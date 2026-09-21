import {
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { SystemBar } from './ui/windows/system-bar/system-bar';
import { ModeNav } from './ui/windows/mode-nav/mode-nav';
import { Readout } from './ui/core/readout/readout';
import { CommandPalette } from './ui/overlays/command-palette/command-palette';
import { Boot } from './ui/boot/boot';
import { MotionService } from './ui/motion/motion.service';
import { COMMANDS, MODES, envWordFor } from './core/navigation';

const CLOCK_PLACEHOLDER = '--:--:--';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, SystemBar, ModeNav, Readout, CommandPalette, Boot],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  modes = MODES;
  commands = COMMANDS;

  motion = inject(MotionService);
  booting = signal(false);

  paletteOpen = signal(false);
  clock = signal(CLOCK_PLACEHOLDER);

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

  envWord = computed(() => envWordFor(this.currentUrl()));

  pathLabel = computed(() => {
    const active = this.modes.find((m) => m.id === this.activeMode());
    // 'NULL', not 'HOME': activeMode() can now return '' for an unmatched
    // URL, and the path readout claiming HOME on a 404 would be the same
    // lie the rail was just fixed for. 'NULL' matches envWordFor's own
    // fallback for this exact class of URL, so the two instruments agree.
    return active ? active.label : 'NULL';
  });

  private readonly entries = signal<string[]>([]);
  lastLog = computed(() => this.entries()[0] ?? '');

  // Derived from the URL, not random: prerender and hydration must agree.
  sync = computed(() => {
    const url = this.currentUrl();
    let hash = 0;
    for (let i = 0; i < url.length; i++) hash = (hash * 31 + url.charCodeAt(i)) | 0;
    return `${String((Math.abs(hash) % 8) + 2).padStart(2, '0')}ms`;
  });

  private currentUrl = signal('/');

  private readonly mainEl = viewChild<ElementRef<HTMLElement>>('mainRegion');
  private readonly scrollOffsets = new Map<string, number>();
  // Set by the popstate listener below; consumed and cleared in
  // handleScrollFor. True only for actual Back/Forward navigation.
  private poppedState = false;

  constructor(private router: Router) {
    this.currentUrl.set(this.router.url);
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.recordScrollOffset();
      }
      this.currentUrl.set(this.router.url);
      if (event instanceof NavigationEnd) {
        this.handleScrollFor(event);
        this.note('NAV ' + event.urlAfterRedirects);
      }
    });

    // Never during prerender: a live clock would differ between the server
    // render and hydration and blow up the DOM match. Same reasoning for the
    // popstate listener — it is browser-only and must not run at render time.
    afterNextRender(() => {
      this.tick();
      setInterval(() => this.tick(), 1000);
      window.addEventListener('popstate', () => {
        this.poppedState = true;
      });

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
    });
  }

  // Snapshots the outgoing route's scroll offset before the URL changes, so
  // it can be restored if the user comes back via Back/Forward.
  private recordScrollOffset(): void {
    const main = this.mainEl()?.nativeElement;
    if (!main) return;
    this.scrollOffsets.set(this.router.url, main.scrollTop);
  }

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

  /**
   * In-page anchors need handling explicitly for two reasons. The shell is
   * pinned, so native anchor scrolling has no scrollable document to act on.
   * And `<base href="/">` makes a fragment-only URL resolve against the base
   * rather than the document, so an un-prevented `#foo` navigates to `/#foo`.
   * Calling preventDefault solves both.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const anchor = (event.target as HTMLElement | null)?.closest?.('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || !href.startsWith('#') || href === '#') return;

    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      block: 'start',
      behavior: this.prefersReducedMotion() ? 'auto' : 'smooth',
    });

    // Restore the fragment the preventDefault suppressed. The path is written
    // out in full deliberately — a bare '#id' would be resolved against
    // <base href="/"> and navigate to the root, which is the bug this handler
    // exists to prevent.
    history.replaceState(
      history.state,
      '',
      `${location.pathname}${location.search}#${href.slice(1)}`,
    );
  }

  // Browser-only; safe to call from an event handler (never during render).
  // Defaults to respecting motion (i.e. smooth) if matchMedia is unavailable.
  private prefersReducedMotion(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    this.note('EXEC ' + id);
    if (command) this.router.navigateByUrl(command.route);
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    return !!el && ['INPUT', 'TEXTAREA'].includes(el.tagName);
  }

  private tick(): void {
    this.clock.set(new Date().toTimeString().slice(0, 8));
  }

  private note(message: string): void {
    // Stamped from the shared clock signal rather than a fresh Date, so the
    // two instruments in the bar can never disagree about the time.
    const stamp = this.clock();
    this.entries.update((all) => [`${stamp} ${message}`, ...all].slice(0, 5));
  }
}
