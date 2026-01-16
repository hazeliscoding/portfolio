export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  gif?: string;
  links: {
    github?: string;
    demo?: string;
    nuget?: string;
  };
  tags?: string[];
  featured?: boolean;
  command?: string;
}

export const projectsData: Project[] = [
  {
    id: 'hazel-tree',
    title: 'HazelTree',
    description:
      'A cute, lightweight Linktree-style profile page built with Angular. Config-driven via a single JSON file with light/dark theme, sparkle cursor, and copy-to-clipboard links + toast.',
    image: 'images/projects/hazel-tree.png',
    links: {
      github: 'https://github.com/hazeliscoding/hazel-tree',
      demo: 'https://hazeliscoding.github.io/hazel-tree/',
    },
    tags: ['Angular', 'TypeScript', 'UI', 'GitHub Pages'],
    featured: true,
    command: 'glow hazel-tree.md',
  },
  {
    id: 'quickbase-net',
    title: 'QuickbaseNet',
    description:
      'A .NET QuickBase API wrapper with a fluent Command/Query builder and a client for streamlined CRUD + complex queries. Built to be practical in real apps while exploring fluent API design.',
    image: 'images/projects/quickbase-net.png',
    links: {
      github: 'https://github.com/hazeliscoding/quickbase-net',
      nuget: 'https://www.nuget.org/packages/QuickbaseNet/',
    },
    tags: ['C#', '.NET', 'NuGet', 'SDK', 'API'],
    featured: true,
    command: 'glow quickbase-net.md',
  },
  {
    id: 'terminal-roguelike',
    title: 'TermRogue (Win32)',
    description:
      'A tiny terminal-based roguelike written in modern C++20 using the Win32 Console API. Built as a structured “relearn C++” project with a roadmap for map generation, turn system, FOV, combat, and more—with an eye toward future cross-platform support.',
    image: 'images/projects/terminal-roguelike.png',
    links: {
      github: 'https://github.com/hazeliscoding/terminal-roguelike',
    },
    tags: ['C++20', 'Win32', 'Game Dev', 'Roguelike', 'CMake'],
    featured: true,
    command: 'glow terminal-roguelike.md',
  },
];
