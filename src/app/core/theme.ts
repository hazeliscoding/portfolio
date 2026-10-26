import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

/**
 * Where a visitor's choice is kept. Absent means "follow the system", and the
 * inline script in index.html reads the same key before first paint.
 */
export const THEME_KEY = 'theme';

/** The browser's chrome colour for each theme: the page's own background. */
const THEME_COLOR: Record<Theme, string> = { light: '#fbfbfd', dark: '#131219' };

/**
 * Light or dark. The system decides until the visitor toggles, and a toggle
 * back to what the system wants forgets the choice, so the site follows the
 * system again from then on.
 *
 * The colours themselves are CSS (tokens/_colors.scss): this only sets
 * `data-theme` on <html> when the visitor's choice differs from the system.
 * The server renders light, and the toggle's icon comes from CSS too, so the
 * prerendered page never waits on this to look right.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly media = isPlatformBrowser(inject(PLATFORM_ID))
    ? (this.doc.defaultView?.matchMedia('(prefers-color-scheme: dark)') ?? null)
    : null;

  /** The theme on screen. */
  readonly theme = signal<Theme>(this.stored() ?? this.system());

  constructor() {
    if (!this.media) return;
    this.media.addEventListener('change', () => {
      if (this.stored()) return;
      this.theme.set(this.system());
      this.syncChrome();
    });
    this.syncChrome();
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    const apply = () => {
      const root = this.doc.documentElement;
      if (next === this.system()) {
        this.write(null);
        delete root.dataset['theme'];
      } else {
        this.write(next);
        root.dataset['theme'] = next;
      }
      this.theme.set(next);
      this.syncChrome();
    };
    // A cross-fade between the two, where the browser has one and motion is welcome.
    const still = this.doc.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still || !this.doc.startViewTransition) apply();
    else this.doc.startViewTransition(apply);
  }

  private system(): Theme {
    return this.media?.matches ? 'dark' : 'light';
  }

  // Storage can throw (a private window, blocked site data); the theme then
  // simply lasts as long as the page.
  private stored(): Theme | null {
    try {
      const value = this.doc.defaultView?.localStorage.getItem(THEME_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  private write(theme: Theme | null): void {
    try {
      const storage = this.doc.defaultView?.localStorage;
      if (theme) storage?.setItem(THEME_KEY, theme);
      else storage?.removeItem(THEME_KEY);
    } catch {
      // See stored().
    }
  }

  private syncChrome(): void {
    for (const meta of this.doc.querySelectorAll('meta[name="theme-color"]')) {
      meta.setAttribute('content', THEME_COLOR[this.theme()]);
    }
  }
}
