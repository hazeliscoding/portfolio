import { PaletteCommand } from '../ui/overlays/command-palette/command-palette';
import { projectsData } from '../data/projects.data';
import { blogPosts } from '../data/blog-posts.generated';

/** A top-level page: the header links it, and its number key opens it. */
export interface Mode {
  id: string;
  label: string;
  index: string;
  route: string;
}

export const MODES: Mode[] = [
  { id: 'home', label: 'Home', index: '01', route: '/' },
  { id: 'about', label: 'About', index: '02', route: '/about' },
  { id: 'projects', label: 'Projects', index: '03', route: '/portfolio' },
  { id: 'blog', label: 'Blog', index: '04', route: '/blog' },
];

/**
 * The search palette lists the four pages, then every project and every post
 * that actually exists. Projects and posts are derived rather than listed: a
 * hand-maintained copy went stale the first time a post was added, and a
 * search that cannot reach a page is worse than none.
 */
export const COMMANDS: PaletteCommand[] = [
  { id: 'go-home', mode: 'Page', label: 'Home', hint: '1', route: '/' },
  { id: 'go-about', mode: 'Page', label: 'About', hint: '2', route: '/about' },
  {
    id: 'go-projects',
    mode: 'Page',
    label: 'Projects',
    hint: '3',
    route: '/portfolio',
  },
  { id: 'go-blog', mode: 'Page', label: 'Blog', hint: '4', route: '/blog' },
  ...projectsData.map((project) => ({
    id: `proj-${project.id}`,
    mode: 'Project',
    label: project.title,
    hint: project.year,
    route: `/portfolio/${project.id}`,
  })),
  ...blogPosts.map((post) => ({
    id: `post-${post.slug}`,
    mode: 'Post',
    label: post.title,
    hint: post.date,
    route: `/blog/${post.slug}`,
  })),
];

/**
 * Entries are numbered oldest-first and printed to four digits, so the newest
 * post on a three-post blog is 0003. `blogPosts` is newest-first, so the
 * position has to be counted from the other end.
 */
export function entryNumber(index: number): string {
  return String(blogPosts.length - index).padStart(4, '0');
}

/**
 * The location code each mode reports as. The mode rail says PROJECTS; the
 * instruments say ARCHIVE_03. Both names are deliberate — the rail is where
 * you are going, the code is what the system calls it — and they are written
 * once here so the two can never drift apart.
 */
export const MODE_CODES: Record<string, string> = {
  home: 'HOME_01',
  about: 'PROFILE_02',
  projects: 'ARCHIVE_03',
  blog: 'LOG_04',
};
