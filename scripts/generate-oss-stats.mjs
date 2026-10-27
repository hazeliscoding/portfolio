import fs from 'node:fs/promises';
import path from 'node:path';

// Generates src/app/data/oss-stats.generated.ts from the public GitHub API.
//
//   node scripts/generate-oss-stats.mjs
//
// Also runs weekly from .github/workflows/oss-stats.yml, which commits the
// result only when the figures actually move.
//
// It uses GITHUB_TOKEN when one is present, because unauthenticated requests
// from a GitHub Actions runner share an IP with every other job on that host
// and burn the 60/hour limit long before this script is the one that asked.

const USER = 'hazeliscoding';
// Only the upstream projects my GitHub profile lists appear, so work orgs and
// the PRs that list my own apps (winget-pkgs, up-for-grabs) never do. The list
// is oss.json in hazeliscoding/hazeliscoding, which also draws the profile's
// open-source section, so the two can't disagree: a project added there shows
// up here on the next run.
const OSS_LIST = `https://api.github.com/repos/${USER}/${USER}/contents/oss.json`;

const outputFile = path.join(
  process.cwd(),
  'src',
  'app',
  'data',
  'oss-stats.generated.ts',
);

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

async function gh(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    // 403 with the limit exhausted is the one failure worth naming, because
    // it is not a bug and the fix is to wait or supply a token.
    const remaining = res.headers.get('x-ratelimit-remaining');
    const hint =
      res.status === 403 && remaining === '0'
        ? ' — rate limit exhausted; set GITHUB_TOKEN or retry later'
        : '';
    throw new Error(`GitHub API ${res.status} for ${url}${hint}`);
  }
  return res.json();
}

/**
 * The previously generated figures, or null on a first run / unreadable file.
 * Parsed out of the emitted TypeScript, which is `JSON.stringify` output with
 * a known prefix, so there is nothing to evaluate.
 */
async function readExisting() {
  const marker = 'export const ossStats: OssStats = ';
  try {
    const source = await fs.readFile(outputFile, 'utf8');
    const start = source.indexOf(marker);
    if (start === -1) return null;
    const json = source.slice(start + marker.length).trim().replace(/;$/, '');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Through the contents API rather than raw.githubusercontent.com, so the
// request carries the token like every other one here.
const listFile = await gh(OSS_LIST);
const listed = JSON.parse(Buffer.from(listFile.content, 'base64').toString('utf8'));
// An empty list would search every PR of mine, the drift the list exists to stop.
if (
  !Array.isArray(listed) ||
  listed.length === 0 ||
  !listed.every((p) => typeof p?.repo === 'string' && /^[\w.-]+\/[\w.-]+$/.test(p.repo))
) {
  throw new Error('oss.json needs at least one project, each with an owner/name repo.');
}
const PROJECTS = listed.map((p) => p.repo);

const query = encodeURIComponent(
  ['is:pr', `author:${USER}`, ...PROJECTS.map((repo) => `repo:${repo}`)].join(' '),
);
const search = await gh(
  `https://api.github.com/search/issues?q=${query}&per_page=100`,
);
// shortcut: reads one page of 100 PRs and refuses to undercount; page through once there are more.
if (search.incomplete_results || search.total_count > search.items.length) {
  throw new Error(`Partial search results: ${search.items.length} of ${search.total_count} PRs.`);
}

const projects = [];
for (const repo of PROJECTS) {
  const prs = search.items.filter((item) =>
    item.repository_url.toLowerCase().endsWith(`/repos/${repo.toLowerCase()}`),
  );
  const mergedPrs = prs.filter((pr) => pr.pull_request?.merged_at).length;
  // Open means in review; a PR closed without merging counts for nothing.
  const openPrs = prs.filter((pr) => pr.state === 'open').length;
  if (!mergedPrs && !openPrs) continue;
  const info = await gh(`https://api.github.com/repos/${repo}`);
  projects.push({
    repo,
    url: `https://github.com/${repo}/pulls?q=${encodeURIComponent(`is:pr author:${USER}`)}`,
    stars: info.stargazers_count,
    mergedPrs,
    openPrs,
  });
}

projects.sort((a, b) => b.stars - a.stars || b.mergedPrs - a.mergedPrs);

const figures = {
  totalMergedPrs: projects.reduce((s, p) => s + p.mergedPrs, 0),
  totalOpenPrs: projects.reduce((s, p) => s + p.openPrs, 0),
  // As on the profile: a project counts once something of mine has merged there.
  projectCount: projects.filter((p) => p.mergedPrs > 0).length,
  totalStars: projects.reduce((s, p) => s + p.stars, 0),
  listedRepos: PROJECTS,
  projects,
};

// `updated` is the date the figures last MOVED, not the date they were last
// checked — so a run that finds nothing new leaves the file byte-identical and
// the scheduled workflow has nothing to commit. Stamping every run instead
// would guarantee a commit and a redeploy every week to change one date, and
// the panel's own footer would claim freshness it had not earned: the site
// truncates stars to `20.9k`, so most real movement is invisible there anyway.
const previous = await readExisting();
const { updated: previousDate, ...previousFigures } = previous ?? {};

// Refuse to replace real figures with nothing. Every call here throws on a
// non-OK response, so an empty result means the search legitimately matched
// zero PRs — which, once it has matched some, is far more likely to be GitHub
// having a moment than Hazel's merged PRs being revoked. Unattended, the
// failure mode without this is the live site quietly reporting 0 MERGED PRS
// until someone notices.
if (previous !== null && previous.projects.length > 0 && figures.projects.length === 0) {
  throw new Error(
    `Refusing to overwrite ${previous.projects.length} projects with 0. ` +
      'The API answered but matched nothing; re-run before trusting this.',
  );
}

const unchanged =
  previous !== null && JSON.stringify(previousFigures) === JSON.stringify(figures);

// Written out field by field rather than spread, to hold the emitted key order
// the file already has. `{ ...figures, updated }` would move `updated` to the
// end and rewrite every line of a file whose whole point is to diff only when
// the numbers do.
const stats = {
  totalMergedPrs: figures.totalMergedPrs,
  totalOpenPrs: figures.totalOpenPrs,
  projectCount: figures.projectCount,
  totalStars: figures.totalStars,
  updated: unchanged ? previousDate : new Date().toISOString().slice(0, 10),
  listedRepos: figures.listedRepos,
  projects: figures.projects,
};

const ts = `/* eslint-disable */
// This file is auto-generated by scripts/generate-oss-stats.mjs.
// Do not edit by hand.

export type OssProject = {
  repo: string;
  url: string;
  stars: number;
  mergedPrs: number;
  /** Open, so still in review. */
  openPrs: number;
};

export type OssStats = {
  totalMergedPrs: number;
  totalOpenPrs: number;
  /** Projects with at least one merged PR. */
  projectCount: number;
  totalStars: number;
  updated: string; // YYYY-MM-DD
  /** The repos in my GitHub profile's oss.json; only these may appear. */
  listedRepos: string[];
  projects: OssProject[];
};

export const ossStats: OssStats = ${JSON.stringify(stats, null, 2)};
`;

await fs.writeFile(outputFile, ts, 'utf8');
console.log(
  unchanged
    ? `Unchanged — ${stats.totalMergedPrs} merged PRs across ${stats.projectCount} projects, ${stats.totalOpenPrs} in review, still dated ${stats.updated}`
    : `Updated ${outputFile} — ${stats.totalMergedPrs} merged PRs across ${stats.projectCount} projects, ${stats.totalOpenPrs} in review, dated ${stats.updated}`,
);
