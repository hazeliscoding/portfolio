# Privacy

Overglance runs on your PC and keeps what it knows there. This page says what it stores, what it sends and to whom, and what it never does. It's short because there's little to say.

## What Overglance stores, all on your PC

Everything lives under `%LOCALAPPDATA%\Overglance`, outside the program folder, so updates never touch it and a reinstall finds it:

- **Settings** (`settings.json`): your theme, size, hotkey, which alerts and modules are on, the trial's start date, and the dates of the last update check, license check and usage count. No key or link is in it.
- **Secrets, encrypted for your Windows account** with DPAPI, so another account on the PC can't read them: your calendar links, store keys, YouTube key, AI chat and AI credits keys, store webhook secrets, the relay secret and your license key. They're never logged, never put in an error message and never in a bug report.
- **Your quick note** (`note.txt`), as typed.
- **Agent hook records** (`hooks\`): a copy of each agent's config file as it was before Overglance edited it and as Overglance wrote it, so an uninstall restores it byte for byte.
- **Events** (`events\`): status files your own scripts write for the Home tab, if you use that.
- **A bug report** (`bug-report.txt`), only when you choose **Copy bug report** in the tray. What's in it is listed under Support.

Things Overglance reads but doesn't keep: your agents' hook events (which project a session is in, what it's waiting for, what it did), Claude Code's status line and the `token_count` lines of Codex's session logs for your limits, the song playing, your clipboard history (in memory only, and never what a password manager marks as secret), and files you drop on the pill, which the shelf holds by path until you drag them out or quit.

## What Overglance never does

- It never reads your AI sign-ins: no credential file, no token, no usage endpoint. Limits come from the status line and session logs, status from each tool's documented hooks.
- It never sends your agents' activity anywhere. Phone alerts, if you turn them on, carry the project and what happened, never the command or what the agent asked.
- It sends no telemetry. The one count it can send is off until you turn it on, and says only whether your copy is a trial or paid.
- It never takes a screenshot, records your screen or reads other apps' windows beyond their titles, which it needs to stay out of the way of fullscreen apps.

## What it sends, and to whom

Overglance goes online for eleven uses and no others; a test fails on network code anywhere else, and the panel's Trust tab shows each use, whether it's on, and when it last went online and to which host. Apart from the update check, each is off until you turn it on or paste its link or key.

| Use | What goes out | To whom |
| --- | --- | --- |
| Updates | A request for the list of releases, once a day | GitHub (`overglance-releases`) |
| Your calendar | Requests for the calendar links you pasted | Whoever hosts each calendar: Google, Microsoft, or your own server |
| Your license | Your license key and Overglance's organization ID, with your PC's name once to activate, then with the activation's ID once a week to check | Polar, which sold you the license |
| Usage counts, opt-in | `{"state":"trial"}` or `{"state":"paid"}`, once a day | Overglance's relay on Cloudflare |
| Weather | Your location, rounded to about 1 km | MET Norway |
| Sales | Your read-only store key, every 5 minutes; each sale's webhook passes through the relay | Polar and Stripe; the relay on Cloudflare |
| Stocks | Your watchlist's symbols | Yahoo Finance |
| YouTube | Your channel's handle, with your own API key | YouTube (Google) |
| AI chat | What you type in the Ask tab, with the chat so far, with your own API key | Anthropic or OpenAI |
| AI credits | Your key, for how much is left | OpenRouter |
| Phone alerts | The project and what happened | The push address you pasted, such as an ntfy topic |

Each service sees your IP address, as any website does, and has its own privacy policy. The relay keeps nothing about a webhook and stores only the daily totals of the usage counts; its request logs at Cloudflare are off.

### YouTube

Overglance's YouTube tab uses YouTube API Services with the key you paste. It reads your channel's public details and statistics and its latest videos, keeps them in memory for up to 10 minutes, and stores nothing from YouTube on disk. Google's privacy policy is at <https://www.google.com/policies/privacy>. Removing your key in Settings ends every request, and your key is deleted from the PC. You can also revoke the key itself in Google Cloud Console. The YouTube section of Settings asks you to agree to this policy and to YouTube's Terms of Service before it takes a key.

## Payments

Polar is the merchant of record. It takes your payment, your email address and your country for tax, and issues the license key. Overglance never sees your card. What Polar keeps is governed by Polar's privacy policy.

## Deleting your data

Uninstalling removes the program and takes Overglance's hooks and status line back out of your agents' configs. Your settings, secrets and note stay under `%LOCALAPPDATA%\Overglance` so a reinstall finds them; delete that folder to remove everything. The relay has nothing of yours to delete. Polar keeps the purchase record it needs for tax and refunds.

## Changes

This page changes only with a release, and the release notes say so.
