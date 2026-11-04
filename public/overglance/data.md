# Data handling

The engineering side of the [privacy page](/overglance/privacy): where each thing lives, how it's protected, how long it's kept, and who else touches it.

## On the PC

| What | Where | Protection | Kept until |
| --- | --- | --- | --- |
| Settings | `%LOCALAPPDATA%\Overglance\settings.json` | Plain JSON, no secret in it | You delete the folder |
| Calendar links | `calendars.dat` | DPAPI, current user | Removed in Settings, or the folder deleted |
| Store, YouTube, chat and credits keys; webhook secrets; the relay secret; the push address; the license key | `stores.dat`, `youtube.dat`, `chat.dat`, `credits.dat`, `webhooks.dat`, `relay.dat`, `push.dat`, `license.dat` | DPAPI, current user | Removed in Settings, or the folder deleted |
| Quick note | `note.txt` | Plain text | You clear it |
| Agents' config files, before and after Overglance's edit | `hooks\<agent>\` | Plain copies, as the agents keep them | The hooks are uninstalled |
| Clipboard history | Memory only | Skips what password managers mark secret | Quit |
| Shelf | Memory only, by path | The files stay where they were | Dragged out, or quit |
| Bug report | `bug-report.txt` | No secret in it by construction, with tests | You delete it |
| Start at sign-in | `HKCU\Software\Microsoft\Windows\CurrentVersion\Run\Overglance` | The launcher's path | Unticked in the tray |

DPAPI ties each file to your Windows account: another account on the PC, or the file copied elsewhere, can't read it. There is no master password and no Overglance account.

## What's read and not kept

- Claude Code's status line, which Overglance's command wraps and passes through unchanged, for its limits; Codex's session logs, of which only lines naming `token_count` are parsed; hook events from each agent, which hold the session, its project folder and what it's doing or waiting for. Shown while they're current, then gone.
- The song playing, from Windows' media session; the system readings on the System tab; window titles, to stay out of the way of fullscreen apps.

## On servers

| Service | What it gets | What it keeps | Whose terms |
| --- | --- | --- | --- |
| GitHub | The daily request for releases | Its own request logs | GitHub |
| The calendar hosts you pasted | Requests for your feeds | Their own logs | Each host |
| Polar | Your purchase, email and country; your key, Overglance's organization ID and your PC's name at activation and each weekly check | The purchase record and the activations | Polar |
| Overglance's relay (Cloudflare Workers, run by Hazel Granados) | Store webhooks, passed through; the opt-in daily count | Nothing of a webhook; the counts' daily totals only. Cloudflare's request logs are off | Cloudflare, for the platform |
| MET Norway | Your location, rounded to about 1 km | Their own logs | MET Norway |
| Polar and Stripe | Your read-only store key | Their own logs | Each store |
| Yahoo Finance | Your watchlist's symbols | Their own logs | Yahoo |
| YouTube | Your channel's handle, with your key | Their own logs | Google |
| Anthropic or OpenAI | What you type in the Ask tab, with your key | Per their API data policies | Each provider |
| OpenRouter | Your key | Their own logs | OpenRouter |
| Your push service | The project and what happened | Per that service | Each service |

Every request goes over HTTPS. Overglance has no server of its own but the relay, and the relay stores nothing it can read back about you.

## Telemetry

None. The opt-in usage count is the whole of it: one `{"state":"trial"}` or `{"state":"paid"}` a day, with no ID, version, event or header that names the copy, added to a daily total.

## Checks that hold this

Tests in the repository fail on: network code outside the eleven listed files, a file that names a credential file or a usage endpoint, a phone alert that carries a command, a bug report that holds a link or a key, a hook install that doesn't restore the config byte for byte, and a license answer that isn't Polar's own. Releases are code-signed, and each lists SHA-256 checksums.
