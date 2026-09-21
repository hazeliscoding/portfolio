# KAIRO Redesign — Design Document

Date: 2026-09-20
Status: Approved for implementation planning
Branch: `redesign/kairo`

## Purpose

Replace the site's GlitterNet visual language (Y2K web-1.0 forum profile, green
and cyan on high-contrast surfaces) with KAIRO — a dark terminal-instrument
system — across every route, and reduce the site's content to a single project
and a single blog post.

Production currently serves an Under Construction notice (commit `11b620d`).
It keeps serving that notice for the whole of this work. The merge of
`redesign/kairo` into `main` is the reveal.

## Source material

Design mockups live in the Claude Design project
`15f1a365-a338-482d-b562-1adf04222ed5`, file `Portfolio Redesign.dc.html`.
It contains one turn, seven screens (`1a`–`1g`), each at desktop 1280 and
mobile, covering every route in the site.

The KAIRO design system is vendored in that project under
`_ds/kairo-design-system-ba65276e-445e-4bde-8347-708efaa0f3ae/`.

Two facts about the mockups shape the plan:

1. They are built from **434 inline styles against the KAIRO token files**, and
   KAIRO's `styles.css` is nothing but `@import` lines. There is no component
   CSS to lift — component styling lives inside each component.

   However, the mockups instantiate **real KAIRO components** via
   `<x-import component-from-global-scope="KAIRODesignSystem_ba6527.Window">`
   and friends. `_ds_bundle.js` defines 29 React components with concrete prop
   signatures. The component **contracts are therefore ported, not invented** —
   only the Angular implementation and its CSS are new work. Exact signatures
   are recorded under "The UI layer" below.
2. They already contain **Angular interpolation** — `{{ p.title }}`,
   `{{ s.idx }}`, `{{ b.date }}`, `{{ themeLabel }}`. Screens map onto Angular
   templates nearly directly rather than needing translation.

## KAIRO in brief

An alternate-history operating environment, Japan circa 1997–2001: part police
information terminal, part hacker workstation. Rules that constrain every
decision below:

- **Color.** Layered dark graphites (`--surface-canvas` `#0b0e12` → window →
  elevated); pure black reserved for inset wells. One accent — signal red
  `#e8382c` — used only for selection, activity, and boundaries. Cyan is
  information and links, blue is network, green is operational, amber is
  warning. Color is signal, never decoration.
- **Type.** Three faces: Saira Condensed (display, mode labels, oversized
  environmental type), IBM Plex Sans (body/UI), IBM Plex Mono (metadata and
  readouts). Uppercase labels take `--tracking-wider`.
- **Geometry.** 0–3px radii, 1px hairline borders, partial borders, corner
  brackets, registration marks. Rhythm from lines, not shadows. No gradients
  beyond faint tints. Effectively no shadows.
- **Spacing.** Strict 4px grid via `--sp-*`.
- **Motion.** Mechanical, linear-ish (`--ease-mech`). 100/180/280ms, 450ms for
  cinematic window choreography only. `prefers-reduced-motion` zeroes them.
- **Selection over hover.** Hover is secondary (text brightens, a bracket
  appears). Selection is primary: a 3px red indicator bar entering the row,
  brackets around the active object, 2px text shift.
- **Voice.** Institutional, matter-of-fact, never jokey. Uppercase mode labels
  and window titles; sentence-case body copy; terse imperatives on controls.
  Zero-padded indices, section codes, `//` and `:` separators.
  **No emoji, ever.** This is a hard break from the current site, which uses
  them throughout.
- **Icons.** Typographic glyphs only — `>`, `//`, `[ ]`, `▲▼◀▶`, `●○`, `█`.
  No icon library. No hand-drawn SVG illustration.

## Decisions taken

| Decision | Choice | Rationale |
|---|---|---|
| Projects area | Keep `/portfolio` index + `/portfolio/:id` detail | Structure stays ready for future projects; detail page is where PR Sweep gets room |
| Theme | Dark-only | KAIRO ships dark-only; the terminal idiom depends on layered graphites and signal red |
| Rollout | All at once behind the notice | Visitors never see a half-migrated site |
| Blog | Cut both the 1999 post and the MCP Gateway post | Owner's call; see Risk 1 |
| Implementation | New `src/app/ui/` layer, route-by-route cutover | Matches KAIRO's own component index; gives the reusable layer the mockups lack |

## Architecture

### Styles

```
src/styles/kairo/
  tokens/_colors.scss  _type.scss  _space.scss  _motion.scss
  _base.scss
```

The six KAIRO `tokens/*.css` files are plain custom-property declarations and
port into `:root` verbatim. The SCSS files above them expose named access to
those properties for components, mirroring the role
`src/styles/abstracts/_variables.scss` plays today.

`src/styles/styles.scss` and `src/styles/abstracts/` are deleted once the last
route stops referencing `gn-*`.

Webfonts come from the Google Fonts URL in KAIRO's `tokens/fonts.css`: Saira
Condensed (400/500/600/700), IBM Plex Sans (400/500/600), IBM Plex Mono
(400/500/600). The current VT323 link in `src/index.html` is removed.
IBM Plex Sans JP is **not** loaded — the site has no Japanese content, and
KAIRO's own rule is that Japanese glyphs appear only where a real bilingual
label makes sense, never decoratively.

### The UI layer

Mirroring KAIRO's own directory layout so a component's origin is obvious:

```
src/app/ui/
  windows/         Window · ViewportWindow · SystemBar · ModeNav
  core/            Readout · StatusLight · Badge · Button
  data/            DataTable · KeyValue
  overlays/        CommandPalette
  chapter-header/  ChapterHeader
```

Ten ported KAIRO components, not twenty-nine. `Window` is a single component
driven by `variant`, not a family of sub-components.

`ChapterHeader` is the eleventh and is **not** a KAIRO component — it is this
site's own `CODE_NN` page header (oversized environmental type, chapter code,
context line). It lives in `ui/` rather than under a feature because six of the
seven routes render it.

Standalone components, following the existing project convention
(`.ts`/`.html`/`.scss`/`.spec.ts` per component, `templateUrl` + `styleUrl`,
selector prefixed `app-`).

**Window is the load-bearing component.** Every content block on every screen
is a hairline window with a zero-padded index and an uppercase title.
Composition of Window covers the majority of every screen.

Angular inputs mirror KAIRO's React props exactly, so the mockup markup
translates without renaming. Signatures extracted from `_ds_bundle.js`:

| Component | Props |
|---|---|
| `Window` | `variant='data'`, `title`, `index`, `context`, `status`, `active`, `controls`, `footer`, `padded=true` + children |
| `ViewportWindow` | `src`, `alt=''`, `ratio='4 / 3'`, `pixelated`, `label` |
| `SystemBar` | `position='top'`, `left`, `center`, `right` |
| `ModeNav` | `modes=[]`, `activeId`, `onSelect`, `header='MODE'` |
| `Readout` | `label`, `value`, `state='neutral'` |
| `StatusLight` | `state='ok'`, `label`, `blink` |
| `Badge` | `tone='neutral'`, `filled` + children |
| `Button` | `variant='secondary'`, `size='md'`, `index`, `disabled` + children |
| `DataTable` | `columns=[]`, `rows=[]`, `selectedId`, `onSelect`, `density='dense'` |
| `KeyValue` | `items=[]`, `columns=1` |
| `CommandPalette` | `open`, `commands=[]`, `onRun`, `onClose`, `placeholder='command_'` |

React callback props (`onSelect`, `onRun`, `onClose`) become Angular
`output()`s of the same name. Everything else becomes `input()`.

Enumerated values, also from the bundle — these are the complete sets:

- `Window.variant`: `data` · `media` · `dialogue` · `command` · `inspector` ·
  `system` · `alert` · `transient` · `viewport`. Each maps to an accent border
  colour (`command` and `alert` → `--signal-active`; `dialogue` and `system` →
  `--signal-info-dim`; the rest → `--border-strong` or `--border-default`).
- `Readout.state` / `StatusLight.state`: `ok` → `--signal-success`, `info` →
  `--signal-info`, `warn` → `--signal-warning`, `danger` → `--text-active`,
  `neutral` → `--text-primary`.
- `Badge.tone`: `neutral` · `active` · `info` · `success` · `warning` ·
  `danger`, each a `[foreground, border]` token pair.

The remaining components in KAIRO's set (forms, `Meter`, `Message`, `Dialog`,
`Select`, `Switch`, `LogViewer`, and the rest of the 29) are **not ported** —
this site has no forms, no dialogue UI, and no screen that streams terminal
output. Port on demand only.

### Shell

`SystemBar` (top) and the instrumentation bar (bottom) are persistent and live
in `app.html` **outside** the router outlet, so they never remount on
navigation.

- Top bar: `hazel.exe` wordmark, running clock (`00:13:48`).
- Bottom bar: `⌘K COMMAND · / SEARCH · ESC BACK`.

`ModeRail` is the vertical desktop nav (`HOME` / `ARCHIVE` / `LOG` / `PROFILE`).
At or below `--bp-tablet` (840px) it is replaced by `CommandPalette`, which is
also what `⌘K` and `/` open on desktop. `ESC` closes it.

The clock is the one piece of live state in the shell. It must not run during
prerender — it initialises to a server-stable placeholder and starts ticking on
`afterNextRender` only, or hydration will mismatch.

## Route map

| Route | Chapter code | Screen | Render mode |
|---|---|---|---|
| `/` | `HOME_01` | Profile hero, stack, OSS, services, featured project, contact | Prerender |
| `/portfolio` | `ARCHIVE_03` | Filter row + record windows (one record) | Prerender |
| `/portfolio/:id` | `ARCHIVE_03_01` | Viewport + thumbnail strip, README, record inspector | Prerender, params from data |
| `/blog` | `LOG_04` | Entries as a log table (one entry) | Prerender |
| `/blog/:slug` | `LOG_04_NNNN` | Reading column + CONTENTS / RECORD inspectors | Prerender, params from generated index |
| `**` | — | `RECORD NOT FOUND` alert over environmental type | Client |

`portfolio/:id` changes from `RenderMode.Client` to prerendered. With one
project there is no reason to ship it client-only, and prerendering it means
the detail page is in the static output and indexable.

**Constraint confirmed against the current build:** every server route in
`app.routes.server.ts` must match a literal app route, or the build fails with
`The '<path>' server route does not match any routes defined in the Angular
routing configuration`. The app route list therefore stays explicit. This was
hit and resolved during the Under Construction work.

Prerendered output after this change: `/`, `/portfolio`, `/portfolio/pr-sweep`,
`/blog`, `/blog/hello-world`, `/about`.

## Screens

Each screen is specified against its mockup id. Where the mockup shows content
that no longer exists after the content cuts, the required state is given
explicitly.

### `/` — HOME_01 (mockup `1a`)

Windows, in order:

1. **Operator profile** — `HAZEL.EXE // OPERATOR PROFILE`, readout
   `LAST UPDATE <date>`, name, `SOFTWARE DEVELOPER`, `SHE/THEY`, and two
   controls: `Contact >` and `Resume`.
2. **Stack** — indexed list, `{{ s.idx }} {{ s.label }}`.
3. **OSS** — `{{ r.repo }} {{ r.meta }}`, fed by `ossStats` from
   `src/app/data/oss-stats.generated.ts`.
4. **Services** — `{{ t.label }}` tags.
5. **Featured record** — `{{ p.idx }} {{ p.title }} {{ p.short }} {{ p.stack }}
   {{ p.year }}` with an `ACTIVE` status light. One entry: PR Sweep.
6. **Log** — `{{ b.date }} {{ b.title }} {{ b.tagline }}`. One entry.
7. **Contact** — "For questions or collaboration, reach out:" and the email
   address.

`LAST UPDATE` is a build-time constant, not a runtime date — a runtime date
differs between prerender and hydration.

### `/portfolio` — ARCHIVE_03 (mockup `1b`)

Filter row plus a 2-up grid of record windows. **With one project the grid
holds a single record and the pager reads `RECORD 01 OF 01`.** The filter row
renders but is inert against a single record; it stays because the archive
idiom and the future multi-project case both need it. A second grid column is
not reserved — the single record occupies the left column at its natural width
and does not stretch.

### `/portfolio/:id` — ARCHIVE_03_01 (mockup `1c`)

Constrained viewport window with a thumbnail strip beneath (PR Sweep has four
images with captions in `projects.data.ts`), the long-form description as
README body, and a record inspector carrying `status`, `year`, `stack`, `tags`,
and the GitHub link.

The mockup renders this screen as MCP Gateway. **MCP Gateway is being deleted**
— the screen is implemented against PR Sweep's data, using the mockup purely
for layout.

Images render inside constrained viewport windows per KAIRO's imagery rule.
Where a project has no image, a `NO SIGNAL` viewport is shown; PR Sweep has
images, so this state is only needed as a fallback.

### `/blog` — LOG_04 (mockup `1d`)

Entries as a log table with columns `DATE` / `ENTRY` / `TAGS`, first row
selected.

**Sparse state, required.** After the content cuts the table holds one row. A
one-row table with a header and a selection bar reads as broken. The table
therefore renders with a trailing `— END OF LOG —` rule directly beneath the
final row, and the window head carries `1 RECORD RETRIEVED` in the machine-report
voice KAIRO specifies. This makes one row read as a complete short log rather
than a truncated long one. The same treatment scales to any row count.

### `/blog/:slug` — LOG_04_NNNN (mockup `1e`)

Reading column with `CONTENTS` and `RECORD` inspectors. The blog pipeline is
unchanged: markdown under `public/blog/`, `scripts/generate-blog.mjs` emits
`src/app/data/blog-posts.generated.ts` on `prestart`/`prebuild`, `marked`
renders. Only the presentation layer changes.

Mermaid is a dependency and is used by the MCP Gateway post's diagrams. **That
post is being deleted**, leaving no content that uses Mermaid. Removing
`mermaid` from `package.json` and its `allowedCommonJsDependencies` entries in
`angular.json` is in scope; it is a large dependency to ship for nothing.

### `/about` — PROFILE_02 (mockup `1f`)

Dossier windows: bio, education, interests, languages, resume. The resume
window links `public/resume/resume-en.pdf` and `resume-en.docx`.

### `**` — RECORD NOT FOUND (mockup `1g`)

Alert window over oversized environmental type. Replaces the current
`ErrorPage`.

## Content changes

Deletions:

- `public/blog/this-site-looks-like-1999-on-purpose.md`
- `public/images/blog/y2k/` (six images: `kakaku.png`, `mandarake.png`,
  `mcmaster.png`, `yahoo-1999.png`, `yahoo-auctions.png`, `yahoo-japan.png`)
- `public/blog/governing-tool-access-for-ai-agents.md`
- `projects.data.ts` entries `incident-control-plane`, `mcp-gateway`,
  `agent-eval-platform` (file goes from 239 lines to roughly 80)
- `public/images/projects/incident-control-plane/`
- `public/images/projects/mcp-gateway/`
- `public/images/projects/agent-eval-platform/`

`src/app/data/blog-posts.generated.ts` regenerates from the remaining markdown
on the next build. It is not edited by hand.

**Verified:** the only `writeup` value in the data is
`writeup: 'governing-tool-access-for-ai-agents'` on the `mcp-gateway` entry —
project and post are deleted together. PR Sweep has no `writeup` field, so the
deletions leave no dangling internal links.

Consequence: the `writeup` field on the `Project` interface and the
project-to-post linking it drives become unreachable. Both the field and the
template branch that renders the link are removed. If a future project gets a
writeup, it comes back with that project.

**Verified:** `mermaid` is used by exactly one piece of content —
`governing-tool-access-for-ai-agents.md`. Nothing else in `public/blog/`
references it.

## Theme

Dark-only. Consequences:

- The pre-paint theme script in `src/index.html` is removed.
- The header's `cycleTheme()` and the `data-theme` attribute contract are
  removed along with the `Header` component.
- The mockup's system bar shows `[THEME : {{ themeLabel }}]`. **This control is
  not implemented.** It is the one place the mockups and the dark-only decision
  disagree; the decision wins.
- The two `theme-color` meta tags in `index.html` collapse to a single dark
  value matching `--surface-canvas` (`#0b0e12`).
- Token files stay split so a light set can be added later without
  restructuring, but no light values ship.

## Metadata and assets

- `public/og-image.png` and `og-image.svg` are GlitterNet-styled — a retro
  member-profile card. They misrepresent the new site. Regenerating them via
  `scripts/generate-og-image.mjs` is in scope for this work, not a follow-up.
- Favicons under `public/` are similarly GlitterNet-styled and regenerate via
  `scripts/generate-favicon.mjs`.
- `site.webmanifest` theme/background colors update to KAIRO surfaces.
- Per-page `Title` and `Meta` continue to be set in each page component's
  `ngOnInit`, matching the existing convention.
- The Plausible analytics script in `index.html` is unchanged.

## Accessibility

KAIRO claims WCAG 2.2 AA and the token set is built for it. Binding requirements:

- Focus is the cyan double ring `--focus-ring`, always visible, never removed.
- Interactive targets meet `--target-min` (44px).
- Selection must not be conveyed by the red indicator bar alone — the active
  row also carries a text shift and bracket glyphs, both non-color signals.
- Signal red `#e8382c` on `--surface-canvas` is used for indicators and codes,
  not for body copy.
- `prefers-reduced-motion` zeroes all durations via the motion token file; the
  blinking block cursor must respect it.
- The oversized environmental type is decorative and gets `aria-hidden`.

## Testing

- A `.spec.ts` per `ui/` component, following the existing pattern.
- Each page component keeps a spec asserting it renders and sets its title.
- Specs that render `RouterLink` must provide a router. **Seven specs currently
  fail with `NG0201: No provider found for ActivatedRoute`** — `Footer`,
  `HomePage`, `PortfolioPage`, `ProjectCard`, `ProjectDetailPage`,
  `FeaturedProjectsSection`, `ErrorPage`. Every one of those components is
  deleted or rebuilt by this work, so the failures resolve as part of it. The
  suite must be green at merge.
- Per route: `npm run build` prerenders all six paths, and each screen is
  screenshotted at 1280 and 390 and compared against its mockup.

## Rollout

1. Branch `redesign/kairo` from `main`.
2. Tokens and `ui/` layer first; no route changes yet.
3. Routes migrated one at a time, deleting the corresponding old feature
   components and their `gn-*` styles as each lands.
4. `src/styles/styles.scss` and `src/styles/abstracts/` deleted once nothing
   references them.
5. The Under Construction route and component are removed last, in the same
   commit that restores the real route table.
6. Full build, full test run, screenshot pass across all six prerendered paths.
7. Merge to `main`. Vercel deploys to `www.hazeliscoding.dev`.

Production serves the notice for the entire duration. Nothing is deployed
incrementally.

## Risks

1. **The blog is left with one thin post.** After both cuts, `hello-world.md`
   is 22 lines and is largely about the blog living in an Angular app — a
   statement that survives the redesign but says little. `LOG_04` is designed
   around a multi-row log. The sparse state specified above makes one row read
   deliberately, but the blog will look underweight until something is written
   into it. Dropping `/blog` entirely remains available and is a smaller change
   than building it; that call can be made before implementation starts without
   invalidating anything else in this document.

2. **The mockups show content that is being deleted.** The project detail
   screen is MCP Gateway; the blog screens feature the 1999 post. They are used
   as layout references only. Any detail in them that depends on the deleted
   content — the `RECORD 02 OF 04` pager, multi-row log tables — is
   respecified above rather than copied.

3. **Prerender/hydration mismatch.** The clock and any "last update" value must
   be server-stable. Handled by initialising from a build-time constant and
   starting the clock in `afterNextRender`.

4. **Font loading shifts layout.** Three new families replace one. Saira
   Condensed carries the oversized environmental type, where a swap is most
   visible. `display=swap` is already in KAIRO's font URL; a `preconnect` to
   `fonts.gstatic.com` is already present in `index.html` and stays.

## Out of scope

- Any light theme.
- Restoring the three deleted projects.
- The interactive `ui_kits/kairo_terminal` login-to-mode-switch shell from the
  KAIRO project; this site takes the visual language, not the application.
- Changing the blog authoring pipeline, the OSS stats generator, or hosting.
