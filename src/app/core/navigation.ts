import { Mode } from '../ui/windows/mode-nav/mode-nav';
import { PaletteCommand } from '../ui/overlays/command-palette/command-palette';
import { projectsData } from '../data/projects.data';
import { blogPosts } from '../data/blog-posts.generated';

export const MODES: Mode[] = [
  { id: 'home', label: 'HOME', index: '01', route: '/' },
  { id: 'about', label: 'ABOUT', index: '02', route: '/about' },
  { id: 'projects', label: 'PROJECTS', index: '03', route: '/portfolio' },
  { id: 'blog', label: 'BLOG', index: '04', route: '/blog' },
];

/**
 * The palette lists the four modes, then every record and every entry that
 * actually exists, then the commands that leave the site. Records and entries
 * are derived rather than listed: a hand-maintained copy went stale the first
 * time a post was added, and a palette that cannot reach a page is worse than
 * no palette.
 */
export const COMMANDS: PaletteCommand[] = [
  { id: 'go-home', mode: '01', label: 'Home', hint: '1', route: '/' },
  { id: 'go-about', mode: '02', label: 'About · dossier', hint: '2', route: '/about' },
  {
    id: 'go-projects',
    mode: '03',
    label: 'Projects · archive',
    hint: '3',
    route: '/portfolio',
  },
  { id: 'go-blog', mode: '04', label: 'Blog · log', hint: '4', route: '/blog' },
  ...projectsData.map((project) => ({
    id: `proj-${project.id}`,
    mode: '03',
    label: `Open record › ${project.title}`,
    hint: project.year,
    route: `/portfolio/${project.id}`,
  })),
  ...blogPosts.map((post) => ({
    id: `post-${post.slug}`,
    mode: '04',
    label: `Open entry › ${post.title}`,
    hint: post.date,
    route: `/blog/${post.slug}`,
  })),
];

/**
 * The oversized background word per route. Distinct from the mode labels —
 * `/` is mode HOME but reads HAZEL, `/about` reads its own chapter number, and
 * a record detail page reads that record's number.
 */
export const ENV_WORDS: Record<string, string> = {
  '/': 'HAZEL',
  '/about': '02',
  '/portfolio': '03',
  '/blog': 'LOG',
};

export function envWordFor(url: string): string {
  const path = url.split('?')[0].split('#')[0];
  if (path === '/') return ENV_WORDS['/'];

  if (path.startsWith('/portfolio/')) {
    const id = path.slice('/portfolio/'.length);
    const index = projectsData.findIndex((project) => project.id === id);
    // A record that does not exist is a 404, and the word behind it should
    // say so rather than print a number for a record with no position.
    return index < 0 ? '404' : String(index + 1).padStart(2, '0');
  }

  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length);
    const index = blogPosts.findIndex((post) => post.slug === slug);
    return index < 0 ? '404' : entryNumber(index);
  }

  const match = Object.keys(ENV_WORDS)
    .filter((key) => key !== '/' && path.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ENV_WORDS[match] : '404';
}

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

export const LOST_CODE = 'ERROR_404';

function cleanPath(url: string): string {
  return url.split('?')[0].split('#')[0];
}

export function isLostRoute(url: string): boolean {
  return envWordFor(url) === '404';
}

/** What the top bar prints after `HAZEL.EXE //`. */
export function pathLabelFor(url: string): string {
  const path = cleanPath(url);
  if (isLostRoute(url)) return 'NOT FOUND';
  if (path === '/') return 'OPERATOR PROFILE';

  if (path.startsWith('/portfolio/')) {
    return `${MODE_CODES['projects']} // ${path.slice('/portfolio/'.length).toUpperCase()}`;
  }
  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length);
    const index = blogPosts.findIndex((post) => post.slug === slug);
    return `${MODE_CODES['blog']} // ${entryNumber(index)}`;
  }

  const mode = MODES.filter((m) => m.route !== '/' && path.startsWith(m.route)).sort(
    (a, b) => b.route.length - a.route.length,
  )[0];
  return mode ? mode.label : 'NULL';
}

/**
 * The bottom bar's event line. The system narrates what just happened in its
 * own vocabulary — a mode change is a MODE SWITCH, opening a record is an
 * OPEN RECORD — rather than echoing the URL, which the address bar already
 * shows.
 */
export function logMessageFor(url: string): string {
  const path = cleanPath(url);
  if (isLostRoute(url)) return `ROUTE ERROR → ${path}`;

  if (path.startsWith('/portfolio/')) {
    const id = path.slice('/portfolio/'.length).toUpperCase();
    return `OPEN RECORD → ${MODE_CODES['projects']} // ${id}`;
  }
  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length).toUpperCase();
    return `OPEN RECORD → ${MODE_CODES['blog']} // ${slug}`;
  }

  const mode =
    path === '/'
      ? MODES[0]
      : MODES.filter((m) => m.route !== '/' && path.startsWith(m.route)).sort(
          (a, b) => b.route.length - a.route.length,
        )[0];
  return `MODE SWITCH → ${mode ? MODE_CODES[mode.id] : LOST_CODE}`;
}
