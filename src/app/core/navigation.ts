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
