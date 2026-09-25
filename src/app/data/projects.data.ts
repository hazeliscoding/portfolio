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
  {
    id: 'quickbase-net',
    title: 'QuickbaseNet',
    description:
      'A .NET library for Quickbase’s JSON API — fluent builders for querying, inserting, updating and deleting records, with typed results instead of exceptions. Published on NuGet.',
    longDescription: [
      'Quickbase’s API addresses everything by numeric field ID. A query is a JSON body with a table ID, field IDs and a where clause in Quickbase’s own query language, and records come back as dictionaries keyed by field ID with every value wrapped in an object. QuickbaseNet puts a fluent layer over that: a query builder covers select, where, sort and group, and a command builder batches new records and updates into one request against Quickbase’s upsert endpoint, or deletes whatever a where clause matches.',
      'Every call returns a result instead of throwing. QuickbaseResult<T> carries IsSuccess, the typed response and a QuickbaseError that says whether Quickbase rejected the request (4xx), failed on its side (5xx) or found nothing to return, so calling code branches on an outcome rather than wrapping each request in try/catch.',
      'It multi-targets .NET Standard 2.0 and 2.1, .NET Framework 4.8, .NET 5 and .NET 6, so it drops into legacy .NET Framework apps as well as current .NET. xUnit tests run against a mocked HTTP handler, GitHub Actions builds and tests every push and publishes to NuGet from version tags, and the package has close to 3,000 downloads.',
    ],
    image: 'images/projects/quickbase-net/query.png',
    images: [
      {
        src: 'images/projects/quickbase-net/query.png',
        caption: 'query — select, where, sort and group, then read values by field ID',
      },
      {
        src: 'images/projects/quickbase-net/upsert.png',
        caption: 'upsert — new records and updates in one request',
      },
      {
        src: 'images/projects/quickbase-net/errors.png',
        caption: 'delete — results instead of exceptions',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/quickbase-net',
      nuget: 'https://www.nuget.org/packages/QuickbaseNet',
    },
    tags: ['C#', '.NET', 'NuGet', 'REST API', 'Fluent API', 'xUnit', 'CI/CD', 'Library'],
    command: 'glow quickbase-net.md',
    status: 'stable',
    year: '2024',
    stack: 'C# · .NET Standard',
  },
];
