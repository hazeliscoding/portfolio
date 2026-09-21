import fs from 'node:fs/promises';
import path from 'node:path';

// Generates src/app/data/oss-stats.generated.ts from the public GitHub API.
//
//   node scripts/generate-oss-stats.mjs
//
// Also runs weekly from .github/workflows/oss-stats.yml, which commits the
// result only when the figures actually move.
//
// Private work is excluded by the `info.private` check below and by
// EXCLUDED_ORGS — not by the absence of a token. That distinction matters now
// that the script will use GITHUB_TOKEN when one is present: unauthenticated
// requests from a GitHub Actions runner share an IP with every other job on
// that host and burn the 60/hour limit long before this script is the one that
// asked. The Actions token is scoped to this repository, so it cannot see the
// user's private repos in the first place, and anything it could see still has
// to clear the private check.

const USER = 'hazeliscoding';
// Work orgs stay out even if a repo ever flips public; WillowPrograms is
// excluded by request.
const EXCLUDED_ORGS = [
  'BAMTech-MyVector',
  'BAMTechnologies',
  'diamond-fiberglass',
  'WillowPrograms',
];

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

const query = encodeURIComponent(
  `author:${USER} type:pr is:merged -user:${USER}`,
);
const search = await gh(
  `https://api.github.com/search/issues?q=${query}&per_page=100`,
);

const prsByRepo = new Map();
for (const item of search.items) {
  const repo = item.repository_url.replace(/.*repos\//, '');
  const org = repo.split('/')[0];
  if (EXCLUDED_ORGS.some((e) => e.toLowerCase() === org.toLowerCase())) continue;
  prsByRepo.set(repo, (prsByRepo.get(repo) ?? 0) + 1);
}

const projects = [];
for (const [repo, mergedPrs] of prsByRepo) {
  const info = await gh(`https://api.github.com/repos/${repo}`);
  if (info.private) continue;
  projects.push({
    repo,
    url: `https://github.com/${repo}/pulls?q=${encodeURIComponent(
      `is:pr author:${USER} is:merged`,
    )}`,
    stars: info.stargazers_count,
    mergedPrs,
  });
}

projects.sort((a, b) => b.stars - a.stars || b.mergedPrs - a.mergedPrs);

const figures = {
  totalMergedPrs: projects.reduce((s, p) => s + p.mergedPrs, 0),
  projectCount: projects.length,
  totalStars: projects.reduce((s, p) => s + p.stars, 0),
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
if (previous !== null && previous.projectCount > 0 && figures.projectCount === 0) {
  throw new Error(
    `Refusing to overwrite ${previous.projectCount} projects with 0. ` +
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
  projectCount: figures.projectCount,
  totalStars: figures.totalStars,
  updated: unchanged ? previousDate : new Date().toISOString().slice(0, 10),
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
};

export type OssStats = {
  totalMergedPrs: number;
  projectCount: number;
  totalStars: number;
  updated: string; // YYYY-MM-DD
  projects: OssProject[];
};

export const ossStats: OssStats = ${JSON.stringify(stats, null, 2)};
`;

await fs.writeFile(outputFile, ts, 'utf8');
console.log(
  unchanged
    ? `Unchanged — ${stats.totalMergedPrs} merged PRs across ${stats.projectCount} projects, still dated ${stats.updated}`
    : `Updated ${outputFile} — ${stats.totalMergedPrs} merged PRs across ${stats.projectCount} projects, dated ${stats.updated}`,
);
