// Renders the site's social card, scripts/og-card.html, to public/og-image.png,
// and a card per blog post into public/images/og/blog/<slug>.png from
// scripts/og-card-post.html, using a locally installed Chrome. A browser,
// not sharp, because sharp cannot load the webfonts (see og-card.html).
//
// Not part of the build: Vercel's builders have no Chrome. The cards are
// committed, and a post without one falls back to the site card. Run after
// changing either card, or adding or retitling a post:
//
//   npm run og:cards        (set CHROME_PATH if Chrome is somewhere unusual)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { ogCardPath, publicDir, readPosts } from './lib/posts.mjs';

const siteCard = path.join(process.cwd(), 'scripts', 'og-card.html');
const template = path.join(process.cwd(), 'scripts', 'og-card-post.html');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
];

const chrome = CHROME_CANDIDATES.find((candidate) => candidate && existsSync(candidate));
if (!chrome) {
  throw new Error('Chrome not found. Set CHROME_PATH to the Chrome executable.');
}

const posts = await readPosts();
// A throwaway profile, so a Chrome the user already has open cannot lock it.
const profile = mkdtempSync(path.join(os.tmpdir(), 'og-cards-'));

/** Screenshots `url` at 1200x630 into `out`, and fails if the size is off. */
async function render(url, out) {
  await fs.mkdir(path.dirname(out), { recursive: true });
  execFileSync(chrome, [
    '--headless=new',
    `--user-data-dir=${profile}`,
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    // Virtual time lets the webfonts and icons load, and fit() run, before the shot.
    '--virtual-time-budget=10000',
    `--screenshot=${out}`,
    url.href,
  ], { stdio: 'ignore' });

  const { width, height } = await sharp(out).metadata();
  if (width !== 1200 || height !== 630) {
    throw new Error(`${out} is ${width}x${height}, expected 1200x630.`);
  }
}

try {
  await render(pathToFileURL(siteCard), path.join(publicDir, 'og-image.png'));
  console.log('Rendered /og-image.png');

  for (const post of posts) {
    const url = pathToFileURL(template);
    url.search = new URLSearchParams({
      title: post.title,
      date: post.date,
      tags: post.tags.join(','),
    }).toString();
    await render(url, path.join(publicDir, ogCardPath(post.slug)));
    console.log(`Rendered ${ogCardPath(post.slug)}`);
  }
} finally {
  rmSync(profile, { recursive: true, force: true });
}
