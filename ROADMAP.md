# Roadmap

What's next for the site. Shipped work lives in the git history.

## Decisions

- 2026-10-25: Roze, the anime character I made of myself, takes the "H" monogram's place where a
  photo would go: waving in the about page's Polaroid, coding late at night in the home page's,
  and among too many open windows in the projects hero. She also sits beside the blog's title and
  the about page's "Say hello." band, the way thatlev.com uses its character. An AI image model
  drew her, and the about page says so under her Polaroid. Each sticker is a 520px WebP of 30 to
  45 KB, and the ones below the fold load lazily. It gives up the monogram Polaroids, which needed
  no image at all, and the site now has two marks, since the favicon and social cards keep the "H".
- 2026-10-25: The site has a dark theme. It follows the system until a visitor uses the moon and
  sun toggle beside search, and toggling back to what the system wants forgets the choice, so the
  site follows the system again. The palette is CSS alone: `data-theme` on <html>, set before
  first paint by an inline script for a saved choice, overrides the semantic tokens, and the
  toggle's icon is chosen by a token too, so the prerendered page is right before the app starts.
  The raw palette stays fixed, because the dark bands, stickers and Polaroids look the same in both
  themes, and the blog's giscus comments get a dark stylesheet of their own, switched live. It
  gives up the single light look the 2026-10-25 redesign chose, and a few one-off colours became
  tokens to make it work.
- 2026-10-25: The home page's open-source section counts the same four upstream projects as my
  GitHub profile (Bulk Crap Uninstaller, PdfCraft, XIVLauncher and XIVLauncher.Core), with PRs in
  review beside the merged ones, instead of every public repo with a merged PR of mine. The two
  had drifted: the site showed pyqb and the winget-pkgs PRs that submit my own apps, and was about
  to add up-for-grabs, where every PR lists one of my projects, while it missed PdfCraft for a week.
  The list lives in both repos and changes in both together. It gives up counting new upstream work
  on its own: a project joins only once I add it to both lists, and pyqb's 2020 README fix drops
  off.
- 2026-10-25: The social cards and the favicon join the light shop. The site card sets "Small apps
  that each do one job." beside the shipped apps' icons as stickers on a night band, and each
  post's card has its title, date and tags as lavender pills under the "H" monogram and the
  wordmark. `npm run og:cards` now renders the site card too, so it no longer needs a hand-taken
  screenshot. The favicon is the same purple "H" on its lavender gradient, drawn as one shape so
  sharp can render it without the webfont, and an SVG copy keeps browser tabs sharp. Post cards
  drop the entry number, which the site no longer shows, and keep four tags. It gives up KAIRO's
  red terminal caret.
- 2026-10-25: The projects page follows my GitHub profile README's lineup, so it's about software
  that has shipped and software I'm building. Staypaw joins Shipped. Shybun, Tattlebun, Carmine
  Workbench and Darnling join Axiomarium under Building now, and sdl3-porter stays under Shipped
  rather than getting the README's own AI engineering group. Puzzle Boy leaves, since the README
  doesn't list it: its page redirects to Community Edition's repo, temporarily (307), so it can come
  back, and its blog posts and images stay. A project with nothing to screenshot yet shows its
  mascot or a prototype's output where the screen goes, and one with no release links its repo
  instead of a build. PR Sweep stays off, as 2026-10-22 decided, though the README still lists it.
  It gives up Puzzle Boy's band, and with it the looping reel and repo links a band could carry,
  which only it used.
- 2026-10-25: The projects page splits into Shipped and Building now, the way thatlev.com/projects
  puts the apps that are ready beside the ones still on the way. Experiments leave their light cards
  for full bands like the shipped ones, with a striped "Building now" sticker, a "Try the latest
  build" button, Puzzle Boy's three repos as links (superseded 2026-10-25: Puzzle Boy left) and
  Axiomarium's commands on its screen. The home
  band takes turns between the featured apps again, on the 2026-10-19 rules: 8 seconds each with a
  crossfade, paused on hover and focus, stopped once a visitor picks an app, its own pause button,
  and never under reduced motion. It gives up the smaller cards that kept an experiment from looking
  finished; the sticker, the button and the group's intro now say it isn't.
- 2026-10-25: The site becomes a light maker's shop after thatlev.com, in place of KAIRO's dark
  broadcast terminal, with my GitHub profile README's voice for the copy. Lavender-white paper, one
  ink, a purple accent and near-black bands for featured work, in Bricolage Grotesque and JetBrains
  Mono. A sticky header (wordmark, four pages, search) and a footer replace the system bars and
  mode rail. Home opens on the first featured app's dark band (superseded 2026-10-25: the featured
  apps take turns on it), then the hero, every shipped project
  as a card, open-source work, the latest posts, a note from me and an FAQ. Projects keep their
  brand-coloured bands; About is a maker page. It gives up the boot intro, the clock, the log, the
  numbered windows, NOW PLAYING's rotation and the Japanese face in the type stacks. ⌘K search and
  the 1–4 and Escape keys stay. Component stylesheets may now reach 16 kB before the build fails
  (8 kB warns), because a whole landing page in one component outgrew the CLI's 8 kB default. The
  social cards are still drawn in the old style (superseded 2026-10-25: they're redrawn).
- 2026-10-22: Sweepling replaces PR Sweep in channel 4. PR Sweep is still maintained, but it isn't
  a main focus now, and the projects page shows the work I'm putting time into. Sweepling's segment
  carries Primrose, its mascot, as a die-cut sticker on the corner of its screen, through an
  optional `mascot` field any project can use. It gives up PR Sweep's segment and detail page; old
  `/portfolio/pr-sweep` links redirect to its repo, temporarily (307), so it can come back.
- 2026-10-20: A post joins a series with one frontmatter field, `series`, and its part number
  comes from date order, so there is no number to keep in sync. In a series post the pager links
  the previous and next part, falling back to the entry published that way, so the parts stay
  linked when other posts come out between them, and a SERIES window in the sidebar lists every
  part. The pager carries it on phones, where the sidebar falls below the article. It gives up a
  planned total ("of 3", which the descriptions say by hand), a page per series (the tag page lists
  the parts) and series structured data, which search engines don't use.
- 2026-10-20: Release data refreshes twice a day instead of weekly, because releases ship often and
  a week was too long for the projects page to trail one. A run with no new release commits
  nothing, so it costs no commits or deploys. OSS stats stay weekly: star counts move every day, so
  a daily run would commit and deploy daily for changes the home page, which cuts stars to 0.1k,
  mostly doesn't show. It gives up
  nothing but a few seconds of free runner time.
- 2026-10-19 (superseded 2026-10-25: one featured band and cards, no rotation): The home page becomes a broadcast too, so it reads as the same station as the
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
  per-product bands, so the page shows premium products without leaving the KAIRO look (the look is
  superseded 2026-10-25; the bands stay). Three
  kinds: shipped apps are ON AIR, live sites are LIVE, experiments are PILOTS, shown smaller at the
  end (superseded 2026-10-25: they get bands under Building now). A channel guide replaces the tag filters. Names stay in the site's type, not each project's
  lockup. Versions and platforms come from each repo's latest GitHub release, refreshed weekly like
  the OSS stats (superseded 2026-10-20: twice a day), so they can't go stale the way Prompuff's macOS build did. Puzzle Boy's three
  repos are one pilot whose main links go to Community Edition, the one that plays out of the box
  (superseded 2026-10-25: Puzzle Boy is off the page).
- 2026-10-19 (superseded 2026-10-25: there is no boot sequence): The boot sequence plays only when a visit lands on `/`. A deep link came for that
  page, not the intro.
- 2026-10-19: App screenshots sit on a clean CRT screen, with no scanlines over them. The capture
  is the product, and scanlines made it hard to read.

## Light shop redesign

- [x] Tokens, fonts and base styles for the light palette
- [x] Header, footer and search replace the terminal chrome
- [x] Home, Projects, project pages, Blog, posts, About and the 404 page
- [x] Phones, reduced motion, and every unit test and the prerendered build
- [x] Social cards (`og-image.png` and the per-post cards) redrawn in the new style

Done when every route renders in the new style at desktop and phone widths, the build prerenders
every route, and the social cards match the site.

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

## Blog series

- [x] `series` frontmatter, numbered by date; the build fails on two parts with one date
- [x] The pager links the previous and next part, falling back to the entry published that way
- [x] A SERIES window lists every part and marks the one being read
- [x] Puzzle Boy parts 1 and 2 join the series

Done when both Puzzle Boy parts show the SERIES window, part 1's pager leads to part 2, and posts
outside a series keep their pager as it was.

## Later

Nothing queued.
