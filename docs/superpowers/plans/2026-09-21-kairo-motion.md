# KAIRO Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the redesigned site the motion vocabulary of the interactive mockup — a boot sequence, animated route transitions, and ambient terminal behaviour — without compromising prerendering, accessibility, or the site's usability when JavaScript fails.

**Architecture:** A keyframe library and a `MotionService` exposing an alternating `sfx` signal that flips on every `NavigationEnd`. Components bind it to `data-sfx`; the stylesheet selects on that attribute to swap animation names, which restarts CSS animations. Motion lives in shared components and the shell only, so every route inherits it — including routes added later.

**Tech Stack:** Angular 21 (standalone components, signals), SSR with `outputMode: static` prerendering, SCSS, Karma + Jasmine. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-09-21-kairo-motion-design.md`

## Global Constraints

These apply to every task. Do not restate them per task; they are always in force.

- **Branch:** all work happens on `redesign/kairo`. Never commit to `main`. Never push.
- **No new dependencies.** Specifically not `@angular/animations`. The CSS approach is deliberate.
- **Prerender safety is non-negotiable.** Every page is prerendered at build time. No `document`/`window` access during render. Anything time-varying or browser-only initialises to a server-stable value and activates in `afterNextRender` only. `npm run build` must keep reporting **6 prerendered routes**.
- **Reduced motion:** `animation: none` for looping/decorative motion (never a zeroed period — a 0ms infinite animation is degenerate, not disabled). Zeroed durations for entrance transitions, which the existing `--dur-*` tokens already handle. The boot overlay does not render at all.
- **All decorative motion is `aria-hidden`** — wipe bars, environmental type, scanline, cursors.
- **No animation may leave content invisible.** Entrance animations use `both` fill and end at the element's natural state, so an interrupted or failed animation cannot hide content.
- **Durations come from `--dur-*` tokens**, easing from `--ease-mech` / `--ease-cut` / `--ease-linear`. The one sanctioned exception is the boot progress bar's `2600ms`, which is a bespoke sequence length, not a transition.
- **No emoji, ever.**
- **Token policy (carried from the redesign):** the constraint binds shared-scale values — spacing gaps, colours, durations, border widths. It does **not** bind one-off layout dimensions or deliberate micro-offsets.
- **Nothing under `src/app/features/` gains animation code.** If a page component needs motion, the motion belongs in the shared component it renders.

**Commands:**

```bash
npm run build                                          # must report 6 prerendered routes
npx ng test --watch=false --browsers=ChromeHeadless    # full suite
```

**Baseline at plan start:** 142 passing / 2 failing / 144 total. The two failures are `Footer` and `ProjectCard`, components deleted by the redesign plan's Task 18, which runs *after* this plan. Do not try to fix them.

---

## File Structure

**Created:**

| Path | Responsibility |
|---|---|
| `src/styles/kairo/_motion-keyframes.scss` | The keyframe library — every `@keyframes`, including both `a`/`b` variants |
| `src/app/ui/motion/motion.service.ts` | The `sfx` signal and its `NavigationEnd` subscription |
| `src/app/ui/motion/motion.service.spec.ts` | |
| `src/app/ui/boot/boot.ts` `.html` `.scss` `.spec.ts` | The boot overlay |

**Modified:** `src/styles/kairo/kairo.scss` (import the keyframes), `src/app/app.html` / `.ts` / `.scss` / `.spec.ts` (shell wiring, env type, boot mount), `src/app/ui/chapter-header/*` (title reveal; loses `environmental`), `src/app/ui/windows/window/*` (entrance), `src/app/ui/windows/viewport-window/*` (scanline), and the six page templates that pass `environmental` to `ChapterHeader`.

---

## Task M1: Keyframe library and MotionService

**Files:**
- Create: `src/styles/kairo/_motion-keyframes.scss`
- Modify: `src/styles/kairo/kairo.scss`
- Create: `src/app/ui/motion/motion.service.ts`, `motion.service.spec.ts`

**Interfaces:**
- Consumes: the existing `--dur-*` / `--ease-*` tokens.
- Produces:
  - Keyframes `win-a`/`win-b`, `ttl-a`/`ttl-b`, `wipe-a`/`wipe-b`, `env-a`/`env-b`, `type-a`/`type-b`, `boot-in`, `boot-bar`, `flicker`, `k-blink`, `k-scan`.
  - `MotionService`, `providedIn: 'root'`. Exposes `sfx: Signal<'a' | 'b'>`, initial value `'a'`, flipping on every `NavigationEnd`.

- [ ] **Step 1: Write the failing test**

Create `src/app/ui/motion/motion.service.spec.ts`:

```typescript
import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { MotionService } from './motion.service';

describe('MotionService', () => {
  let events: Subject<any>;
  let service: MotionService;

  beforeEach(() => {
    events = new Subject<any>();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Router, useValue: { events: events.asObservable() } },
      ],
    });
    service = TestBed.inject(MotionService);
  });

  it('starts at a, so prerendered output is deterministic', () => {
    expect(service.sfx()).toBe('a');
  });

  it('flips on NavigationEnd', () => {
    events.next(new NavigationEnd(1, '/', '/'));
    expect(service.sfx()).toBe('b');
  });

  it('alternates rather than latching', () => {
    events.next(new NavigationEnd(1, '/', '/'));
    events.next(new NavigationEnd(2, '/about', '/about'));
    expect(service.sfx()).toBe('a');
    events.next(new NavigationEnd(3, '/blog', '/blog'));
    expect(service.sfx()).toBe('b');
  });

  it('ignores router events that are not NavigationEnd', () => {
    events.next({ id: 9, url: '/x' });
    expect(service.sfx()).toBe('a');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/motion.service.spec.ts'`
Expected: FAIL — cannot resolve `./motion.service`.

- [ ] **Step 3: Implement MotionService**

`src/app/ui/motion/motion.service.ts`:

```typescript
import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

/**
 * Drives CSS animation re-triggering across route changes.
 *
 * A CSS animation only restarts if its `animation-name` changes. So the
 * keyframe library defines every entrance animation twice — `win-a` and
 * `win-b` are identical — and components bind this alternating value into a
 * `data-sfx` attribute the stylesheet selects on. Flipping the attribute
 * swaps the animation name, which restarts the animation.
 *
 * Starts at 'a' and only changes on navigation, so prerendered output is
 * deterministic and hydration cannot mismatch.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly router = inject(Router);
  private readonly state = signal<'a' | 'b'>('a');

  readonly sfx = this.state.asReadonly();

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.state.update((current) => (current === 'a' ? 'b' : 'a'));
      }
    });
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/motion.service.spec.ts'`
Expected: PASS, 4 specs.

- [ ] **Step 5: Create the keyframe library**

`src/styles/kairo/_motion-keyframes.scss`:

```scss
// KAIRO motion keyframes.
//
// Entrance animations are defined TWICE — `-a` and `-b` are byte-identical.
// That duplication is deliberate and load-bearing: a CSS animation only
// restarts when its `animation-name` changes, so MotionService alternates a
// `data-sfx` attribute between the two on every route change. Collapsing them
// into one would silently stop every route transition from animating.

@keyframes win-a {
  from {
    opacity: 0;
    transform: translateX(-18px);
    clip-path: inset(0 100% 0 0);
  }
  to {
    opacity: 1;
    transform: none;
    clip-path: inset(0 0 0 0);
  }
}

@keyframes win-b {
  from {
    opacity: 0;
    transform: translateX(-18px);
    clip-path: inset(0 100% 0 0);
  }
  to {
    opacity: 1;
    transform: none;
    clip-path: inset(0 0 0 0);
  }
}

@keyframes ttl-a {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes ttl-b {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

@keyframes wipe-a {
  0% {
    transform: translateX(-101%);
  }
  100% {
    transform: translateX(101%);
  }
}

@keyframes wipe-b {
  0% {
    transform: translateX(-101%);
  }
  100% {
    transform: translateX(101%);
  }
}

@keyframes env-a {
  from {
    transform: translateX(80px);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

@keyframes env-b {
  from {
    transform: translateX(80px);
    opacity: 0;
  }
  to {
    transform: none;
    opacity: 1;
  }
}

@keyframes type-a {
  from {
    max-width: 0;
  }
  to {
    max-width: 520px;
  }
}

@keyframes type-b {
  from {
    max-width: 0;
  }
  to {
    max-width: 520px;
  }
}

@keyframes boot-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes boot-bar {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

@keyframes flicker {
  0%,
  100% {
    opacity: 1;
  }
  30% {
    opacity: 0.35;
  }
  60% {
    opacity: 0.9;
  }
}

@keyframes k-blink {
  0%,
  55% {
    opacity: 1;
  }
  56%,
  100% {
    opacity: 0;
  }
}

@keyframes k-scan {
  0% {
    top: -2px;
  }
  100% {
    top: 100%;
  }
}
```

- [ ] **Step 6: Import it**

In `src/styles/kairo/kairo.scss`, add after the existing `@use` lines:

```scss
@use "motion-keyframes";
```

- [ ] **Step 7: Verify the build**

Run: `npm run build`
Expected: `Prerendered 6 static routes.`

Confirm the keyframes reached the bundle:

```bash
grep -c "win-a\|win-b" dist/portfolio/browser/styles-*.css
```

Expected: at least 1.

- [ ] **Step 8: Commit**

```bash
git add src/styles/kairo src/app/ui/motion
git commit -m "feat(motion): add keyframe library and MotionService"
```

---

## Task M2: Boot overlay

**Files:**
- Create: `src/app/ui/boot/boot.ts`, `boot.html`, `boot.scss`, `boot.spec.ts`

**Interfaces:**
- Consumes: KAIRO tokens; `boot-in` and `boot-bar` keyframes from M1.
- Produces: `Boot`, selector `app-boot`. No inputs. Output `dismissed` (void). Renders nothing when `prefers-reduced-motion: reduce` matches.

Not yet mounted — M4 wires it into the shell.

- [ ] **Step 1: Write the failing test**

Create `src/app/ui/boot/boot.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Boot } from './boot';

describe('Boot', () => {
  let fixture: ComponentFixture<Boot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Boot] }).compileComponents();
    fixture = TestBed.createComponent(Boot);
    fixture.detectChanges();
  });

  it('renders the overlay', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.boot')).toBeTruthy();
  });

  it('announces itself as a status region rather than a dialog', () => {
    const el = (fixture.nativeElement as HTMLElement).querySelector('.boot');
    expect(el?.getAttribute('role')).toBe('status');
  });

  it('is focusable so a keyboard user is not stranded', () => {
    const el = (fixture.nativeElement as HTMLElement).querySelector(
      '.boot',
    ) as HTMLElement;
    expect(el.tabIndex).toBe(-1);
  });

  it('emits dismissed on click', () => {
    let fired = false;
    fixture.componentInstance.dismissed.subscribe(() => (fired = true));
    (fixture.nativeElement as HTMLElement)
      .querySelector('.boot')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fired).toBe(true);
  });

  it('emits dismissed on Escape', () => {
    let fired = false;
    fixture.componentInstance.dismissed.subscribe(() => (fired = true));
    (fixture.nativeElement as HTMLElement)
      .querySelector('.boot')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(fired).toBe(true);
  });

  it('emits dismissed on Enter', () => {
    let fired = false;
    fixture.componentInstance.dismissed.subscribe(() => (fired = true));
    (fixture.nativeElement as HTMLElement)
      .querySelector('.boot')
      ?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(fired).toBe(true);
  });

  it('marks the decorative environmental word aria-hidden', () => {
    const env = (fixture.nativeElement as HTMLElement).querySelector('.boot__env');
    expect(env?.getAttribute('aria-hidden')).toBe('true');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/boot.spec.ts'`
Expected: FAIL — cannot resolve `./boot`.

- [ ] **Step 3: Implement Boot**

`src/app/ui/boot/boot.ts`:

```typescript
import { Component, HostListener, output } from '@angular/core';

const BOOT_LINES = [
  'KAIRO/OS — INITIALISING',
  'MOUNT /hazel.exe … OK',
  'LOAD OPERATOR PROFILE … OK',
  'NET LINK … ESTABLISHED',
  'READY',
];

@Component({
  selector: 'app-boot',
  standalone: true,
  imports: [],
  templateUrl: './boot.html',
  styleUrl: './boot.scss',
})
export class Boot {
  lines = BOOT_LINES;
  dismissed = output<void>();

  /** Stagger each log line by its index. Matches the mockup's ladder. */
  delayFor(index: number): string {
    return `${index * 160}ms`;
  }

  @HostListener('click')
  onClick(): void {
    this.dismissed.emit();
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event.key === 'Enter') {
      event.preventDefault();
      this.dismissed.emit();
    }
  }
}
```

`src/app/ui/boot/boot.html`:

```html
<div class="boot" role="status" tabindex="-1" aria-label="System boot sequence">
  <span class="boot__env" aria-hidden="true">HAZEL</span>

  <div class="boot__window">
    <div class="boot__head">
      <span class="boot__index">00</span>
      <span class="boot__title">Boot sequence</span>
      <span class="boot__sep">// hazel.exe</span>
    </div>

    <div class="boot__body">
      @for (line of lines; track line; let i = $index) {
        <p class="boot__line" [style.animation-delay]="delayFor(i)">
          <span class="boot__caret" aria-hidden="true">&gt;</span>{{ line }}
        </p>
      }
    </div>

    <div class="boot__bar" aria-hidden="true"></div>
  </div>

  <p class="boot__hint">PRESS ANY KEY OR CLICK TO SKIP</p>
</div>
```

`src/app/ui/boot/boot.scss`:

```scss
.boot {
  position: fixed;
  inset: 0;
  z-index: var(--z-alert);
  background: var(--surface-inset);
  display: grid;
  place-items: center;
  overflow: hidden;
  cursor: pointer;
}

.boot__env {
  position: absolute;
  inset-inline-start: -2%;
  inset-block-end: 2%;
  font: 600 34vh/0.9 var(--font-display);
  letter-spacing: var(--tracking-display);
  color: var(--surface-elevated);
  user-select: none;
  pointer-events: none;
  animation: env-a var(--dur-cinematic) var(--ease-mech) both;
  animation-delay: 200ms;
}

.boot__window {
  position: relative;
  z-index: 1;
  width: min(560px, 92vw);
  background: var(--surface-window);
  border: var(--bw-hairline) solid var(--border-strong);
  border-top: var(--bw-rule) solid var(--signal-active);
}

.boot__head {
  display: flex;
  gap: var(--sp-3);
  align-items: center;
  padding: var(--sp-2) var(--sp-3);
  border-bottom: var(--bw-hairline) solid var(--border-faint);
  font: var(--type-mono-s);
  color: var(--text-faint);
}

.boot__index {
  color: var(--text-active);
}

.boot__title {
  font: var(--type-label);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--text-primary);
}

.boot__body {
  padding: var(--sp-4) var(--sp-3);
  display: grid;
  gap: var(--sp-2);
  min-height: 150px;
  font: var(--type-mono);
  color: var(--text-secondary);
}

.boot__line {
  margin: 0;
  display: flex;
  gap: var(--sp-2);
  animation: boot-in var(--dur-control) var(--ease-mech) both;
}

.boot__caret {
  color: var(--signal-active);
}

.boot__bar {
  height: var(--bw-indicator);
  background: var(--signal-active);
  transform-origin: left center;
  animation: boot-bar 2600ms linear both;
}

.boot__hint {
  position: absolute;
  inset-block-end: var(--sp-6);
  margin: 0;
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wider);
  color: var(--text-faint);
}

// Reduced motion: the overlay is not rendered at all (see the shell), but if
// it ever were, nothing here may animate.
@media (prefers-reduced-motion: reduce) {
  .boot__env,
  .boot__line,
  .boot__bar {
    animation: none;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/boot.spec.ts'`
Expected: PASS, 8 specs.

- [ ] **Step 5: Commit**

```bash
git add src/app/ui/boot
git commit -m "feat(motion): add the boot overlay component"
```

---

## Task M3: Move environmental type to page level

Pure refactor — **no motion added in this task.** It exists on its own because it changes a component API that six templates depend on, and mixing that with animation work would make a failure hard to localise.

**Files:**
- Modify: `src/app/ui/chapter-header/chapter-header.ts`, `.html`, `.scss`, `.spec.ts`
- Modify: `src/app/core/navigation.ts`
- Modify: `src/app/app.html`, `app.scss`, `app.ts`, `app.spec.ts`
- Modify: the templates that pass `environmental` — `home-page.html`, `portfolio-page.html`, `project-detail-page.html`, `blog-page.html`, `blog-post-page.html`, `about-page.html`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `ChapterHeader` **loses its `environmental` input** and stops rendering `.chapter__env`. Its other four inputs (`code`, `index`, `context`, `status`) are unchanged.
  - `ENV_WORDS: Record<string, string>` exported from `navigation.ts`, plus `envWordFor(url: string): string`.
  - The shell renders `.app__env` at page level.

### Why it moves

The mockup renders the environmental word as `position: fixed; right: -10px; bottom: 20px` — a page-level element. The current implementation has it absolutely positioned *inside* `ChapterHeader`, at the top, clipped mid-glyph by `.main`'s `overflow: hidden`.

The `env-{sfx}` slide-in requires a page-level fixed element to animate as designed. Moving it also fixes a known deviation from the mockup that was deferred during the redesign precisely because it meant restructuring a shared component for decoration alone. It is no longer for decoration alone.

- [ ] **Step 1: Find every usage before changing anything**

```bash
grep -rn "environmental" src/app --include=*.html --include=*.ts
```

Write the full list into your report. Every one must be accounted for by the end — a missed template would leave a binding to a removed input, which `strictTemplates` will reject at build time, but an unnoticed *removal* would silently drop a word.

- [ ] **Step 2: Write the failing tests**

In `src/app/ui/chapter-header/chapter-header.spec.ts`, **replace** the existing `environmental` test with:

```typescript
  it('no longer renders environmental type — the shell owns it', () => {
    fixture.componentRef.setInput('code', 'HOME');
    fixture.componentRef.setInput('index', '01');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.chapter__env')).toBeNull();
  });
```

In `src/app/app.spec.ts`, add:

```typescript
  it('renders the environmental word at page level, hidden from assistive tech', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const env = (fixture.nativeElement as HTMLElement).querySelector('.app__env');
    expect(env).toBeTruthy();
    expect(env?.getAttribute('aria-hidden')).toBe('true');
  });
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/{chapter-header,app}.spec.ts'`
Expected: FAIL — `.chapter__env` still exists; `.app__env` does not.

- [ ] **Step 4: Strip `environmental` from ChapterHeader**

In `chapter-header.ts`, delete the `environmental = input('');` line. In `chapter-header.html`, delete the entire `@if (environmental()) { … }` block. In `chapter-header.scss`, delete the `.chapter__env` rule **and** the `font-size`/`inset-block-start` override for it inside the `@media (max-width: 840px)` block — leave the rest of that media query intact.

- [ ] **Step 5: Add the env word map**

Append to `src/app/core/navigation.ts`:

```typescript
/**
 * The oversized background word per route. Distinct from the mode labels —
 * `/` is mode HOME but reads HAZEL, and a project detail page reads RECORD.
 */
export const ENV_WORDS: Record<string, string> = {
  '/': 'HAZEL',
  '/about': 'PROFILE',
  '/portfolio': 'ARCHIVE',
  '/blog': 'LOG',
};

export function envWordFor(url: string): string {
  const path = url.split('?')[0].split('#')[0];
  if (path === '/') return ENV_WORDS['/'];
  if (path.startsWith('/portfolio/')) return 'RECORD';
  if (path.startsWith('/blog/')) return 'ENTRY';
  const match = Object.keys(ENV_WORDS)
    .filter((key) => key !== '/' && path.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];
  return match ? ENV_WORDS[match] : 'NULL';
}
```

- [ ] **Step 6: Render it in the shell**

In `app.ts`, import `envWordFor` and add a computed alongside the existing `activeMode`:

```typescript
  envWord = computed(() => envWordFor(this.currentUrl()));
```

In `app.html`, add inside `.app__body`, before `<main class="main">`:

```html
    <span class="app__env" aria-hidden="true">{{ envWord() }}</span>
```

In `app.scss`:

```scss
.app__env {
  position: fixed;
  inset-inline-end: -10px;
  inset-block-end: var(--sp-5);
  font: 600 min(260px, 30vw)/0.85 var(--font-display);
  letter-spacing: var(--tracking-display);
  color: var(--surface-elevated);
  user-select: none;
  pointer-events: none;
  z-index: 0;
}
```

- [ ] **Step 7: Remove `environmental` from every page template**

Using the list from Step 1, delete the `environmental="…"` attribute from every `<app-chapter-header>` usage. Change nothing else on those lines.

- [ ] **Step 8: Run the full suite**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: 2 failures (`Footer`, `ProjectCard` — pre-existing, not yours). Everything else green.

- [ ] **Step 9: Verify the build**

Run: `npm run build`
Expected: `Prerendered 6 static routes.` A leftover `environmental` binding would fail the build under `strictTemplates`, so a clean build is meaningful evidence here.

```bash
grep -o 'class="app__env"' dist/portfolio/browser/index.html | head -1
grep -c "chapter__env" dist/portfolio/browser/index.html
```

Expected: the first prints a match; the second prints `0`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "refactor(motion): move environmental type from ChapterHeader to the shell"
```

---

## Task M4: Shell motion

**Files:**
- Modify: `src/app/app.ts`, `app.html`, `app.scss`, `app.spec.ts`

**Interfaces:**
- Consumes: `MotionService` (M1), `Boot` (M2), `.app__env` (M3), the keyframe library (M1).
- Produces: the boot overlay mounted and dismissing; the wipe bar; `data-sfx` on the shell.

- [ ] **Step 1: Write the failing tests**

Add to `src/app/app.spec.ts`:

```typescript
  it('does not render the boot overlay during the server render', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    // booting() only becomes true in afterNextRender, so the first pass —
    // which is what prerendering captures — must have no overlay.
    expect((fixture.nativeElement as HTMLElement).querySelector('.boot')).toBeNull();
  });

  it('exposes the motion sequence on the shell for CSS to select on', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const app = (fixture.nativeElement as HTMLElement).querySelector('.app');
    expect(app?.getAttribute('data-sfx')).toBe('a');
  });

  it('renders a wipe bar hidden from assistive tech', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const wipe = (fixture.nativeElement as HTMLElement).querySelector('.app__wipe');
    expect(wipe).toBeTruthy();
    expect(wipe?.getAttribute('aria-hidden')).toBe('true');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/app.spec.ts'`
Expected: FAIL — no `data-sfx`, no `.app__wipe`.

- [ ] **Step 3: Wire the shell**

In `app.ts`: import `Boot`, `MotionService`, and `inject`. Add to `imports`. Then:

```typescript
  motion = inject(MotionService);
  booting = signal(false);

  private readonly prefersReducedMotion = (): boolean =>
    typeof matchMedia === 'function' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches;
```

Inside the existing `afterNextRender` block, alongside the clock:

```typescript
      // Browser-only, deliberately. Prerendered HTML must not contain the
      // overlay: if it did and JavaScript failed, the site would be hidden
      // behind a permanent full-screen panel.
      if (!this.prefersReducedMotion()) {
        this.booting.set(true);
        setTimeout(() => this.booting.set(false), 2600);
      }
```

In `app.html`, add `[attr.data-sfx]="motion.sfx()"` to the root `.app` div, add the wipe bar as the first child of `<main class="main">`:

```html
      <span class="app__wipe" aria-hidden="true"></span>
```

and mount the boot overlay as the last child of `.app`:

```html
  @if (booting()) {
    <app-boot (dismissed)="booting.set(false)" />
  }
```

In `app.scss`:

```scss
.app__wipe {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
  width: 100%;
  height: 100%;
  background: var(--surface-elevated);
  border-inline-end: var(--bw-indicator) solid var(--signal-active);
  pointer-events: none;
  z-index: 2;
}

.app[data-sfx="a"] .app__wipe {
  animation: wipe-a var(--dur-cinematic) var(--ease-mech) both;
}

.app[data-sfx="b"] .app__wipe {
  animation: wipe-b var(--dur-cinematic) var(--ease-mech) both;
}

.app[data-sfx="a"] .app__env {
  animation: env-a var(--dur-cinematic) var(--ease-mech) both;
}

.app[data-sfx="b"] .app__env {
  animation: env-b var(--dur-cinematic) var(--ease-mech) both;
}

@media (prefers-reduced-motion: reduce) {
  .app__wipe {
    display: none;
  }

  .app__env {
    animation: none;
  }
}
```

The wipe bar is `display: none` rather than merely un-animated under reduced motion — a static full-viewport panel would cover the page.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/app.spec.ts'`
Expected: PASS.

- [ ] **Step 5: Add the `<noscript>` escape hatch**

In `src/index.html`, inside `<head>`:

```html
    <noscript><style>.boot{display:none !important}</style></noscript>
```

This is defence in depth. The overlay is already browser-only, but if that ever regresses, this keeps a JavaScript failure from hiding the entire site.

- [ ] **Step 5b: Add the two instrumentation readouts the motion needs**

M1 defines `type-a`/`type-b` and `flicker`, but the elements they animate do not exist yet — the system bar currently carries NET, LOC, STATUS and the clock. The mockup also shows a **SYNC** readout and a typing **path** readout. Without these, those three keyframes would be dead code.

Both are KAIRO's own documented vocabulary, not invented chrome — the design system's readme gives `NET ONLINE · SYNC 04ms` as its example of persistent instrumentation.

In `app.ts`, add a computed for the path label, reusing the existing mode lookup:

```typescript
  pathLabel = computed(() => {
    const active = this.modes.find((m) => m.id === this.activeMode());
    return active ? active.label : 'HOME';
  });
```

In `app.html`, add to the top bar's **centre** slot, after the existing LOC readout:

```html
    <app-readout barCenter label="SYNC" value="04ms" class="app__sync" />
    <span barCenter class="app__path">
      HAZEL.EXE <span class="app__path-sep">//</span> {{ pathLabel() }}
    </span>
```

The centre slot is hidden below 840px (established when SystemBar was built), so these are desktop-only — which matches the mockup, where both sit inside a wide-viewport conditional.

In `app.scss`:

```scss
.app__path {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  letter-spacing: var(--tracking-wide);
  color: var(--text-faint);
}

.app__path-sep {
  color: var(--text-muted);
}

.app[data-sfx="a"] .app__path {
  animation: type-a var(--dur-cinematic) var(--ease-cut) both;
}

.app[data-sfx="b"] .app__path {
  animation: type-b var(--dur-cinematic) var(--ease-cut) both;
}

.app[data-sfx="a"] .app__sync,
.app[data-sfx="b"] .app__sync {
  animation: flicker var(--dur-window) var(--ease-cut) both;
}

@media (prefers-reduced-motion: reduce) {
  .app__path,
  .app__sync {
    animation: none;
  }
}
```

Note `.app__path` does not need its reduced-motion guard for content-hiding reasons — `type-*` animates `max-width` from 0, and the text is present in the DOM at full length throughout, so assistive technology reads it normally either way. The guard is for motion sensitivity only.

Add a spec to `app.spec.ts`:

```typescript
  it('renders the instrumentation readouts the motion animates', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.app__sync')).toBeTruthy();
    expect(el.querySelector('.app__path')?.textContent).toContain('HAZEL.EXE');
  });
```


- [ ] **Step 6: Verify the build and prerendered output**

Run: `npm run build`
Expected: `Prerendered 6 static routes.`

```bash
grep -c 'class="boot"' dist/portfolio/browser/index.html
grep -c "noscript" dist/portfolio/browser/index.html
```

Expected: `0` for the first — the overlay must **not** be in the prerendered HTML — and at least `1` for the second.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(motion): boot overlay, wipe transition and environmental slide-in"
```

---

## Task M5: Component motion

**Files:**
- Modify: `src/app/ui/windows/window/window.ts`, `.html`, `.scss`, `.spec.ts`
- Modify: `src/app/ui/chapter-header/chapter-header.ts`, `.html`, `.scss`, `.spec.ts`
- Modify: `src/app/ui/windows/viewport-window/viewport-window.html`, `.scss`, `.spec.ts`

**Interfaces:**
- Consumes: `MotionService` (M1), the keyframe library (M1).
- Produces: `Window` gains an optional `delay` input (string, default `''`) for stagger. No other API changes.

- [ ] **Step 1: Write the failing tests**

Add to `window.spec.ts`:

```typescript
  it('exposes the motion sequence so its entrance can re-trigger', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('section')?.getAttribute('data-sfx')).toBe('a');
  });

  it('applies a stagger delay when given one', () => {
    // Host sets delay="120ms"
    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('section') as HTMLElement;
    expect(section.style.animationDelay).toBe('120ms');
  });
```

Update the host component in that spec to pass `delay="120ms"`.

Add to `chapter-header.spec.ts`:

```typescript
  it('exposes the motion sequence for the title reveal', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__title')?.getAttribute('data-sfx')).toBe('a');
  });
```

Add to `viewport-window.spec.ts`:

```typescript
  it('renders a scanline only when an image is present', () => {
    fixture.componentRef.setInput('src', '');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.viewport__scan')).toBeNull();

    fixture.componentRef.setInput('src', 'images/projects/pr-sweep/board.png');
    fixture.detectChanges();
    const scan = (fixture.nativeElement as HTMLElement).querySelector('.viewport__scan');
    expect(scan).toBeTruthy();
    expect(scan?.getAttribute('aria-hidden')).toBe('true');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/ui/**/*.spec.ts'`
Expected: FAIL on the three new specs.

- [ ] **Step 3: Window**

In `window.ts`, inject the service and add the input:

```typescript
  motion = inject(MotionService);
  delay = input('');
```

In `window.html`, on the root `<section>`, add:

```html
  [attr.data-sfx]="motion.sfx()"
  [style.animation-delay]="delay() || null"
```

In `window.scss`:

```scss
.window[data-sfx="a"] {
  animation: win-a var(--dur-window) var(--ease-mech) both;
}

.window[data-sfx="b"] {
  animation: win-b var(--dur-window) var(--ease-mech) both;
}

@media (prefers-reduced-motion: reduce) {
  .window[data-sfx="a"],
  .window[data-sfx="b"] {
    animation: none;
  }
}
```

`animation: none` rather than a zeroed duration, because a zeroed `win-*` would still apply its `from` state for one frame — and that state is `opacity: 0`.

- [ ] **Step 4: ChapterHeader**

Inject the service the same way. In `chapter-header.html`, add `[attr.data-sfx]="motion.sfx()"` to `.chapter__title`. In `chapter-header.scss`:

```scss
.chapter__title[data-sfx="a"] {
  animation: ttl-a var(--dur-window) var(--ease-mech) both;
}

.chapter__title[data-sfx="b"] {
  animation: ttl-b var(--dur-window) var(--ease-mech) both;
}

@media (prefers-reduced-motion: reduce) {
  .chapter__title[data-sfx="a"],
  .chapter__title[data-sfx="b"] {
    animation: none;
  }
}
```

- [ ] **Step 5: ViewportWindow scanline**

In `viewport-window.html`, inside the `@if (src()) { … }` branch, after the `<img>`:

```html
    <span class="viewport__scan" aria-hidden="true"></span>
```

It belongs inside that branch deliberately — a scanline travelling over a `NO SIGNAL` placeholder would read as a fault rather than an effect.

In `viewport-window.scss`:

```scss
.viewport__scan {
  position: absolute;
  inset-inline: 0;
  height: 2px;
  background: var(--signal-info);
  opacity: 0.35;
  pointer-events: none;
  animation: k-scan 3.2s var(--ease-linear) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .viewport__scan {
    animation: none;
    display: none;
  }
}
```

- [ ] **Step 6: Add stagger to the home page's windows**

`home-page.html` is the only page dense enough to need it. Add `delay` to each `<app-window>` in ascending order — `"40ms"`, `"80ms"`, `"120ms"`, `"160ms"`, `"200ms"`, `"240ms"` — following the mockup's ladder. Change nothing else.

- [ ] **Step 7: Run the full suite and build**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: 2 pre-existing failures only.

Run: `npm run build` — `Prerendered 6 static routes.`

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(motion): window entrance, title reveal and viewport scanline"
```

---

## Task M6: Reduced motion and accessibility verification

This task **finds and fixes**, rather than building. Its output is evidence.

**Files:** whichever the audit implicates.

- [ ] **Step 1: Audit every animation for a reduced-motion rule**

```bash
grep -rn "animation:" src/app src/styles --include=*.scss
```

For each hit, confirm a `prefers-reduced-motion` rule covers it. Build a table in your report: the animating selector, its file, whether it is a loop or an entrance, and the rule that disables it.

**Looping animations must use `animation: none`.** A zeroed duration on an infinite animation is degenerate, not disabled. **Entrance animations must also use `animation: none`** where their `from` state hides content (`opacity: 0`, `clip-path: inset(0 100% 0 0)`), because a zeroed duration still paints that first frame.

Any animation with no reduced-motion rule is a defect. Fix it and say so.

- [ ] **Step 2: Verify decorative elements are hidden from assistive tech**

```bash
grep -rn "app__wipe\|app__env\|viewport__scan\|boot__env" src/app --include=*.html
```

Every one must carry `aria-hidden="true"`. Fix any that do not.

- [ ] **Step 3: Confirm no entrance animation can strand content invisible**

For each entrance animation, confirm the declaration ends with `both` and the `to` state is the element's natural appearance. Report the list you checked.

- [ ] **Step 4: Add a reduced-motion spec**

Create `src/app/ui/motion/reduced-motion.spec.ts`:

```typescript
describe('reduced motion', () => {
  const ruleFor = (selector: string, media: string): string | null => {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin stylesheet
      }
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSMediaRule && rule.conditionText.includes(media)) {
          for (const inner of Array.from(rule.cssRules)) {
            if (inner instanceof CSSStyleRule && inner.selectorText.includes(selector)) {
              return inner.style.animation || inner.style.display || '';
            }
          }
        }
      }
    }
    return null;
  };

  it('disables the looping scanline outright rather than zeroing its period', () => {
    const declared = ruleFor('.viewport__scan', 'prefers-reduced-motion');
    expect(declared).not.toBeNull();
    expect(declared).toMatch(/none/);
  });

  it('disables the window entrance outright, since its from-state is invisible', () => {
    const declared = ruleFor('.window[data-sfx', 'prefers-reduced-motion');
    expect(declared).not.toBeNull();
    expect(declared).toMatch(/none/);
  });
});
```

If the stylesheet is not reachable from the test environment, say so in your report and note what you verified by reading the source instead — **do not delete the spec and claim coverage**.

- [ ] **Step 5: Run everything**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: 2 pre-existing failures only.

Run: `npm run build` — `Prerendered 6 static routes.`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "fix(motion): complete reduced-motion and accessibility coverage"
```

---

## Notes for the executor

- **Never push.** Every task commits locally to `redesign/kairo`.
- **The `-a`/`-b` keyframe duplication is deliberate.** If a reviewer or linter suggests collapsing them, that would silently stop every route transition from animating. It is commented in the source; leave it.
- **The boot overlay must never appear in prerendered HTML.** That is asserted by a test and verified by a grep in M4. If you find yourself making `booting` default to `true`, stop — it would put a full-screen panel into the static HTML and hide the site whenever JavaScript fails.
- **Reduced motion is the area where the source mockup is weakest.** It uses a blanket `*{animation-duration:0ms}`, which is wrong for loops. Do not copy it.
- **Visual verification is the controller's.** You have no browser. Verify built HTML and computed styles; do not claim to have looked at the page.
