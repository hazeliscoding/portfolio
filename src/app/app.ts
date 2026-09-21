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
