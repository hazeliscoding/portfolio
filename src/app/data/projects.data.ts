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
];
