import { Injectable } from '@angular/core';
import { blogPosts, type BlogPostSource } from '../data/blog-posts.generated';
import { marked, type Tokens } from 'marked';

export type BlogPost = BlogPostSource & {
  dateObj: Date;
  html: string;
};

/**
 * Slug rule shared by the heading renderer below and by
 * `BlogPostPage.extractHeadings`, which parses the `id` this renderer emits
 * back out of the rendered HTML. Keeping this the single place the rule is
 * implemented is the point: the component never re-derives a slug, so the
 * two can't drift out of agreement.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Escapes text for a double-quoted attribute, leaving entities the author
 * already wrote (`&amp;`) intact. Same rule as escapeAlt in
 * scripts/generate-blog.mjs, which renders the feed.
 */
function escapeAttr(text: string): string {
  return text
    .replace(/&(?![#a-z0-9]+;)/gi, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// marked's default heading renderer emits no `id` attribute, which would
// leave the blog post page's CONTENTS anchors pointing at nothing. Register
// a renderer that adds one, slugifying the raw (pre-escape) heading text.
//
// Its image renderer writes the alt text unescaped (marked 15), so an alt
// containing a quotation ended the attribute early and spilled the rest of the
// sentence into junk attributes. This one escapes it.
marked.use({
  renderer: {
    heading(token: Tokens.Heading): string {
      const id = slugify(token.text);
      return `<h${token.depth} id="${id}">${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
    },
    image({ href, title, text }: Tokens.Image): string {
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : '';
      return `<img src="${href}" alt="${escapeAttr(text)}"${titleAttr}>`;
    },
  },
});

function stripLeadingTitleHeading(markdown: string, title: string) {
  const normalized = markdown.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');

  let i = 0;
  while (i < lines.length && lines[i].trim() === '') {
    i++;
  }

  if (i >= lines.length) {
    return markdown;
  }

  const match = lines[i].match(/^#\s+(.+?)\s*$/);
  if (!match) {
    return markdown;
  }

  const headingText = match[1].trim().toLowerCase();
  const titleText = title.trim().toLowerCase();
  if (headingText !== titleText) {
    return markdown;
  }

  i++;
  while (i < lines.length && lines[i].trim() === '') {
    i++;
  }

  return lines.slice(i).join('\n');
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly posts: BlogPost[] = blogPosts
    .map((post) => ({
      ...post,
      dateObj: new Date(post.date),
      html: sizeImages(
        marked.parse(stripLeadingTitleHeading(post.markdown, post.title)) as string,
        post.imageSizes,
      ),
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  getAllPosts() {
    return this.posts;
  }

  getPostBySlug(slug: string) {
    return this.posts.find((post) => post.slug === slug) ?? null;
  }

  /** The entries either side of `slug`: `older` came out before it, `newer` after. */
  getNeighbors(slug: string): { older: BlogPost | null; newer: BlogPost | null } {
    const i = this.posts.findIndex((post) => post.slug === slug);
    if (i < 0) return { older: null, newer: null };
    return { older: this.posts[i + 1] ?? null, newer: this.posts[i - 1] ?? null };
  }
}

/**
 * Gives each image its intrinsic size and defers every one after the first.
 *
 * The size lets the browser reserve the box before the file arrives (prose
 * sets `height: auto`, so it scales); without it the post shifted down as each
 * image landed. The first image can be in view on arrival, where lazy loading
 * would hold back the largest paint; the rest are below a screen of prose and
 * need not compete with it. Several posts carry multi-megabyte GIFs, so this
 * is most of the page's weight.
 */
function sizeImages(html: string, sizes: Record<string, [number, number]>): string {
  let seen = 0;
  return html.replace(/<img src="([^"]+)"/g, (_tag, src: string) => {
    const size = sizes[src];
    const dims = size ? ` width="${size[0]}" height="${size[1]}"` : '';
    const lazy = seen++ ? ' loading="lazy" decoding="async"' : '';
    return `<img src="${src}"${dims}${lazy}`;
  });
}
