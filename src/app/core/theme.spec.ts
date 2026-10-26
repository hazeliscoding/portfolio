import { TestBed } from '@angular/core/testing';

import { THEME_KEY, ThemeService } from './theme';

describe('ThemeService', () => {
  const root = document.documentElement;
  // The test browser's own preference, which the service treats as "the system".
  const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const other = system === 'dark' ? 'light' : 'dark';
  let meta: HTMLMetaElement;

  const make = () => {
    TestBed.resetTestingModule();
    return TestBed.inject(ThemeService);
  };

  beforeEach(() => {
    localStorage.removeItem(THEME_KEY);
    delete root.dataset['theme'];
    meta = document.head.appendChild(Object.assign(document.createElement('meta'), { name: 'theme-color' }));
    // Runs the change at once, so each test reads the result straight after toggling.
    spyOn(document, 'startViewTransition').and.callFake(((update: () => void) => {
      update();
      return {} as ViewTransition;
    }) as typeof document.startViewTransition);
  });

  afterEach(() => {
    localStorage.removeItem(THEME_KEY);
    delete root.dataset['theme'];
    meta.remove();
  });

  it('follows the system until the visitor chooses', () => {
    const theme = make();
    expect(theme.theme()).toBe(system);
    expect(root.dataset['theme']).toBeUndefined();
  });

  it('keeps a choice that differs from the system, and marks the page with it', () => {
    const theme = make();
    theme.toggle();
    expect(theme.theme()).toBe(other);
    expect(localStorage.getItem(THEME_KEY)).toBe(other);
    expect(root.dataset['theme']).toBe(other);
  });

  // Toggling back to what the system wants is no choice at all, so the site
  // follows the system again, including when it changes later.
  it('forgets the choice once it matches the system again', () => {
    const theme = make();
    theme.toggle();
    theme.toggle();
    expect(theme.theme()).toBe(system);
    expect(localStorage.getItem(THEME_KEY)).toBeNull();
    expect(root.dataset['theme']).toBeUndefined();
  });

  it('starts from a stored choice', () => {
    localStorage.setItem(THEME_KEY, other);
    expect(make().theme()).toBe(other);
  });

  it('ignores a stored value that is not a theme', () => {
    localStorage.setItem(THEME_KEY, 'sepia');
    expect(make().theme()).toBe(system);
  });

  it('paints the browser chrome in the theme on screen', () => {
    const theme = make();
    theme.toggle();
    expect(meta.content).toBe(theme.theme() === 'dark' ? '#131219' : '#fbfbfd');
  });
});
