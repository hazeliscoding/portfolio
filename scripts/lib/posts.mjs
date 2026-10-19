import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

// Shared by generate-blog.mjs (site data + feed) and generate-og-cards.mjs, so
// the two can never disagree about which posts exist or what their titles are.

const projectRoot = process.cwd();
export const publicDir = path.join(projectRoot, 'public');
const inputDir = path.join(publicDir, 'blog');

export function isSlug(value) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

/** Where a post's social card lives, relative to the site root. */
export function ogCardPath(slug) {
  return `/images/og/blog/${slug}.png`;
}

function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { frontmatter: {}, body: raw };
  }

  const end = normalized.indexOf('\n---\n', 4);
  if (end === -1) {
    throw new Error('Frontmatter started but no closing --- found.');
  }

  const fmBlock = normalized.slice(4, end).trim();
  const body = normalized.slice(end + '\n---\n'.length).replace(/^\n+/, '');

  const frontmatter = {};
  for (const line of fmBlock.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.slice(0, colonIndex).trim();
    let value = trimmed.slice(colonIndex + 1).trim();

    // Basic array syntax: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim();
      const parts = inner
        ? inner.split(',').map((p) => p.trim()).filter(Boolean)
        : [];
      frontmatter[key] = parts;
      continue;
    }

    // Strip optional surrounding quotes
    value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
    frontmatter[key] = value;
  }

  return { frontmatter, body };
}

/**
 * `[width, height]` of every site image the post embeds, keyed by its src.
 * The page writes them onto each <img> so the browser reserves the space
 * before the file arrives; an unsized GIF pushing the article down was most of
 * a post's layout shift. A missing file fails the build here instead of
 * shipping a broken image.
 */
async function imageSizes(markdown, fileName) {
  const sizes = {};
  // Commented-out images never render, so they need no file.
  const rendered = markdown.replace(/<!--[\s\S]*?-->/g, '');
  for (const [, src] of rendered.matchAll(/!\[[^\]]*\]\((\/[^)\s]+)/g)) {
    const file = path.join(publicDir, src);
    if (!existsSync(file)) {
      throw new Error(`${fileName} embeds ${src}, which is not in public/.`);
    }
    // limitInputPixels: an animated GIF's pixel count is every frame summed.
    const meta = await sharp(file, { limitInputPixels: false }).metadata();
    sizes[src] = [meta.width, meta.pageHeight ?? meta.height];
  }
  return sizes;
}

/** Every post in public/blog, newest first. */
export async function readPosts() {
  let entries;
  try {
    entries = await fs.readdir(inputDir, { withFileTypes: true });
  } catch (err) {
    throw new Error(
      `Blog input folder not found: ${inputDir}. Create it and add .md files.`,
    );
  }

  const markdownFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));

  const posts = [];

  for (const fileName of markdownFiles) {
    const slug = fileName.replace(/\.md$/, '');
    if (!isSlug(slug)) {
      throw new Error(
        `Invalid post filename: ${fileName}. Use kebab-case like my-first-post.md`,
      );
    }

    const fullPath = path.join(inputDir, fileName);
    const raw = await fs.readFile(fullPath, 'utf8');
    const { frontmatter, body } = parseFrontmatter(raw);

    const title = frontmatter.title;
    const date = frontmatter.date;

    if (!title || typeof title !== 'string') {
      throw new Error(`Missing required frontmatter 'title' in ${fileName}`);
    }

    if (!date || typeof date !== 'string') {
      throw new Error(`Missing required frontmatter 'date' in ${fileName}`);
    }

    const description =
      typeof frontmatter.description === 'string'
        ? frontmatter.description
        : '';

    const tags = Array.isArray(frontmatter.tags)
      ? frontmatter.tags
      : typeof frontmatter.tags === 'string' && frontmatter.tags
        ? frontmatter.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    // Each tag is a URL segment (/blog/tags/<tag>), so it has to be one.
    for (const tag of tags) {
      if (!isSlug(tag)) {
        throw new Error(
          `Invalid tag '${tag}' in ${fileName}. Use kebab-case like reverse-engineering`,
        );
      }
    }

    // A post without a rendered card falls back to the site card; see
    // scripts/generate-og-cards.mjs.
    const card = ogCardPath(slug);
    const image = existsSync(path.join(publicDir, card)) ? card : '';

    posts.push({
      slug,
      title,
      date,
      description,
      tags,
      image,
      imageSizes: await imageSizes(body, fileName),
      markdown: body,
    });
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  return posts;
}
