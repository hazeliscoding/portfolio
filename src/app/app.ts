import { Component, ElementRef, HostListener, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommandPalette } from './ui/overlays/command-palette/command-palette';
import { MotionService } from './ui/motion/motion.service';
import { COMMANDS, MODES } from './core/navigation';
import { ICONS, SOCIAL } from './core/site';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommandPalette],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  modes = MODES;
  commands = COMMANDS;
  social = SOCIAL;
  searchIcon = ICONS.search;
  year = new Date().getFullYear();

  motion = inject(MotionService);

  paletteOpen = signal(false);

  activeMode = computed(() => {
    const url = this.currentUrl();
    const path = url.split('?')[0].split('#')[0];
    if (path === '/') return 'home';
    const match = this.modes
      .filter((m) => m.route !== '/' && path.startsWith(m.route))
      .sort((a, b) => b.route.length - a.route.length)[0];
    // No fallback: an unmatched URL is not a page, and the header should mark
    // nothing rather than claim a location.
    return match?.id ?? '';
  });

  private currentUrl = signal('/');

  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');
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
      }
    });

    // Browser-only: the listener must not run at render time.
    afterNextRender(() => {
      window.addEventListener('popstate', () => {
        this.poppedState = true;
      });
    });
  }

  // Snapshots the outgoing route's scroll offset before the URL changes, so
  // it can be restored if the user comes back via Back/Forward.
  private recordScrollOffset(): void {
    const el = this.scroller()?.nativeElement;
    if (!el) return;
    this.scrollOffsets.set(this.router.url, el.scrollTop);
  }

  // Restore on Back/Forward, start at the top otherwise.
  private handleScrollFor(event: NavigationEnd): void {
    const el = this.scroller()?.nativeElement;
    if (!el) return;
    const restored = this.scrollOffsets.get(event.urlAfterRedirects);
    el.scrollTop = this.poppedState && restored !== undefined ? restored : 0;
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

  /**
   * ⌘K or `/` opens search, Escape steps one level out, and 1–4 open the four
   * pages. Every branch below the palette check is skipped while the palette is
   * open — typing `3` into the search input must not also navigate.
   */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.paletteOpen.update((open) => !open);
      return;
    }
    if (this.paletteOpen()) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (this.isTypingTarget(event.target)) return;

    if (event.key === '/') {
      event.preventDefault();
      this.paletteOpen.set(true);
      return;
    }
    if (event.key === 'Escape') {
      this.back();
      return;
    }
    const mode = this.modes.find((m) => m.index === '0' + event.key);
    if (mode) {
      event.preventDefault();
      this.router.navigateByUrl(mode.route);
    }
  }

  /**
   * One level out, not history.back(). Landing on a project from a shared link
   * and pressing Escape should reach the projects page, which `history.back()`
   * would not — there is nothing behind that entry.
   */
  private back(): void {
    const path = this.router.url.split('?')[0].split('#')[0];
    if (path === '/') return;
    if (path.startsWith('/portfolio/')) {
      this.router.navigateByUrl('/portfolio');
      return;
    }
    if (path.startsWith('/blog/')) {
      this.router.navigateByUrl('/blog');
      return;
    }
    this.router.navigateByUrl('/');
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
}
