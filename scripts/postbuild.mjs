import fs from 'node:fs/promises';
import path from 'node:path';

// Runs after `ng build` (npm's postbuild hook) over the prerendered output.
//
// 1. 404.html. Vercel serves it, with a real 404 status, for any path that has
//    no file. It is the client-rendered shell, so the router still draws the
//    ERROR_404 screen. Before this, the Angular preset rewrote every miss to the
//    prerendered homepage with a 200, so /anything (and /robots.txt) indexed as
//    a duplicate of / with a canonical pointing at /.
//
// 2. sitemap.xml, read off the prerendered pages rather than a route list: a
//    page is in the sitemap exactly when it shipped with a canonical and
//    without noindex, so the sitemap cannot list a URL the page itself
//    disowns, and a new post or project appears without touching this file.

const browserDir = path.join(process.cwd(), 'dist', 'portfolio', 'browser');

async function findPages(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await findPages(full)));
    else if (entry.name === 'index.html') out.push(full);
  }
  return out;
}

function attr(html, pattern) {
  return html.match(pattern)?.[1] ?? '';
}

async function main() {
  await fs.copyFile(
    path.join(browserDir, 'index.csr.html'),
    path.join(browserDir, '404.html'),
  );

  const urls = [];
  for (const file of await findPages(browserDir)) {
    const html = await fs.readFile(file, 'utf8');
    if (/<meta name="robots" content="[^"]*noindex/.test(html)) continue;

    const loc = attr(html, /<link rel="canonical" href="([^"]+)"/);
    if (!loc) continue;

    // Posts carry article:published_time; other pages have no honest date, and
    // a lastmod that is just the build time teaches crawlers to ignore it.
    const lastmod = attr(html, /<meta property="article:published_time" content="([^"]+)"/);
    urls.push({ loc, lastmod });
  }

  if (!urls.some((u) => u.loc.endsWith('/blog'))) {
    throw new Error(`No prerendered pages with a canonical found in ${browserDir}`);
  }

  urls.sort((a, b) => a.loc.localeCompare(b.loc));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n${u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : ''}  </url>`,
  )
  .join('\n')}
</urlset>
`;
  await fs.writeFile(path.join(browserDir, 'sitemap.xml'), xml, 'utf8');
  console.log(`Wrote 404.html and sitemap.xml (${urls.length} URLs)`);
}

await main();
