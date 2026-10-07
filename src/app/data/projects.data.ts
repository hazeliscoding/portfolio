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
  {
    id: 'prompuff',
    title: 'Prompuff',
    description:
      'A local-first desktop app for Windows and Linux that keeps the AI prompts that actually worked — saved, tagged and versioned, with their {{variables}} filled in and copied in one step, and nothing leaving the machine.',
    longDescription: [
      'Each prompt keeps a title, description, body, a note on why it worked, a collection, tags, a favorite flag and a 1–5 usefulness rating. The Render tab lists a prompt’s {{variables}}, previews the result as values are filled in and copies it, leaving anything unfilled as a token. Search covers titles, bodies, notes and tags, #tag filters by tag, a command palette opens, copies or runs anything from the keyboard, and Quick save starts a new prompt from whatever is on the clipboard. Prompts travel as plain Markdown, one file per prompt, so import and export never need Prompuff on the other end.',
      'Versioning is the core rule. Every distinct saved state of a prompt’s title, description, body and notes is a version with a generated note such as “Edited body (+3 −1 lines)”, a save that changes none of them creates nothing, and restoring an old version adds it as a new one, so the history never loses a step; the History tab shows each version’s line diff. Under the Avalonia app sit separate Domain, Application and Infrastructure layers, and the library is one SQLite file reached through hand-written SQL rather than an ORM. Schema migrations run against PRAGMA user_version after the database is copied to a backup, and the Markdown frontmatter reader and writer are hand-written too, so there is no YAML dependency.',
      'It ships for Windows as a per-user Velopack installer that updates itself and for Linux as an AppImage, both self-contained. A pushed tag tests and packs both platforms, starts the AppImage under Xvfb to check that it creates its library, and opens a draft release, and headless UI tests drive the real main window through saving, rendering, copying and restarting on Windows and Linux runners. There is no account, telemetry or AI call: the only network request is the update check, and logs record prompt IDs, never their text.',
    ],
    image: 'images/projects/prompuff/library.png',
    images: [
      {
        src: 'images/projects/prompuff/library.png',
        caption: 'library — collections, tags, favorites and usefulness ratings',
      },
      {
        src: 'images/projects/prompuff/edit.png',
        caption: 'edit — the prompt, its detected variables and why it worked',
      },
      {
        src: 'images/projects/prompuff/render.png',
        caption: 'render & copy — values filled in, the unfilled variable left as a token',
      },
      {
        src: 'images/projects/prompuff/history.png',
        caption: 'history — every saved change as a version, with a line diff and restore',
      },
      {
        src: 'images/projects/prompuff/quick-save.png',
        caption: 'quick save — a new prompt from whatever is on the clipboard',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/prompuff',
    },
    tags: ['C#', '.NET', 'Avalonia', 'SQLite', 'Velopack', 'xUnit', 'CI/CD', 'Desktop'],
    featured: true,
    command: 'glow prompuff.md',
    status: 'active',
    year: '2026',
    stack: 'Avalonia · SQLite',
  },
  {
    id: 'sdl3-porter',
    title: 'sdl3-porter',
    description:
      'A Claude Code plugin that ports C and C++ code from SDL2 to SDL3, then catches the changes that still compile but break at runtime — 17 traps, each proven by fixtures in CI and measured against agents working without it.',
    longDescription: [
      'SDL’s rename scripts handle most of an SDL2 port and the compiler catches most of the rest, but neither catches code that still compiles and now means something else. SDL3 functions return true on success, so a leftover SDL_Init(...) != 0 check exits on every launch; a stream opened with SDL_OpenAudioDeviceStream starts paused, so the game plays no sound; textures filter linearly by default, so pixel art blurs. Coding agents make the same mistakes, because most of the SDL code they learned from is SDL2. sdl3-porter runs SDL’s own rename scripts from pinned copies, fixes the build one subsystem at a time, then sweeps every subsystem the code uses for traps and reports each one by file, line and trap id, along with what still needs a person.',
      'A trap only ships once it’s proven. Each has three small programs — the SDL2 original, the naive port that compiles and fails, and the correct port — and CI builds them against SDL 2.32, 3.2.0 and 3.4.18 and runs them headless on Windows, Linux and macOS: the naive port must fail and the other two must pass. Evals then run Claude Code on each trap’s sample and on a whole game, five times with the skill and five without, on Sonnet 5 and Haiku 4.5. With it, Sonnet 5 fixes every trap, and on the whole game Haiku 4.5 goes from 0.39 to 0.92.',
      'It was dogfooded on real ports and compared with the maintainers’ own: Woof!, a Doom source port of about 165,000 lines, and scrcpy, about 31,000. Every miss became a trap, a fix to the skill or a roadmap item, and Woof!’s menu turned up a mouse-mapping bug, now the logical-scale-separate trap, that the maintainers’ port has too. It installs from its own Claude Code plugin marketplace, ships the SDL3 headers, migration guide and rename scripts it needs, collects no data, and keeps its trap ids and report format stable across every 1.x release.',
    ],
    image: 'images/projects/sdl3-porter/before.png',
    images: [
      {
        src: 'images/projects/sdl3-porter/before.png',
        caption: 'the bug that compiles — a naive port that builds against SDL3 without a warning',
      },
      {
        src: 'images/projects/sdl3-porter/report.png',
        caption: 'report — each trap by file, line and id, and what still needs a person',
      },
      {
        src: 'images/projects/sdl3-porter/trap-card.png',
        caption: 'trap card — what compiles, what breaks, the fix and its fixture',
      },
      {
        src: 'images/projects/sdl3-porter/evals.png',
        caption: 'evals — Claude Code with and without the skill, five runs per case',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/sdl3-porter',
    },
    tags: [
      'Claude Code',
      'Agent Skills',
      'SDL3',
      'C/C++',
      'LLM Evals',
      'Python',
      'CMake',
      'CI/CD',
    ],
    featured: true,
    command: 'glow sdl3-porter.md',
    status: 'stable',
    year: '2026',
    stack: 'Claude Code · SDL3',
  },
];
