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

// marked's default heading renderer emits no `id` attribute, which would
// leave the blog post page's CONTENTS anchors pointing at nothing. Register
// a renderer that adds one, slugifying the raw (pre-escape) heading text.
marked.use({
  renderer: {
    heading(token: Tokens.Heading): string {
      const id = slugify(token.text);
      return `<h${token.depth} id="${id}">${this.parser.parseInline(token.tokens)}</h${token.depth}>\n`;
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
      html: marked.parse(stripLeadingTitleHeading(post.markdown, post.title)) as string,
    }))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  getAllPosts() {
    return this.posts;
  }

  getPostBySlug(slug: string) {
    return this.posts.find((post) => post.slug === slug) ?? null;
  }
}
