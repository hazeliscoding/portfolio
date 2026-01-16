import { Injectable } from '@angular/core';
import { blogPosts, type BlogPostSource } from '../data/blog-posts.generated';
import { marked } from 'marked';

export type BlogPost = BlogPostSource & {
  dateObj: Date;
  html: string;
};

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
