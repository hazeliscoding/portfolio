# Roadmap

What's next for the site. Shipped work lives in the git history.

## Decisions

- 2026-10-19: The home page becomes a broadcast too, so it reads as the same station as the
  projects page. A lower third introduces me, then NOW PLAYING cycles the featured projects' real
  segments (XIV Vault, Gil Sweep and Prompuff) every 8 seconds with a crossfade, then the latest
  posts and open-source PRs run as two strips. Stack and services move to About. It gives up the
  six numbered windows and the stack at a glance on the home page. The rotation pauses on hover and
  focus, stops once a visitor picks a channel, has its own pause button, and never runs under
  reduced motion.
- 2026-10-19: Blog comments use giscus, so they live as GitHub Discussions in this repo with no
  database, accounts or tracking to run. The cost is that only people with a GitHub account can
  comment. Disqus was ruled out for its ads, tracking and heavy scripts, and a self-built service on
  Vercel for the building and upkeep it needs. Comments sit straight after the post, with a jump
  link in the RECORD window. Reactions stay on, in GitHub's own colours, as the one-click kudos.
- 2026-10-19: The projects page becomes a broadcast. Each project is a full-width segment on the
  same dark station, in its own brand colours and with its real logo, after thatlev.com/projects'
  per-product bands, so the page shows premium products without leaving the KAIRO look. Three
  kinds: shipped apps are ON AIR, live sites are LIVE, experiments are PILOTS, shown smaller at the
  end. A channel guide replaces the tag filters. Names stay in the site's type, not each project's
  lockup. Versions and platforms come from each repo's latest GitHub release, refreshed weekly like
  the OSS stats, so they can't go stale the way Prompuff's macOS build did. Puzzle Boy's three
  repos are one pilot whose main links go to Community Edition, the one that plays out of the box.
- 2026-10-19: The boot sequence plays only when a visit lands on `/`. A deep link came for that
  page, not the intro.
- 2026-10-19: App screenshots sit on a clean CRT screen, with no scanlines over them. The capture
  is the product, and scanlines made it hard to read.

## Projects as broadcast segments

- [x] Release data: a weekly generator writes each repo's latest tag and platforms
- [x] Project data: kind, pitch, brand colours, logos, ticker facts and CTA per project
- [x] ConAtlas TX (LIVE), Puzzle Boy and Axiomarium (PILOTS) added, with detail pages
- [x] ON AIR and LIVE segments, and the channel guide, replace the archive grid
- [x] PILOTS section with test-tape cards and the lazily loaded Puzzle Boy GIF
- [x] Phones, reduced motion and a check against the approved mockups

Done when `/portfolio` shows all eight projects as segments or pilots, with versions and platforms
read from release data, and the home page, ⌘K palette and detail pages still work for every
project.

## Home as a broadcast

- [x] One shared function builds a project's segment for both pages
- [x] XIV Vault, Gil Sweep and Prompuff are the featured projects
- [x] Lower third, NOW PLAYING with rotating channels, and the LATEST and OSS strips
- [x] Stack and services on About
- [x] Phones, reduced motion and keyboard

Done when `/` cycles the three featured segments exactly as `/portfolio` draws them, a visitor can
pause or pick a channel, and nothing moves under reduced motion.

## Later

Nothing queued.
