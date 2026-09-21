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

## Task M0: Pin the shell

**Runs FIRST — before M1.** Several later tasks are actively degraded without it: M3's fixed environmental word and M4's full-height wipe both assume a viewport that holds still.

**Files:**
- Modify: `src/app/app.scss`, `src/app/app.ts`, `src/app/app.spec.ts`
- Modify: `src/styles/kairo/_base.scss`
- Modify: `src/app/app.config.ts`
- Modify: `src/app/ui/windows/system-bar/system-bar.scss`

**Interfaces:**
- Consumes: nothing.
- Produces: a fixed-viewport application shell. `.main` becomes the scroll container.

### Why this is the whole request in one change

Five independent analyses of the mockup converged on one root cause. `.app { min-height: 100vh }` plus `.main { overflow: hidden }` means **the document scrolls and the instrument frame scrolls with it**. On the home page there is roughly 144px of residual scroll — enough to take the entire top bar off screen.

Everything the design is reaching for — bars that never move, a rail running the full column height, a scroll gutter framed on three sides, a wipe that crosses exactly one viewport, an environmental word silkscreened on the bezel rather than stuck to the glass — is downstream of the frame holding still while content moves inside it.

**This is a deliberate scope change.** The redesign spec said the site takes "the visual language, not the application". Pinning the shell crosses that line knowingly, because the owner has asked for the feel and this is what produces it.

- [ ] **Step 1: Write the failing tests**

Add to `src/app/app.spec.ts`:

```typescript
  it('pins the shell to the viewport rather than growing with content', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const app = (fixture.nativeElement as HTMLElement).querySelector('.app') as HTMLElement;
    const height = getComputedStyle(app).height;
    expect(getComputedStyle(app).minHeight).not.toBe('100vh');
    expect(height).not.toBe('auto');
  });

  it('makes the content region the scroll container, not the document', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const main = (fixture.nativeElement as HTMLElement).querySelector('.main') as HTMLElement;
    const style = getComputedStyle(main);
    expect(style.overflowY).toBe('auto');
    expect(style.overflowX).toBe('hidden');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/app.spec.ts'`
Expected: FAIL — `minHeight` is `100vh`, `overflowY` is `hidden`.

- [ ] **Step 3: Pin the shell**

In `src/styles/kairo/_base.scss`, add:

```scss
html,
body {
  height: 100%;
  overflow: hidden;
}
```

In `src/app/app.scss`, change `.app`:

```scss
.app {
  // 100dvh, not 100vh. The mockup uses 100vh and that is a bug there: on
  // mobile the dynamic toolbar overshoots and pushes the bottom bar out of
  // view. The current growable shell happens to avoid it; pinning with 100vh
  // would import the bug deliberately.
  height: 100dvh;
  display: flex;
  flex-direction: column;
}
```

and `.main`:

```scss
.main {
  flex: 1;
  min-width: 0;
  // The content region scrolls; the chrome around it does not. `overflow-x`
  // must stay hidden — it is the load-bearing clamp against the 260px
  // environmental word overflowing horizontally.
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  padding: var(--sp-5) var(--sp-6) var(--sp-8);
  position: relative;
}
```

In `src/app/ui/windows/system-bar/system-bar.scss`, add `flex-shrink: 0;` to `.system-bar` so neither bar can be squeezed by the flex column.

- [ ] **Step 4: Handle scroll position across navigation**

In `app.config.ts`, remove `withInMemoryScrolling(...)` from `provideRouter` — it operates on the document scroller, which no longer scrolls.

In `app.ts`, inside the existing router subscription, reset the content region on **forward** navigation only:

```typescript
  private readonly scrollOffsets = new Map<string, number>();

  // Restore on Back/Forward, hard-cut to top otherwise. The mockup resets
  // unconditionally because it has no history; this site has a Back button,
  // and losing scroll restoration to match a demo would be a plain usability
  // regression.
  private handleScrollFor(event: NavigationEnd): void {
    const main = this.mainEl()?.nativeElement;
    if (!main) return;
    const restored = this.scrollOffsets.get(event.urlAfterRedirects);
    main.scrollTop = this.poppedState && restored !== undefined ? restored : 0;
    this.poppedState = false;
  }
```

Record offsets before leaving a route, and set `poppedState` from a `popstate` listener registered inside `afterNextRender`. Add a `mainEl = viewChild<ElementRef<HTMLElement>>('mainRegion')` and `#mainRegion` on the `<main>` element.

- [ ] **Step 5: Run the tests**

Run: `npx ng test --watch=false --browsers=ChromeHeadless`
Expected: 2 pre-existing failures only.

- [ ] **Step 6: Verify the build**

Run: `npm run build` — `Prerendered 6 static routes.`

- [ ] **Step 7: Manual checks the controller must be told about**

These cannot be unit tested and must be listed in your report as **unverified by you**:

- **In-page fragment links.** `home-page.html`'s `href="#contact"` and `blog-post-page.html`'s TOC anchors relied on the document scrolling. Browsers do scroll the nearest scrollable ancestor, so they probably survive — but this is the most likely silent regression and the controller will check it in a browser.
- **`.post__side { position: sticky }`** (`blog-post-page.scss`) goes from dead to live now that it has a scrolling ancestor. State in your report that this changed; do not decide whether a sticky TOC is wanted.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(motion): pin the shell so the instrument frame holds still"
```

---

## Task M1: Keyframe library and MotionService

**Files:**
- Create: `src/styles/kairo/_motion-keyframes.scss`
- Modify: `src/styles/kairo/kairo.scss`
- Create: `src/app/ui/motion/motion.service.ts`, `motion.service.spec.ts`

**Interfaces:**
- Consumes: the existing `--dur-*` / `--ease-*` tokens.
- Produces:
  - Keyframes `win-a`/`win-b`, `ttl-a`/`ttl-b`, `wipe-a`/`wipe-b`, `env-a`/`env-b`, `type-a`/`type-b`, `boot-in`, `boot-bar`, `flicker-a`/`flicker-b`, `k-blink`, `k-scan`.
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

@keyframes flicker-a {
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

@keyframes flicker-b {
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

The single highest-fidelity moment in the design — it is the first thing every
visitor sees, and it sets the premise that this site is an instrument. The
values below are taken from the mockup rather than approximated; where they
differ from the mockup, the difference is deliberate and noted.

**Files:**
- Create: `src/app/ui/boot/boot.ts`, `boot.html`, `boot.scss`, `boot.spec.ts`

**Interfaces:**
- Consumes: KAIRO tokens; `boot-in`, `boot-bar` and `k-blink` keyframes from M1; `projectsData` from `src/app/data/projects.data.ts`; `blogPosts` from `src/app/data/blog-posts.generated.ts`.
- Produces: `Boot`, selector `app-boot`. Required input `clock: string`. Output `dismissed` (void).

Not yet mounted — M4 wires it into the shell and only in the browser.

**Three things this task gets right that a looser reading would get wrong:**

1. **`clock` is an input, not a second timer.** The shell already ticks once a
   second. Boot displays that value. A component that owns its own interval for
   a 2.6-second overlay is machinery with no payer.
2. **The record counts are computed, not typed.** The mockup says
   "4 RECORDS · 3 LOG ENTRIES" because that is what the mockup's fake data
   holds. Hardcoding a number here would be a lie the day content changes.
3. **Any key dismisses.** The footer promises "PRESS ANY KEY" and the interface
   must keep that promise. Restricting it to Escape and Enter would advertise a
   binding that does not exist — the exact defect class already found twice in
   this project.

**Ruling — `ui/` importing from `data/`.** No other component under
`src/app/ui/` imports site content; they are all prop-driven primitives. Boot is
not a primitive. It is a one-off overlay whose entire purpose is to introduce
*this* site, and the alternative — passing counts down through the shell — would
spread the same coupling to `App`, which otherwise has no reason to know how
many projects exist. Couple the overlay, not the shell.

- [ ] **Step 1: Write the failing test**

Create `src/app/ui/boot/boot.spec.ts`:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Boot } from './boot';

describe('Boot', () => {
  let fixture: ComponentFixture<Boot>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Boot] }).compileComponents();
    fixture = TestBed.createComponent(Boot);
    fixture.componentRef.setInput('clock', '12:34:56');
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('renders the overlay', () => {
    expect(el.querySelector('.boot')).toBeTruthy();
  });

  it('announces itself as a status region rather than a dialog', () => {
    expect(el.querySelector('.boot')?.getAttribute('role')).toBe('status');
  });

  it('is focusable so a keyboard user is not stranded behind it', () => {
    expect((el.querySelector('.boot') as HTMLElement).tabIndex).toBe(-1);
  });

  it('emits dismissed on click', () => {
    let fired = false;
    fixture.componentInstance.dismissed.subscribe(() => (fired = true));
    el.querySelector('.boot')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fired).toBe(true);
  });

  it('emits dismissed on ANY key, not just Escape', () => {
    const keys = ['Escape', 'Enter', 'a', ' ', 'ArrowLeft'];
    let fired = 0;
    fixture.componentInstance.dismissed.subscribe(() => (fired += 1));
    for (const key of keys) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    }
    expect(fired).toBe(keys.length);
  });

  it('takes focus on mount so focus is not left behind the overlay', async () => {
    await fixture.whenStable();
    expect(document.activeElement).toBe(el.querySelector('.boot'));
  });

  it('shows the real record counts rather than a hardcoded number', () => {
    const log = el.querySelector('.boot__log')?.textContent ?? '';
    expect(log).toMatch(/\d+ RECORDS? · \d+ LOG (ENTRY|ENTRIES) RETRIEVED/);
  });

  it('renders the progress bar as a track plus a fill', () => {
    expect(el.querySelector('.boot__bar')).toBeTruthy();
    expect(el.querySelector('.boot__bar .boot__bar-fill')).toBeTruthy();
  });

  it('renders a live prompt with a blinking cursor', () => {
    expect(el.querySelector('.boot__cursor')).toBeTruthy();
  });

  it('shows the clock it was given', () => {
    expect(el.querySelector('.boot__clock')?.textContent).toContain('12:34:56');
  });

  it('carries the exact skip affordance copy', () => {
    expect(el.querySelector('.boot__foot')?.textContent).toContain(
      'CLICK OR PRESS ANY KEY TO SKIP',
    );
  });

  it('hides the decorative log and environmental word from assistive tech', () => {
    expect(el.querySelector('.boot__log')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.boot__env')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('leaves the title and the skip hint exposed, so the announcement is useful', () => {
    expect(el.querySelector('.boot__title')?.getAttribute('aria-hidden')).toBeNull();
    expect(el.querySelector('.boot__foot')?.getAttribute('aria-hidden')).toBeNull();
  });

  it('contains no emoji', () => {
    expect(/\p{Extended_Pictographic}/u.test(el.textContent ?? '')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/boot.spec.ts'`
Expected: FAIL — cannot resolve `./boot`.

- [ ] **Step 3: Implement Boot**

`src/app/ui/boot/boot.ts`:

```typescript
import {
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  input,
  output,
  viewChild,
} from '@angular/core';
import { blogPosts } from '../../data/blog-posts.generated';
import { projectsData } from '../../data/projects.data';

interface BootLine {
  prefix: string;
  text: string;
  /** Colour of the status prefix column. */
  tone: 'active' | 'faint' | 'success';
  /** Statements read primary; detail reads secondary. */
  emphasis: 'primary' | 'secondary';
  /** Milliseconds after mount at which this line appears. */
  delay: number;
}

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

// The delay ladder is not uniform. It is fast at the head, slows through the
// middle, then lands — the rhythm is what makes it read as a machine working
// rather than a list animating. Taken from the mockup verbatim.
const BOOT_LINES: BootLine[] = [
  {
    prefix: '>',
    text: 'HAZEL.EXE // BOOT SEQUENCE 4.02',
    tone: 'active',
    emphasis: 'primary',
    delay: 0,
  },
  {
    prefix: '..',
    text: 'LOADING MODULES : HOME ABOUT PROJECTS BLOG',
    tone: 'faint',
    emphasis: 'secondary',
    delay: 350,
  },
  {
    prefix: 'OK',
    text: 'CONNECTION ESTABLISHED — NODE TX-01',
    tone: 'success',
    emphasis: 'secondary',
    delay: 750,
  },
  {
    prefix: 'OK',
    text: `${count(projectsData.length, 'RECORD', 'RECORDS')} · ${count(
      blogPosts.length,
      'LOG ENTRY',
      'LOG ENTRIES',
    )} RETRIEVED`,
    tone: 'success',
    emphasis: 'secondary',
    delay: 1150,
  },
  {
    prefix: '..',
    text: 'OPERATOR : HAZEL GRANADOS · STATUS : OPEN TO WORK',
    tone: 'faint',
    emphasis: 'secondary',
    delay: 1600,
  },
  {
    prefix: '>',
    text: 'ENTERING SYSTEM',
    tone: 'active',
    emphasis: 'primary',
    delay: 2100,
  },
];

@Component({
  selector: 'app-boot',
  standalone: true,
  imports: [],
  templateUrl: './boot.html',
  styleUrl: './boot.scss',
})
export class Boot {
  /** Supplied by the shell, which already ticks once a second. */
  clock = input.required<string>();
  dismissed = output<void>();

  lines = BOOT_LINES;

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  constructor() {
    // Take focus so a keyboard or screen-reader user is not left interacting
    // with content the overlay covers. afterNextRender never runs on the
    // server, which is the guarantee we want — this component is browser-only.
    afterNextRender(() => this.root().nativeElement.focus());
  }

  @HostListener('click')
  onClick(): void {
    this.dismissed.emit();
  }

  // Bound to the document, not the host: the footer promises ANY key, and that
  // has to hold whether or not focus happens to be inside the overlay.
  @HostListener('document:keydown')
  onKeydown(): void {
    this.dismissed.emit();
  }
}
```

`src/app/ui/boot/boot.html`:

```html
<div class="boot" #root role="status" tabindex="-1">
  <span class="boot__env" aria-hidden="true">HAZEL</span>

  <div class="boot__window">
    <div class="boot__head">
      <span class="boot__index" aria-hidden="true">00</span>
      <span class="boot__title">Boot sequence</span>
      <span class="boot__sep" aria-hidden="true">// hazel.exe</span>
      <span class="boot__clock" aria-hidden="true">{{ clock() }}</span>
    </div>

    <div class="boot__log" aria-hidden="true">
      @for (line of lines; track line.text) {
        <p class="boot__line" [style.animation-delay.ms]="line.delay">
          <span class="boot__prefix" [attr.data-tone]="line.tone">{{ line.prefix }}</span>
          <span class="boot__text" [attr.data-emphasis]="line.emphasis">{{ line.text }}</span>
        </p>
      }
      <p class="boot__line boot__line--live">
        <span class="boot__prefix" data-tone="active">&gt;</span>
        <span class="boot__cursor"></span>
      </p>
    </div>

    <div class="boot__bar" aria-hidden="true"><span class="boot__bar-fill"></span></div>

    <div class="boot__foot">
      <span>CLICK OR PRESS ANY KEY TO SKIP</span>
      <span class="boot__node" aria-hidden="true">NODE TX-01</span>
    </div>
  </div>
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

// One auto margin, not two — with a margin on both ends flexbox splits the
// free space between them and neither lands where it was aimed.
.boot__clock {
  margin-inline-start: auto;
}

.boot__log {
  padding: var(--sp-4) var(--sp-3);
  display: grid;
  gap: var(--sp-2);
  font: var(--type-mono);
  color: var(--text-secondary);
}

.boot__line {
  margin: 0;
  display: flex;
  gap: var(--sp-2);
  animation: boot-in var(--dur-control) var(--ease-mech) both;
}

// The prompt is present from the first frame; only the log streams in.
.boot__line--live {
  animation: none;
  align-items: center;
}

.boot__prefix[data-tone="active"] {
  color: var(--signal-active);
}

.boot__prefix[data-tone="faint"] {
  color: var(--text-faint);
}

.boot__prefix[data-tone="success"] {
  color: var(--signal-success);
}

.boot__text[data-emphasis="primary"] {
  color: var(--text-primary);
}

.boot__cursor {
  display: inline-block;
  // Sized to the mono cell rather than the 4px spacing grid: a text cursor's
  // dimensions come from the font's metrics, not the layout scale.
  width: 9px;
  height: 15px;
  background: var(--text-primary);
  animation: k-blink var(--dur-blink) steps(1) infinite;
}

// A track the fill travels along, not a bare bar — without the track there is
// nothing to read the progress against.
.boot__bar {
  height: var(--bw-indicator);
  background: var(--surface-raised);
  overflow: hidden;
}

.boot__bar-fill {
  display: block;
  height: 100%;
  background: var(--signal-active);
  transform-origin: left center;
  // Paired with M4's 2700ms dismissal: the bar completes, then the overlay
  // leaves. Changing one without the other either truncates the bar or leaves
  // a finished bar sitting on screen. Both numbers are deliberate.
  animation: boot-bar 2600ms linear both;
}

.boot__foot {
  display: flex;
  gap: var(--sp-4);
  padding: var(--sp-2) var(--sp-3);
  border-top: var(--bw-hairline) solid var(--border-faint);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wider);
  color: var(--text-faint);
}

.boot__node {
  margin-inline-start: auto;
}

// The shell does not mount this component at all under reduced motion. The
// guard is here anyway so the component cannot animate in any context.
@media (prefers-reduced-motion: reduce) {
  .boot__env,
  .boot__line,
  .boot__cursor,
  .boot__bar-fill {
    animation: none;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/boot.spec.ts'`
Expected: PASS, 14 specs.

If the focus assertion is the only failure, `afterNextRender` is not firing
under this Karma setup. **Keep the focus call and adjust the test** — try
`TestBed.tick()` before asserting, or attach the fixture to the document body.
Do not delete the assertion, and if nothing works, report it rather than
dropping it.

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
  it('starts with the boot overlay off, so the first render pass has no overlay', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    // This asserts only that `booting` starts false. It is NOT proof of
    // prerender safety — it would pass against a component that never mounts
    // the overlay at all. The real proof is Step 6's grep of the prerendered
    // HTML, which cannot be satisfied by an absent feature.
    expect(fixture.componentInstance.booting()).toBe(false);
    expect((fixture.nativeElement as HTMLElement).querySelector('.boot')).toBeNull();
  });

  it('mounts the boot overlay once the browser has rendered', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    // Paired with the spec above: together they prove the overlay is off for
    // the render that prerendering captures and on afterwards. Alone, either
    // one is satisfiable by a component that does nothing.
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    expect(fixture.componentInstance.booting()).toBe(!reduced);
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

Inside the existing `afterNextRender` block, **after the existing `this.tick()` call** — Boot displays the shell's clock, so the clock must hold a real time before the overlay mounts, or it shows the placeholder for a frame:

```typescript
      // Browser-only, deliberately. Prerendered HTML must not contain the
      // overlay: if it did and JavaScript failed, the site would be hidden
      // behind a permanent full-screen panel.
      if (!this.prefersReducedMotion()) {
        this.booting.set(true);
        // 2700, not 2600: M2's progress bar runs for 2600ms, and the overlay
        // leaves 100ms after it completes. A finished bar that lingers reads
        // as a hang; a bar cut short reads as a glitch. The two numbers are
        // paired — change neither alone.
        setTimeout(() => this.booting.set(false), 2700);
      }
```

In `app.html`, add the motion sequence attribute to the **root** `.app` div — every `data-sfx` selector in every stylesheet keys off this one binding, so without it nothing re-triggers:

```html
<div class="app" [attr.data-sfx]="motion.sfx()">
```

and mount the boot overlay as the **last** child of `.app`:

```html
  @if (booting()) {
    <app-boot [clock]="clock()" (dismissed)="booting.set(false)" />
  }
```


In `app.html`, add the wipe as a **sibling of `<main class="main">`**, inside `.app__body`, immediately before `<main>`:

```html
      <span class="app__wipe" aria-hidden="true"><span class="app__wipe-bar"></span></span>
```

If M3 placed `.app__env` in this same position, the wipe goes **after** it — the env word must paint behind the sweep.

In `app.scss`, add `position: relative` to the existing `.app__body` rule if it does not already have it (this makes it the containing block for the wipe; it does **not** affect `.app__env`, because only `transform`/`filter`/`contain`-style properties capture a fixed-position descendant, never `position: relative`). Then:

```scss
// The wrapper is absolutely positioned against `.app__body`, so it fills the
// content region exactly: below the top bar, above the bottom bar, and — being
// outside `.main` — it does not scroll with the content. The instrument frame
// stays visible throughout the transition, which is the whole point of pinning
// the shell.
//
// DO NOT reinstate the mockup's arrangement here. The mockup wraps the bar in
// a `position: sticky; height: 0; overflow: hidden` element, and a zero-height
// box with `overflow: hidden` clips its content to nothing — measured in a
// browser: the bar is laid out at full height and paints zero pixels at every
// sampled point, and hit-testing finds it only once the clip is removed. The
// mockup's own wipe never renders. A 450ms animation that does not appear
// reads as "subtle", not "broken", which is why it survived there.
.app__wipe {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  overflow: hidden;
}

.app__wipe-bar {
  display: block;
  height: 100%;
  background: var(--surface-elevated);
  border-inline-end: var(--bw-indicator) solid var(--signal-active);
}

.app[data-sfx="a"] .app__wipe-bar {
  animation: wipe-a var(--dur-cinematic) var(--ease-mech) both;
}

.app[data-sfx="b"] .app__wipe-bar {
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

The wrapper is `display: none` rather than merely un-animated under reduced motion — a static bar would otherwise sit across the content.


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

// steps(26, end) literally, NOT --ease-cut. --ease-cut is steps(2, end), which
// would reveal the path in two chunks — a jump, not typing. The step count is
// what makes this read as a machine printing characters, and it is the one
// place in the system where the easing is a sequence length rather than a
// curve. Taken from the mockup verbatim.
/* prettier-ignore */
.app[data-sfx="a"] .app__path {
  animation: type-a var(--dur-cinematic) steps(26, end) both;
}

/* prettier-ignore */
.app[data-sfx="b"] .app__path {
  animation: type-b var(--dur-cinematic) steps(26, end) both;
}

.app[data-sfx="a"] .app__sync {
  animation: flicker-a var(--dur-window) var(--ease-cut) both;
}

.app[data-sfx="b"] .app__sync {
  animation: flicker-b var(--dur-window) var(--ease-cut) both;
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

- [ ] **Step 7: Prove the wipe actually paints**

A wipe that renders zero pixels is indistinguishable from a wipe that is merely quick, so a unit test asserting the element exists is not evidence. Serve `dist/portfolio/browser`, open it, and run this in the console:

```javascript
(() => {
  const w = document.querySelector('.app__wipe');
  const b = document.querySelector('.app__wipe-bar');
  const r = w.getBoundingClientRect();
  const top = document.querySelector('.app > *').getBoundingClientRect();
  // Park the bar mid-sweep and hit-test through it.
  w.style.pointerEvents = 'auto'; b.style.pointerEvents = 'auto';
  b.style.animation = 'none'; b.style.transform = 'translateX(0)';
  const at = (x, y) => { const e = document.elementFromPoint(x, y); return e && e.className; };
  return {
    regionStartsBelowTopBar: r.top >= top.bottom,
    barCoversRegion: [r.top + 10, (r.top + r.bottom) / 2, r.bottom - 10].map(y => at(innerWidth / 2, y)),
    topBarUncovered: at(innerWidth / 2, top.top + 5),
    noHorizontalScroll: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  };
})()
```

Expected: `regionStartsBelowTopBar` true; all three entries of `barCoversRegion` report the wipe bar; `topBarUncovered` reports something that is **not** the wipe bar; `noHorizontalScroll` true. Then reload and watch a real navigation — the bar should sweep left to right across the content region while the top and bottom bars stay put. Put what you saw in your report.

- [ ] **Step 8: Commit**

Stage the specific files you changed — not `git add -A`.

```bash
git add src/app/app.ts src/app/app.html src/app/app.scss src/app/app.spec.ts src/index.html
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

## Task M7: Give the interface a pulse

**Files:**
- Modify: `src/app/ui/chapter-header/chapter-header.html`, `.scss`, `.spec.ts`
- Modify: `src/app/features/projectDetail/project-detail-page/project-detail-page.html`, `.scss`

**Interfaces:**
- Consumes: `k-blink` from M1.
- Produces: nothing consumed elsewhere.

### Why

A repo-wide grep for `infinite` currently returns one rule, gated behind a `blink` input that no template passes. **The running application has zero moving pixels between navigations.** Worse, after executing M1–M6 as originally written it still would — `k-blink` sits in the keyframe library and no task ever applies it. That is dead code masquerading as a feature, and it is the difference between a themed page and a machine that is running.

- [ ] **Step 1: Write the failing test**

Add to `chapter-header.spec.ts`:

```typescript
  it('carries a blinking caret so the interface is never fully still', () => {
    const el = fixture.nativeElement as HTMLElement;
    const caret = el.querySelector('.chapter__caret');
    expect(caret).toBeTruthy();
    expect(caret?.getAttribute('aria-hidden')).toBe('true');
  });
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx ng test --watch=false --browsers=ChromeHeadless --include='**/chapter-header.spec.ts'`
Expected: FAIL — no `.chapter__caret`.

- [ ] **Step 3: Add the caret**

In `chapter-header.html`, after the `.chapter__title` element:

```html
  <span class="chapter__caret" aria-hidden="true"></span>
```

In `chapter-header.scss`:

```scss
.chapter__caret {
  display: inline-block;
  width: 10px;
  height: 22px;
  background: var(--signal-active);
  align-self: center;
  // 1.1s, deliberately not a round second and deliberately not the same as
  // the other loops. Cadences that share a period visibly lock together and
  // read as one mechanism rather than several.
  animation: k-blink 1.1s steps(1) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .chapter__caret {
    animation: none;
  }
}
```

- [ ] **Step 4: Add a second, non-harmonic cadence**

On the project detail page's viewport window, add a recording lamp:

```html
        <span class="detail__rec" aria-hidden="true">&#9679; REC</span>
```

```scss
.detail__rec {
  position: absolute;
  inset-block-start: var(--sp-2);
  inset-inline-end: var(--sp-2);
  font: var(--type-mono-s);
  letter-spacing: var(--tracking-wide);
  color: var(--text-active);
  animation: k-blink 1.4s steps(1) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .detail__rec {
    animation: none;
  }
}
```

With M5's 3.2s scanline that gives three loops on periods of 1.1s, 1.4s and 3.2s — non-harmonic, so they drift against each other rather than pulsing in time. **Three is the ceiling.** More and the screen fidgets.

- [ ] **Step 5: Run tests, build, commit**

```bash
git add -A
git commit -m "feat(motion): add non-harmonic ambient cadences"
```

---

## Task M8: Correct the pointer-feedback inversion

**Files:**
- Modify: `src/app/ui/core/button/button.scss`, `src/app/ui/windows/mode-nav/mode-nav.scss`
- Modify: `src/app/features/home/home-page/home-page.scss`
- Modify: `src/app/features/projectDetail/project-detail-page/project-detail-page.scss`

### Why

Two problems, both of which the code gets backwards.

Buttons and mode keys currently **ease** at `--dur-control` (180ms) where hardware should snap. And the highest-frequency motion on the entire site — a row hover — animates `padding-inline-start` by **8px with no transition at all**: a reflowing jump, four times the system's own 2px shift idiom, on the wrong property.

`--dur-micro` has **zero consumers anywhere in the codebase.** A visitor cannot learn the machine's timing vocabulary until more than one tier is observable.

**Note:** this breaches the plan's Global Constraint that nothing under `src/app/features/` gains animation code. That constraint is hereby amended to permit *transitions on existing hover states* in feature stylesheets. The alternative — lifting every row into a shared component — is a larger refactor than the problem warrants.

- [ ] **Step 1: Make primary controls snap**

Remove the `transition` declaration from `button.scss` and from `.mode-nav__item` in `mode-nav.scss`. A switch that eases reads as software; a switch that snaps reads as hardware.

- [ ] **Step 2: Fix the row hover**

In `home-page.scss`, for both `.home__record:hover` and `.home__log-row:hover`, replace `padding-inline-start: var(--sp-2)` with:

```scss
    transform: translateX(2px);
```

and add to the base rules:

```scss
  transition: transform var(--dur-micro) var(--ease-mech);
```

2px matches the shift used by `ModeNav`, `DataTable` and the command palette. `transform` does not reflow; `padding` does.

- [ ] **Step 3: Give the thumbnails a transition**

In `project-detail-page.scss`, add to `.detail__thumb`:

```scss
  transition: border-color var(--dur-micro) var(--ease-mech);
```

- [ ] **Step 4: Run tests, build, commit**

```bash
git add -A
git commit -m "fix(motion): snap primary controls, stop rows reflowing on hover"
```

---

## Task M9: Make the shell's affordances honest

Four shell defects that share one cause — an element that reports something it does not actually know.

**Files:**
- Modify: `src/app/app.ts`, `app.html`, `app.scss`, `app.spec.ts`

### Why

**First, a bug already shipped.** The bottom bar advertises `ESC BACK` and Escape does not navigate back — it only closes the command palette. An advertised binding that does nothing undermines the operator fiction *more* than an absent one would. This has been live since the shell was built and every review passed it.

**Second, the wordmark is not a link.** `hazel.exe` renders as a bare `<span>`. In the mockup it carries `cursor: pointer` and `onClick={goHome}` — the wordmark is the home affordance, which is the one navigation convention every visitor already knows. Ours dropped it. This matters most on mobile, where the mode rail is `display: none` and the only route home is the command palette.

**Third, the mode rail lies on a 404.** `activeMode` falls back to `'home'` for any URL it cannot match, so a request for a record that does not exist highlights `01 HOME` — the instrument reporting a location you are not at. Found while verifying M3 in a browser.

**Fourth**, four instrumented edges where the only changing value is a clock is a bezel with nothing behind it. A log line is the machine narrating itself — it is what makes an interface feel like it *remembers* what you did rather than merely re-rendering.

### The mode rail, specifically

In `app.ts`, `activeMode` currently ends `return match?.id ?? 'home';`. That fallback is wrong for two different reasons at once — it is right for `/`, which genuinely is HOME, and wrong for `/nonsense`, which is nowhere. Distinguish them:

```typescript
  activeMode = computed(() => {
    const url = this.currentUrl();
    const path = url.split('?')[0].split('#')[0];
    if (path === '/') return 'home';
    const match = this.modes
      .filter((m) => m.route !== '/' && path.startsWith(m.route))
      .sort((a, b) => b.route.length - a.route.length)[0];
    // No fallback: an unmatched URL is not a mode, and the rail should show
    // nothing rather than claim a location.
    return match?.id ?? '';
  });
```

The query/hash stripping changes no current behaviour — every existing route still matches by prefix with or without it. It is there so this function and `envWordFor` answer the same question the same way; two route matchers in one shell that disagree about what a URL is would be a bug waiting for a route with a query string.

Add a spec:

```typescript
  it('highlights no mode when the route matches none', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/definitely-not-a-route');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeMode()).toBe('');
  });
```

### The wordmark, specifically

In `app.html`, replace the wordmark span with a `routerLink`:

```html
    <a barLeft class="app__wordmark" routerLink="/" aria-label="hazel.exe — home"
      >hazel<span class="app__ext">.exe</span></a
    >
```

`RouterLink` is already imported by `App`. In `app.scss`, add to the existing `.app__wordmark` rule:

```scss
  text-decoration: none;
  cursor: pointer;
```

and a hover state that does not reflow — the `.exe` is already `--signal-active`, so brighten the stem rather than moving anything:

```scss
.app__wordmark:hover .app__ext,
.app__wordmark:focus-visible .app__ext {
  color: var(--signal-active-strong);
}
```

The `aria-label` is deliberate: the visible text "hazel.exe" names the site but not the destination, and a link whose accessible name does not say where it goes is a WCAG 2.4.4 failure in spirit even when it passes in letter.

Add a spec:

```typescript
  it('makes the wordmark a link home', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const mark = (fixture.nativeElement as HTMLElement).querySelector('.app__wordmark');
    expect(mark?.tagName).toBe('A');
    expect(mark?.getAttribute('href')).toBe('/');
  });
```

- [ ] **Step 1: Write the failing tests**

```typescript
  it('does not advertise a keybinding it does not implement', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const hints = (fixture.nativeElement as HTMLElement).querySelector('.app__hints');
    expect(hints?.textContent).not.toContain('ESC BACK');
  });

  it('narrates navigation in the bottom bar', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const log = (fixture.nativeElement as HTMLElement).querySelector('.app__log');
    expect(log).toBeTruthy();
  });
```

- [ ] **Step 2: Resolve the ESC BACK lie**

**Remove the hint**, rather than implementing Escape-navigates-back. Escape already has a meaning in this interface — it closes the palette — and overloading one key with two behaviours depending on hidden state is worse than dropping the claim. Delete that `<span class="app__hint">ESC BACK</span>`.

- [ ] **Step 3: Add the log**

In `app.ts`:

```typescript
  private readonly entries = signal<string[]>([]);
  lastLog = computed(() => this.entries()[0] ?? '');

  private note(message: string): void {
    // Stamped from the shared clock signal rather than a fresh Date, so the
    // two instruments in the bar can never disagree about the time.
    const stamp = this.clock();
    this.entries.update((all) => [`${stamp} ${message}`, ...all].slice(0, 5));
  }
```

Call `note()` on `NavigationEnd` (`'NAV ' + url`) and on palette command execution (`'EXEC ' + id`).

In `app.html`, in the bottom bar's `barRight` slot:

```html
    <span barRight class="app__log">{{ lastLog() }}</span>
```

In `app.scss`:

```scss
.app__log {
  max-width: 40ch;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-faint);
}
```

- [ ] **Step 4: Make SYNC mean something**

M4 Step 5b's SYNC readout is a hardcoded `value="04ms"` that flickers but never changes — a decal that twitches. Make it a computed that varies per navigation, seeded deterministically so prerendered output stays stable:

```typescript
  // Derived from the URL, not random: prerender and hydration must agree.
  sync = computed(() => {
    const url = this.currentUrl();
    let hash = 0;
    for (let i = 0; i < url.length; i++) hash = (hash * 31 + url.charCodeAt(i)) | 0;
    return `${String((Math.abs(hash) % 8) + 2).padStart(2, '0')}ms`;
  });
```

Bind `[value]="sync()"`.

- [ ] **Step 5: Run tests, build, commit**

```bash
git add -A
git commit -m "feat(motion): bottom-bar event log, honest keybinding hints, live SYNC"
```

---

## Notes for the executor

- **Never push.** Every task commits locally to `redesign/kairo`.
- **The `-a`/`-b` keyframe duplication is deliberate.** If a reviewer or linter suggests collapsing them, that would silently stop every route transition from animating. It is commented in the source; leave it.
- **The boot overlay must never appear in prerendered HTML.** That is asserted by a test and verified by a grep in M4. If you find yourself making `booting` default to `true`, stop — it would put a full-screen panel into the static HTML and hide the site whenever JavaScript fails.
- **Reduced motion is the area where the source mockup is weakest.** It uses a blanket `*{animation-duration:0ms}`, which is wrong for loops. Do not copy it.
- **Visual verification is the controller's.** You have no browser. Verify built HTML and computed styles; do not claim to have looked at the page.
