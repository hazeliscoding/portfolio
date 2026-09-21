import { Mode } from '../ui/windows/mode-nav/mode-nav';
import { PaletteCommand } from '../ui/overlays/command-palette/command-palette';

export const MODES: Mode[] = [
  { id: 'home', label: 'HOME', index: '01', route: '/' },
  { id: 'profile', label: 'PROFILE', index: '02', route: '/about' },
  { id: 'archive', label: 'ARCHIVE', index: '03', route: '/portfolio' },
  { id: 'log', label: 'LOG', index: '04', route: '/blog' },
];

export const COMMANDS: PaletteCommand[] = [
  { id: 'home', label: 'HOME', mode: 'SYSTEM', route: '/' },
  { id: 'profile', label: 'PROFILE', mode: 'SYSTEM', route: '/about' },
  { id: 'archive', label: 'ARCHIVE', mode: 'RECORDS', route: '/portfolio' },
  { id: 'pr-sweep', label: 'PR SWEEP', mode: 'RECORDS', route: '/portfolio/pr-sweep' },
  { id: 'log', label: 'LOG', mode: 'RECORDS', route: '/blog' },
];

/**
 * The oversized background word per route. Distinct from the mode labels —
 * `/` is mode HOME but reads HAZEL, and a project detail page reads RECORD.
 */
export const ENV_WORDS: Record<string, string> = {
  '/': 'HAZEL',
  '/about': 'PROFILE',
  '/portfolio': 'ARCHIVE',
  '/blog': 'LOG',
};

export function envWordFor(url: string): string {
  const path = url.split('?')[0].split('#')[0];
  if (path === '/') return ENV_WORDS['/'];
  if (path.startsWith('/portfolio/')) return 'RECORD';
  if (path.startsWith('/blog/')) return 'ENTRY';
  const match = Object.keys(ENV_WORDS)
    .filter((key) => key !== '/' && path.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ENV_WORDS[match] : 'NULL';
}
