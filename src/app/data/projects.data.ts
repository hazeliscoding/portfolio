export interface ProjectImage {
  src: string;
  caption: string;
}

/**
 * Where a project sits on the projects page: a shipped app or live website
 * under Shipped, an experiment under Building now.
 */
export type ProjectKind = 'app' | 'site' | 'pilot';

/** A project's own colours and marks, from its repo's brand folder, tuned for the dark station. */
export interface ProjectBrand {
  /** Name, call to action and links: the light end of the brand's palette. */
  ink: string;
  /** Channel chip, status badge and ticker: the brand's own colour. */
  tint: string;
  /** The segment's background glow, only where a wash of `tint` isn't the brand's look. */
  glow?: string;
  /** The app icon, above the name. */
  icon: string;
  /** The small mark in the channel guide and bug; the icon itself when there is no separate mark. */
  mark: string;
}

/** One repository of a project that spans several. */
export interface ProjectPart {
  label: string;
  url: string;
  note: string;
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
  kind: ProjectKind;
  /** The one line under the name. */
  pitch: string;
  /** What it is, for the channel bug: Desktop, Website, Claude Code plugin… */
  medium: string;
  brand: ProjectBrand;
  /** Hard facts for the segment's ticker, each taken from the project's own README or write-up. */
  ticker?: string[];
  /** Fine print after the platforms on the call to action. */
  note?: string;
  /** Commands that install it, shown in place of a download button. */
  install?: string[];
  /** The repos of a project that spans several, each linking its own. */
  parts?: ProjectPart[];
  /** A phone-sized capture, shown beside a live site's browser frame. */
  phone?: string;
  /** The project's character, a die-cut sticker set on the corner of its segment's screen. */
  mascot?: { src: string; alt: string };
  /**
   * What a project with nothing to screenshot yet shows in its band's place for
   * a screen: its mascot, or a prototype's output. Its `image` stays empty.
   */
  art?: { src: string; alt: string };
  /** A CLI's commands, drawn on its band's screen in place of a capture. */
  console?: { command: string; note: string }[];
}

export const projectsData: Project[] = [
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
    featured: true,
    command: 'glow xiv-vault.md',
    status: 'active',
    year: '2026',
    stack: '.NET 10 · Avalonia',
    kind: 'app',
    pitch: 'Move your Dalamud plugin setup to a new PC, with nothing lost.',
    medium: 'Desktop + CLI',
    brand: {
      ink: '#a9c7ff',
      tint: '#6c9eff',
      icon: 'images/projects/xiv-vault/icon.svg',
      mark: 'images/projects/xiv-vault/mark.svg',
    },
    ticker: [
      'SHA-256 verified backups',
      'A safety backup before every restore',
      'Brought back a 67-plugin setup',
      'Nearly 200 tests',
    ],
    note: 'app and CLI, updates itself',
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
    featured: true,
    command: 'glow gil-sweep.md',
    status: 'active',
    year: '2026',
    stack: '.NET 10 · Avalonia',
    kind: 'app',
    pitch: 'What should I farm for gil right now?',
    medium: 'Desktop',
    brand: {
      ink: '#f0cf85',
      tint: '#d9a94a',
      icon: 'images/projects/gil-sweep/icon.svg',
      mark: 'images/projects/gil-sweep/mark.svg',
    },
    ticker: [
      'About 100 gatherables priced per sweep',
      'The Eorzea clock for timed nodes',
      '125 tests on recorded market data',
    ],
    note: 'no account, no telemetry',
  },
  {
    id: 'prompuff',
    title: 'Prompuff',
    description:
      'A local-first desktop app for Windows, macOS and Linux that keeps the AI prompts that actually worked — saved, tagged and versioned, with their {{variables}} filled in and copied in one step, and nothing leaving the machine.',
    longDescription: [
      'Each prompt keeps a title, description, body, a note on why it worked, a collection, tags, a favorite flag and a 1–5 usefulness rating. The Render tab lists a prompt’s {{variables}}, previews the result as values are filled in and copies it, leaving anything unfilled as a token. Search covers titles, bodies, notes and tags, #tag filters by tag, a command palette opens, copies or runs anything from the keyboard, and Quick save starts a new prompt from whatever is on the clipboard. Prompts travel as plain Markdown, one file per prompt, so import and export never need Prompuff on the other end.',
      'Versioning is the core rule. Every distinct saved state of a prompt’s title, description, body and notes is a version with a generated note such as “Edited body (+3 −1 lines)”, a save that changes none of them creates nothing, and restoring an old version adds it as a new one, so the history never loses a step; the History tab shows each version’s line diff. Under the Avalonia app sit separate Domain, Application and Infrastructure layers, and the library is one SQLite file reached through hand-written SQL rather than an ORM. Schema migrations run against PRAGMA user_version after the database is copied to a backup, and the Markdown frontmatter reader and writer are hand-written too, so there is no YAML dependency.',
      'It ships for Windows as a signed per-user Velopack installer, for macOS as a package or a zip, and for Linux as an AppImage, all self-contained and all updating themselves. A pushed tag tests and packs every platform, starts the AppImage under Xvfb to check that it creates its library, and opens a draft release, and headless UI tests drive the real main window through saving, rendering, copying and restarting on Windows and Linux runners. There is no account, telemetry or AI call: the only network request is the update check, and logs record prompt IDs, never their text.',
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
    kind: 'app',
    pitch: 'Keep the AI prompts that actually worked, on your own machine.',
    medium: 'Desktop',
    brand: {
      ink: '#cdb4ff',
      tint: '#b48eff',
      icon: 'images/projects/prompuff/icon.svg',
      mark: 'images/projects/prompuff/mark.svg',
    },
    ticker: [
      'Every save is a version',
      'Fill in {{variables}}, copy in one step',
      'Plain Markdown in and out',
    ],
    note: 'nothing leaves your machine',
  },
  {
    id: 'sweepling',
    title: 'Sweepling',
    description:
      'A Windows tray app that notices the processes your Claude Code sessions left running — dev servers, file watchers, little scripts — and closes them only after you confirm, re-checking each one right before it does.',
    longDescription: [
      'A Claude Code session starts dev servers, file watchers and little scripts, and when it ends many of them keep running, holding ports and memory and blocking the next npm run dev. Windows doesn’t clean them up, and Task Manager lists them as bare node.exe, tail.exe and grep.exe rows. The first scan of one machine found next dev holding port 3001 for 35 hours with nothing connected, and 20 watchers Claude Code had started. Sweepling sits in the tray, counts the leftovers of sessions that have ended and notifies when the count rises. Its review window says what each one is in words, with its project folder, age, port and memory, and closes a whole group with one click; strays of a session that is still running get their own section and are never ticked.',
      'Every 5 seconds it takes a Toolhelp32 snapshot and keeps a family tree for each Claude Code session. Windows doesn’t reparent orphans, so a parent counts as gone when its PID no longer exists or now belongs to a process that started after the child. A stray is tied to its session three ways, strongest first: the family tree Sweepling watched form, the CLAUDE_PID Claude Code puts in the environment of everything it starts, then command-line rules. It is offered only when its parent has been gone for a 60-second grace period, nothing in its group has an established TCP connection or is a windowed app, and it isn’t protected, and a session Sweepling can’t prove has ended counts as running. Right before closing, it re-checks the group’s connections and each process’s start time, because Windows reuses process IDs. Agent roots, rules, the protect list and grace periods live in a rules file, so new agent behaviour needs a rules change rather than a release.',
      'It is .NET 10 and Avalonia 12 compiled with NativeAOT, with Win32 calls through CsWin32 and its own Shell_NotifyIcon tray icon, and it renders in software, which took tray-only idle from 73.9 MB to 13.7 MB of private bytes. A signed per-user Velopack installer starts it at login and keeps it up to date; it sees only your own processes and never asks for administrator rights. There is no telemetry: the update check is its only network call, and the local log of what it closed masks command lines. Synthetic process tables test every rule, each proven by breaking it, and integration tests close a fake orphaned dev server until its port frees and refuse to close a reused PID.',
    ],
    image: 'images/projects/sweepling/review.png',
    images: [
      {
        src: 'images/projects/sweepling/review.png',
        caption: 'review — three leftovers ticked with their folder, age, port and memory, and a running session’s dev server left alone',
      },
      {
        src: 'images/projects/sweepling/review-light.png',
        caption: 'light theme',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/sweepling',
    },
    tags: ['C#', '.NET', 'Avalonia', 'NativeAOT', 'Win32', 'Velopack', 'xUnit', 'CI/CD', 'Desktop'],
    command: 'glow sweepling.md',
    status: 'active',
    year: '2026',
    stack: 'Avalonia · NativeAOT',
    kind: 'app',
    pitch: 'Find what your Claude Code sessions left running, and close it only when you say so.',
    medium: 'Tray app',
    // Straw bristles, pistachio handle, ink-green band: the mark's own three.
    brand: {
      ink: '#dcecc4',
      tint: '#e9b949',
      glow: 'rgba(36, 72, 56, 0.75)',
      icon: 'images/projects/sweepling/icon.svg',
      mark: 'images/projects/sweepling/icon.svg',
    },
    ticker: [
      'Closes only what you confirm',
      'Found a dev server idle for 35 hours',
      'Re-checks before every close',
      'No admin rights, no telemetry',
    ],
    note: 'signed, updates itself',
    // Primrose's "Close these?" sticker from the repo's brand folder, at 320 px.
    mascot: {
      src: 'images/projects/sweepling/primrose.png',
      alt: 'Primrose, Sweepling’s café owner, holds up a finger and a tray as she asks whether to clear a table.',
    },
  },
  {
    id: 'conatlas-tx',
    title: 'ConAtlas TX',
    description:
      'A free, open-source calendar of every anime convention in Texas on one calm page — every date, venue and status checked against the organizer’s own site, with no accounts, no tracking and no guessed dates.',
    longDescription: [
      'ConAtlas TX is a convention calendar for fans, cosplayers and first-timers. The home page groups upcoming Texas anime conventions by month, each with its dates, venue and verification; the calendar spans each convention across its weekend; and on a phone a convention’s page has its dates, venue, a bookmark and an Add to calendar menu. If a con hasn’t announced its weekend, the site says so rather than guessing.',
      'The data is the product. Every convention lives in a plain YAML file versioned in Git, every published date, venue and status needs an official source, and each listing shows when it was last checked. A maintainer reviews every change before it’s published: Claude Code can help research updates, but nothing reaches the site without human approval. A data CLI checks every file and cross-record rule, lists the conventions due for a re-check and compares staged drafts with what’s published.',
      'The site is static Astro, so it builds and runs without a server, database or AI service, and its fonts are self-hosted so a visit makes no third-party requests. Browser smoke and axe checks run against the build, both colour modes meet WCAG AA, and the convention data is CC BY 4.0 for anyone to reuse with attribution.',
    ],
    image: 'images/projects/conatlas-tx/home.png',
    images: [
      {
        src: 'images/projects/conatlas-tx/home.png',
        caption: 'home — upcoming Texas conventions by month, each with its dates, venue and verification',
      },
      {
        src: 'images/projects/conatlas-tx/calendar.png',
        caption: 'calendar — a month in dark mode, each convention spanning its weekend',
      },
      {
        src: 'images/projects/conatlas-tx/convention-phone.png',
        caption: 'on a phone — a convention’s dates, venue, bookmark and Add to calendar',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/conatlas-tx',
      demo: 'https://conatlas-tx.vercel.app',
    },
    tags: ['Astro', 'TypeScript', 'YAML', 'Open data', 'Website'],
    command: 'glow conatlas-tx.md',
    status: 'public beta',
    year: '2026',
    stack: 'Astro · TypeScript',
    kind: 'site',
    pitch: 'Every anime convention in Texas on one calm page, with dates checked against each organizer’s own site.',
    medium: 'Website',
    // Dusty pink, brightened the way the site's own dark mode brightens it.
    brand: {
      ink: '#f2b8cb',
      tint: '#e98aa8',
      icon: 'images/projects/conatlas-tx/icon.svg',
      mark: 'images/projects/conatlas-tx/icon.svg',
    },
    ticker: [
      'Every Texas anime con on one page',
      'Every date has an official source',
      'No guessed dates',
      'Static: no server, no database',
    ],
    note: 'no accounts, no tracking',
    phone: 'images/projects/conatlas-tx/convention-phone.png',
  },
  {
    id: 'staypaw',
    title: 'Staypaw',
    description:
      'A Windows tray app that puts your keyboard focus back when another app steals it — a chat popup, an installer, a browser an agent is driving — and holds the keys you press meanwhile so the stealer never gets them. Nothing injected, no telemetry.',
    longDescription: [
      'Windows lets apps pull focus to themselves, and your next keypress lands in the wrong window, sometimes on its default button: Space has cancelled a Visual Studio install, and Esc has killed a Bluetooth transfer. PowerToys #65 has asked for a fix since 2019. Staypaw puts focus straight back where you were typing, and protects one app you pick, a game or your editor, so nothing takes focus from it unless you click or Alt+Tab away, even while you’re idle.',
      'A key you press during a steal never reaches the app that stole focus. Staypaw holds it and sends it to your window once focus is back, or drops it if that window is a game, so nothing is ever replayed into a match. Its tray menu protects the app you were just in, names the app that took focus last and the one that takes it most, and opens a focus log that lists every focus change and what Staypaw did about it.',
      'It watches your keyboard, so it is built to be easy to trust. Nothing is injected: its low-level keyboard hook runs inside Staypaw itself, and it never touches a game’s process. It keeps the time of each keypress, never the key, and writes nothing about keys to disk. The update check is its only network call, and the code that sees your keys can’t reach the network: a test fails if it references the updater or any networking code. It is .NET and Avalonia compiled with NativeAOT, and ships as a signed per-user installer that needs no admin rights and updates itself, plus a portable zip.',
    ],
    image: 'images/projects/staypaw/welcome.png',
    images: [
      {
        src: 'images/projects/staypaw/welcome.png',
        caption: 'welcome — Calla, and the app nothing takes focus from',
      },
      {
        src: 'images/projects/staypaw/tray.png',
        caption: 'tray menu — the protected app, the last and top stealers, and the focus log',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/staypaw',
    },
    tags: ['C#', '.NET', 'Avalonia', 'NativeAOT', 'Win32', 'Velopack', 'Desktop'],
    command: 'glow staypaw.md',
    status: 'active',
    year: '2026',
    stack: 'Avalonia · NativeAOT',
    kind: 'app',
    pitch: 'Put your keyboard focus back when another app steals it.',
    medium: 'Tray app',
    // Rust on paper, the mark's dark-background pair.
    brand: {
      ink: '#f6cba3',
      tint: '#e8954f',
      icon: 'images/projects/staypaw/icon.svg',
      mark: 'images/projects/staypaw/mark.svg',
    },
    ticker: [
      'Nothing injected',
      'Keys typed during a steal never reach the stealer',
      'No telemetry, no keys stored',
      'Signed, no admin rights',
    ],
    note: 'signed, updates itself',
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
    command: 'glow sdl3-porter.md',
    status: 'stable',
    year: '2026',
    stack: 'Claude Code · SDL3',
    kind: 'app',
    pitch: 'Port SDL2 code to SDL3, and catch the bugs that still compile.',
    medium: 'Claude Code plugin',
    brand: {
      ink: '#fdba74',
      tint: '#fb923c',
      icon: 'images/projects/sdl3-porter/icon.svg',
      mark: 'images/projects/sdl3-porter/icon.svg',
    },
    ticker: [
      '17 traps, each proven in CI',
      'Haiku 4.5: 0.39 → 0.92 on a whole game',
      'Dogfooded on Woof! and scrcpy',
    ],
    install: [
      '/plugin marketplace add hazeliscoding/sdl3-porter',
      '/plugin install sdl3-porter@sdl3-porter',
    ],
  },
  {
    id: 'axiomarium',
    title: 'Axiomarium',
    description:
      'My open lab for building, testing and debugging an AI coding environment like software: the agents, skills, hooks, policies and evals I use, plus axm, a local CLI that inspects, validates and tests them.',
    longDescription: [
      'AI coding configuration drifts. Instructions contradict each other, skills overlap, old rules stay forever, and broken behaviour gets fixed by adding more prose. Axiomarium treats that as an engineering problem: failures should become tests, not paragraphs. Its vault holds agents, skills, hooks, policies, workflows, schemas and evals as plain Markdown, YAML and JSON Schema, and every asset carries a manifest saying what it is, which harnesses it supports, what it may touch, how it’s tested and how far it can be trusted.',
      'axm is the engineering around the vault. axm explain shows what Claude Code and Codex actually load for a file, what they silently drop and which skills and hooks reach the agent; axm doctor checks the instruction files, skills and hooks of any repo; axm triggers finds skills whose descriptions overlap, and axm triggers test runs a skill’s trigger prompts on both harnesses to see whether the agent picks it. Since v0.5, axm eval run runs an asset’s eval cases in a sealed home, and axm conflicts --judge has a model find instructions that contradict each other.',
      'It’s in early development and built for my own setup first. In a terminal the output is in colour, with a kaomoji for the outcome; piped, in CI or read by an agent, it’s plain text.',
    ],
    image: 'images/projects/axiomarium/doctor.gif',
    images: [
      {
        src: 'images/projects/axiomarium/doctor.gif',
        caption: 'axm doctor — an edit claims a maturity its evidence doesn’t back, and the doctor says so',
      },
      {
        src: 'images/projects/axiomarium/explain.gif',
        caption: 'axm explain — what Claude Code and Codex each load, drop and run for one file',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/axiomarium',
    },
    tags: ['C#', 'CLI', 'Claude Code', 'Codex', 'LLM Evals'],
    command: 'glow axiomarium.md',
    status: 'early development',
    year: '2026',
    stack: 'C# · CLI',
    kind: 'pilot',
    pitch:
      'Build, test and debug your AI coding setup like software: agents, skills, hooks and evals, plus the axm CLI.',
    medium: 'CLI',
    brand: {
      ink: '#f58cbb',
      tint: '#f0569b',
      icon: 'images/projects/axiomarium/icon.svg',
      mark: 'images/projects/axiomarium/icon.svg',
    },
    console: [
      { command: 'axm explain', note: 'what Claude Code and Codex load' },
      { command: 'axm doctor', note: 'check instructions, skills, hooks' },
      { command: 'axm triggers test', note: 'does the agent pick the skill?' },
      { command: 'axm eval run', note: 'run evals in a sealed home' },
      { command: 'axm conflicts --judge', note: 'find instructions that contradict' },
    ],
  },
  {
    id: 'shybun',
    title: 'Shybun',
    description:
      'A Windows tray app where one key mutes your mic and camera in every app, and a badge shows you’re muted only when Windows confirms it.',
    longDescription: [
      'Windows has no camera key, and its own mic key, Win+Alt+K, works only in apps that support it. PowerToys’ Video Conference Mute did both until v0.88.0 removed it in January 2025, and people still hold PowerToys at 0.87.1 to keep it. Shybun brings it back as one key that mutes every mic Windows has and the Shybun camera, from any app and without moving focus, so a Meet tab behind your editor goes quiet too. A headset plugged in while you’re muted is muted the moment it appears.',
      'A small always-on-top badge shows the mic’s and the camera’s state as Windows reports it, read back after every change, and when Shybun can’t confirm a device is quiet, the badge says so instead of guessing. The mic half flips Windows’ own mute switch, so a meeting app’s mute icon doesn’t change: trust the badge, not the app. The Shybun camera is a Windows 11 virtual camera you pick once in each meeting app; it passes your camera through, and sends a camera-off image while you’re muted.',
      'It’s in development: the mic half and the badge work when built from source, and the camera and a first release come next. It is .NET 10 and Avalonia 12 compiled with NativeAOT, with Win32 and COM through CsWin32, and its mute rules live in a core with no Win32 so they test without devices. Nothing is injected and nothing is recorded, the update check is its only network call, and only the camera needs admin, once, at install.',
    ],
    image: '',
    links: {
      github: 'https://github.com/hazeliscoding/shybun',
    },
    tags: ['C#', '.NET', 'Avalonia', 'NativeAOT', 'Win32', 'Desktop'],
    command: 'glow shybun.md',
    status: 'in development',
    year: '2026',
    stack: 'Avalonia · NativeAOT',
    kind: 'pilot',
    pitch: 'One key mutes your mic and camera in every Windows app.',
    medium: 'Tray app',
    // Blush on paper, the mark's dark-background pair.
    brand: {
      ink: '#f9c9d9',
      tint: '#f08fb0',
      icon: 'images/projects/shybun/icon.svg',
      mark: 'images/projects/shybun/mark.svg',
    },
    ticker: [
      'Mutes every mic, from any app',
      'A badge that waits for Windows to confirm',
      'Nothing recorded, no telemetry',
    ],
    art: {
      src: 'images/projects/shybun/shiori.png',
      alt: 'Shiori, Shybun’s shy homebody, covers her eyes with one hand and her mouth with the other and peeks out with one eye, as Shybun mutes the camera and the mic together.',
    },
  },
  {
    id: 'tattlehop',
    title: 'Tattlehop',
    description:
      'A Windows tray app and Claude Code plugin that keeps a receipt of what your coding agents changed on your PC outside the repo, and undoes it once you confirm. Nothing leaves your PC.',
    longDescription: [
      'Git shows what an agent changed in your repo. It doesn’t show the global npm package, the PATH entry, the .gitconfig line or the startup entry it added along the way, and on Windows Claude Code’s sandbox doesn’t run at all, so an agent’s commands can do anything you can. Run three agents at once and nobody can say which one did it. Tattlehop keeps a receipt for every command an agent runs, naming the command and the session behind each change, with Undo.',
      'Before and after each Bash or PowerShell call, it will snapshot the places agents change outside the repo: environment variables, installed apps and global npm, pip and dotnet tool packages, startup entries, scheduled tasks and services, dotfiles such as .gitconfig and .ssh/config, and new items in your home folder. Blame stays fair: a change found while one command ran is tied to it, two commands running at once get “one of these”, and receipts say “while”, never “by”. Undo puts a change back only after you confirm, and one that needs admin shows the exact command to run instead.',
      'It’s at the planning stage: the .NET 10 and Avalonia 12 projects and their guardrail tests are scaffolded, and receipts come first. Its hooks arrive as a Claude Code plugin you add yourself, so you see them before they run. Taking a snapshot changes nothing, a slow or failing snapshot never blocks your agent, old values are kept encrypted with Windows DPAPI for 30 days so Undo can restore them, and the update check is its only network call.',
    ],
    image: '',
    links: {
      github: 'https://github.com/hazeliscoding/tattlehop',
    },
    tags: ['C#', '.NET', 'Avalonia', 'NativeAOT', 'Claude Code', 'Desktop'],
    command: 'glow tattlehop.md',
    status: 'planning',
    year: '2026',
    stack: 'Avalonia · NativeAOT',
    kind: 'pilot',
    pitch: 'See what your coding agents changed outside the repo, and undo it.',
    medium: 'Tray app + Claude Code plugin',
    // Cornflower on paper, the mark's dark-background pair.
    brand: {
      ink: '#c6d6fb',
      tint: '#8fb0f5',
      icon: 'images/projects/tattlehop/icon.svg',
      mark: 'images/projects/tattlehop/mark.svg',
    },
    ticker: [
      'A receipt for every agent command',
      'Undo only after you confirm',
      'Nothing leaves your PC',
    ],
    art: {
      src: 'images/projects/tattlehop/tilly.png',
      alt: 'Tilly, Tattlehop’s front-desk clerk, peeks wide-eyed over a long receipt she holds up to her face, as Tattlehop keeps a receipt for every command an agent runs.',
    },
  },
  {
    id: 'carmine-workbench',
    title: 'Carmine Workbench',
    description:
      'A local-first desktop app that swaps the tokens, cookies and API keys in curl commands, headers, logs and JSON for labels before you share them, so the debugging detail stays. Nothing you paste leaves your PC.',
    longDescription: [
      'When an integration breaks, you paste curl commands, headers, logs and tokens into tickets, chats and vendor support portals, and that is how credentials leak: in 2023, attackers took HAR files from Okta’s support system and used the session tokens inside them against Okta’s customers. Carmine removes what grants access, keeps what helps debugging, and shows you every change in a diff before you copy.',
      'It removes bearer tokens, cookies, API keys, secret URL parameters, sensitive JSON keys, private keys and known key formats, and keeps the structure: the same secret gets the same label everywhere, so a reader can still follow it across requests. Any JWT it finds is explained, with its decoded claims, its expiry in plain time and warnings; it decodes tokens but never verifies them. Each rule is one folder, a small detector plus its fixtures.',
      'It’s in early development: the screen shows a canned sample, and there is nothing to install yet. On 2026-10-24 it moved from Angular and Tauri to .NET 10 and Avalonia 12 with NativeAOT, and the engine was ported rather than redesigned: the fixtures moved unchanged, and every case must come out byte for byte as it did before. Input stays in memory only, with no history and no telemetry, and CI rejects any networking code beyond the update check.',
    ],
    image: 'images/projects/carmine-workbench/sanitize.png',
    images: [
      {
        src: 'images/projects/carmine-workbench/sanitize.png',
        caption: 'sanitize — three findings, the curl with its secrets marked, the labelled diff and the decoded JWT, on a canned sample',
      },
    ],
    links: {
      github: 'https://github.com/hazeliscoding/carmine-workbench',
    },
    tags: ['C#', '.NET', 'Avalonia', 'NativeAOT', 'Security', 'Desktop'],
    command: 'glow carmine-workbench.md',
    status: 'early development',
    year: '2026',
    stack: 'Avalonia · NativeAOT',
    kind: 'pilot',
    pitch: 'Swap the secrets in curl commands and logs for labels before you share them.',
    medium: 'Desktop',
    // The mark's carmine, lifted so the sticker's dark text still reads on it.
    brand: {
      ink: '#f2b3b0',
      tint: '#e0605f',
      icon: 'images/projects/carmine-workbench/icon.svg',
      mark: 'images/projects/carmine-workbench/mark.svg',
    },
    ticker: [
      'The same secret, the same label everywhere',
      'Decodes JWTs, never verifies them',
      'Nothing you paste leaves your PC',
    ],
  },
  {
    id: 'mendmoth',
    title: 'Mendmoth',
    description:
      'A web app that shows your sticker on every background, fills the see-through gaps dark mode gives away, and exports it for every place you post. Nothing leaves your browser.',
    longDescription: [
      'A sticker can look finished on a white page and still have see-through gaps inside its outline: a sliver between an arm and the body, a gap under the hair. On GitHub’s dark mode or in Discord those gaps show as dark slivers, and you only find out after you’ve posted. Mendmoth shows your sticker on white, black, GitHub’s light and dark, Discord’s dark, a checkerboard and your own brand colours, side by side at 50%, 100% and 200%.',
      'It finds holes, the see-through areas inside the art that the outside can’t reach, and warns about a narrow gap that does reach the outside, since it may be meant. It mends them in a copy with the sticker’s border colour, like the vinyl of a real die-cut sticker, once you approve each fill, and every pixel outside those holes stays exactly as it was. Then it exports sets for READMEs, Discord, Telegram, LINE, socials and blogs, sized from each platform’s own docs.',
      'It’s at the planning stage. The hole finder was prototyped on 2026-10-24 on Calla from Staypaw and Primrose from Sweepling, whose stickers stay out of their READMEs until their gaps are filled. It will be Vite and plain TypeScript with no UI framework: Canvas 2D draws the previews, and the hole finder is a pure function over RGBA pixels, tested with Vitest and run in a Web Worker so a large PNG never freezes the page. It’s a static page, with no uploads, accounts or analytics.',
    ],
    image: '',
    links: {
      github: 'https://github.com/hazeliscoding/mendmoth',
    },
    tags: ['TypeScript', 'Vite', 'Canvas', 'Web Worker', 'Image processing'],
    command: 'glow mendmoth.md',
    status: 'planning',
    year: '2026',
    stack: 'TypeScript · Canvas',
    kind: 'pilot',
    pitch: 'Mend the see-through gaps dark mode finds in your stickers.',
    medium: 'Web app',
    // The mark's dark-background rose.
    brand: {
      ink: '#f8c6d4',
      tint: '#f08aa8',
      icon: 'images/projects/mendmoth/icon.svg',
      mark: 'images/projects/mendmoth/mark.svg',
    },
    ticker: [
      'Hole finder prototyped on real stickers',
      'Mends a copy, never your original',
      'Nothing leaves your browser',
    ],
    // The prototype's output, the nearest thing to a screenshot so far.
    art: {
      src: 'images/projects/mendmoth/calla-mended.png',
      alt: 'Calla, Staypaw’s cat-eared homebody, on GitHub’s dark background. On the left, two dark slivers show between her arms and her body. On the right, Mendmoth’s prototype has filled them magenta and ringed them.',
    },
  },
];
