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
  {
    id: 'animatch',
    title: 'AniMatch',
    description:
      'A web app that compares anime taste between AniList users — a 0–100 compatibility score, the titles two people disagree on most, what’s on both of their plan-to-watch lists, and what they should watch together. It works for whole friend groups too.',
    longDescription: [
      'Enter two AniList usernames and AniMatch reads both public lists, then answers three questions on one page: how compatible are we, where do we disagree, and what should we watch together? The score weights agreement on ratings most — 45% Pearson correlation on the titles both people scored, 30% cosine similarity of their genre mix, 15% overlap in what they’ve completed, 10% shared favorite studios — so two people who watch the same genres but rate them differently still score low. Every comparison has its own link to send to the other person.',
      'The same math scales out. The shared backlog ranks titles on both plan-to-watch lists by predicted mutual score: AniList’s site average, nudged by how each person rates that title’s genres relative to their own mean. Recommendations run the same prediction over AniList’s most popular and highest-rated titles that neither person has listed, with a reason for each pick. Groups get per-member stats, a pairwise taste-match grid and the backlog the whole group shares, and can be saved under a name.',
      'There is no backend. It’s a static Angular site on Vercel that talks straight to AniList’s GraphQL API, with optional AniList sign-in through the OAuth implicit grant. A comparison exports as a 1200×630 share card drawn on a canvas from the live CSS tokens, so it matches the viewer’s light or dark theme. The UI is the Hikari design system ported to CSS tokens, with a contrast-checked dark theme, and Vitest unit tests plus Playwright end-to-end tests run in CI.',
    ],
    image: 'images/projects/animatch/compare.png',
    images: [
      {
        src: 'images/projects/animatch/compare.png',
        caption: 'compare — taste match score, breakdown, biggest disagreements',
      },
      {
        src: 'images/projects/animatch/compare-dark.png',
        caption: 'dark theme',
      },
      {
        src: 'images/projects/animatch/backlog.png',
        caption: 'shared backlog — ranked by predicted mutual score',
      },
      {
        src: 'images/projects/animatch/groups.png',
        caption: 'groups — member stats and a pairwise taste-match grid',
      },
      {
        src: 'images/projects/animatch/recommendations.png',
        caption: 'recommendations — picks neither has listed, with a reason for each',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/animatch',
      demo: 'https://animatch-moe.vercel.app',
    },
    tags: [
      'Angular',
      'TypeScript',
      'AniList GraphQL',
      'OAuth',
      'Canvas',
      'Playwright',
      'CI/CD',
      'Web',
    ],
    featured: true,
    command: 'glow animatch.md',
    status: 'live',
    year: '2026',
    stack: 'Angular · AniList GraphQL',
  },
];
