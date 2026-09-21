# KAIRO Motion — Design Document

Date: 2026-09-21
Status: Awaiting approval
Branch: `redesign/kairo` (continues after Task 17 of the redesign plan)

## Purpose

Give the redesigned site the motion vocabulary of the interactive mockup: a boot
sequence, animated route transitions, and the ambient terminal behaviour that
makes KAIRO read as an operating environment rather than a static page.

## Source material

`Portfolio Demo.dc.html` in Claude Design project
`15f1a365-a338-482d-b562-1adf04222ed5`. It is **pure CSS** — fifteen
`@keyframes`, no script block. Route re-triggering is done with an alternating
suffix: two identical keyframe sets (`win-a` / `win-b`) that the markup flips
between so the browser restarts the animation.

Two things about the mockup that shape this spec:

1. **The scanline is not global.** It is scoped to the project screenshot
   viewport. That matters because KAIRO's own readme forbids global CRT filters
   and requires scanline effects to be opt-in and never reduce legibility. The
   mockup obeys its own system; we do too. Do not apply it site-wide.

2. **The mockup's reduced-motion handling is wrong for loops.** It does
   `*{animation-duration:0ms !important}`. A 0ms *infinite* animation is
   degenerate, not disabled. This project already settled the correct pattern in
   the `--dur-blink` ruling: `animation: none` for looping/decorative motion,
   zeroed durations for entrance transitions. We use ours.

## Decisions taken

| Decision | Choice | Rationale |
|---|---|---|
| Sequencing | After redesign Task 17, before Task 18 | The full verification sweep then runs once, over the finished site including motion |
| Boot sequence | Plays on **every page load** | Owner's decision; cost was flagged and accepted |
| Re-trigger mechanism | Alternating `a`/`b` keyframe suffix | Faithful to the mockup, dependency-free; no `@angular/animations` |
| Scanline scope | Project screenshot viewport only | KAIRO forbids global CRT filters |
| Reduced motion | `animation: none` for loops, zeroed durations for transitions | Established by the `--dur-blink` ruling |

## Motion inventory

| Name | What it does | Duration | Applies to |
|---|---|---|---|
| `boot-in` | Fade + 6px rise | `--dur-control` | Boot log lines, staggered |
| `boot-bar` | `scaleX(0→1)` progress | 2600ms linear | Boot progress bar |
| `wipe-{sfx}` | Full-height bar sweeps across, red leading edge | `--dur-cinematic` | Page content, on every route change |
| `env-{sfx}` | Slides in 80px from right | `--dur-cinematic` | Environmental type |
| `ttl-{sfx}` | `clip-path` wipe reveal | `--dur-window` | Chapter title |
| `win-{sfx}` | Slide 18px + clip reveal | `--dur-window` | Windows and chapter meta, staggered |
| `type-{sfx}` | `max-width` 0→520px | `--dur-cinematic`, `steps(26,end)` | System bar path readout |
| `flicker` | Opacity 1 → .35 → .9 → 1 | `--dur-window`, `steps(3)` | SYNC readout on route change |
| `k-blink` | Block cursor | 1s / 1.1s / 1.4s `steps(1)` infinite | Cursors — deliberately desynchronised |
| `k-scan` | 2px line travels top→bottom | 3.2s linear infinite | Project screenshot viewport only |

Stagger ladder from the mockup: 40, 60, 80, 120, 140, 160, 180, 200, 240, 300ms.

## Architecture

### Where motion lives

Motion belongs to the **shared components and the shell**, never to individual
routes. Every route then inherits it, including any route added later. No page
component gains animation code of its own.

```
src/app/ui/motion/
  motion.service.ts     # the sfx signal, route-change orchestration
  _motion.scss          # the keyframe library, imported once
src/app/ui/boot/
  boot.ts .html .scss .spec.ts
```

### The `sfx` mechanism

`MotionService` exposes `sfx: Signal<'a' | 'b'>`, flipped on every
`NavigationEnd`. Components bind it into a data attribute:

```html
<section class="window" [attr.data-sfx]="motion.sfx()">
```

and the stylesheet selects on it:

```scss
.window[data-sfx="a"] { animation-name: win-a; }
.window[data-sfx="b"] { animation-name: win-b; }
```

Flipping the attribute changes the animation name, which restarts the animation.
This is the mockup's own mechanism, expressed in Angular.

**Why not `@angular/animations`:** it is a new dependency, it would need
`provideAnimations()` in a prerendered app, and it buys nothing the CSS approach
does not already do. The mockup proves the CSS approach works.

**Prerender safety:** `sfx` must have a stable initial value on the server.
It initialises to `'a'` and only flips on navigation, which does not occur during
prerender.

### The boot overlay

A new `Boot` component rendered in `app.html`, above the router outlet.

- **Every page load**, per the owner's decision.
- **Dismissable** by clicking anywhere on it, and automatically after the
  2600ms progress bar completes.
- **Content stays in the DOM beneath it.** The overlay is
  `position: fixed; inset: 0; z-index: var(--z-alert)`. Prerendered HTML
  therefore still contains the full page content — crawlers and SEO are
  unaffected by the overlay.
- **`<noscript>` escape hatch.** The prerendered HTML includes
  `<noscript><style>.boot{display:none}</style></noscript>`. With JavaScript the
  overlay shows and dismisses; without it, the overlay never appears and the site
  is fully usable. Without this, a JS failure would leave a permanent full-screen
  overlay hiding the entire site.
- **Skipped entirely under `prefers-reduced-motion`** — not shortened, skipped.

### Environmental type moves to page level

The mockup renders the environmental word as
`position: fixed; right: -10px; bottom: 20px`, at page level. The current
implementation has it absolutely positioned *inside* `ChapterHeader`, at the top,
clipped by `.main`'s overflow.

The `env-{sfx}` slide-in requires the element to be page-level and fixed to
animate as designed, so it moves. This also resolves a deferred finding from the
redesign (the environmental type sitting at the top rather than the bottom, and
being clipped mid-glyph) — the motion work fixes it as a by-product rather than
as a standalone refactor.

`ChapterHeader` loses its `environmental` input; the shell renders the word
instead, driven by the active route.

## Accessibility

Non-negotiable, and the area where the mockup is weakest:

- **`prefers-reduced-motion: reduce` disables everything.** Entrance transitions
  get zeroed durations via the existing motion tokens. Looping animations
  (`k-blink`, `k-scan`) get `animation: none` — never a zeroed period. The boot
  overlay does not render at all.
- **All decorative motion is `aria-hidden`** — the wipe bar, the environmental
  type, the scanline, the cursors.
- **The boot overlay is keyboard dismissable.** Click-to-dismiss alone would trap
  a keyboard user for 2.6 seconds with no way out. It takes focus on appear,
  dismisses on `Escape` or `Enter`, and returns focus afterwards.
- **No animation blocks content.** Every entrance animation uses `both` fill with
  the element ending at its natural state, so a failed or interrupted animation
  cannot leave content invisible.
- **The typing effect must not truncate text.** `max-width` animation reveals
  pre-existing text; the text is present in the DOM at full length throughout, so
  assistive technology reads it normally.

## Testing

Animation is hard to unit test meaningfully. What is testable, and will be
tested:

- `MotionService.sfx` flips on `NavigationEnd` and starts at `'a'`.
- Components bind `data-sfx` and it changes value on navigation.
- The boot overlay renders, dismisses on click, on `Escape`, and after its
  timeout; and does **not** render under reduced motion.
- Decorative elements carry `aria-hidden`.
- The `<noscript>` fallback rule is present in the prerendered HTML.
- Reduced-motion rules resolve to `animation: none` for the looping animations.

Visual verification stays with the controller: each route checked in a real
browser at 1280 and 390, plus a reduced-motion pass with the media feature
emulated.

## Risks

1. **Boot on every page load costs 2.6 seconds per navigation.** Flagged to the
   owner and accepted. Mitigated by click/keyboard dismissal and by the content
   being prerendered beneath. If it proves irritating in use, changing to
   once-per-session is a one-line change to the service.

2. **Animation on a prerendered page can flash.** Entrance animations start from
   a hidden state (`opacity: 0`, `clip-path: inset(0 100% 0 0)`). Between HTML
   parse and CSS apply, content could appear then re-hide. Mitigated by the boot
   overlay covering the first paint, and by `both` fill. Needs checking in the
   browser, not assumed.

3. **`position: fixed` environmental type over scrolling content.** It stays put
   while content scrolls. That is the mockup's behaviour, but it must not
   overlap readable text at small viewports.

## Out of scope

- Any motion not present in the mockup.
- Scroll-driven animation.
- Page transition animation between routes beyond the wipe (no cross-fade or
  slide of the outlet itself).
- Replacing the existing `--dur-*` token scale.
