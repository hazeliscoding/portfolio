# KAIRO Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's GlitterNet visual language with the KAIRO terminal design system across every route, and cut site content to one project (PR Sweep) and one blog post.

**Architecture:** Port KAIRO's design tokens verbatim into `src/styles/kairo/`, then build a 12-component Angular UI layer under `src/app/ui/` whose inputs mirror KAIRO's React props exactly. Rebuild each route against that layer one at a time, swapping a single `loadComponent` in `app.routes.ts` per route so the branch always builds. Production keeps serving the Under Construction notice until the branch merges.

**Tech Stack:** Angular 21 (standalone components, signal `input()`/`output()`), SSR with `outputMode: static` prerendering, SCSS, Karma + Jasmine, marked (blog markdown), Vercel hosting.

**Spec:** `docs/superpowers/specs/2026-09-20-kairo-redesign-design.md`

## Global Constraints

These apply to every task. Do not restate them per task; they are always in force.

- **Branch:** all work happens on `redesign/kairo`. Never commit to `main`. Never push.
- **No emoji, ever.** KAIRO's voice rules forbid them. The current site uses them throughout; none survive.
- **Typographic glyphs only** — `>`, `//`, `[ ]`, `▲▼◀▶`, `●○`, `█`. No icon library, no hand-drawn SVG illustration.
- **Voice:** institutional, matter-of-fact, never jokey. UPPERCASE for mode labels, window titles, statuses. Sentence-case body copy. Terse imperatives on controls (`EXECUTE`, `< BACK`, `[FILTER]`). System messages read as machine reports (`1 RECORD RETRIEVED`).
- **Dark-only.** No light theme, no theme toggle, no `data-theme` attribute.
- **Color is signal.** Signal red `#e8382c` is reserved for selection, activity, and boundaries. Never for body copy.
- **Geometry:** 0–3px radii, 1px hairline borders. No shadows. No gradients beyond faint tints.
- **Spacing:** strict 4px grid, always via `--sp-*` tokens. Never hardcode a pixel gap.
- **Motion:** `--dur-micro` 100ms / `--dur-control` 180ms / `--dur-window` 280ms / `--dur-cinematic` 450ms, easing `--ease-mech`. Never hardcode a duration.
- **Focus:** the cyan double ring `--focus-ring`, always visible, never removed.
- **Targets:** interactive elements meet `--target-min` (44px).
- **Component convention:** standalone, selector prefixed `app-`, separate `.ts`/`.html`/`.scss`/`.spec.ts`, `templateUrl` + `styleUrl`. Matches every existing component in this repo.
- **Angular 21 signal APIs:** `input()` and `output()`, not `@Input()`/`@Output()`. See `src/app/core/layout/terminal-section/components/terminal-line/terminal-line.ts` for the existing in-repo example.
- **Prerender safety:** no `Date.now()`, `Math.random()`, or `localStorage` during initial render. Anything time-varying initialises to a server-stable value and updates in `afterNextRender` only.
- **Server routes must match app routes.** Every path in `app.routes.server.ts` needs a literal match in `app.routes.ts`, or the build fails with `The '<path>' server route does not match any routes defined in the Angular routing configuration`.

**Commands:**

```bash
npm run build                                          # prebuild regenerates the blog index
npx ng test --watch=false --browsers=ChromeHeadless    # full suite
npx ng test --watch=false --browsers=ChromeHeadless --include='**/window.spec.ts'   # one spec
```

**Baseline test state:** 7 specs fail at branch point with `NG0201: No provider found for ActivatedRoute` — `Footer`, `HomePage`, `PortfolioPage`, `ProjectCard`, `ProjectDetailPage`, `FeaturedProjectsSection`, `ErrorPage`. Every one of those components is deleted or rebuilt by this plan. Do not treat them as regressions; do confirm the count only ever goes down.

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `src/styles/kairo/tokens/_colors.scss` etc. | KAIRO custom properties in `:root` |
| `src/styles/kairo/_base.scss` | reset, focus ring, default type |
| `src/app/ui/windows/window/` | `Window` — the frame every content block uses |
| `src/app/ui/windows/viewport-window/` | `ViewportWindow` — constrained image viewport |
| `src/app/ui/windows/system-bar/` | `SystemBar` — top and bottom instrumentation |
| `src/app/ui/windows/mode-nav/` | `ModeNav` — desktop vertical mode rail |
| `src/app/ui/core/readout/` | `Readout` — label/value instrument |
| `src/app/ui/core/status-light/` | `StatusLight` — dot + label |
| `src/app/ui/core/badge/` | `Badge` — tone chip |
| `src/app/ui/core/button/` | `Button` — terminal control |
| `src/app/ui/data/data-table/` | `DataTable` — selectable rows |
| `src/app/ui/data/key-value/` | `KeyValue` — inspector list |
| `src/app/ui/overlays/command-palette/` | `CommandPalette` — ⌘K navigation |
| `src/app/ui/chapter-header/` | `ChapterHeader` — the `CODE_NN` page header, shared by six routes |
| `src/app/features/*/` | one page component per route, rebuilt |

**Deleted** (progressively, as each route lands): `src/styles/styles.scss`, `src/styles/abstracts/`, `src/app/core/layout/header/`, `src/app/core/layout/footer/`, `src/app/core/layout/terminal-section/`, `src/app/core/shared/`, all `src/app/features/*/components/`, `src/app/features/construction/`.

---

## Task 1: KAIRO tokens and base styles

**Files:**
- Create: `src/styles/kairo/tokens/_colors.scss`, `_type.scss`, `_space.scss`, `_motion.scss`
- Create: `src/styles/kairo/_base.scss`
- Create: `src/styles/kairo/kairo.scss` (entry point loaded by angular.json)
- Modify: `angular.json` (add KAIRO as a second styles entry, build + test targets)
- Modify: `src/index.html` (swap the VT323 font link for KAIRO's three families; drop the pre-paint theme script)
- Test: `src/styles/kairo/tokens.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: the full `--k-*`, `--surface-*`, `--text-*`, `--signal-*`, `--border-*`, `--font-*`, `--type-*`, `--tracking-*`, `--sp-*`, `--radius-*`, `--bw-*`, `--z-*`, `--dur-*`, `--ease-*`, `--focus-ring`, `--target-min`, `--bp-*` custom properties on `:root`. Every later task depends on these.

- [ ] **Step 1: Write the failing test**

Create `src/styles/kairo/tokens.spec.ts`:

```typescript
describe('KAIRO tokens', () => {
  const read = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  it('defines the canvas surface', () => {
    expect(read('--surface-canvas')).toBeTruthy();
  });

  it('resolves signal red to the KAIRO value', () => {
    const probe = document.createElement('div');
    probe.style.color = 'var(--signal-active)';
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    expect(resolved).toBe('rgb(232, 56, 44)');
  });

  it('defines the 4px spacing grid', () => {
    expect(read('--sp-1')).toBe('4px');
    expect(read('--sp-4')).toBe('16px');
  });

  it('defines the mechanical easing curve', () => {
    expect(read('--ease-mech')).toBe('cubic-bezier(0.3,0,0.1,1)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/tokens.spec.ts'`
Expected: FAIL — `--surface-canvas` resolves to empty string.

- [ ] **Step 3: Create the token files**

`src/styles/kairo/tokens/_colors.scss` — copy verbatim from the design project's `tokens/colors.css`:

```scss
:root {
  --k-black: #07090b;
  --k-graphite-0: #0b0e12;
  --k-graphite-1: #10141a;
  --k-graphite-2: #161b22;
  --k-graphite-3: #1d242d;
  --k-graphite-4: #28313b;
  --k-ash-0: #3a444f;
  --k-ash-1: #5c6670;
  --k-ash-2: #8b949d;
  --k-ash-3: #aeb6bd;
  --k-paper: #e9e7e1;
  --k-paper-dim: #c9c8c2;
  --k-red-0: #7a1714;
  --k-red-1: #c2271f;
  --k-red-2: #e8382c;
  --k-red-3: #ff6a55;
  --k-cyan-1: #2fa8b8;
  --k-cyan-2: #4fd2e0;
  --k-blue-1: #3f6fb5;
  --k-blue-2: #6fa0e8;
  --k-green-1: #2f9e5f;
  --k-green-2: #55d88a;
  --k-amber-1: #b8862d;
  --k-amber-2: #e8b04a;

  --surface-canvas: var(--k-graphite-0);
  --surface-window: var(--k-graphite-1);
  --surface-elevated: var(--k-graphite-2);
  --surface-raised: var(--k-graphite-3);
  --surface-inset: var(--k-black);
  --surface-inverse: var(--k-paper);
  --surface-active-tint: rgba(232, 56, 44, 0.08);
  --surface-info-tint: rgba(79, 210, 224, 0.07);

  --text-primary: var(--k-paper);
  --text-secondary: var(--k-ash-3);
  --text-muted: var(--k-ash-2);
  --text-faint: var(--k-ash-1);
  --text-inverse: #101418;
  --text-active: var(--k-red-3);
  --text-link: var(--k-cyan-2);

  --signal-active: var(--k-red-2);
  --signal-active-strong: var(--k-red-3);
  --signal-active-dim: var(--k-red-0);
  --signal-info: var(--k-cyan-2);
  --signal-info-dim: var(--k-cyan-1);
  --signal-network: var(--k-blue-2);
  --signal-success: var(--k-green-2);
  --signal-success-dim: var(--k-green-1);
  --signal-warning: var(--k-amber-2);
  --signal-warning-dim: var(--k-amber-1);
  --signal-danger: var(--k-red-2);

  --border-default: var(--k-graphite-4);
  --border-strong: var(--k-ash-0);
  --border-faint: var(--k-graphite-3);
  --border-active: var(--k-red-2);
  --border-info: var(--k-cyan-1);

  --focus-ring: 0 0 0 1px var(--surface-canvas),0 0 0 3px var(--k-cyan-2);
}
```

`src/styles/kairo/tokens/_type.scss`:

```scss
:root {
  --font-display: "Saira Condensed", system-ui, sans-serif;
  --font-ui: "IBM Plex Sans", system-ui, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, monospace;
  --type-display-xl: 600 96px/0.95 var(--font-display);
  --type-display-l: 600 56px/1 var(--font-display);
  --type-display-m: 600 32px/1.05 var(--font-display);
  --type-title: 600 20px/1.2 var(--font-display);
  --type-body: 400 14px/1.55 var(--font-ui);
  --type-body-s: 400 13px/1.5 var(--font-ui);
  --type-label: 500 11px/1.2 var(--font-ui);
  --type-mono: 400 12px/1.5 var(--font-mono);
  --type-mono-s: 400 11px/1.45 var(--font-mono);
  --tracking-wide: 0.08em;
  --tracking-wider: 0.16em;
  --tracking-display: 0.02em;
  --tracking-normal: 0;
}
```

Note: KAIRO's originals list `'IBM Plex Sans JP'` in each stack. It is dropped here — the site has no Japanese content, and KAIRO's own rule is that Japanese glyphs appear only where a real bilingual label makes sense. Do not load that family.

`src/styles/kairo/tokens/_space.scss`:

```scss
:root {
  --sp-0: 0px;
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 20px;
  --sp-6: 24px;
  --sp-8: 32px;
  --sp-10: 40px;
  --sp-12: 48px;
  --sp-16: 64px;
  --sp-20: 80px;
  --radius-0: 0;
  --radius-1: 2px;
  --radius-2: 3px;
  --bw-hairline: 1px;
  --bw-rule: 2px;
  --bw-indicator: 3px;
  --opacity-disabled: 0.45;
  --opacity-inactive: 0.65;
  --z-window: 10;
  --z-rail: 20;
  --z-statusbar: 30;
  --z-overlay: 40;
  --z-palette: 50;
  --z-alert: 60;
  --target-min: 44px;
  --bp-mobile: 480px;
  --bp-tablet: 840px;
  --bp-desktop: 1200px;
}
```

`src/styles/kairo/tokens/_motion.scss`:

```scss
:root {
  --dur-micro: 100ms;
  --dur-control: 180ms;
  --dur-window: 280ms;
  --dur-cinematic: 450ms;
  // Cursor/blink cadence. Deliberately NOT part of the transition scale above,
  // and deliberately not zeroed under prefers-reduced-motion — blinking is
  // switched off with `animation: none`, not by collapsing its period.
  --dur-blink: 1s;
  --ease-mech: cubic-bezier(0.3,0,0.1,1);
  --ease-cut: steps(2, end);
  --ease-linear: linear;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --dur-micro: 0ms;
    --dur-control: 0ms;
    --dur-window: 0ms;
    --dur-cinematic: 0ms;
  }
}
```

`src/styles/kairo/_base.scss`:

```scss
* {
  box-sizing: border-box;
}

html {
  color-scheme: dark;
}

body {
  margin: 0;
  background: var(--surface-canvas);
  color: var(--text-primary);
  font: var(--type-body);
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--text-link);
  text-decoration: none;

  &:hover {
    color: var(--text-primary);
  }
}

:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

::selection {
  background: var(--signal-active);
  color: #fff;
}
```

`src/styles/kairo/kairo.scss` — note: no leading underscore. This is a real
entry point, not a partial, because `angular.json` loads it directly:

```scss
@use "tokens/colors";
@use "tokens/type";
@use "tokens/space";
@use "tokens/motion";
@use "base";
```

- [ ] **Step 4: Wire it into the build — load order matters**

**Do not modify `src/styles/styles.scss`.** GlitterNet sets
`body { background-color: ... }` at `styles.scss:146`, and it must not win over
KAIRO's base during the migration or every screenshot check in Tasks 9–15 would
be comparing KAIRO pages rendered on a GlitterNet background. Sass requires
`@use` at the top of a file, so the import cannot simply be appended there.

Instead, in `angular.json`, add KAIRO as a **second** entry after `styles.scss`
— in **both** the `build` and the `test` targets:

```json
"styles": ["src/styles/styles.scss", "src/styles/kairo/kairo.scss"]
```

Later entries win, so KAIRO's base overrides the GlitterNet rules that remain
until Task 18. `stylePreprocessorOptions.includePaths: ["src/styles"]` is
already set and needs no change.

This is temporary: Task 18 removes the `styles.scss` entry, leaving a single
`main.scss`.

- [ ] **Step 5: Swap the fonts and drop the theme script in `src/index.html`**

Delete the entire `<script>` block that reads `localStorage.getItem('theme')` and sets `data-theme` — dark-only means it has nothing to do.

Replace:

```html
<link href="https://fonts.googleapis.com/css2?family=VT323&display=swap" rel="stylesheet" />
```

with:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@400;500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

Collapse the two `theme-color` meta tags into one:

```html
<meta name="theme-color" content="#0b0e12" />
```

Leave `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` in place — both are still needed.

- [ ] **Step 6: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/tokens.spec.ts'`
Expected: PASS, 4 specs.

- [ ] **Step 7: Verify the build still prerenders**

Run: `npm run build`
Expected: `Prerendered 7 static routes.` and `Application bundle generation complete.`

- [ ] **Step 8: Commit**

```bash
git add src/styles/kairo angular.json src/index.html
git commit -m "feat(ui): add KAIRO design tokens and base styles"
```

---

## Task 2: Content cuts

Independent of every UI task, done early so later routes are built against final data.

**Files:**
- Delete: `public/blog/this-site-looks-like-1999-on-purpose.md`
- Delete: `public/blog/governing-tool-access-for-ai-agents.md`
- Delete: `public/images/blog/y2k/` (6 files)
- Delete: `public/images/projects/incident-control-plane/`, `mcp-gateway/`, `agent-eval-platform/`
- Modify: `src/app/data/projects.data.ts` (remove 3 entries and the `writeup` field)
- Modify: `package.json`, `angular.json` (remove `mermaid`)
- Modify: `src/app/features/blog/blog-post-page/blog-post-page.ts`, `.scss` (remove mermaid rendering)
- Test: `src/app/data/projects.data.spec.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `projectsData: Project[]` containing exactly one entry, `id: 'pr-sweep'`. `Project` no longer has a `writeup` field. Tasks 9–11 depend on this shape.

- [ ] **Step 1: Write the failing test**

Create `src/app/data/projects.data.spec.ts`:

```typescript
import { projectsData } from './projects.data';

describe('projectsData', () => {
  it('contains exactly one project', () => {
    expect(projectsData.length).toBe(1);
  });

  it('is PR Sweep', () => {
    expect(projectsData[0].id).toBe('pr-sweep');
    expect(projectsData[0].title).toBe('PR Sweep');
  });

  it('has no project referencing a deleted blog post', () => {
    const ids = projectsData.map((p) => p.id);
    expect(ids).not.toContain('mcp-gateway');
    expect(ids).not.toContain('incident-control-plane');
    expect(ids).not.toContain('agent-eval-platform');
  });

  it('retains the images the detail page renders', () => {
    expect(projectsData[0].images?.length).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/projects.data.spec.ts'`
Expected: FAIL — `Expected 4 to be 1`.

- [ ] **Step 3: Cut the data**

In `src/app/data/projects.data.ts`, delete the three object literals with `id: 'incident-control-plane'` (lines ~31–85), `id: 'mcp-gateway'` (~86–151), and `id: 'agent-eval-platform'` (~152–191). Keep only the `pr-sweep` entry. The file drops from 239 lines to roughly 80.

Also delete this line from the `Project` interface:

```typescript
  /** Slug of a related blog post, linked from the project page. */
  writeup?: string;
```

Its only value was on the deleted `mcp-gateway` entry.

- [ ] **Step 4: Delete the content files**

```bash
git rm public/blog/this-site-looks-like-1999-on-purpose.md
git rm public/blog/governing-tool-access-for-ai-agents.md
git rm -r public/images/blog/y2k
git rm -r public/images/projects/incident-control-plane
git rm -r public/images/projects/mcp-gateway
git rm -r public/images/projects/agent-eval-platform
```

- [ ] **Step 5: Remove mermaid**

`mermaid` is used by exactly one piece of content — the MCP Gateway post just deleted. Verify, then remove:

```bash
grep -rl "mermaid" public/blog/ || echo "no remaining content uses mermaid"
npm uninstall mermaid
```

In `angular.json`, delete these entries from `allowedCommonJsDependencies`:

```
"dayjs", "dayjs/plugin/customParseFormat.js", "dayjs/plugin/advancedFormat.js",
"dayjs/plugin/duration.js", "dayjs/plugin/isoWeek.js", "cytoscape-cose-bilkent",
"cytoscape-fcose", "@braintree/sanitize-url", "fastdom",
"fastdom/extensions/fastdom-promised.js"
```

All ten are mermaid's transitive dependencies and have no other consumer. Leave the `allowedCommonJsDependencies` key present but empty, or remove the key entirely.

In `src/app/features/blog/blog-post-page/blog-post-page.ts`, remove the `mermaid` import and every call to it. In `blog-post-page.scss`, remove the mermaid diagram rules. This component is fully rebuilt in Task 13 — here you are only making it compile without the dependency.

- [ ] **Step 6: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/projects.data.spec.ts'`
Expected: PASS, 4 specs.

- [ ] **Step 7: Verify the build and the regenerated blog index**

Run: `npm run build`
Expected: prebuild logs `Generated ... (1 posts)`, then `Prerendered 5 static routes.` — two blog slugs are gone, so the count drops from 7 to 5.

Confirm the generated index really has one entry:

```bash
grep -c "slug:" src/app/data/blog-posts.generated.ts
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: cut content to PR Sweep and one blog post, drop mermaid"
```

---

## Task 3: Window and ViewportWindow

The load-bearing frame. Every content block on every screen is a `Window`.

**Files:**
- Create: `src/app/ui/windows/window/window.ts`, `window.html`, `window.scss`, `window.spec.ts`
- Create: `src/app/ui/windows/viewport-window/viewport-window.ts`, `.html`, `.scss`, `.spec.ts`

**Interfaces:**
- Consumes: KAIRO tokens from Task 1.
- Produces:
  - `Window`, selector `app-window`. Inputs: `variant` (`'data' | 'media' | 'dialogue' | 'command' | 'inspector' | 'system' | 'alert' | 'transient' | 'viewport'`, default `'data'`), `title` (string), `index` (string), `context` (string), `status` (string), `active` (boolean, default false), `padded` (boolean, default true). Projects content into the body via `<ng-content>`, and named slots `[windowControls]` and `[windowFooter]`.
  - `ViewportWindow`, selector `app-viewport-window`. Inputs: `src` (string), `alt` (string, default `''`), `ratio` (string, default `'4 / 3'`), `pixelated` (boolean), `label` (string). With no `src`, renders a `NO SIGNAL` state.

- [ ] **Step 1: Write the failing test**

Create `src/app/ui/windows/window/window.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Window } from './window';

@Component({
  standalone: true,
  imports: [Window],
  template: `
    <app-window index="03" title="Archive" context="RECORDS" variant="inspector">
      <p class="body-probe">contents</p>
    </app-window>
  `,
})
class Host {}

describe('Window', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('renders the zero-padded index', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.window__index')?.textContent?.trim()).toBe('03');
  });

  it('renders the title uppercased', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.window__title')?.textContent?.trim()).toBe('Archive');
    const transform = getComputedStyle(
      el.querySelector('.window__title') as Element,
    ).textTransform;
    expect(transform).toBe('uppercase');
  });

  it('renders the context after a // separator', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.window__head')?.textContent).toContain('//');
    expect(el.querySelector('.window__context')?.textContent?.trim()).toBe('RECORDS');
  });

  it('projects body content', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.body-probe')?.textContent).toBe('contents');
  });

  it('exposes the title as an accessible label', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('section')?.getAttribute('aria-label')).toBe('Archive');
  });

  it('applies the variant as a data attribute', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('section')?.getAttribute('data-variant')).toBe('inspector');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/window.spec.ts'`
Expected: FAIL — cannot resolve `./window`.

- [ ] **Step 3: Implement Window**

`src/app/ui/windows/window/window.ts`:

```typescript
import { Component, input } from '@angular/core';

export type WindowVariant =
  | 'data'
  | 'media'
  | 'dialogue'
  | 'command'
  | 'inspector'
  | 'system'
  | 'alert'
  | 'transient'
  | 'viewport';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [],
  templateUrl: './window.html',
  styleUrl: './window.scss',
})
export class Window {
  variant = input<WindowVariant>('data');
  title = input('');
  index = input('');
  context = input('');
  status = input('');
  active = input(false);
  padded = input(true);
}
```

`src/app/ui/windows/window/window.html`:

```html
<section
  class="window"
  [attr.data-variant]="variant()"
  [class.window--active]="active()"
  [attr.aria-label]="title()"
>
  <div class="window__head">
    @if (index()) {
      <span class="window__index">{{ index() }}</span>
    }
    <span class="window__title">{{ title() }}</span>
    @if (context()) {
      <span class="window__sep">//</span>
      <span class="window__context">{{ context() }}</span>
    }
    @if (status()) {
      <span class="window__status">{{ status() }}</span>
    }
    <span class="window__controls"><ng-content select="[windowControls]" /></span>
  </div>

  <div class="window__body" [class.window__body--padded]="padded()">
    <ng-content />
  </div>

  <ng-content select="[windowFooter]" />
</section>
```

`src/app/ui/windows/window/window.scss` — the accent map comes straight from KAIRO's `variantAccent`:

```scss
.window {
  background: var(--surface-window);
  border: var(--bw-hairline) solid var(--border-default);
  border-top-color: var(--border-strong);
  border-radius: var(--radius-0);
  position: relative;

  &[data-variant="command"],
  &[data-variant="alert"] {
    border-top-color: var(--signal-active);
  }

  &[data-variant="dialogue"],
  &[data-variant="system"] {
    border-top-color: var(--signal-info-dim);
  }

  &[data-variant="transient"] {
    border-top-color: var(--border-default);
  }

  &--active::before {
    content: "";
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    width: var(--bw-indicator);
    background: var(--signal-active);
  }
}

.window__head {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-1) var(--sp-3);
  border-bottom: var(--bw-hairline) solid var(--border-default);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
  color: var(--text-muted);
}

.window__index {
  color: var(--signal-active);
}

.window__title {
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.window__sep {
  color: var(--text-faint);
}

.window__context {
  color: var(--text-secondary);
  text-transform: uppercase;
}

.window__status {
  margin-inline-start: auto;
  color: var(--text-faint);
}

.window__controls {
  display: inline-flex;
  gap: var(--sp-3);
}

.window__body--padded {
  padding: var(--sp-3);
}
```

Note: only `.window__status` carries `margin-inline-start: auto`. Two auto margins on the same edge would split the free space equally and push status and controls apart; with one, status absorbs the slack and controls sit flush beside it, which is the mockups arrangement.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/window.spec.ts'`
Expected: PASS, 6 specs.

- [ ] **Step 5: Write the failing ViewportWindow test**

Create `src/app/ui/windows/viewport-window/viewport-window.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewportWindow } from './viewport-window';

describe('ViewportWindow', () => {
  let fixture: ComponentFixture<ViewportWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewportWindow],
    }).compileComponents();
    fixture = TestBed.createComponent(ViewportWindow);
  });

  it('shows NO SIGNAL when no src is supplied', () => {
    fixture.componentRef.setInput('label', 'CAM 00');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toContain('NO SIGNAL');
  });

  it('renders the image and its alt text when src is supplied', () => {
    fixture.componentRef.setInput('src', 'images/projects/pr-sweep/board.png');
    fixture.componentRef.setInput('alt', 'status board');
    fixture.detectChanges();
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.getAttribute('src')).toBe('images/projects/pr-sweep/board.png');
    expect(img?.getAttribute('alt')).toBe('status board');
  });

  it('renders the corner label', () => {
    fixture.componentRef.setInput('label', 'CAM 00');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('CAM 00');
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/viewport-window.spec.ts'`
Expected: FAIL — cannot resolve `./viewport-window`.

- [ ] **Step 7: Implement ViewportWindow**

`viewport-window.ts`:

```typescript
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-viewport-window',
  standalone: true,
  imports: [],
  templateUrl: './viewport-window.html',
  styleUrl: './viewport-window.scss',
})
export class ViewportWindow {
  src = input('');
  alt = input('');
  ratio = input('4 / 3');
  pixelated = input(false);
  label = input('');
}
```

`viewport-window.html`:

```html
<figure class="viewport" [style.aspect-ratio]="ratio()">
  @if (src()) {
    <img
      class="viewport__img"
      [class.viewport__img--pixelated]="pixelated()"
      [src]="src()"
      [alt]="alt()"
    />
  } @else {
    <span class="viewport__nosignal">NO SIGNAL</span>
  }
  @if (label()) {
    <figcaption class="viewport__label">{{ label() }}</figcaption>
  }
</figure>
```

`viewport-window.scss`:

```scss
.viewport {
  margin: 0;
  position: relative;
  background: var(--surface-inset);
  border: var(--bw-hairline) solid var(--border-default);
  overflow: hidden;
  display: grid;
  place-items: center;
}

.viewport__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;

  &--pixelated {
    image-rendering: pixelated;
  }
}

.viewport__nosignal {
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wider);
  color: var(--text-faint);
}

.viewport__label {
  position: absolute;
  inset-block-end: var(--sp-1);
  inset-inline-start: var(--sp-2);
  // The label sits over arbitrary images, so it needs an opaque backing — no
  // single text colour is legible against both light and dark captures.
  padding: 0 var(--sp-1);
  background: rgba(7, 9, 11, 0.78);
  border: var(--bw-hairline) solid var(--border-default);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
  color: var(--text-primary);
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/viewport-window.spec.ts'`
Expected: PASS, 3 specs.

- [ ] **Step 9: Commit**

```bash
git add src/app/ui/windows
git commit -m "feat(ui): add Window and ViewportWindow"
```

---

## Task 4: Core components — Readout, StatusLight, Badge, Button

Four small components, one commit. They are grouped because each is under 40 lines and none is independently rejectable — a reviewer assessing `Readout` is assessing the same state-map that `StatusLight` uses.

**Files:**
- Create: `src/app/ui/core/readout/readout.ts`, `.html`, `.scss`, `.spec.ts`
- Create: `src/app/ui/core/status-light/status-light.ts`, `.html`, `.scss`, `.spec.ts`
- Create: `src/app/ui/core/badge/badge.ts`, `.html`, `.scss`, `.spec.ts`
- Create: `src/app/ui/core/button/button.ts`, `.html`, `.scss`, `.spec.ts`
- Create: `src/app/ui/core/signal-state.ts`

**Interfaces:**
- Consumes: KAIRO tokens from Task 1.
- Produces:
  - `SignalState` type = `'ok' | 'info' | 'warn' | 'danger' | 'neutral'`, exported from `src/app/ui/core/signal-state.ts`. Used by `Readout` and `StatusLight`.
  - `Readout`, selector `app-readout`. Inputs: `label` (string), `value` (string), `state` (`SignalState`, default `'neutral'`).
  - `StatusLight`, selector `app-status-light`. Inputs: `state` (`SignalState`, default `'ok'`), `label` (string), `blink` (boolean, default false).
  - `Badge`, selector `app-badge`. Inputs: `tone` (`'neutral' | 'active' | 'info' | 'success' | 'warning' | 'danger'`, default `'neutral'`), `filled` (boolean, default false). Projects content.
  - `Button`, selector `app-button`. Inputs: `variant` (`'primary' | 'secondary' | 'danger' | 'command' | 'mode'`, default `'secondary'`), `size` (`'sm' | 'md'`, default `'md'`), `index` (string), `disabled` (boolean, default false). Projects content.

Note: an `AppButton` already exists at `src/app/core/shared/app-button/`. It is GlitterNet-specific and is deleted in Task 18. The new component lives at a different path with a different selector; there is no collision.

- [ ] **Step 1: Write the failing tests**

Create `src/app/ui/core/readout/readout.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Readout } from './readout';

describe('Readout', () => {
  let fixture: ComponentFixture<Readout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Readout] }).compileComponents();
    fixture = TestBed.createComponent(Readout);
    fixture.componentRef.setInput('label', 'NET');
    fixture.componentRef.setInput('value', 'ONLINE');
    fixture.detectChanges();
  });

  it('renders label and value', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.readout__label')?.textContent?.trim()).toBe('NET');
    expect(el.querySelector('.readout__value')?.textContent?.trim()).toBe('ONLINE');
  });

  it('defaults to the neutral state', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.readout')?.getAttribute('data-state')).toBe('neutral');
  });

  it('reflects an explicit state', () => {
    fixture.componentRef.setInput('state', 'ok');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.readout')?.getAttribute('data-state')).toBe('ok');
  });
});
```

Create `src/app/ui/core/status-light/status-light.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusLight } from './status-light';

describe('StatusLight', () => {
  let fixture: ComponentFixture<StatusLight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusLight],
    }).compileComponents();
    fixture = TestBed.createComponent(StatusLight);
    fixture.componentRef.setInput('label', 'ACTIVE');
    fixture.detectChanges();
  });

  it('renders a dot glyph and the label', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.status-light__dot')).toBeTruthy();
    expect(el.textContent).toContain('ACTIVE');
  });

  it('announces itself as a status region', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="status"]')).toBeTruthy();
  });

  it('does not blink unless asked', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.status-light__dot--blink')).toBeNull();
  });
});
```

Create `src/app/ui/core/badge/badge.spec.ts`:

```typescript
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Badge } from './badge';

@Component({
  standalone: true,
  imports: [Badge],
  template: `<app-badge tone="active">ACTIVE</app-badge>`,
})
class Host {}

describe('Badge', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('projects its content', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('ACTIVE');
  });

  it('reflects its tone', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.badge')?.getAttribute('data-tone')).toBe('active');
  });
});
```

Create `src/app/ui/core/button/button.spec.ts`:

```typescript
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  standalone: true,
  imports: [Button],
  template: `<app-button variant="primary" index="01">EXECUTE</app-button>`,
})
class Host {}

describe('Button', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('renders a real button element', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('button')).toBeTruthy();
  });

  it('projects its label and renders the index', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('EXECUTE');
    expect(el.querySelector('.button__index')?.textContent?.trim()).toBe('01');
  });

  it('meets the minimum target height', () => {
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLElement;
    expect(getComputedStyle(btn).minHeight).toBe('44px');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/ui/core/**/*.spec.ts'`
Expected: FAIL — none of the four modules resolve.

- [ ] **Step 3: Implement the shared state type**

`src/app/ui/core/signal-state.ts`:

```typescript
export type SignalState = 'ok' | 'info' | 'warn' | 'danger' | 'neutral';
```

- [ ] **Step 4: Implement Readout**

`readout.ts`:

```typescript
import { Component, input } from '@angular/core';
import { SignalState } from '../signal-state';

@Component({
  selector: 'app-readout',
  standalone: true,
  imports: [],
  templateUrl: './readout.html',
  styleUrl: './readout.scss',
})
export class Readout {
  label = input('');
  value = input('');
  state = input<SignalState>('neutral');
}
```

`readout.html`:

```html
<span class="readout" [attr.data-state]="state()">
  <span class="readout__label">{{ label() }}</span>
  <span class="readout__value">{{ value() }}</span>
</span>
```

`readout.scss` — the state map is KAIRO's `stateColor`:

```scss
.readout {
  display: inline-flex;
  gap: var(--sp-2);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
  white-space: nowrap;
}

.readout__label {
  color: var(--text-faint);
}

.readout__value {
  color: var(--text-primary);
}

.readout[data-state="ok"] .readout__value {
  color: var(--signal-success);
}

.readout[data-state="info"] .readout__value {
  color: var(--signal-info);
}

.readout[data-state="warn"] .readout__value {
  color: var(--signal-warning);
}

.readout[data-state="danger"] .readout__value {
  color: var(--text-active);
}
```

- [ ] **Step 5: Implement StatusLight**

`status-light.ts`:

```typescript
import { Component, input } from '@angular/core';
import { SignalState } from '../signal-state';

@Component({
  selector: 'app-status-light',
  standalone: true,
  imports: [],
  templateUrl: './status-light.html',
  styleUrl: './status-light.scss',
})
export class StatusLight {
  state = input<SignalState>('ok');
  label = input('');
  blink = input(false);
}
```

`status-light.html`:

```html
<span class="status-light" role="status" [attr.data-state]="state()">
  <span
    class="status-light__dot"
    [class.status-light__dot--blink]="blink()"
    aria-hidden="true"
    >●</span
  >
  <span class="status-light__label">{{ label() }}</span>
</span>
```

`status-light.scss`:

```scss
.status-light {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
  color: var(--text-secondary);
}

.status-light__dot {
  color: var(--text-primary);
  line-height: 1;
}

// Status words are always uppercase under KAIRO's voice rules, so this lives
// in the component. A parent stylesheet cannot reach it — emulated
// encapsulation scopes it to this component's own styles.
.status-light__label {
  text-transform: uppercase;
}

.status-light[data-state="ok"] .status-light__dot {
  color: var(--signal-success);
}

.status-light[data-state="info"] .status-light__dot {
  color: var(--signal-info);
}

.status-light[data-state="warn"] .status-light__dot {
  color: var(--signal-warning);
}

.status-light[data-state="danger"] .status-light__dot {
  color: var(--text-active);
}

.status-light__dot--blink {
  animation: status-blink var(--dur-blink) var(--ease-cut) infinite;
}

@keyframes status-blink {
  0%,
  55% {
    opacity: 1;
  }
  56%,
  100% {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-light__dot--blink {
    animation: none;
  }
}
```

- [ ] **Step 6: Implement Badge**

`badge.ts`:

```typescript
import { Component, input } from '@angular/core';

export type BadgeTone =
  | 'neutral'
  | 'active'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  tone = input<BadgeTone>('neutral');
  filled = input(false);
}
```

`badge.html`:

```html
<span class="badge" [attr.data-tone]="tone()" [class.badge--filled]="filled()">
  <ng-content />
</span>
```

`badge.scss` — the `[foreground, border]` pairs are KAIRO's `tones` map:

```scss
.badge {
  display: inline-block;
  font: var(--type-mono-s);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  padding: 0 var(--sp-2);
  border: var(--bw-hairline) solid var(--border-default);
  border-radius: var(--radius-1);
  color: var(--text-secondary);

  &[data-tone="active"] {
    color: var(--text-active);
    border-color: var(--signal-active);
  }

  &[data-tone="info"] {
    color: var(--signal-info);
    border-color: var(--signal-info-dim);
  }

  &[data-tone="success"] {
    color: var(--signal-success);
    border-color: var(--signal-success-dim);
  }

  &[data-tone="warning"] {
    color: var(--signal-warning);
    border-color: var(--signal-warning-dim);
  }

  &[data-tone="danger"] {
    color: var(--text-active);
    border-color: var(--signal-active);
  }
}
```

- [ ] **Step 7: Implement Button**

`button.ts`:

```typescript
import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'command' | 'mode';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  variant = input<ButtonVariant>('secondary');
  size = input<'sm' | 'md'>('md');
  index = input('');
  disabled = input(false);
}
```

`button.html`:

```html
<button
  type="button"
  class="button"
  [attr.data-variant]="variant()"
  [attr.data-size]="size()"
  [disabled]="disabled()"
>
  @if (index()) {
    <span class="button__index">{{ index() }}</span>
  }
  <ng-content />
</button>
```

`button.scss` — hover and press states come from KAIRO's `variants()` map:

```scss
.button {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: var(--target-min);
  padding: 0 var(--sp-4);
  font: var(--type-mono);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  border-radius: var(--radius-1);
  cursor: pointer;
  background: var(--surface-elevated);
  color: var(--text-secondary);
  border: var(--bw-hairline) solid var(--border-default);
  transition:
    background-color var(--dur-control) var(--ease-mech),
    color var(--dur-control) var(--ease-mech);

  &:hover:not(:disabled) {
    background: var(--surface-raised);
    color: var(--text-primary);
  }

  &:active:not(:disabled) {
    background: var(--surface-inset);
  }

  &:disabled {
    opacity: var(--opacity-disabled);
    cursor: default;
  }

  &[data-variant="primary"] {
    background: var(--signal-active);
    color: #fff;
    border-color: transparent;

    &:hover:not(:disabled) {
      background: var(--k-red-3);
      color: var(--text-inverse);
    }

    &:active:not(:disabled) {
      background: var(--k-red-1);
      color: #fff;
    }
  }

  &[data-variant="danger"] {
    color: var(--text-active);
    border-color: var(--signal-active);
  }

  &[data-variant="command"] {
    background: transparent;
    border-color: var(--signal-active);
    color: var(--text-active);
  }

  &[data-variant="mode"] {
    background: transparent;
    border-color: transparent;
    justify-content: flex-start;
    width: 100%;
  }

  &[data-size="sm"] {
    min-height: var(--target-min);
    padding: 0 var(--sp-3);
    font: var(--type-mono-s);
  }
}

.button__index {
  color: var(--signal-active);
}
```

Note on `size="sm"`: it reduces padding and type but **not** height — `--target-min` is a floor, not a default. Do not let a small button drop below 44px.

- [ ] **Step 8: Run tests to verify they pass**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/ui/core/**/*.spec.ts'`
Expected: PASS, 11 specs.

- [ ] **Step 9: Commit**

```bash
git add src/app/ui/core
git commit -m "feat(ui): add Readout, StatusLight, Badge and Button"
```

---

## Task 5: SystemBar and ModeNav

**Files:**
- Create: `src/app/ui/windows/system-bar/system-bar.ts`, `.html`, `.scss`, `.spec.ts`
- Create: `src/app/ui/windows/mode-nav/mode-nav.ts`, `.html`, `.scss`, `.spec.ts`

**Interfaces:**
- Consumes: KAIRO tokens (Task 1).
- Produces:
  - `SystemBar`, selector `app-system-bar`. Input: `position` (`'top' | 'bottom'`, default `'top'`). Three named content slots: `[barLeft]`, `[barCenter]`, `[barRight]`.
  - `ModeNav`, selector `app-mode-nav`. Inputs: `modes` (`Mode[]`), `activeId` (string), `header` (string, default `'MODE'`). Output: `select` emitting the mode `id` string.
  - `Mode` interface, exported from `mode-nav.ts`: `{ id: string; label: string; index: string; route: string }`.

- [ ] **Step 1: Write the failing tests**

Create `src/app/ui/windows/system-bar/system-bar.spec.ts`:

```typescript
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemBar } from './system-bar';

@Component({
  standalone: true,
  imports: [SystemBar],
  template: `
    <app-system-bar position="bottom">
      <span barLeft>LEFT</span>
      <span barRight>RIGHT</span>
    </app-system-bar>
  `,
})
class Host {}

describe('SystemBar', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('projects left and right slots', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.system-bar__left')?.textContent).toContain('LEFT');
    expect(el.querySelector('.system-bar__right')?.textContent).toContain('RIGHT');
  });

  it('reflects its position', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.system-bar')?.getAttribute('data-position')).toBe('bottom');
  });

  it('announces itself as a status region', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="status"]')).toBeTruthy();
  });
});
```

Create `src/app/ui/windows/mode-nav/mode-nav.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModeNav, Mode } from './mode-nav';

const MODES: Mode[] = [
  { id: 'home', label: 'HOME', index: '01', route: '/' },
  { id: 'archive', label: 'ARCHIVE', index: '03', route: '/portfolio' },
];

describe('ModeNav', () => {
  let fixture: ComponentFixture<ModeNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ModeNav] }).compileComponents();
    fixture = TestBed.createComponent(ModeNav);
    fixture.componentRef.setInput('modes', MODES);
    fixture.componentRef.setInput('activeId', 'archive');
    fixture.detectChanges();
  });

  it('renders the MODE header by default', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('MODE');
  });

  it('renders one entry per mode with its index', () => {
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('.mode-nav__item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('01');
    expect(items[0].textContent).toContain('HOME');
  });

  it('marks only the active mode', () => {
    const el = fixture.nativeElement as HTMLElement;
    const active = el.querySelectorAll('.mode-nav__item--active');
    expect(active.length).toBe(1);
    expect(active[0].textContent).toContain('ARCHIVE');
  });

  it('exposes the active mode to assistive tech', () => {
    const el = fixture.nativeElement as HTMLElement;
    const active = el.querySelector('.mode-nav__item--active');
    expect(active?.getAttribute('aria-current')).toBe('page');
  });

  it('emits the mode id on click', () => {
    let emitted = '';
    fixture.componentInstance.select.subscribe((id: string) => (emitted = id));
    const first = (fixture.nativeElement as HTMLElement).querySelector(
      '.mode-nav__item',
    ) as HTMLElement;
    first.click();
    expect(emitted).toBe('home');
  });

  it('labels the nav landmark', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Mode');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/ui/windows/{system-bar,mode-nav}/*.spec.ts'`
Expected: FAIL — neither module resolves.

- [ ] **Step 3: Implement SystemBar**

`system-bar.ts`:

```typescript
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-system-bar',
  standalone: true,
  imports: [],
  templateUrl: './system-bar.html',
  styleUrl: './system-bar.scss',
})
export class SystemBar {
  position = input<'top' | 'bottom'>('top');
}
```

`system-bar.html`:

```html
<div class="system-bar" role="status" [attr.data-position]="position()">
  <span class="system-bar__left"><ng-content select="[barLeft]" /></span>
  <span class="system-bar__center"><ng-content select="[barCenter]" /></span>
  <span class="system-bar__right"><ng-content select="[barRight]" /></span>
</div>
```

`system-bar.scss`:

```scss
.system-bar {
  display: flex;
  align-items: center;
  gap: var(--sp-6);
  padding: 0 var(--sp-4);
  // 32px — KAIRO's own SystemBar specifies minHeight 32; the mockup's 34px
  // was a one-off and is off the 4px grid.
  min-height: var(--sp-8);
  background: var(--surface-window);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
  color: var(--text-muted);

  &[data-position="top"] {
    border-bottom: var(--bw-hairline) solid var(--border-default);
  }

  &[data-position="bottom"] {
    border-top: var(--bw-hairline) solid var(--border-default);
  }
}

.system-bar__left,
.system-bar__center {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-6);
}

.system-bar__right {
  margin-inline-start: auto;
  display: inline-flex;
  align-items: center;
  gap: var(--sp-5);
}

@media (max-width: 840px) {
  .system-bar {
    gap: var(--sp-3);
    padding: 0 var(--sp-3);
  }

  .system-bar__center {
    display: none;
  }
}
```

The center slot is hidden below tablet because the mockups drop secondary readouts on mobile rather than wrapping the bar.

- [ ] **Step 4: Implement ModeNav**

`mode-nav.ts`:

```typescript
import { Component, input, output } from '@angular/core';

export interface Mode {
  id: string;
  label: string;
  index: string;
  route: string;
}

@Component({
  selector: 'app-mode-nav',
  standalone: true,
  imports: [],
  templateUrl: './mode-nav.html',
  styleUrl: './mode-nav.scss',
})
export class ModeNav {
  modes = input<Mode[]>([]);
  activeId = input('');
  header = input('MODE');
  select = output<string>();
}
```

`mode-nav.html`:

```html
<nav class="mode-nav" aria-label="Mode">
  <span class="mode-nav__header">{{ header() }}</span>
  @for (mode of modes(); track mode.id) {
    <button
      type="button"
      class="mode-nav__item"
      [class.mode-nav__item--active]="mode.id === activeId()"
      [attr.aria-current]="mode.id === activeId() ? 'page' : null"
      (click)="select.emit(mode.id)"
    >
      <span class="mode-nav__index">{{ mode.index }}</span>
      <span class="mode-nav__label">{{ mode.label }}</span>
    </button>
  }
</nav>
```

`mode-nav.scss`:

```scss
.mode-nav {
  display: flex;
  flex-direction: column;
  border-inline-end: var(--bw-hairline) solid var(--border-faint);
  padding-block-start: var(--sp-1);
}

.mode-nav__header {
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wider);
  color: var(--text-faint);
  padding: var(--sp-2) var(--sp-3);
}

.mode-nav__item {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  min-height: var(--target-min);
  padding: 0 var(--sp-3);
  background: transparent;
  border: 0;
  border-inline-start: var(--bw-indicator) solid transparent;
  font: var(--type-mono);
  letter-spacing: var(--tracking-wide);
  color: var(--text-muted);
  cursor: pointer;
  text-align: start;
  transition: color var(--dur-control) var(--ease-mech);

  &:hover {
    color: var(--text-primary);
  }

  &--active {
    border-inline-start-color: var(--signal-active);
    background: var(--surface-active-tint);
    color: var(--text-primary);
    // 2px text shift — a non-color selection signal, per KAIRO
    padding-inline-start: calc(var(--sp-3) + 2px);
  }
}

.mode-nav__index {
  color: var(--text-faint);
}

.mode-nav__item--active .mode-nav__index {
  color: var(--signal-active);
}
```

The active state carries three signals — indicator bar, tint, and a 2px text shift — so selection is never conveyed by color alone.

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/ui/windows/{system-bar,mode-nav}/*.spec.ts'`
Expected: PASS, 9 specs.

- [ ] **Step 6: Commit**

```bash
git add src/app/ui/windows/system-bar src/app/ui/windows/mode-nav
git commit -m "feat(ui): add SystemBar and ModeNav"
```

---

## Task 6: Data components — DataTable and KeyValue

**Files:**
- Create: `src/app/ui/data/data-table/data-table.ts`, `.html`, `.scss`, `.spec.ts`
- Create: `src/app/ui/data/key-value/key-value.ts`, `.html`, `.scss`, `.spec.ts`

**Interfaces:**
- Consumes: KAIRO tokens (Task 1).
- Produces:
  - `DataTable`, selector `app-data-table`. Inputs: `columns` (`Column[]`), `rows` (`Row[]`), `selectedId` (string), `density` (`'dense' | 'comfortable'`, default `'dense'`), `endLabel` (string, default `''`). Output: `select` emitting the row `id`.
  - `Column` interface: `{ key: string; label: string; width?: string }`.
  - `Row` interface: `{ id: string; cells: Record<string, string> }`.
  - `KeyValue`, selector `app-key-value`. Inputs: `items` (`KeyValueItem[]`), `columns` (number, default 1).
  - `KeyValueItem` interface: `{ key: string; value: string }`.

`endLabel` is an addition to KAIRO's `DataTable` API, required by the spec's sparse-state rule for `LOG_04`. When set, the table renders a terminating rule beneath the last row. Everything else matches KAIRO's props.

- [ ] **Step 1: Write the failing tests**

Create `src/app/ui/data/data-table/data-table.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataTable, Column, Row } from './data-table';

const COLUMNS: Column[] = [
  { key: 'date', label: 'DATE' },
  { key: 'entry', label: 'ENTRY' },
];

const ROWS: Row[] = [
  { id: 'hello-world', cells: { date: '2026-01-16', entry: 'Hello, World!' } },
];

describe('DataTable', () => {
  let fixture: ComponentFixture<DataTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [DataTable] }).compileComponents();
    fixture = TestBed.createComponent(DataTable);
    fixture.componentRef.setInput('columns', COLUMNS);
    fixture.componentRef.setInput('rows', ROWS);
    fixture.detectChanges();
  });

  it('renders a header cell per column', () => {
    const el = fixture.nativeElement as HTMLElement;
    const heads = el.querySelectorAll('th');
    expect(heads.length).toBe(2);
    expect(heads[0].textContent?.trim()).toBe('DATE');
  });

  it('renders a row per entry', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
    expect(el.textContent).toContain('Hello, World!');
  });

  it('emits the row id on click', () => {
    let emitted = '';
    fixture.componentInstance.select.subscribe((id: string) => (emitted = id));
    const row = (fixture.nativeElement as HTMLElement).querySelector(
      'tbody tr',
    ) as HTMLElement;
    row.click();
    expect(emitted).toBe('hello-world');
  });

  it('marks the selected row with aria-selected', () => {
    fixture.componentRef.setInput('selectedId', 'hello-world');
    fixture.detectChanges();
    const row = (fixture.nativeElement as HTMLElement).querySelector('tbody tr');
    expect(row?.getAttribute('aria-selected')).toBe('true');
  });

  it('renders no end rule unless endLabel is set', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.data-table__end')).toBeNull();
  });

  it('renders the end rule when endLabel is set', () => {
    fixture.componentRef.setInput('endLabel', '— END OF LOG —');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.data-table__end')?.textContent).toContain('END OF LOG');
  });
});
```

Create `src/app/ui/data/key-value/key-value.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyValue } from './key-value';

describe('KeyValue', () => {
  let fixture: ComponentFixture<KeyValue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KeyValue] }).compileComponents();
    fixture = TestBed.createComponent(KeyValue);
    fixture.componentRef.setInput('items', [
      { key: 'STATUS', value: 'ACTIVE' },
      { key: 'YEAR', value: '2026' },
    ]);
    fixture.detectChanges();
  });

  it('renders a definition list', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('dl')).toBeTruthy();
    expect(el.querySelectorAll('dt').length).toBe(2);
    expect(el.querySelectorAll('dd').length).toBe(2);
  });

  it('pairs keys with values', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('dt')[0].textContent?.trim()).toBe('STATUS');
    expect(el.querySelectorAll('dd')[0].textContent?.trim()).toBe('ACTIVE');
  });
});
```


- [ ] **Step 2: Run tests to verify they fail**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/ui/data/**/*.spec.ts'`
Expected: FAIL — none of the three modules resolve.

- [ ] **Step 3: Implement DataTable**

`data-table.ts`:

```typescript
import { Component, input, output } from '@angular/core';

export interface Column {
  key: string;
  label: string;
  width?: string;
}

export interface Row {
  id: string;
  cells: Record<string, string>;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  columns = input<Column[]>([]);
  rows = input<Row[]>([]);
  selectedId = input('');
  density = input<'dense' | 'comfortable'>('dense');
  endLabel = input('');
  select = output<string>();
}
```

`data-table.html`:

```html
<table class="data-table" role="grid" [attr.data-density]="density()">
  <thead>
    <tr>
      @for (col of columns(); track col.key) {
        <th scope="col" [style.width]="col.width">{{ col.label }}</th>
      }
    </tr>
  </thead>
  <tbody>
    @for (row of rows(); track row.id) {
      <tr
        class="data-table__row"
        [class.data-table__row--selected]="row.id === selectedId()"
        [attr.aria-selected]="row.id === selectedId()"
        tabindex="0"
        (click)="select.emit(row.id)"
        (keydown.enter)="$event.preventDefault(); select.emit(row.id)"
        (keydown.space)="$event.preventDefault(); select.emit(row.id)"
      >
        @for (col of columns(); track col.key) {
          <td>{{ row.cells[col.key] }}</td>
        }
      </tr>
    }
  </tbody>
</table>

@if (endLabel()) {
  <p class="data-table__end">{{ endLabel() }}</p>
}
```

`data-table.scss`:

```scss
.data-table {
  width: 100%;
  border-collapse: collapse;
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);

  th {
    text-align: start;
    text-transform: uppercase;
    letter-spacing: var(--tracking-wider);
    color: var(--text-faint);
    font-weight: 500;
    border-bottom: var(--bw-hairline) solid var(--border-default);
    padding: var(--sp-2) var(--sp-3);
  }

  td {
    color: var(--text-secondary);
    border-bottom: var(--bw-hairline) solid var(--border-faint);
    padding: var(--sp-2) var(--sp-3);
  }

  &[data-density="comfortable"] {
    th,
    td {
      padding: var(--sp-3);
    }
  }
}

.data-table__row {
  cursor: pointer;
  border-inline-start: var(--bw-indicator) solid transparent;
  transition: color var(--dur-control) var(--ease-mech);

  &:hover td {
    color: var(--text-primary);
  }

  &--selected {
    border-inline-start-color: var(--signal-active);
    background: var(--surface-active-tint);

    td {
      color: var(--text-primary);
      // 2px shift — non-color selection signal
      transform: translateX(2px);
    }
  }
}

.data-table__end {
  margin: var(--sp-3) 0 0;
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wider);
  color: var(--text-faint);
  text-align: center;
  border-top: var(--bw-hairline) solid var(--border-faint);
  padding-block-start: var(--sp-3);
}
```

- [ ] **Step 4: Implement KeyValue**

`key-value.ts`:

```typescript
import { Component, input } from '@angular/core';

export interface KeyValueItem {
  key: string;
  value: string;
}

@Component({
  selector: 'app-key-value',
  standalone: true,
  imports: [],
  templateUrl: './key-value.html',
  styleUrl: './key-value.scss',
})
export class KeyValue {
  items = input<KeyValueItem[]>([]);
  columns = input(1);
}
```

`key-value.html`:

```html
<dl class="key-value" [style.grid-template-columns]="'repeat(' + columns() + ', auto 1fr)'">
  @for (item of items(); track item.key) {
    <dt class="key-value__key">{{ item.key }}</dt>
    <dd class="key-value__value">{{ item.value }}</dd>
  }
</dl>
```

`key-value.scss`:

```scss
.key-value {
  margin: 0;
  display: grid;
  gap: var(--sp-2) var(--sp-4);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
  align-items: baseline;
}

.key-value__key {
  color: var(--text-faint);
  text-transform: uppercase;
}

.key-value__value {
  margin: 0;
  color: var(--text-primary);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/ui/data/**/*.spec.ts'`
Expected: PASS, 8 specs.

- [ ] **Step 6: Commit**

```bash
git add src/app/ui/data
git commit -m "feat(ui): add DataTable and KeyValue"
```

---

## Task 7: CommandPalette

The mobile navigation and the desktop ⌘K overlay are the same component.

**Files:**
- Create: `src/app/ui/overlays/command-palette/command-palette.ts`, `.html`, `.scss`, `.spec.ts`

**Interfaces:**
- Consumes: KAIRO tokens (Task 1).
- Produces: `CommandPalette`, selector `app-command-palette`. Inputs: `open` (boolean, default false), `commands` (`PaletteCommand[]`), `placeholder` (string, default `'command_'`). Outputs: `run` emitting the command `id`, `close` emitting void.
- `PaletteCommand` interface, exported from `command-palette.ts`: `{ id: string; label: string; mode?: string; route: string }`.

Filtering matches against `label` and `mode`, case-insensitively — same rule as KAIRO's implementation.

- [ ] **Step 1: Write the failing test**

Create `src/app/ui/overlays/command-palette/command-palette.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandPalette, PaletteCommand } from './command-palette';

const COMMANDS: PaletteCommand[] = [
  { id: 'home', label: 'HOME', mode: 'SYSTEM', route: '/' },
  { id: 'archive', label: 'ARCHIVE', mode: 'RECORDS', route: '/portfolio' },
  { id: 'log', label: 'LOG', mode: 'RECORDS', route: '/blog' },
];

describe('CommandPalette', () => {
  let fixture: ComponentFixture<CommandPalette>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandPalette],
    }).compileComponents();
    fixture = TestBed.createComponent(CommandPalette);
    fixture.componentRef.setInput('commands', COMMANDS);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  it('renders nothing when closed', () => {
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.palette')).toBeNull();
  });

  it('lists every command when the query is empty', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.palette__item').length).toBe(3);
  });

  it('filters by label', () => {
    fixture.componentInstance.query.set('arch');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('.palette__item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('ARCHIVE');
  });

  it('filters by mode', () => {
    fixture.componentInstance.query.set('records');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.palette__item').length).toBe(2);
  });

  it('reports how many records matched', () => {
    fixture.componentInstance.query.set('arch');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('1 RECORD');
  });

  it('emits run with the command id on click', () => {
    let emitted = '';
    fixture.componentInstance.run.subscribe((id: string) => (emitted = id));
    const first = (fixture.nativeElement as HTMLElement).querySelector(
      '.palette__item',
    ) as HTMLElement;
    first.click();
    expect(emitted).toBe('home');
  });

  it('emits close on Escape', () => {
    let closed = false;
    fixture.componentInstance.close.subscribe(() => (closed = true));
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input',
    ) as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(closed).toBe(true);
  });

  it('is announced as a modal dialog', () => {
    const el = fixture.nativeElement as HTMLElement;
    const dialog = el.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/command-palette.spec.ts'`
Expected: FAIL — cannot resolve `./command-palette`.

- [ ] **Step 3: Implement CommandPalette**

`command-palette.ts`:

```typescript
import {
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface PaletteCommand {
  id: string;
  label: string;
  mode?: string;
  route: string;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.scss',
})
export class CommandPalette {
  open = input(false);
  commands = input<PaletteCommand[]>([]);
  placeholder = input('command_');
  run = output<string>();
  close = output<void>();

  query = signal('');

  private inputEl = viewChild<ElementRef<HTMLInputElement>>('paletteInput');
  private dialogEl = viewChild<ElementRef<HTMLElement>>('paletteDialog');
  private restoreFocusTo: HTMLElement | null = null;

  filtered = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.commands();
    return this.commands().filter(
      (c) =>
        c.label.toLowerCase().includes(q) || (c.mode ?? '').toLowerCase().includes(q),
    );
  });

  constructor() {
    // Moves focus into the palette when it opens and returns it to whatever
    // opened it on close. Angular does not focus newly-inserted elements, and
    // without this the palette — the only navigation below 840px — opens with
    // the user's focus stranded behind the scrim.
    effect(() => {
      const el = this.inputEl();
      if (this.open()) {
        if (!this.restoreFocusTo) {
          this.restoreFocusTo = document.activeElement as HTMLElement | null;
        }
        el?.nativeElement.focus();
      } else if (this.restoreFocusTo) {
        this.restoreFocusTo.focus();
        this.restoreFocusTo = null;
      }
    });
  }

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  /**
   * Bound to the dialog rather than the input, so Escape fires wherever focus
   * sits. Tab is cycled inside the dialog because `aria-modal="true"` promises
   * assistive technology that everything outside is inert.
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close.emit();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable =
      this.dialogEl()?.nativeElement.querySelectorAll<HTMLElement>('input, button');
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
```

`command-palette.html`:

```html
@if (open()) {
  <div class="palette-scrim" (click)="close.emit()">
    <div
      #paletteDialog
      class="palette"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      (click)="$event.stopPropagation()"
      (keydown)="onKeydown($event)"
    >
      <div class="palette__prompt">
        <span class="palette__caret" aria-hidden="true">&gt;</span>
        <input
          #paletteInput
          class="palette__input"
          type="text"
          autocomplete="off"
          [attr.placeholder]="placeholder()"
          [value]="query()"
          (input)="onInput($event)"
        />
      </div>

      <ul class="palette__list">
        @for (cmd of filtered(); track cmd.id) {
          <li>
            <button type="button" class="palette__item" (click)="run.emit(cmd.id)">
              <span class="palette__label">{{ cmd.label }}</span>
              @if (cmd.mode) {
                <span class="palette__mode">{{ cmd.mode }}</span>
              }
            </button>
          </li>
        }
      </ul>

      <p class="palette__count">{{ filtered().length }} RECORD(S) RETRIEVED</p>
    </div>
  </div>
}
```

`command-palette.scss`:

```scss
.palette-scrim {
  position: fixed;
  inset: 0;
  z-index: var(--z-palette);
  background: rgba(7, 9, 11, 0.7);
  display: grid;
  place-items: start center;
  padding-block-start: 12vh;
}

.palette {
  width: min(560px, 92vw);
  background: var(--surface-window);
  border: var(--bw-hairline) solid var(--border-strong);
  border-top-color: var(--signal-active);
}

.palette__prompt {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3);
  border-bottom: var(--bw-hairline) solid var(--border-default);
}

.palette__caret {
  color: var(--signal-active);
  font: var(--type-mono);
}

.palette__input {
  flex: 1;
  background: transparent;
  border: 0;
  color: var(--text-primary);
  font: var(--type-mono);
  letter-spacing: var(--tracking-wide);

  &::placeholder {
    color: var(--text-faint);
  }

  &:focus-visible {
    outline: none;
    box-shadow: none;
  }
}

.palette__list {
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: 50vh;
  overflow-y: auto;
}

.palette__item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  width: 100%;
  min-height: var(--target-min);
  padding: 0 var(--sp-3);
  background: transparent;
  border: 0;
  border-inline-start: var(--bw-indicator) solid transparent;
  font: var(--type-mono);
  letter-spacing: var(--tracking-wide);
  color: var(--text-secondary);
  cursor: pointer;
  text-align: start;

  &:hover {
    background: var(--surface-active-tint);
    border-inline-start-color: var(--signal-active);
    color: var(--text-primary);
    padding-inline-start: calc(var(--sp-3) + 2px);
  }
}

.palette__mode {
  margin-inline-start: auto;
  color: var(--text-faint);
  font: var(--type-mono-s);
}

.palette__count {
  margin: 0;
  padding: var(--sp-2) var(--sp-3);
  border-top: var(--bw-hairline) solid var(--border-default);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wider);
  color: var(--text-faint);
}
```

The `.palette__input` deliberately suppresses the focus ring: the palette is only ever opened with the input already focused, and a ring around a full-width field reads as an error box. Every other interactive element keeps the global ring.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/command-palette.spec.ts'`
Expected: PASS, 8 specs.

- [ ] **Step 5: Commit**

```bash
git add src/app/ui/overlays
git commit -m "feat(ui): add CommandPalette"
```

---

## Task 8: Application shell

Wires the persistent instrumentation, the mode rail, and the palette around the router outlet. After this task the shell is KAIRO even though every route still renders the construction page.

**Files:**
- Modify: `src/app/app.ts`, `src/app/app.html`, `src/app/app.scss`, `src/app/app.spec.ts`
- Create: `src/app/core/navigation.ts`

**Interfaces:**
- Consumes: `SystemBar`, `ModeNav` + `Mode` (Task 5), `CommandPalette` + `PaletteCommand` (Task 7), `Readout` (Task 4).
- Produces: `MODES: Mode[]` and `COMMANDS: PaletteCommand[]`, exported from `src/app/core/navigation.ts`. Tasks 9–15 do not consume these; they are shell-only.

- [ ] **Step 1: Write the failing test**

Replace `src/app/app.spec.ts` entirely:

```typescript
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a top and a bottom system bar', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-position="top"]')).toBeTruthy();
    expect(el.querySelector('[data-position="bottom"]')).toBeTruthy();
  });

  it('renders the wordmark in the top bar', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('hazel');
  });

  it('renders the mode rail', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('nav[aria-label="Mode"]')).toBeTruthy();
  });

  it('renders the routed page outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('main.main')).toBeTruthy();
  });

  it('keeps the palette closed until asked', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.palette')).toBeNull();
  });

  it('opens the palette on ctrl+k', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }),
    );
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.palette')).toBeTruthy();
  });

  it('renders a server-stable clock placeholder before hydration', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('--:--:--');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/app.spec.ts'`
Expected: FAIL — no top/bottom system bar in the DOM.

- [ ] **Step 3: Define the navigation model**

`src/app/core/navigation.ts`:

```typescript
import { Mode } from '../ui/windows/mode-nav/mode-nav';
import { PaletteCommand } from '../ui/overlays/command-palette/command-palette';

export const MODES: Mode[] = [
  { id: 'home', label: 'HOME', index: '01', route: '/' },
  { id: 'profile', label: 'PROFILE', index: '02', route: '/about' },
  { id: 'archive', label: 'ARCHIVE', index: '03', route: '/portfolio' },
  { id: 'log', label: 'LOG', index: '04', route: '/blog' },
];

export const COMMANDS: PaletteCommand[] = [
  { id: 'home', label: 'HOME', mode: 'SYSTEM', route: '/' },
  { id: 'profile', label: 'PROFILE', mode: 'SYSTEM', route: '/about' },
  { id: 'archive', label: 'ARCHIVE', mode: 'RECORDS', route: '/portfolio' },
  { id: 'pr-sweep', label: 'PR SWEEP', mode: 'RECORDS', route: '/portfolio/pr-sweep' },
  { id: 'log', label: 'LOG', mode: 'RECORDS', route: '/blog' },
];
```

The index values are the chapter codes from the spec's route map — `HOME_01`, `PROFILE_02`, `ARCHIVE_03`, `LOG_04`. They must stay in sync with the codes each page renders in its own header.

- [ ] **Step 4: Implement the shell**

`src/app/app.ts`:

```typescript
import {
  Component,
  HostListener,
  afterNextRender,
  computed,
  signal,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { SystemBar } from './ui/windows/system-bar/system-bar';
import { ModeNav } from './ui/windows/mode-nav/mode-nav';
import { Readout } from './ui/core/readout/readout';
import { CommandPalette } from './ui/overlays/command-palette/command-palette';
import { COMMANDS, MODES } from './core/navigation';

const CLOCK_PLACEHOLDER = '--:--:--';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SystemBar, ModeNav, Readout, CommandPalette],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  modes = MODES;
  commands = COMMANDS;

  paletteOpen = signal(false);
  clock = signal(CLOCK_PLACEHOLDER);

  activeMode = computed(() => {
    const url = this.currentUrl();
    const match = this.modes
      .filter((m) => m.route !== '/' && url.startsWith(m.route))
      .sort((a, b) => b.route.length - a.route.length)[0];
    return match?.id ?? 'home';
  });

  private currentUrl = signal('/');

  constructor(private router: Router) {
    this.currentUrl.set(this.router.url);
    this.router.events.subscribe(() => this.currentUrl.set(this.router.url));

    // Never during prerender: a live clock would differ between the server
    // render and hydration and blow up the DOM match.
    afterNextRender(() => {
      this.tick();
      setInterval(() => this.tick(), 1000);
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      this.paletteOpen.set(true);
      return;
    }
    if (event.key === '/' && !this.isTypingTarget(event.target)) {
      event.preventDefault();
      this.paletteOpen.set(true);
      return;
    }
    if (event.key === 'Escape') {
      this.paletteOpen.set(false);
    }
  }

  onModeSelect(id: string): void {
    const mode = this.modes.find((m) => m.id === id);
    if (mode) this.router.navigateByUrl(mode.route);
  }

  onCommandRun(id: string): void {
    const command = this.commands.find((c) => c.id === id);
    this.paletteOpen.set(false);
    if (command) this.router.navigateByUrl(command.route);
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    return !!el && ['INPUT', 'TEXTAREA'].includes(el.tagName);
  }

  private tick(): void {
    this.clock.set(new Date().toTimeString().slice(0, 8));
  }
}
```

`src/app/app.html`:

```html
<div class="app">
  <app-system-bar position="top">
    <span barLeft class="app__wordmark">hazel<span class="app__ext">.exe</span></span>
    <span barCenter>
      <app-readout label="NET" value="ONLINE" state="ok" />
      <app-readout label="LOC" value="TEXAS // USA" />
    </span>
    <span barRight>
      <app-readout label="STATUS" value="OPEN TO WORK" state="ok" />
      <span class="app__clock">{{ clock() }}</span>
    </span>
  </app-system-bar>

  <div class="app__body">
    <app-mode-nav
      class="app__rail"
      [modes]="modes"
      [activeId]="activeMode()"
      (select)="onModeSelect($event)"
    />

    <main class="main">
      <router-outlet />
    </main>
  </div>

  <app-system-bar position="bottom">
    <span barLeft class="app__hints">
      <span>&#8984;K COMMAND</span>
      <span>/ SEARCH</span>
      <span>ESC BACK</span>
    </span>
  </app-system-bar>

  <app-command-palette
    [open]="paletteOpen()"
    [commands]="commands"
    (run)="onCommandRun($event)"
    (close)="paletteOpen.set(false)"
  />
</div>
```

`src/app/app.scss` — replaces the GlitterNet header styles entirely:

```scss
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app__wordmark {
  font: 600 16px/1 var(--font-display);
  letter-spacing: var(--tracking-wide);
  color: var(--text-primary);
}

.app__ext {
  color: var(--signal-active);
}

.app__clock {
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

.app__hints {
  display: inline-flex;
  gap: var(--sp-5);
  color: var(--text-faint);
}

.app__body {
  flex: 1;
  display: flex;
  min-height: 0;
}

.app__rail {
  width: 140px;
  flex-shrink: 0;
}

.main {
  flex: 1;
  min-width: 0;
  padding: var(--sp-5) var(--sp-6) var(--sp-8);
  position: relative;
  overflow: hidden;
}

@media (max-width: 840px) {
  .app__rail {
    display: none;
  }

  .main {
    padding: var(--sp-4) var(--sp-4) var(--sp-6);
  }
}
```

Below 840px the rail is hidden and the palette is the only navigation — that is the mockup's mobile behaviour, and why the bottom bar's `⌘K COMMAND` hint is always visible.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/app.spec.ts'`
Expected: PASS, 8 specs.

- [ ] **Step 6: Verify the build still prerenders**

Run: `npm run build`
Expected: `Prerendered 5 static routes.`

Confirm the clock did not leak a real time into the static output:

```bash
grep -o "\-\-:\-\-:\-\-" dist/portfolio/browser/index.html
```

Expected: one match. If a real timestamp appears instead, the clock is running during prerender and `afterNextRender` is wired wrong.

- [ ] **Step 7: Commit**

```bash
git add src/app/app.ts src/app/app.html src/app/app.scss src/app/app.spec.ts src/app/core/navigation.ts
git commit -m "feat(ui): KAIRO application shell with mode rail and command palette"
```

---

## Task 9: Home route — HOME_01

First route cutover. Swaps one `loadComponent` in `app.routes.ts`.

**Files:**
- Create: `src/app/features/home/home-page/home-page.ts`, `.html`, `.scss`, `.spec.ts` (replacing the existing four)
- Create: `src/app/ui/chapter-header/chapter-header.ts`, `.html`, `.scss`, `.spec.ts`
- Modify: `src/app/app.routes.ts` (route `''`)
- Delete: `src/app/features/home/components/` (all six subfolders)

**Interfaces:**
- Consumes: `Window` (Task 3), `ViewportWindow` (Task 3), `Readout`, `StatusLight`, `Badge`, `Button` (Task 4), `KeyValue` (Task 6), `projectsData` (Task 2), `blogPosts` from `src/app/data/blog-posts.generated.ts`, `ossStats` from `src/app/data/oss-stats.generated.ts`.
- Produces: `ChapterHeader`, selector `app-chapter-header`. Inputs: `code` (string, e.g. `'HOME'`), `index` (string, e.g. `'01'`), `context` (string), `status` (string), `environmental` (string — the oversized background word). Reused by Tasks 10–15.

- [ ] **Step 1: Write the failing ChapterHeader test**

Create `src/app/ui/chapter-header/chapter-header.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChapterHeader } from './chapter-header';

describe('ChapterHeader', () => {
  let fixture: ComponentFixture<ChapterHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterHeader],
    }).compileComponents();
    fixture = TestBed.createComponent(ChapterHeader);
    fixture.componentRef.setInput('code', 'HOME');
    fixture.componentRef.setInput('index', '01');
    fixture.componentRef.setInput('context', 'OPERATOR PROFILE');
    fixture.componentRef.setInput('environmental', 'HAZEL');
    fixture.detectChanges();
  });

  it('renders the chapter code and index separately', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('HOME');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_01');
  });

  it('renders the context', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'OPERATOR PROFILE',
    );
  });

  it('hides the environmental type from assistive tech', () => {
    const el = fixture.nativeElement as HTMLElement;
    const env = el.querySelector('.chapter__env');
    expect(env?.getAttribute('aria-hidden')).toBe('true');
    expect(env?.textContent?.trim()).toBe('HAZEL');
  });

  it('renders exactly one h1', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('h1').length).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/chapter-header.spec.ts'`
Expected: FAIL — cannot resolve `./chapter-header`.

- [ ] **Step 3: Implement ChapterHeader**

`chapter-header.ts`:

```typescript
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-chapter-header',
  standalone: true,
  imports: [],
  templateUrl: './chapter-header.html',
  styleUrl: './chapter-header.scss',
})
export class ChapterHeader {
  code = input('');
  index = input('');
  context = input('');
  status = input('');
  environmental = input('');
}
```

`chapter-header.html`:

```html
<header class="chapter">
  @if (environmental()) {
    <span class="chapter__env" aria-hidden="true">{{ environmental() }}</span>
  }

  <h1 class="chapter__title">
    <span class="chapter__code">{{ code() }}</span
    ><span class="chapter__index">_{{ index() }}</span>
  </h1>

  @if (context()) {
    <p class="chapter__context">
      <span class="chapter__owner">HAZEL.EXE</span>
      <span class="chapter__sep">//</span>
      <span class="chapter__label">{{ context() }}</span>
    </p>
  }

  @if (status()) {
    <p class="chapter__status">{{ status() }}</p>
  }
</header>
```

`chapter-header.scss`:

```scss
.chapter {
  display: flex;
  align-items: baseline;
  gap: var(--sp-5);
  margin-block-end: var(--sp-5);
  position: relative;
}

.chapter__env {
  position: absolute;
  inset-inline-end: -10px;
  inset-block-start: -20px;
  font: 600 260px/0.85 var(--font-display);
  letter-spacing: var(--tracking-display);
  color: var(--surface-elevated);
  user-select: none;
  pointer-events: none;
  z-index: -1;
}

.chapter__title {
  margin: 0;
  font: var(--type-display-l);
  letter-spacing: var(--tracking-display);
  color: var(--text-primary);
}

.chapter__index {
  color: var(--signal-active);
}

.chapter__context {
  margin: 0;
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
  color: var(--text-faint);
}

.chapter__owner {
  color: var(--text-faint);
}

.chapter__sep {
  color: var(--text-muted);
}

.chapter__label {
  color: var(--text-primary);
}

.chapter__status {
  margin: 0 0 0 auto;
  font: var(--type-mono-s);
  color: var(--text-faint);
}

@media (max-width: 840px) {
  .chapter {
    flex-direction: column;
    gap: var(--sp-2);
  }

  .chapter__title {
    font: var(--type-display-m);
  }

  .chapter__env {
    font-size: 120px;
    inset-block-start: -8px;
  }

  .chapter__status {
    margin-inline-start: 0;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/chapter-header.spec.ts'`
Expected: PASS, 4 specs.

- [ ] **Step 5: Write the failing HomePage test**

Replace `src/app/features/home/home-page/home-page.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the HOME_01 chapter header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('HOME');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_01');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Hazel Granados');
  });

  it('renders the operator profile window', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('OPERATOR PROFILE');
  });

  it('renders exactly one featured record', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.home__record').length).toBe(1);
    expect(el.textContent).toContain('PR Sweep');
  });

  it('renders the contact email', () => {
    const el = fixture.nativeElement as HTMLElement;
    const mail = el.querySelector('a[href^="mailto:"]');
    expect(mail?.getAttribute('href')).toBe('mailto:hazel.granados@protonmail.com');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
```

The final spec is a guard on the global no-emoji constraint. Copy it into every page spec in Tasks 10–15.

- [ ] **Step 6: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/home-page.spec.ts'`
Expected: FAIL — no `.chapter__code` in the DOM.

- [ ] **Step 7: Implement HomePage**

`home-page.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { StatusLight } from '../../../ui/core/status-light/status-light';
import { Badge } from '../../../ui/core/badge/badge';
import { projectsData } from '../../../data/projects.data';
import { blogPosts } from '../../../data/blog-posts.generated';
import { ossStats } from '../../../data/oss-stats.generated';

const LAST_UPDATE = '2026-09-20';

@Component({
  selector: 'home-page',
  standalone: true,
  imports: [RouterLink, ChapterHeader, Window, ViewportWindow, StatusLight, Badge],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  lastUpdate = LAST_UPDATE;
  projects = projectsData;
  posts = blogPosts;
  oss = ossStats;

  stack = [
    { idx: '01', label: 'C# / .NET' },
    { idx: '02', label: 'Angular / TypeScript' },
    { idx: '03', label: 'AWS' },
    { idx: '04', label: 'SQL' },
  ];

  services = [
    { label: 'FULL-STACK DELIVERY' },
    { label: 'API DESIGN' },
    { label: 'DESKTOP APPLICATIONS' },
  ];

  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Hazel Granados — Software Developer');
    this.meta.updateTag({
      name: 'description',
      content: 'Software developer. Full-stack applications built with care.',
    });
  }
}
```

`LAST_UPDATE` is a build-time constant, never `new Date()` — a runtime value would differ between prerender and hydration.

Confirm the `stack` and `services` values against the current `tech-stack-section` and `services-section` templates before deleting them, and carry over whatever is actually there.

`home-page.html`:

```html
<app-chapter-header
  code="HOME"
  index="01"
  context="OPERATOR PROFILE"
  [status]="'LAST UPDATE ' + lastUpdate"
  environmental="HAZEL"
/>

<div class="home">
  <div class="home__col">
    <app-window variant="inspector" index="00" title="Operator" context="PROFILE" [active]="true">
      <div class="home__operator">
        <app-viewport-window ratio="1 / 1" label="CAM 00" alt="" />
        <div>
          <p class="home__name">Hazel Granados</p>
          <p class="home__role">SOFTWARE DEVELOPER</p>
          <p class="home__pronouns">SHE/THEY</p>
          <div class="home__controls">
            <a class="home__link" href="#contact">Contact &gt;</a>
            <a class="home__link" href="resume/resume-en.pdf">Resume</a>
          </div>
        </div>
      </div>
    </app-window>

    <app-window index="01" title="Stack" context="RUNTIME">
      <ul class="home__list">
        @for (s of stack; track s.idx) {
          <li class="home__list-row">
            <span class="home__idx">{{ s.idx }}</span>
            <span>{{ s.label }}</span>
          </li>
        }
      </ul>
    </app-window>

    <app-window index="02" title="Services" context="OFFERED">
      <div class="home__tags">
        @for (t of services; track t.label) {
          <app-badge>{{ t.label }}</app-badge>
        }
      </div>
    </app-window>
  </div>

  <div class="home__col">
    <app-window
      index="03"
      title="Open Source"
      context="CONTRIBUTIONS"
      [status]="oss.totalMergedPrs + ' MERGED'"
    >
      <ul class="home__list">
        @for (r of oss.projects; track r.repo) {
          <li class="home__list-row">
            <a [href]="r.url" target="_blank" rel="noopener">{{ r.repo }}</a>
            <span class="home__meta">{{ r.stars }} STARS // {{ r.mergedPrs }} PRS</span>
          </li>
        }
      </ul>
    </app-window>

    <app-window index="04" title="Archive" context="FEATURED" [status]="'RECORD 01 OF 0' + projects.length">
      @for (p of projects; track p.id) {
        <a class="home__record" [routerLink]="['/portfolio', p.id]">
          <span class="home__idx">01</span>
          <span class="home__record-title">{{ p.title }}</span>
          <span class="home__meta">{{ p.stack }} // {{ p.year }}</span>
          <app-status-light state="ok" label="ACTIVE" />
        </a>
      }
    </app-window>

    <app-window index="05" title="Log" context="RECENT" [status]="posts.length + ' ENTRIES'">
      @for (b of posts; track b.slug) {
        <a class="home__log-row" [routerLink]="['/blog', b.slug]">
          <span class="home__meta">{{ b.date }}</span>
          <span class="home__record-title">{{ b.title }}</span>
        </a>
      }
    </app-window>

    <app-window id="contact" index="06" title="Contact" context="DIRECT">
      <p class="home__body">For questions or collaboration, reach out:</p>
      <a href="mailto:hazel.granados&#64;protonmail.com">hazel.granados&#64;protonmail.com</a>
    </app-window>
  </div>
</div>
```

`home-page.scss`:

```scss
.home {
  display: grid;
  grid-template-columns: 400px minmax(0, 1fr);
  gap: var(--sp-3);
  align-items: start;
}

.home__col {
  display: grid;
  gap: var(--sp-3);
  align-content: start;
}

.home__operator {
  display: grid;
  grid-template-columns: 104px 1fr;
  gap: var(--sp-4);
  align-items: start;
}

.home__name {
  margin: 0;
  font: var(--type-title);
  color: var(--text-primary);
}

.home__role,
.home__pronouns {
  margin: var(--sp-1) 0 0;
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wider);
  color: var(--text-muted);
}

.home__controls {
  display: flex;
  gap: var(--sp-4);
  margin-block-start: var(--sp-3);
}

.home__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.home__list-row {
  display: flex;
  align-items: baseline;
  gap: var(--sp-3);
  padding: var(--sp-2) 0;
  border-bottom: var(--bw-hairline) solid var(--border-faint);
  font: var(--type-mono-s);

  &:last-child {
    border-bottom: 0;
  }
}

.home__idx {
  color: var(--signal-active);
}

.home__meta {
  margin-inline-start: auto;
  color: var(--text-faint);
}

.home__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.home__record {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  min-height: var(--target-min);
  padding: var(--sp-2) 0;
  border-inline-start: var(--bw-indicator) solid transparent;
  border-bottom: var(--bw-hairline) solid var(--border-faint);
  font: var(--type-mono-s);
  color: var(--text-secondary);

  &:hover {
    border-inline-start-color: var(--signal-active);
    color: var(--text-primary);
    padding-inline-start: var(--sp-2);
  }

  &:last-child {
    border-bottom: 0;
  }
}

.home__record-title {
  color: var(--text-primary);
  font: var(--type-body-s);
}

.home__body {
  margin: 0 0 var(--sp-2);
  color: var(--text-secondary);
}

.home__link {
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
}

@media (max-width: 840px) {
  .home {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 8: Point the route at the new page**

In `src/app/app.routes.ts`, change only the `''` entry:

```typescript
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home-page/home-page').then((m) => m.HomePage),
  },
```

Every other route still resolves to `ConstructionPage`. Leave them alone.

- [ ] **Step 9: Delete the old home sections**

```bash
git rm -r src/app/features/home/components
```

This removes `presentation-section`, `tech-stack-section`, `oss-section`, `services-section`, `featured-projects-section`, and `contact-section` — and with them two of the seven baseline `NG0201` failures (`FeaturedProjectsSection`, and `HomePage`'s own spec is replaced).

- [ ] **Step 10: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/home-page.spec.ts'`
Expected: PASS, 7 specs.

- [ ] **Step 11: Verify the build and screenshot**

Run: `npm run build`
Expected: `Prerendered 5 static routes.`

Confirm the home page really carries the new markup:

```bash
grep -c "chapter__code" dist/portfolio/browser/index.html
```

Expected: 1.

Then serve `dist/portfolio/browser` and screenshot `/` at 1280x900 and 390x844, comparing against mockup `1a`. Check: the two-column grid collapses at 390, the environmental `HAZEL` sits behind the header without causing horizontal scroll, and the mode rail is hidden at 390.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat(home): rebuild home on KAIRO as HOME_01"
```

---

## Task 10: Projects index — ARCHIVE_03

**Files:**
- Create: `src/app/features/portfolio/portfolio-page/portfolio-page.ts`, `.html`, `.scss`, `.spec.ts` (replacing the existing four)
- Modify: `src/app/app.routes.ts` (route `'portfolio'`)

**Interfaces:**
- Consumes: `ChapterHeader` (Task 9), `Window`, `ViewportWindow` (Task 3), `Badge`, `StatusLight` (Task 4), `projectsData` (Task 2).
- Produces: nothing consumed elsewhere.

The spec requires the pager to read `RECORD 01 OF 01` and the single record to sit in the left column at its natural width without stretching. The filter row renders but is inert against one record — it stays because the archive idiom needs it and a second project will.

- [ ] **Step 1: Write the failing test**

Replace `src/app/features/portfolio/portfolio-page/portfolio-page.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PortfolioPage } from './portfolio-page';

describe('PortfolioPage', () => {
  let fixture: ComponentFixture<PortfolioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(PortfolioPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the ARCHIVE_03 chapter header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('ARCHIVE');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_03');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Projects');
  });

  it('renders the pager as 01 of 01', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.archive__pager')?.textContent).toContain('RECORD 01 OF 01');
  });

  it('renders exactly one record window', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.archive__record').length).toBe(1);
    expect(el.textContent).toContain('PR Sweep');
  });

  it('renders the filter row', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.archive__filters')).toBeTruthy();
  });

  it('links the record to its detail route', () => {
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('.archive__record a, a.archive__record');
    expect(link?.getAttribute('href')).toBe('/portfolio/pr-sweep');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/portfolio-page.spec.ts'`
Expected: FAIL — no `.chapter__code` in the DOM.

- [ ] **Step 3: Implement PortfolioPage**

`portfolio-page.ts`:

```typescript
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { Badge } from '../../../ui/core/badge/badge';
import { StatusLight } from '../../../ui/core/status-light/status-light';
import { projectsData } from '../../../data/projects.data';

@Component({
  selector: 'portfolio-page',
  standalone: true,
  imports: [RouterLink, ChapterHeader, Window, ViewportWindow, Badge, StatusLight],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  projects = projectsData;

  get total(): string {
    return String(this.projects.length).padStart(2, '0');
  }

  indexOf(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Projects - Hazel Granados');
    this.meta.updateTag({
      name: 'description',
      content: 'Project archive — selected work by Hazel Granados.',
    });
  }
}
```

`portfolio-page.html`:

```html
<app-chapter-header
  code="ARCHIVE"
  index="03"
  context="PROJECT RECORDS"
  environmental="ARCHIVE"
/>

<div class="archive__filters">
  <span class="archive__filter-label">[FILTER]</span>
  <span class="archive__filter archive__filter--active">ALL</span>
  <span class="archive__pager">RECORD 01 OF {{ total }}</span>
</div>

<div class="archive__grid">
  @for (p of projects; track p.id; let i = $index) {
    <app-window
      class="archive__record"
      variant="media"
      [index]="indexOf(i)"
      [title]="p.title"
      context="RECORD"
    >
      <a class="archive__link" [routerLink]="['/portfolio', p.id]">
        <app-viewport-window
          ratio="16 / 10"
          [src]="p.image"
          [alt]="p.title + ' screenshot'"
          [label]="'REC ' + indexOf(i)"
        />

        <p class="archive__desc">{{ p.description }}</p>

        <div class="archive__meta">
          <app-status-light state="ok" [label]="p.status ?? ''" />
          <span class="archive__stack">{{ p.stack }} // {{ p.year }}</span>
        </div>

        <div class="archive__tags">
          @for (t of p.tags ?? []; track t) {
            <app-badge>{{ t }}</app-badge>
          }
        </div>
      </a>
    </app-window>
  }
</div>
```

`StatusLight` already uppercases its own label (Task 4). Do **not** add a
`.status-light__label` rule to `portfolio-page.scss` — that class lives inside
StatusLight's emulated encapsulation and a parent stylesheet cannot reach it.

`portfolio-page.scss`:

```scss
.archive__filters {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-2) 0 var(--sp-3);
  border-bottom: var(--bw-hairline) solid var(--border-default);
  margin-block-end: var(--sp-4);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
  color: var(--text-faint);
}

.archive__filter-label {
  color: var(--signal-active);
}

.archive__filter--active {
  color: var(--text-primary);
}

.archive__pager {
  margin-inline-start: auto;
  color: var(--text-muted);
}

.archive__grid {
  display: grid;
  // Fixed track width so one record does not stretch to fill the row.
  grid-template-columns: repeat(2, minmax(0, 480px));
  gap: var(--sp-3);
  align-items: start;
}

.archive__link {
  display: grid;
  gap: var(--sp-3);
  color: inherit;
}

.archive__desc {
  margin: 0;
  font: var(--type-body-s);
  color: var(--text-secondary);
}

.archive__meta {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  font: var(--type-mono-s);
}

.archive__stack {
  margin-inline-start: auto;
  color: var(--text-faint);
}

.archive__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

@media (max-width: 840px) {
  .archive__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

`grid-template-columns: repeat(2, minmax(0, 480px))` is the spec's "does not stretch" requirement — with one record the second track stays empty and the record keeps its natural width rather than spanning the viewport.

- [ ] **Step 4: Point the route at the new page**

In `src/app/app.routes.ts`, change only the `'portfolio'` entry:

```typescript
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./features/portfolio/portfolio-page/portfolio-page').then(
        (m) => m.PortfolioPage,
      ),
  },
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/portfolio-page.spec.ts'`
Expected: PASS, 8 specs.

- [ ] **Step 6: Verify the build and screenshot**

Run: `npm run build`
Expected: `Prerendered 5 static routes.`

```bash
grep -c "RECORD 01 OF 01" dist/portfolio/browser/portfolio/index.html
```

Expected: 1.

Screenshot `/portfolio` at 1280x900 and 390x844 against mockup `1b`. Check the single record does not stretch across both columns at 1280.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(portfolio): rebuild projects index on KAIRO as ARCHIVE_03"
```

---

## Task 11: Project detail — ARCHIVE_03_01

Also flips this route from client-rendered to prerendered, per the spec.

**Files:**
- Create: `src/app/features/projectDetail/project-detail-page/project-detail-page.ts`, `.html`, `.scss`, `.spec.ts` (replacing the existing four)
- Modify: `src/app/app.routes.ts` (route `'portfolio/:id'`)
- Modify: `src/app/app.routes.server.ts` (route `'portfolio/:id'`)

**Interfaces:**
- Consumes: `ChapterHeader` (Task 9), `Window`, `ViewportWindow` (Task 3), `Badge` (Task 4), `KeyValue` + `KeyValueItem` (Task 6), `ProjectsDataService` from `src/app/services/projects-data.service.ts`.
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Write the failing test**

Replace `src/app/features/projectDetail/project-detail-page/project-detail-page.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectDetailPage } from './project-detail-page';

describe('ProjectDetailPage', () => {
  let fixture: ComponentFixture<ProjectDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(new Map([['id', 'pr-sweep']])) },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectDetailPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the ARCHIVE chapter header with the record index', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('ARCHIVE');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_03');
  });

  it('renders the project title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('PR Sweep');
  });

  it('renders the primary viewport and a thumbnail per image', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.detail__viewport')).toBeTruthy();
    expect(el.querySelectorAll('.detail__thumb').length).toBe(4);
  });

  it('renders every long description paragraph as README body', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.detail__para').length).toBe(3);
  });

  it('renders the record inspector with status, year and stack', () => {
    const el = fixture.nativeElement as HTMLElement;
    const text = el.querySelector('.detail__inspector')?.textContent ?? '';
    expect(text).toContain('STATUS');
    expect(text).toContain('YEAR');
    expect(text).toContain('2026');
  });

  it('links to the GitHub repository', () => {
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('a[href*="github.com"]');
    expect(link?.getAttribute('href')).toBe('https://github.com/hazeliscoding/pr-sweep');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/project-detail-page.spec.ts'`
Expected: FAIL — no `.chapter__code` in the DOM.

- [ ] **Step 3: Confirm the service API before using it**

```bash
cat src/app/services/projects-data.service.ts
```

Use whatever lookup method it already exposes. If it offers `getById(id: string): Project | undefined`, use that. If it exposes only the array, read `projectsData` directly and drop the service import. Do not invent a method name.

- [ ] **Step 4: Implement ProjectDetailPage**

`project-detail-page.ts` — adjust the service call in `ngOnInit` to match what Step 3 found:

```typescript
import { Component, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { Badge } from '../../../ui/core/badge/badge';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { Project, projectsData } from '../../../data/projects.data';

@Component({
  selector: 'project-detail-page',
  standalone: true,
  imports: [ChapterHeader, Window, ViewportWindow, Badge, KeyValue],
  templateUrl: './project-detail-page.html',
  styleUrl: './project-detail-page.scss',
})
export class ProjectDetailPage {
  project = signal<Project | undefined>(undefined);
  activeImage = signal('');

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      const found = projectsData.find((p) => p.id === id);
      this.project.set(found);
      this.activeImage.set(found?.image ?? '');

      if (found) {
        this.title.setTitle(`${found.title} - Hazel Granados`);
        this.meta.updateTag({ name: 'description', content: found.description });
      }
    });
  }

  inspector(): KeyValueItem[] {
    const p = this.project();
    if (!p) return [];
    return [
      { key: 'STATUS', value: (p.status ?? '').toUpperCase() },
      { key: 'YEAR', value: p.year ?? '' },
      { key: 'STACK', value: p.stack ?? '' },
      { key: 'RECORD', value: '01 OF 01' },
    ];
  }

  select(src: string): void {
    this.activeImage.set(src);
  }
}
```

`project-detail-page.html`:

```html
@if (project(); as p) {
  <app-chapter-header
    code="ARCHIVE"
    index="03"
    [context]="p.title"
    status="RECORD 01 OF 01"
    environmental="RECORD"
  />

  <div class="detail">
    <div class="detail__main">
      <app-window variant="viewport" index="01" title="Viewport" [context]="p.title">
        <app-viewport-window
          class="detail__viewport"
          ratio="16 / 10"
          [src]="activeImage()"
          [alt]="p.title + ' screenshot'"
          label="REC 01"
        />

        <div class="detail__strip">
          @for (img of p.images ?? []; track img.src) {
            <button
              type="button"
              class="detail__thumb"
              [class.detail__thumb--active]="img.src === activeImage()"
              (click)="select(img.src)"
            >
              <img [src]="img.src" [alt]="img.caption" />
              <span class="detail__caption">{{ img.caption }}</span>
            </button>
          }
        </div>
      </app-window>

      <app-window index="02" title="Readme" context="DESCRIPTION">
        @for (para of p.longDescription ?? []; track $index) {
          <p class="detail__para">{{ para }}</p>
        }
      </app-window>
    </div>

    <aside class="detail__side">
      <app-window
        class="detail__inspector"
        variant="inspector"
        index="03"
        title="Record"
        context="METADATA"
        [active]="true"
      >
        <app-key-value [items]="inspector()" />

        <div class="detail__tags">
          @for (t of p.tags ?? []; track t) {
            <app-badge>{{ t }}</app-badge>
          }
        </div>

        @if (p.links.github) {
          <a class="detail__link" [href]="p.links.github" target="_blank" rel="noopener"
            >&gt; SOURCE</a
          >
        }
        @if (p.links.demo) {
          <a class="detail__link" [href]="p.links.demo" target="_blank" rel="noopener"
            >&gt; DEMO</a
          >
        }
      </app-window>
    </aside>
  </div>
} @else {
  <app-chapter-header code="ARCHIVE" index="03" context="NO RECORD" environmental="NULL" />
  <p class="detail__missing">NO RECORD AT THIS ADDRESS</p>
}
```

`project-detail-page.scss`:

```scss
.detail {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: var(--sp-3);
  align-items: start;
}

.detail__main {
  display: grid;
  gap: var(--sp-3);
}

.detail__strip {
  display: flex;
  gap: var(--sp-2);
  margin-block-start: var(--sp-3);
  overflow-x: auto;
}

.detail__thumb {
  flex: 0 0 120px;
  display: grid;
  gap: var(--sp-1);
  padding: 0;
  background: transparent;
  border: var(--bw-hairline) solid var(--border-default);
  cursor: pointer;
  text-align: start;

  img {
    width: 100%;
    display: block;
    aspect-ratio: 16 / 10;
    object-fit: cover;
  }

  &--active {
    border-color: var(--signal-active);
  }
}

.detail__caption {
  padding: 0 var(--sp-1) var(--sp-1);
  font: var(--type-mono-s);
  color: var(--text-faint);
}

.detail__para {
  margin: 0 0 var(--sp-4);
  font: var(--type-body);
  color: var(--text-secondary);
  max-width: 68ch;

  &:last-child {
    margin-bottom: 0;
  }
}

.detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-block-start: var(--sp-4);
}

.detail__link {
  display: block;
  min-height: var(--target-min);
  line-height: var(--target-min);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
  border-top: var(--bw-hairline) solid var(--border-faint);
  margin-block-start: var(--sp-3);
}

.detail__missing {
  font: var(--type-mono);
  letter-spacing: var(--tracking-wider);
  color: var(--text-active);
}

@media (max-width: 840px) {
  .detail {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

Note the thumbnail strip uses `<button>`, not a bare `<img>` — it changes the viewport and must be keyboard reachable.

- [ ] **Step 5: Point the route at the new page**

In `src/app/app.routes.ts`, change only the `'portfolio/:id'` entry:

```typescript
  {
    path: 'portfolio/:id',
    loadComponent: () =>
      import(
        './features/projectDetail/project-detail-page/project-detail-page'
      ).then((m) => m.ProjectDetailPage),
  },
```

- [ ] **Step 6: Switch the route to prerendered**

In `src/app/app.routes.server.ts`, replace the `portfolio/:id` entry:

```typescript
  {
    path: 'portfolio/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      const { projectsData } = await import('./data/projects.data');
      return projectsData.map((p) => ({ id: p.id }));
    },
  },
```

`PrerenderFallback` is already imported at the top of that file for the blog route. Confirm it is still in the import list.

- [ ] **Step 7: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/project-detail-page.spec.ts'`
Expected: PASS, 8 specs.

- [ ] **Step 8: Verify the build prerenders the detail page**

Run: `npm run build`
Expected: `Prerendered 6 static routes.` — up one, because `/portfolio/pr-sweep` is now static.

```bash
ls dist/portfolio/browser/portfolio/pr-sweep/index.html
grep -c "PR Sweep" dist/portfolio/browser/portfolio/pr-sweep/index.html
```

Screenshot `/portfolio/pr-sweep` at 1280x900 and 390x844 against mockup `1c`. Check the thumbnail strip scrolls horizontally at 390 without the page scrolling.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(portfolio): rebuild project detail on KAIRO and prerender it"
```

---

## Task 12: Blog index — LOG_04

Implements the spec's sparse-state rule: one row must read as a complete short log, not a truncated long one.

**Files:**
- Create: `src/app/features/blog/blog-page/blog-page.ts`, `.html`, `.scss`, `.spec.ts`
- Modify: `src/app/app.routes.ts` (route `'blog'`)

**Interfaces:**
- Consumes: `ChapterHeader` (Task 9), `Window` (Task 3), `DataTable` + `Column` + `Row` (Task 6), `blogPosts` from `src/app/data/blog-posts.generated.ts`.
- Produces: nothing consumed elsewhere.

Note: `blog-page` currently has no `.spec.ts` — it is one of two page components in the repo without one. Create it.

- [ ] **Step 1: Write the failing test**

Create `src/app/features/blog/blog-page/blog-page.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BlogPage } from './blog-page';

describe('BlogPage', () => {
  let fixture: ComponentFixture<BlogPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(BlogPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the LOG_04 chapter header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('LOG');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_04');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Blog');
  });

  it('renders DATE, ENTRY and TAGS columns', () => {
    const el = fixture.nativeElement as HTMLElement;
    const heads = Array.from(el.querySelectorAll('th')).map((h) => h.textContent?.trim());
    expect(heads).toEqual(['DATE', 'ENTRY', 'TAGS']);
  });

  it('renders one row per post', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('reports the record count as a machine report', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      '1 RECORD RETRIEVED',
    );
  });

  it('terminates the log so one row reads as complete', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.data-table__end')?.textContent).toContain('END OF LOG');
  });

  it('selects the first row', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('tbody tr')?.getAttribute('aria-selected')).toBe('true');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/blog-page.spec.ts'`
Expected: FAIL — no `.chapter__code` in the DOM.

- [ ] **Step 3: Implement BlogPage**

`blog-page.ts`:

```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { Column, DataTable, Row } from '../../../ui/data/data-table/data-table';
import { blogPosts } from '../../../data/blog-posts.generated';

@Component({
  selector: 'blog-page',
  standalone: true,
  imports: [ChapterHeader, Window, DataTable],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
})
export class BlogPage {
  columns: Column[] = [
    { key: 'date', label: 'DATE', width: '120px' },
    { key: 'entry', label: 'ENTRY' },
    { key: 'tags', label: 'TAGS', width: '220px' },
  ];

  posts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));

  rows: Row[] = this.posts.map((p) => ({
    id: p.slug,
    cells: {
      date: p.date,
      entry: p.title,
      tags: p.tags.join(' // '),
    },
  }));

  selectedId = this.rows[0]?.id ?? '';

  get report(): string {
    const n = this.rows.length;
    return `${n} RECORD${n === 1 ? '' : 'S'} RETRIEVED`;
  }

  constructor(
    private router: Router,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Blog - Hazel Granados');
    this.meta.updateTag({
      name: 'description',
      content: 'Notes on building software, by Hazel Granados.',
    });
  }

  open(slug: string): void {
    this.router.navigate(['/blog', slug]);
  }
}
```

`blog-page.html`:

```html
<app-chapter-header code="LOG" index="04" context="ENTRIES" environmental="LOG" />

<app-window index="01" title="Log" context="ENTRIES" [status]="report">
  <app-data-table
    [columns]="columns"
    [rows]="rows"
    [selectedId]="selectedId"
    endLabel="— END OF LOG —"
    (select)="open($event)"
  />
</app-window>
```

`blog-page.scss`:

```scss
:host {
  display: block;
  max-width: 900px;
}
```

The sparse state is carried entirely by two things already built: `Window`'s `status` renders `1 RECORD RETRIEVED` in the head, and `DataTable`'s `endLabel` renders the terminating rule. Both scale to any row count without change.

- [ ] **Step 4: Point the route at the new page**

In `src/app/app.routes.ts`, change only the `'blog'` entry:

```typescript
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/blog/blog-page/blog-page').then((m) => m.BlogPage),
  },
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/blog-page.spec.ts'`
Expected: PASS, 9 specs.

- [ ] **Step 6: Verify the build and screenshot**

Run: `npm run build`
Expected: `Prerendered 6 static routes.`

```bash
grep -c "END OF LOG" dist/portfolio/browser/blog/index.html
grep -c "1 RECORD RETRIEVED" dist/portfolio/browser/blog/index.html
```

Expected: 1 each.

Screenshot `/blog` at 1280x900 and 390x844 against mockup `1d`. Judge specifically whether the single row plus terminating rule reads as a deliberate short log. If it does not, stop and raise it — the spec's Risk 1 anticipated exactly this, and dropping the route is a live option.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(blog): rebuild blog index on KAIRO as LOG_04"
```

---

## Task 13: Blog post — LOG_04_NNNN

**Files:**
- Create: `src/app/features/blog/blog-post-page/blog-post-page.ts`, `.html`, `.scss`, `.spec.ts` (replacing the existing files; the current `.ts` is mermaid-heavy and imports the deleted `Footer`)
- Modify: `src/app/app.routes.ts` (route `'blog/:slug'`)

**Interfaces:**
- Consumes: `ChapterHeader` (Task 9), `Window` (Task 3), `KeyValue` + `KeyValueItem` (Task 6), `Badge` (Task 4), `BlogService` + `BlogPost` from `src/app/services/blog.service.ts`.
- Produces: nothing consumed elsewhere.

`BlogService` is design-agnostic and stays exactly as it is. `BlogPost` = `BlogPostSource & { dateObj: Date; html: string }`, where `BlogPostSource` is `{ slug, title, date, description, tags, markdown }`.

- [ ] **Step 1: Confirm the service API**

```bash
grep -n "^\s*\(get\|find\|load\)" src/app/services/blog.service.ts
```

Use the lookup method it already exposes. Do not invent one.

- [ ] **Step 2: Write the failing test**

Create `src/app/features/blog/blog-post-page/blog-post-page.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BlogPostPage } from './blog-post-page';

describe('BlogPostPage', () => {
  let fixture: ComponentFixture<BlogPostPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(new Map([['slug', 'hello-world']])) },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BlogPostPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the LOG chapter header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('LOG');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_04');
  });

  it('renders the post title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Hello, World!');
  });

  it('renders the rendered markdown into the reading column', () => {
    const el = fixture.nativeElement as HTMLElement;
    const body = el.querySelector('.post__body');
    expect(body?.innerHTML.length).toBeGreaterThan(0);
  });

  it('builds a CONTENTS inspector from the post headings', () => {
    const el = fixture.nativeElement as HTMLElement;
    const contents = el.querySelector('.post__contents');
    expect(contents).toBeTruthy();
    expect(contents?.textContent).toContain('optimizing for');
  });

  it('renders a RECORD inspector with the date and tags', () => {
    const el = fixture.nativeElement as HTMLElement;
    const record = el.querySelector('.post__record')?.textContent ?? '';
    expect(record).toContain('DATE');
    expect(record).toContain('2026-01-16');
  });

  it('offers a way back to the log', () => {
    const el = fixture.nativeElement as HTMLElement;
    const back = el.querySelector('a[href="/blog"]');
    expect(back?.textContent).toContain('BACK');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/blog-post-page.spec.ts'`
Expected: FAIL — the current component imports the deleted `Footer` and mermaid.

- [ ] **Step 4: Implement BlogPostPage**

Delete the existing `blog-post-page.ts`, `.html` and `.scss` first — the mermaid machinery, theme observers, and `Footer` import are all obsolete. Adjust the `BlogService` call to match Step 1.

`blog-post-page.ts`:

```typescript
import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { Badge } from '../../../ui/core/badge/badge';
import { BlogService, type BlogPost } from '../../../services/blog.service';

interface Heading {
  id: string;
  text: string;
}

@Component({
  selector: 'blog-post-page',
  standalone: true,
  imports: [RouterLink, ChapterHeader, Window, KeyValue, Badge],
  templateUrl: './blog-post-page.html',
  styleUrl: './blog-post-page.scss',
})
export class BlogPostPage {
  post = signal<BlogPost | null>(null);
  headings = signal<Heading[]>([]);

  constructor(
    private route: ActivatedRoute,
    private blog: BlogService,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') ?? '';
      const found = this.blog.getPostBySlug(slug);
      this.post.set(found);
      this.headings.set(found ? this.extractHeadings(found.html) : []);

      if (found) {
        this.title.setTitle(`${found.title} - Hazel Granados`);
        this.meta.updateTag({ name: 'description', content: found.description });
      }
    });
  }

  record(): KeyValueItem[] {
    const p = this.post();
    if (!p) return [];
    return [
      { key: 'DATE', value: p.date },
      { key: 'SLUG', value: p.slug },
      { key: 'TAGS', value: String(p.tags.length) },
    ];
  }

  /**
   * Parses h2/h3 out of the rendered HTML with a regex rather than the DOM,
   * because this also runs during prerender where `document` is absent.
   */
  private extractHeadings(html: string): Heading[] {
    const out: Heading[] = [];
    const re = /<h([23])[^>]*>([\s\S]*?)<\/h\1>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const text = m[2].replace(/<[^>]+>/g, '').trim();
      if (!text) continue;
      out.push({ id: this.slugify(text), text });
    }
    return out;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
```

Verified against the real service: the method is `getPostBySlug` and it returns `BlogPost | null`, never `undefined`.

`blog-post-page.html`:

```html
@if (post(); as p) {
  <app-chapter-header code="LOG" index="04" [context]="p.title" [status]="p.date" />

  <div class="post">
    <article class="post__main">
      <app-window index="01" title="Entry" [context]="p.slug">
        <h2 class="post__title">{{ p.title }}</h2>
        <div class="post__body" [innerHTML]="p.html"></div>
      </app-window>

      <a class="post__back" routerLink="/blog">&lt; BACK TO LOG</a>
    </article>

    <aside class="post__side">
      <app-window class="post__contents" variant="inspector" index="02" title="Contents" context="INDEX">
        @if (headings().length) {
          <ol class="post__toc">
            @for (h of headings(); track h.id) {
              <li><a [href]="'#' + h.id">{{ h.text }}</a></li>
            }
          </ol>
        } @else {
          <p class="post__empty">NO SECTIONS</p>
        }
      </app-window>

      <app-window class="post__record" variant="inspector" index="03" title="Record" context="METADATA">
        <app-key-value [items]="record()" />
        <div class="post__tags">
          @for (t of p.tags; track t) {
            <app-badge>{{ t }}</app-badge>
          }
        </div>
      </app-window>
    </aside>
  </div>
} @else {
  <app-chapter-header code="LOG" index="04" context="NO RECORD" environmental="NULL" />
  <p class="post__missing">NO RECORD AT THIS ADDRESS</p>
}
```

`blog-post-page.scss`:

```scss
.post {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: var(--sp-3);
  align-items: start;
}

.post__title {
  margin: 0 0 var(--sp-4);
  font: var(--type-display-m);
  letter-spacing: var(--tracking-display);
  color: var(--text-primary);
}

.post__body {
  max-width: 68ch;
  font: var(--type-body);
  color: var(--text-secondary);

  h2,
  h3 {
    font: var(--type-title);
    color: var(--text-primary);
    margin-block: var(--sp-8) var(--sp-3);
  }

  p {
    margin: 0 0 var(--sp-4);
  }

  ul,
  ol {
    margin: 0 0 var(--sp-4);
    padding-inline-start: var(--sp-5);
  }

  code {
    font: var(--type-mono-s);
    background: var(--surface-inset);
    border: var(--bw-hairline) solid var(--border-faint);
    padding: 0 var(--sp-1);
  }

  pre {
    background: var(--surface-inset);
    border: var(--bw-hairline) solid var(--border-default);
    padding: var(--sp-3);
    overflow-x: auto;

    code {
      border: 0;
      padding: 0;
      background: transparent;
    }
  }

  img {
    max-width: 100%;
    border: var(--bw-hairline) solid var(--border-default);
  }

  blockquote {
    margin: 0 0 var(--sp-4);
    padding-inline-start: var(--sp-3);
    border-inline-start: var(--bw-indicator) solid var(--signal-active);
    color: var(--text-muted);
  }
}

.post__side {
  display: grid;
  gap: var(--sp-3);
  position: sticky;
  top: var(--sp-4);
}

.post__toc {
  margin: 0;
  padding-inline-start: var(--sp-4);
  font: var(--type-mono-s);

  li {
    margin-block-end: var(--sp-2);
  }
}

.post__empty,
.post__missing {
  margin: 0;
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wider);
  color: var(--text-faint);
}

.post__missing {
  color: var(--text-active);
}

.post__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-block-start: var(--sp-4);
}

.post__back {
  display: inline-block;
  min-height: var(--target-min);
  line-height: var(--target-min);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
}

@media (max-width: 840px) {
  .post {
    grid-template-columns: minmax(0, 1fr);
  }

  .post__side {
    position: static;
  }
}
```

The `[innerHTML]` binding is safe here: the markdown is authored in-repo and rendered at build time by `marked`. It is not user input.

Note: the anchors in the CONTENTS list assume `marked` emits `id` attributes on headings. Verify with `grep -o '<h2[^>]*>' dist/portfolio/browser/blog/hello-world/index.html` after the build. If no `id` is present, configure `marked` with a heading renderer that adds `id="${slugify(text)}"` using the same `slugify` rule as the component, so the two agree.

- [ ] **Step 5: Point the route at the new page**

In `src/app/app.routes.ts`, change only the `'blog/:slug'` entry:

```typescript
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./features/blog/blog-post-page/blog-post-page').then(
        (m) => m.BlogPostPage,
      ),
  },
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/blog-post-page.spec.ts'`
Expected: PASS, 8 specs.

- [ ] **Step 7: Verify the build and the heading anchors**

Run: `npm run build`
Expected: `Prerendered 6 static routes.`

```bash
grep -o '<h2[^>]*>' dist/portfolio/browser/blog/hello-world/index.html
```

If the output has no `id=`, do the `marked` renderer fix described in Step 4 before moving on.

Screenshot `/blog/hello-world` at 1280x900 and 390x844 against mockup `1e`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(blog): rebuild blog post on KAIRO, drop mermaid rendering"
```

---

## Task 14: About — PROFILE_02

**Files:**
- Create: `src/app/features/about/about-page/about-page.ts`, `.html`, `.scss`, `.spec.ts` (replacing the existing four)
- Delete: `src/app/features/about/components/` (all five subfolders)
- Modify: `src/app/app.routes.ts` (route `'about'`)

**Interfaces:**
- Consumes: `ChapterHeader` (Task 9), `Window` (Task 3), `KeyValue` + `KeyValueItem` (Task 6), `Badge` (Task 4).
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Harvest the existing copy before deleting it**

The five section components hold the real content. Read every one and copy the actual text into the new page — do not paraphrase, and do not invent biography:

```bash
cat src/app/features/about/components/about-section/about-section.html
cat src/app/features/about/components/education-section/education-section.html
cat src/app/features/about/components/interests-section/interests-section.html
cat src/app/features/about/components/languages-section/languages-section.html
cat src/app/features/about/components/download-section/download-section.html
```

Strip every emoji you find; keep the words.

- [ ] **Step 2: Write the failing test**

Replace `src/app/features/about/about-page/about-page.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AboutPage } from './about-page';

describe('AboutPage', () => {
  let fixture: ComponentFixture<AboutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the PROFILE_02 chapter header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('PROFILE');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_02');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('About');
  });

  it('renders five dossier windows', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.about__window').length).toBe(5);
  });

  it('links both resume formats', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[href$="resume-en.pdf"]')).toBeTruthy();
    expect(el.querySelector('a[href$="resume-en.docx"]')).toBeTruthy();
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/about-page.spec.ts'`
Expected: FAIL — no `.chapter__code` in the DOM.

- [ ] **Step 4: Implement AboutPage**

`about-page.ts` — populate the four data arrays from what Step 1 harvested:

```typescript
import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { Badge } from '../../../ui/core/badge/badge';

@Component({
  selector: 'about-page',
  standalone: true,
  imports: [ChapterHeader, Window, KeyValue, Badge],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage {
  /** Paragraphs harvested verbatim from the old about-section. */
  bio: string[] = [];

  /** Harvested from education-section. */
  education: KeyValueItem[] = [];

  /** Harvested from languages-section. */
  languages: KeyValueItem[] = [];

  /** Harvested from interests-section. */
  interests: string[] = [];

  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('About - Hazel Granados');
    this.meta.updateTag({
      name: 'description',
      content: 'About Hazel Granados — software developer.',
    });
  }
}
```

`about-page.html`:

```html
<app-chapter-header code="PROFILE" index="02" context="DOSSIER" environmental="PROFILE" />

<div class="about">
  <app-window class="about__window" variant="inspector" index="01" title="Bio" context="SUBJECT" [active]="true">
    @for (para of bio; track $index) {
      <p class="about__para">{{ para }}</p>
    }
  </app-window>

  <app-window class="about__window" index="02" title="Education" context="RECORD">
    <app-key-value [items]="education" />
  </app-window>

  <app-window class="about__window" index="03" title="Languages" context="RECORD">
    <app-key-value [items]="languages" />
  </app-window>

  <app-window class="about__window" index="04" title="Interests" context="RECORD">
    <div class="about__tags">
      @for (i of interests; track i) {
        <app-badge>{{ i }}</app-badge>
      }
    </div>
  </app-window>

  <app-window class="about__window" index="05" title="Resume" context="DOWNLOAD">
    <a class="about__link" href="resume/resume-en.pdf" download>&gt; RESUME.PDF</a>
    <a class="about__link" href="resume/resume-en.docx" download>&gt; RESUME.DOCX</a>
  </app-window>
</div>
```

`about-page.scss`:

```scss
.about {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--sp-3);
  align-items: start;
  max-width: 1000px;
}

.about__window:first-child {
  grid-column: 1 / -1;
}

.about__para {
  margin: 0 0 var(--sp-4);
  font: var(--type-body);
  color: var(--text-secondary);
  max-width: 68ch;

  &:last-child {
    margin-bottom: 0;
  }
}

.about__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.about__link {
  display: block;
  min-height: var(--target-min);
  line-height: var(--target-min);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
}

@media (max-width: 840px) {
  .about {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

- [ ] **Step 5: Point the route at the new page and delete the old sections**

In `src/app/app.routes.ts`, change only the `'about'` entry:

```typescript
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about-page/about-page').then((m) => m.AboutPage),
  },
```

Then:

```bash
git rm -r src/app/features/about/components
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/about-page.spec.ts'`
Expected: PASS, 6 specs.

- [ ] **Step 7: Verify the build and screenshot**

Run: `npm run build`
Expected: `Prerendered 6 static routes.`

Screenshot `/about` at 1280x900 and 390x844 against mockup `1f`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(about): rebuild about on KAIRO as PROFILE_02"
```

---

## Task 15: Error page — RECORD NOT FOUND

**Files:**
- Create: `src/app/features/error/error-page/error-page.ts`, `.html`, `.scss`, `.spec.ts` (replacing the existing four)
- Modify: `src/app/app.routes.ts` (route `'**'`)

**Interfaces:**
- Consumes: `Window` (Task 3).
- Produces: nothing consumed elsewhere.

This is the last of the seven baseline `NG0201` failures — the old `ErrorPage` spec fails because the component uses `RouterLink` without a router provider. The new spec provides one.

- [ ] **Step 1: Write the failing test**

Replace `src/app/features/error/error-page/error-page.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ErrorPage } from './error-page';

describe('ErrorPage', () => {
  let fixture: ComponentFixture<ErrorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reports the failure as a machine report', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'NO RECORD AT THIS ADDRESS',
    );
  });

  it('renders the alert window variant', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-variant="alert"]')).toBeTruthy();
  });

  it('shows the requested path', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.error__path')).toBeTruthy();
  });

  it('offers a way back', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[href="/"]')?.textContent).toContain('BACK');
  });

  it('hides the environmental type from assistive tech', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error__env')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/error-page.spec.ts'`
Expected: FAIL — the old template renders "no page here", not the machine report.

- [ ] **Step 3: Implement ErrorPage**

`error-page.ts`:

```typescript
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Window } from '../../../ui/windows/window/window';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [RouterLink, Window],
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss',
})
export class ErrorPage {
  currentPath = '';

  constructor(
    private router: Router,
    private title: Title,
  ) {
    this.currentPath = this.router.url;
  }

  ngOnInit(): void {
    this.title.setTitle('Record not found - Hazel Granados');
  }
}
```

`error-page.html`:

```html
<div class="error">
  <span class="error__env" aria-hidden="true">404</span>

  <app-window variant="alert" index="00" title="Fault" context="LOOKUP" status="CODE 404">
    <p class="error__report">NO RECORD AT THIS ADDRESS</p>
    <p class="error__path">{{ currentPath }}</p>
    <a class="error__back" routerLink="/">&lt; BACK TO HOME</a>
  </app-window>
</div>
```

`error-page.scss`:

```scss
.error {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 60vh;
}

.error__env {
  position: absolute;
  font: 600 320px/0.85 var(--font-display);
  letter-spacing: var(--tracking-display);
  color: var(--surface-elevated);
  user-select: none;
  pointer-events: none;
  z-index: -1;
}

.error__report {
  margin: 0 0 var(--sp-2);
  font: var(--type-mono);
  letter-spacing: var(--tracking-wider);
  color: var(--text-active);
}

.error__path {
  margin: 0 0 var(--sp-4);
  font: var(--type-mono-s);
  color: var(--text-faint);
  overflow-wrap: anywhere;
}

.error__back {
  display: inline-block;
  min-height: var(--target-min);
  line-height: var(--target-min);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
}

@media (max-width: 840px) {
  .error__env {
    font-size: 160px;
  }
}
```

- [ ] **Step 4: Point the wildcard route at it**

In `src/app/app.routes.ts`, change the `'**'` entry:

```typescript
  {
    path: '**',
    loadComponent: () =>
      import('./features/error/error-page/error-page').then((m) => m.ErrorPage),
  },
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/error-page.spec.ts'`
Expected: PASS, 7 specs.

- [ ] **Step 6: Run the whole suite**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: **0 failures.** All seven baseline `NG0201` failures are now gone — every affected component has been deleted or rebuilt. If any remain, stop and fix before continuing.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(error): rebuild 404 on KAIRO as RECORD NOT FOUND"
```

---

## Task 16: Retire the Under Construction page

Every route now resolves to a real page. Nothing references the construction component.

**Files:**
- Delete: `src/app/features/construction/`
- Modify: `src/app/app.routes.ts` (remove the explanatory comment about the notice)

**Interfaces:**
- Consumes: nothing.
- Produces: nothing.

- [ ] **Step 1: Confirm nothing still references it**

```bash
grep -rn "construction" src/ --include=*.ts --include=*.html
```

Expected: no matches outside `src/app/features/construction/` itself. If `app.routes.ts` still imports it, a route was missed in Tasks 9–15 — go back and finish that route rather than deleting the component.

- [ ] **Step 2: Delete it**

```bash
git rm -r src/app/features/construction
```

- [ ] **Step 3: Update the route file comment**

At the top of `src/app/app.routes.ts`, replace the block comment explaining the construction notice with:

```typescript
// Paths stay declared individually because the server routes prerender them by
// name — Angular rejects a server route with no matching app route.
```

- [ ] **Step 4: Run the suite and build**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: 0 failures.

Run: `npm run build`
Expected: `Prerendered 6 static routes.`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove the under construction page"
```

---

## Task 17: Social image, favicons and manifest

The current assets are GlitterNet member-profile cards. They would misrepresent the new site from the moment it ships, so they are part of this work rather than a follow-up.

**Files:**
- Modify: `scripts/generate-og-image.mjs`
- Modify: `scripts/generate-favicon.mjs`
- Modify: `public/site.webmanifest`
- Regenerate: `public/og-image.png`, `public/og-image.svg`, `public/favicon.ico`, `public/favicon-16x16.png`, `public/favicon-32x32.png`, `public/apple-touch-icon.png`, `public/android-chrome-192x192.png`, `public/android-chrome-512x512.png`
- Modify: `src/index.html` (og/twitter image alt text)

**Interfaces:**
- Consumes: KAIRO tokens (Task 1) as literal hex values — these scripts run in Node and cannot read CSS custom properties.
- Produces: regenerated static assets.

- [ ] **Step 1: Read the generators before changing them**

```bash
cat scripts/generate-og-image.mjs
cat scripts/generate-favicon.mjs
```

Both use `sharp`. Establish how each builds its source SVG before editing.

- [ ] **Step 2: Restyle the OG image**

Rewrite the SVG that `generate-og-image.mjs` composes, to KAIRO:

- Background `#0b0e12` (`--surface-canvas`).
- A 1px `#28313b` hairline inset frame, no rounding.
- `hazel` in Saira Condensed 600 at `#e9e7e1`, `.exe` in `#e8382c`.
- Below it, `HAZEL.EXE // OPERATOR PROFILE` in IBM Plex Mono 11px, `#8b949d`, letter-spacing `0.16em`.
- Bottom-left corner readout `NET ONLINE` with a `#55d88a` dot.
- No emoji, no sparkle, no sticker shadow, no gradient.

Keep the output at 1200x630.

- [ ] **Step 3: Restyle the favicons**

Rewrite the source SVG in `generate-favicon.mjs`:

- Background `#0b0e12`.
- A single `#e8382c` block cursor glyph, centered, filling roughly 60% of the canvas.

This is legible at 16px in a way a wordmark is not, and it matches KAIRO's block-cursor idiom.

- [ ] **Step 4: Regenerate and verify**

```bash
npm run generate:og
node scripts/generate-favicon.mjs
```

Then open `public/og-image.png` and `public/favicon-32x32.png` and confirm both are dark and carry no GlitterNet green.

- [ ] **Step 5: Update the manifest and meta**

In `public/site.webmanifest`, set `"background_color": "#0b0e12"` and `"theme_color": "#0b0e12"`.

In `src/index.html`, replace the OG image alt text — it currently reads `Retro member-profile card: hazel.exe ✧ — Hazel Granados, software developer`, which describes the old design and contains a non-KAIRO glyph:

```html
<meta
  property="og:image:alt"
  content="hazel.exe — operator profile terminal card, Hazel Granados, software developer"
/>
```

- [ ] **Step 6: Verify the build**

Run: `npm run build`
Expected: `Prerendered 6 static routes.`

```bash
grep -c "Retro member-profile" dist/portfolio/browser/index.html
```

Expected: 0.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: regenerate social image and favicons for KAIRO"
```

---

## Task 18: Delete GlitterNet and verify the whole site

**Files:**
- Delete: `src/styles/styles.scss`, `src/styles/abstracts/`
- Delete: `src/app/core/layout/header/`, `src/app/core/layout/footer/`, `src/app/core/layout/terminal-section/`
- Delete: `src/app/core/shared/app-button/`, `app-title/`, `project-card/`
- Modify: `angular.json` (point `styles` at the KAIRO entry)
- Create: `src/styles/main.scss`

**Interfaces:**
- Consumes: everything built in Tasks 1–17.
- Produces: the finished site.

### Before you delete `styles.scss`, know what else goes with it

Its last rule is a blanket reduced-motion net:

```scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Measured during the motion plan: this `!important` blanket — not the KAIRO `--dur-*` tokens — is what actually neutralises animation under reduced motion today. Computed durations read `1e-05s` (0.01ms), which is this rule's value, not the tokens' `0ms`.

Two consequences for this task:

1. **`animation-iteration-count: 1 !important` is currently the only thing stopping an uncovered looping animation from running forever under reduced motion.** The motion plan's M6 removes the dependency by making every per-component `animation: none` rule actually win. **Confirm M6 landed before deleting this**, and if it did not, do not delete `styles.scss` until it has.
2. **After deletion, re-measure reduced motion rather than assuming it still holds.** With reduced motion emulated, `getComputedStyle(el).animationName` must read `none` for every animated element on every route — in particular the viewport scanline, the chapter caret and the detail REC lamp, which are the loops. A rule that was passing only because of the blanket will start failing silently, and silently is the operative word: nothing errors, the motion just comes back for the users who asked for less of it.

- [ ] **Step 1: Confirm nothing references GlitterNet**

```bash
grep -rn "gn-" src/app --include=*.html --include=*.scss | grep -v "^src/styles" || echo "clean"
grep -rn "abstracts/variables" src/app || echo "clean"
grep -rn "core/layout\|core/shared" src/app --include=*.ts || echo "clean"
```

All three must report `clean`. Any hit is a route that was not fully migrated — go fix that route first.

- [ ] **Step 2: Delete the old style system and components**

```bash
git rm src/styles/styles.scss
git rm -r src/styles/abstracts
git rm -r src/app/core/layout
git rm -r src/app/core/shared
```

`src/app/core/navigation.ts` stays — it is new, from Task 8.

- [ ] **Step 3: Create the new global entry point**

`src/styles/main.scss`:

```scss
@use "kairo/kairo" as *;
```

- [ ] **Step 4: Repoint the build**

In `angular.json`, in both the `build` and `test` targets, change:

```json
"styles": ["src/styles/styles.scss", "src/styles/kairo/kairo.scss"]
```

to:

```json
"styles": ["src/styles/main.scss"]
```

Leave `stylePreprocessorOptions.includePaths: ["src/styles"]` as is.

- [ ] **Step 5: Run the full suite**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: 0 failures.

- [ ] **Step 6: Full build verification**

Run: `npm run build`
Expected: `Prerendered 6 static routes.`, no warnings about unused CommonJS dependencies, and initial bundle well under the 500kB budget — mermaid's removal should have cut it substantially.

Confirm every prerendered path carries the new design and none carries the old:

```bash
for f in $(find dist/portfolio/browser -name "index.html" | sort); do
  if grep -q "chapter__code\|window__head" "$f" && ! grep -q "gn-panel" "$f"; then
    echo "OK   $f"
  else
    echo "FAIL $f"
  fi
done
```

Expected: six `OK` lines — `/`, `/about`, `/blog`, `/blog/hello-world`, `/portfolio`, `/portfolio/pr-sweep`.

Confirm no emoji survived anywhere in the output:

```bash
grep -rlP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" dist/portfolio/browser --include=*.html || echo "no emoji"
```

Expected: `no emoji`.

- [ ] **Step 7: Screenshot pass**

Serve `dist/portfolio/browser` and screenshot all six paths plus one 404 at 1280x900 and 390x844. Compare each against its mockup (`1a`–`1g`). Check on every screen:

- No horizontal scroll at 390px.
- The mode rail is hidden below 840px and the palette opens from the bottom bar hint.
- Focus rings are visible when tabbing.
- Environmental type never overlaps readable copy.

- [ ] **Step 8: Accessibility pass**

With the site served, run an axe or Lighthouse accessibility audit on `/`, `/portfolio/pr-sweep`, and `/blog/hello-world`. Fix any contrast failure by moving to a lighter text token (`--text-secondary` → `--text-primary`), never by changing a KAIRO colour value.

Confirm by keyboard alone: tab reaches every mode, the palette opens with `/` and closes with `Escape`, and the project thumbnail strip is operable.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: delete GlitterNet styles and components"
```

- [ ] **Step 10: Hand back for the merge decision**

Do **not** merge or push. Report:

- The full test count and that it is green.
- The six prerendered paths and their verification status.
- The screenshot comparison result per screen.
- Any accessibility finding and what was done about it.
- A direct answer on the spec's Risk 1: does the one-entry blog read as deliberate, or should `/blog` be dropped before the reveal?

Merging `redesign/kairo` into `main` is the reveal and is the owner's call. Production serves the Under Construction notice until they make it.

---

## Notes for the executor

- **Never push.** Every task commits locally to `redesign/kairo`.
- **The route table is the cutover mechanism.** Each route task swaps exactly one `loadComponent`. Never swap two in one task, and never rewrite the whole file — the explicit path list is load-bearing for prerendering.
- **When a KAIRO rule and a mockup disagree, the rule wins.** The mockups are a visual reference produced against the system, not the system itself. The one known conflict — the `[THEME : ...]` control in the mockup's system bar — is resolved in the spec: it is not implemented.
- **When the spec and this plan disagree, stop and ask.** Do not silently pick one.
- **Content is harvested, never invented.** Bio, education, languages, interests, and stack copy all come from the components being deleted. If a value cannot be found in the repo, ask rather than writing plausible filler.
