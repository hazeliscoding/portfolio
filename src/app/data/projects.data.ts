export interface ProjectImage {
  src: string;
  caption: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string[];
  image: string;
  gif?: string;
  images?: ProjectImage[];
  links: {
    github?: string;
    demo?: string;
    nuget?: string;
  };
  tags?: string[];
  featured?: boolean;
  command?: string;
  status?: string;
  year?: string;
  stack?: string;
}

export const projectsData: Project[] = [
  {
    id: 'pr-sweep',
    title: 'PR Sweep',
    description:
      'A portable desktop PR dashboard for teams that work in sprints across many repos in one GitHub organization — one window that answers: what’s open, what needs review, what has changes requested, what’s approved, and what merged this sprint.',
    longDescription: [
      'PRs are bucketed from GitHub’s actual reviewDecision — no labels, no manual bookkeeping. A "My queue" section surfaces every open PR in the org waiting on your review, stale PRs get flagged past a configurable threshold, and the whole board is scoped to a sprint date range and a configurable team list. Profiles save org + team + range views, and export/import as JSON so one person configures the team’s view and everyone imports it.',
      'The interesting engineering is in the GitHub layer: OR-ing authors needs GraphQL’s advanced search backend, search hard-caps at 1000 results so busy ranges split their date window recursively, and auto-refreshes are incremental — they ask only for PRs updated since the last sweep and patch the cached result. The last sweep is snapshotted to disk, so the board renders instantly on launch and refreshes quietly. A token that isn’t SAML-authorized returns silently empty results rather than errors; PR Sweep probes for that and explains it instead of showing an empty board.',
      'It ships like a real product: device-flow "Sign in with GitHub", credentials encrypted at rest (DPAPI via safeStorage on Windows, libsecret on Linux), a system-tray presence with live counts and review-queue notifications, code-signed Windows builds via Azure Trusted Signing, self-updating installers plus a Linux AppImage, and a Playwright screenshot harness with tests in CI.',
    ],
    image: 'images/projects/pr-sweep/board.png',
    images: [
      {
        src: 'images/projects/pr-sweep/board.png',
        caption: 'status board — review buckets, filters, stale flags',
      },
      {
        src: 'images/projects/pr-sweep/board-dark.png',
        caption: 'dark theme',
      },
      {
        src: 'images/projects/pr-sweep/settings.png',
        caption: 'settings — profiles, team list, OAuth',
      },
      {
        src: 'images/projects/pr-sweep/onboarding-oauth.png',
        caption: 'onboarding — sign in with GitHub (device flow)',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/pr-sweep',
    },
    tags: [
      'Electron',
      'Angular',
      'TypeScript',
      'GitHub GraphQL',
      'Node.js',
      'Playwright',
      'CI/CD',
      'Desktop',
    ],
    featured: true,
    command: 'glow pr-sweep.md',
    status: 'active',
    year: '2026',
    stack: 'Electron · Angular',
  },
];
