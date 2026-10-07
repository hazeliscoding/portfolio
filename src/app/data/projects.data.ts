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
    id: 'xiv-vault',
    title: 'XIV Vault',
    description:
      'A Windows desktop app and command-line tool that moves a Final Fantasy XIV player’s Dalamud plugin setup to a new PC — every plugin’s settings backed up as a hash-verified ZIP to OneDrive, a NAS or any folder, and restored with a safety backup taken first.',
    longDescription: [
      'Dalamud, the plugin framework XIVLauncher loads into the game, keeps each plugin’s settings in its own folder, and a new PC starts with none of them. XIV Vault backs up the portable part — plugin settings, Dalamud’s own settings and custom repositories, and its plugin database — and leaves the plugins themselves for Dalamud to download again. Backups run on demand or from a Windows scheduled task (daily, weekly or at login) that waits for the game to close, and a restore is a four-step wizard: choose a backup, review what it changes on this PC, pass the safety checks, restore. Nothing on disk changes before the last step.',
      'The engine is built never to make things worse. It reads and writes only an allowlist of files, and each archive is written as a temp file, read back and checked against the SHA-256 of every file before it counts, so a failed backup never looks like a finished one. A restore checks the manifest, takes a pre-restore safety backup, unpacks into a temporary folder, replaces files one rename at a time and puts every one back if anything fails part-way. Archives with traversal paths, files outside the allowlist or a manifest that misdescribes its contents are refused, and a named mutex stops the app, the CLI and a scheduled run from writing at once. Backups that OneDrive keeps online only are recognized from their Windows file attributes, so a new PC lists them without downloading any and fetches only the one it restores.',
      'The Avalonia desktop app and the Spectre.Console CLI are two front ends on one .NET 10 engine, and the CLI has JSON output and stable exit codes for scripts. It ships as a per-user Velopack installer that updates itself from GitHub releases through delta packages, plus portable builds, and the update check is its only network call. Nearly 200 xUnit tests and a CLI smoke test run in CI on Windows, the screenshots are rendered from the real views by Avalonia’s headless renderer against a fake XIVLauncher folder, and the first real restore brought back a 67-plugin setup.',
    ],
    image: 'images/projects/xiv-vault/overview.png',
    images: [
      {
        src: 'images/projects/xiv-vault/overview.png',
        caption: 'overview — protection status, last backup and recent verified archives',
      },
      {
        src: 'images/projects/xiv-vault/backups.png',
        caption: 'backups — each archive with its plugin count, type and integrity',
      },
      {
        src: 'images/projects/xiv-vault/restore-review.png',
        caption: 'restore review — the backup compared with this PC before anything changes',
      },
      {
        src: 'images/projects/xiv-vault/restore-checks.png',
        caption: 'safety check — game closed, hashes verified, safety backup ready',
      },
      {
        src: 'images/projects/xiv-vault/schedule.png',
        caption: 'schedule — a Windows scheduled task that waits for the game to close',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/xiv-vault',
    },
    tags: ['C#', '.NET', 'Avalonia', 'CLI', 'Velopack', 'xUnit', 'CI/CD', 'Desktop'],
    command: 'glow xiv-vault.md',
    status: 'active',
    year: '2026',
    stack: '.NET 10 · Avalonia',
  },
  {
    id: 'gil-sweep',
    title: 'Gil Sweep',
    description:
      'A Windows desktop app that answers one question for Final Fantasy XIV gatherers — what should I farm for gil right now? It prices the gatherables on your world, weighs competition, price trend and the in-game clock for timed nodes, and ranks the best farm with the reasons why.',
    longDescription: [
      'Each sweep prices about a hundred tracked gatherables on the player’s world through Universalis and gives every item an opportunity score from 0 to 100: how much gil changes hands for it each day, how many days of stock already sit on the market board, which way its price moved over the week, and, for timed nodes, how long until the Eorzea clock opens them. Only items the character can gather are ranked, and every score shows the facts behind it. It never shows gil per hour — it doesn’t know a node’s yield, the travel time or how fast someone gathers, so it compares markets instead of guessing. Around the ranking sit a Market view for one item in depth, a Craft view that says whether a material is worth more processed, and an optional Farm Session that queues what to gather now and which timed nodes open while you play.',
      'Version 2 is a native rewrite of an Electron and Angular original. The ranking was ported with characterization tests against outputs captured from the v1 TypeScript, so with the new adjustments set aside it orders items exactly as v1 did, and a v1 install’s settings, watchlist and sweep history come across on first start. Universalis only counts the listings a request returns, so competition is read from the stack-size histogram of every listing on the world, fetched 20 items at a time because larger batches time out. A provider failing part-way doesn’t lose the sweep, and when Universalis is down the last sweep stays on screen with a retry.',
      'While it runs, Gil Sweep sweeps hourly and sends Windows notifications for watched items — a reminder before a node opens, a price spike or crash, someone undercutting your retainers — and its tray icon keeps the Eorzea time and the next node windows. It is .NET 10 and Avalonia 12, installed per user with Velopack and updated in place, never during a sweep, and has no accounts or telemetry: everything it learns stays on the PC. 125 xUnit tests run offline against recorded market data in CI, which also renders every screen from fake data for the screenshots.',
    ],
    image: 'images/projects/gil-sweep/sweep.png',
    images: [
      {
        src: 'images/projects/gil-sweep/sweep.png',
        caption: 'sweep — the best farm right now, with price, sales, competition, trend and node',
      },
      {
        src: 'images/projects/gil-sweep/market.png',
        caption: 'market — one item in depth, and the signals behind its score',
      },
      {
        src: 'images/projects/gil-sweep/farm-session.png',
        caption: 'farm session — what to gather now and which timed nodes open while you play',
      },
      {
        src: 'images/projects/gil-sweep/craft.png',
        caption: 'craft — sell a material raw or process it first',
      },
      {
        src: 'images/projects/gil-sweep/watchlist.png',
        caption: 'watchlist — node reminders, price spikes and crashes, undercuts',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/gil-sweep',
    },
    tags: [
      'C#',
      '.NET',
      'Avalonia',
      'Universalis API',
      'Velopack',
      'xUnit',
      'CI/CD',
      'Desktop',
    ],
    command: 'glow gil-sweep.md',
    status: 'active',
    year: '2026',
    stack: '.NET 10 · Avalonia',
  },
];
