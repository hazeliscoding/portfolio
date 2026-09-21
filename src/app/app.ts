import {
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  signal,
  viewChild,
} from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
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
