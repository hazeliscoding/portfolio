// Overglance's product page: its links and the copy its sections loop over.
// The facts come from the app's README; the screenshots in public/overglance
// show made-up data.

export const OVERGLANCE_DOWNLOAD_URL =
  'https://github.com/hazeliscoding/overglance-releases/releases/latest';

/** The Polar checkout link fills this before launch. The Buy button renders only once it's set. */
export const OVERGLANCE_CHECKOUT_URL = '';

export const OVERGLANCE_PRICE = 'Free for 7 days, then $9.99 once for 3 PCs';

export interface OverglanceShot {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface OverglanceSection {
  id: string;
  heading: string;
  body: string;
  /** Absent while no screenshot shows this tab with made-up data. */
  image?: OverglanceShot;
}

/** The open panel on its Home tab: the hero's mockup, and the still the launch video replaces. */
export const OVERGLANCE_MOCKUP: OverglanceShot = {
  src: 'overglance/midnight-home.webp',
  alt: 'The Overglance panel open on its Home tab: a Claude Code session waiting on an npm publish command with Allow and Deny buttons and "7 more" below it, Claude Code and Codex limits with a pace forecast, a Design review meeting with a Join button, and a song playing',
  width: 722,
  height: 418,
};

export const OVERGLANCE_SECTIONS: OverglanceSection[] = [
  {
    id: 'agents',
    heading: 'Your agents',
    body: 'A row for every Claude Code, Codex, Cursor, Copilot CLI, OpenCode, Factory Droid, Gemini CLI, Antigravity CLI, Qwen Code and Kiro CLI session: working, waiting for you and for what, done or failed. The pill grows when one finishes or asks for approval, and with a setting, Allow and Deny answer a Claude Code or Codex request from the panel.',
    image: {
      src: 'overglance/agents.webp',
      alt: 'Six agent rows: api waiting on "Bash npm run deploy", four working, and site failed',
      width: 882,
      height: 270,
    },
  },
  {
    id: 'limits',
    heading: 'Your AI limits',
    body: "Claude's 5-hour and weekly limits and Codex's, each with its reset countdown, a pace forecast and how old the number is. The closed pill carries the fullest limit as a gauge and a dot per session, so you see a limit coming without opening anything.",
    image: {
      src: 'overglance/midnight-closed.webp',
      alt: 'The closed pill: an amber gauge for the fullest limit and six agents’ dots, two of them amber for waiting',
      width: 240,
      height: 56,
    },
  },
  {
    id: 'day',
    heading: 'Your day',
    body: "The next meeting with a countdown and a Join button, today's list and the month, from calendar links you paste: Microsoft 365, Outlook.com or Google. Five minutes before a meeting, the pill grows.",
    image: {
      src: 'overglance/porcelain-home.webp',
      alt: 'The Porcelain theme: the Home tab with a Design review meeting happening now, 11:24 to 12:24, and its Join button',
      width: 722,
      height: 418,
    },
  },
  {
    id: 'music',
    heading: 'Your music',
    body: "What's playing in any app that shows in Windows' media controls, with its album art. Play, pause or skip from the panel instead of switching to the music app.",
    image: {
      src: 'overglance/graphite-home.webp',
      alt: 'The Graphite theme: the Home tab with "The Long Way Round" by Northbound Lights playing, its album art, and previous, pause and next buttons',
      width: 722,
      height: 418,
    },
  },
  {
    id: 'numbers',
    heading: 'Your numbers',
    body: 'Sales from Polar and Stripe and your YouTube channel’s views with a key you paste, sales from Lemon Squeezy and Shopify through their webhooks, and a stock watchlist with no key at all. A sale alerts within seconds, and Hide amounts keeps them off a shared screen.',
  },
  {
    id: 'typing',
    heading: 'Click to type',
    body: 'Quick notes and a Markdown task list, clipboard history, unit conversion and maths, and an Ask tab that chats with Claude or ChatGPT on your own API key. The panel takes focus only when you click into one of these.',
  },
  {
    id: 'tools',
    heading: 'Tools, and the Trust tab',
    body: "The weather, a timer, stopwatch and Pomodoro, your PC's CPU, memory, disk, network and battery, a grid of your shortcuts and a shelf for files. The Trust tab lists each network use, whether it's on, and when it last went online and to which host.",
  },
];

export const OVERGLANCE_THEMES: (OverglanceShot & { name: string })[] = [
  { name: 'Midnight', src: 'overglance/midnight-closed.webp', alt: '', width: 240, height: 56 },
  { name: 'Graphite', src: 'overglance/graphite-closed.webp', alt: '', width: 240, height: 56 },
  { name: 'Porcelain', src: 'overglance/porcelain-closed.webp', alt: '', width: 240, height: 56 },
];

export const OVERGLANCE_TRUST = [
  "It never reads your AI sign-ins. Claude's limits come from Claude Code's status line, Codex's from its session logs, and agent status from each tool's documented hooks. A test fails on code that tries.",
  'It goes online for eleven listed uses and no more. Each one but the update check stays off until you turn it on or paste its link or key, and the Trust tab shows them all.',
  'It takes focus only when you click into something to type, hides over fullscreen games and presentations, and reserves no screen space.',
  "Your agents' settings come back exactly as they were: uninstalling its hooks restores each config file byte for byte.",
];

export const OVERGLANCE_FAQ = [
  {
    q: 'How does the trial work?',
    a: 'Overglance works in full for 7 days from the first time it runs on a PC. After that, the panel shows only where to buy until you paste a key.',
  },
  {
    q: 'What does $9.99 buy?',
    a: 'One license key for up to 3 PCs you use, and every update of this major version. The purchase and the key go through Polar.',
  },
  {
    q: 'Where do updates come from?',
    a: 'Once a day it asks the public overglance-releases repo on GitHub for a newer version. A setting turns the check off.',
  },
  {
    q: 'Will it sit on top of a game or a presentation?',
    a: 'No. Overglance hides over fullscreen apps, and it never takes focus unless you click into something to type.',
  },
  {
    q: "What if it isn't for me?",
    a: 'A full refund within 14 days of purchase, no questions asked.',
  },
];
