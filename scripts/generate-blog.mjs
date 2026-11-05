import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';
import { publicDir, readPosts } from './lib/posts.mjs';

const projectRoot = process.cwd();

const outputFile = path.join(
  projectRoot,
  'src',
  'app',
  'data',
  'blog-posts.generated.ts',
);
const feedFile = path.join(publicDir, 'feed.xml');

// Same value as SITE_ORIGIN in src/app/core/page-meta.ts, which a Node script
// cannot import. www is the canonical host; feed readers need absolute URLs.
const SITE_ORIGIN = 'https://www.hazeliscoding.dev';

function escapeForTemplateLiteral(value) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

// marked 15 writes image alt text unescaped, so a quotation inside an alt
// broke the attribute. Same rule as escapeAttr in src/app/services/blog.service.ts.
function escapeAlt(text) {
  return text
    .replace(/&(?![#a-z0-9]+;)/gi, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

marked.use({
  renderer: {
    image({ href, title, text }) {
      const titleAttr = title ? ` title="${escapeAlt(title)}"` : '';
      return `<img src="${href}" alt="${escapeAlt(text)}"${titleAttr}>`;
    },
  },
});

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RFC 822, which RSS requires. Posts carry a date only, so midnight UTC. */
function rfc822(date) {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

/**
 * Full post HTML for the feed. Posts link images and pages root-relative
 * (`/images/...`), which a feed reader resolves against nothing, so every
 * `src="/` and `href="/` is made absolute. A `]]>` inside the HTML would close
 * the CDATA section early, so it is split across two sections.
 */
function feedHtml(markdown) {
  return (marked.parse(markdown))
    .replace(/(src|href)="\/(?!\/)/g, `$1="${SITE_ORIGIN}/`)
    .replace(/]]>/g, ']]]]><![CDATA[>');
}

function renderFeed(posts) {
  const items = posts
    .map((p) => {
      const url = `${SITE_ORIGIN}/blog/${p.slug}`;
      const categories = p.tags
        .map((tag) => `      <category>${escapeXml(tag)}</category>`)
        .join('\n');
      return `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <description>${escapeXml(p.description)}</description>
${categories}
      <content:encoded><![CDATA[${feedHtml(p.markdown)}]]></content:encoded>
    </item>`;
    })
    .join('\n');

  // lastBuildDate is the newest post's date, not the clock, so rebuilding
  // without a new post leaves the file byte-identical.
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Hazel Granados — Blog</title>
    <link>${SITE_ORIGIN}/blog</link>
    <description>Notes on building software, by Hazel Granados.</description>
    <language>en-us</language>
    <lastBuildDate>${posts.length ? rfc822(posts[0].date) : ''}</lastBuildDate>
    <atom:link href="${SITE_ORIGIN}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

/**
 * llms.txt (llmstxt.org): a Markdown index for language models. Entries link
 * to the post's raw Markdown in public/blog, which a model reads more cleanly
 * than the rendered page. vercel.json keeps those .md files out of search.
 */
function renderLlmsTxt(posts) {
  const entries = posts
    .map((p) => `- [${p.title}](${SITE_ORIGIN}/blog/${p.slug}.md): ${p.description}`)
    .join('\n');
  return `# Hazel Granados

> Full-stack developer working in C#, .NET and Angular, moving into AI engineering: deterministic agent workflows and evals that prove they work. This site holds a project archive, most of it free and one app for sale, contributions to other people's open source, and a blog about building software.

## Blog

${entries}

## Pages

- [About](${SITE_ORIGIN}/about): background, education, interests and resume
- [Projects](${SITE_ORIGIN}/portfolio): every project with its stack, status and source
- [RSS feed](${SITE_ORIGIN}/feed.xml): every entry in full
`;
}

/**
 * Overglance's trust pages: public/overglance/<slug>.md, copied as written
 * from the app repo's docs/, compiled like the posts so /overglance/<slug>
 * prerenders. The title is the Markdown's first heading, which the page
 * prints itself, and the description its first paragraph. The order here is
 * the order the pages link each other in.
 */
const OVERGLANCE_DOCS = ['privacy', 'terms', 'refunds', 'support', 'data'];

async function readOverglanceDocs() {
  const docs = [];
  for (const slug of OVERGLANCE_DOCS) {
    const raw = await fs.readFile(path.join(publicDir, 'overglance', `${slug}.md`), 'utf8');
    const [, title, body] = raw.replace(/\r\n/g, '\n').match(/^# (.+)\n+([\s\S]*)$/) ?? [];
    if (!title) throw new Error(`public/overglance/${slug}.md must start with a # heading.`);
    const description = body
      .split('\n\n')[0]
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    docs.push({ slug, title, description, markdown: body });
  }
  return docs;
}

function renderOverglanceDocs(docs) {
  const entries = docs
    .map(
      (d) =>
        `  {\n    slug: ${JSON.stringify(d.slug)},\n    title: ${JSON.stringify(d.title)},\n    description: ${JSON.stringify(d.description)},\n    markdown: \`${escapeForTemplateLiteral(d.markdown)}\`,\n  }`,
    )
    .join(',\n');
  // The launch video is a file, not a flag: committing it is what shows it.
  const video = existsSync(path.join(publicDir, 'overglance', 'launch.mp4'));
  return `/* eslint-disable */
// This file is auto-generated by scripts/generate-blog.mjs.
// Do not edit by hand.

export type OverglanceDoc = {
  slug: string;
  title: string;
  description: string;
  markdown: string;
};

export const overglanceDocs: OverglanceDoc[] = [
${entries}
];

/** True once public/overglance/launch.mp4 exists; the hero then plays it instead of the still. */
export const overglanceLaunchVideo = ${video};
`;
}

async function main() {
  const posts = await readPosts();
  await fs.writeFile(
    path.join(projectRoot, 'src', 'app', 'data', 'overglance-docs.generated.ts'),
    renderOverglanceDocs(await readOverglanceDocs()),
    'utf8',
  );

  const ts = `/* eslint-disable */
// This file is auto-generated by scripts/generate-blog.mjs.
// Do not edit by hand.

export type BlogPostSource = {
  slug: string;
  title: string;
  date: string; // YYYY-MM-DD
  description: string;
  tags: string[];
  /** The series the post is a part of, or '' when it stands alone. */
  series: string;
  /** Root-relative social card, or '' to use the site card. */
  image: string;
  /** \`[width, height]\` of each embedded site image, keyed by src. */
  imageSizes: Record<string, [number, number]>;
  markdown: string;
};

export const blogPosts: BlogPostSource[] = [\n${posts
    .map((p) => {
      const markdown = escapeForTemplateLiteral(p.markdown);
      return `  {\n    slug: ${JSON.stringify(p.slug)},\n    title: ${JSON.stringify(
        p.title,
      )},\n    date: ${JSON.stringify(p.date)},\n    description: ${JSON.stringify(
        p.description,
      )},\n    tags: ${JSON.stringify(p.tags)},\n    series: ${JSON.stringify(
        p.series,
      )},\n    image: ${JSON.stringify(
        p.image,
      )},\n    imageSizes: ${JSON.stringify(p.imageSizes)},\n    markdown: \`${markdown}\`,\n  }`;
    })
    .join(',\n')}\n];\n`;

  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, ts, 'utf8');
  await fs.writeFile(feedFile, renderFeed(posts), 'utf8');
  await fs.writeFile(path.join(publicDir, 'llms.txt'), renderLlmsTxt(posts), 'utf8');

  console.log(`Generated ${outputFile}, feed.xml and llms.txt (${posts.length} posts)`);
}

await main();
