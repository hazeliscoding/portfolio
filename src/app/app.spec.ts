import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { ThemeService } from './core/theme';

// Stub target for the shared wildcard route, standing in for the real
// app.routes.ts catch-all `**` -> ErrorPage. `activeMode()` is a pure function
// of the URL string, so which component the route renders is immaterial to
// what these specs assert.
@Component({ selector: 'app-test-not-found-stub', template: '', standalone: true })
class NotFoundStub {}

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      // A wildcard, not an empty table. `provideRouter([])` cannot match any
      // URL, so any spec that navigates throws NG04002 before the component
      // sees anything — and the real app.routes.ts has a `**` catch-all for
      // exactly this reason. One shared stub keeps every navigating spec on
      // the same setup.
      providers: [provideRouter([{ path: '**', component: NotFoundStub }])],
    }).compileComponents();
  });

  function render() {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('should create the app', () => {
    expect(render().fixture.componentInstance).toBeTruthy();
  });

  it('renders a header, the page and a footer as landmarks', () => {
    const { el } = render();
    expect(el.querySelector('header.site-header')).toBeTruthy();
    expect(el.querySelector('main.main')).toBeTruthy();
    expect(el.querySelector('footer.site-footer')).toBeTruthy();
    // Outside <main>, or the header and footer lose their banner and
    // contentinfo roles.
    expect(el.querySelector('main header, main footer.site-footer')).toBeNull();
  });

  it('makes the wordmark a link home', () => {
    const mark = render().el.querySelector('.site-header .wordmark');
    expect(mark?.tagName).toBe('A');
    expect(mark?.getAttribute('href')).toBe('/');
    expect(mark?.textContent).toContain('hazeliscoding');
  });

  it('links the four pages from the header and marks the current one', async () => {
    const { fixture, el } = render();
    const links = el.querySelectorAll('.site-nav__link');
    expect([...links].map((a) => a.textContent?.trim())).toEqual(['Home', 'About', 'Projects', 'Blog']);

    await TestBed.inject(Router).navigateByUrl('/blog/some-post');
    fixture.detectChanges();
    const current = el.querySelectorAll('.site-nav__link[aria-current="page"]');
    expect(current.length).toBe(1);
    expect(current[0].textContent?.trim()).toBe('Blog');
  });

  it('highlights no page when the route matches none', async () => {
    const { fixture } = render();
    await TestBed.inject(Router).navigateByUrl('/definitely-not-a-route');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeMode()).toBe('');
  });

  it('opens a page on 1–4 and steps one level out on Escape', async () => {
    const { fixture } = render();
    const router = TestBed.inject(Router);

    document.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));
    await fixture.whenStable();
    expect(router.url).toBe('/portfolio');

    // One level out, not history.back().
    await router.navigateByUrl('/portfolio/anything');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(router.url).toBe('/portfolio');
  });

  it('does not navigate on 1–4 while the palette has the keyboard', async () => {
    const { fixture } = render();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');

    fixture.componentInstance.paletteOpen.set(true);
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));
    await fixture.whenStable();
    expect(router.url).toBe('/');
  });

  it('keeps the palette closed until asked', () => {
    expect(render().el.querySelector('.palette')).toBeNull();
  });

  it('opens the palette on ctrl+k', () => {
    const { fixture, el } = render();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    fixture.detectChanges();
    expect(el.querySelector('.palette')).toBeTruthy();
  });

  it('opens the palette from the search button, which is a real touch target on phones', () => {
    const { fixture, el } = render();
    const btn = el.querySelector('.search-key') as HTMLButtonElement;
    expect(btn.tagName.toLowerCase()).toBe('button');
    expect(btn.textContent).toContain('Search');
    expect(parseInt(getComputedStyle(btn).minHeight, 10)).toBeGreaterThanOrEqual(40);
    btn.click();
    fixture.detectChanges();
    expect(el.querySelector('.palette')).toBeTruthy();
  });

  it('offers a theme toggle beside search that says which theme is on', () => {
    const { fixture, el } = render();
    const theme = TestBed.inject(ThemeService);
    const btn = el.querySelector('.site-tools .theme-toggle') as HTMLButtonElement;
    expect(btn.getAttribute('aria-label')).toBe('Dark theme');
    expect(btn.getAttribute('aria-pressed')).toBe(String(theme.theme() === 'dark'));
    // Both icons are in the page; CSS shows one, so they stay out of the name.
    expect([...btn.querySelectorAll('svg')].every((svg) => svg.getAttribute('aria-hidden') === 'true')).toBe(true);

    const toggle = spyOn(theme, 'toggle');
    btn.click();
    fixture.detectChanges();
    expect(toggle).toHaveBeenCalled();
  });

  it('lists the ways to reach Hazel in the footer, flagging the ones that open a tab', () => {
    const links = [...render().el.querySelectorAll<HTMLAnchorElement>('.site-footer__link')];
    expect(links.map((a) => a.textContent?.replace(/\(opens in a new tab\)/, '').trim())).toEqual([
      'GitHub',
      'LinkedIn',
      'Say hello',
      'RSS',
      'Ko-fi',
      'Résumé',
    ]);
    for (const a of links) {
      const external = a.getAttribute('target') === '_blank';
      expect(a.textContent?.includes('opens in a new tab')).toBe(external);
    }
  });

  it('offers a skip link to the page content', () => {
    const skip = render().el.querySelector('.app__skip');
    expect(skip?.getAttribute('href')).toBe('#main');
  });

  it('pins the shell to the viewport rather than growing with content', () => {
    const app = render().el.querySelector('.app') as HTMLElement;
    expect(getComputedStyle(app).height).not.toBe('auto');
  });

  it('makes the shell the scroll container, not the document', () => {
    const style = getComputedStyle(render().el.querySelector('.app') as HTMLElement);
    expect(style.overflowY).toBe('auto');
    expect(style.overflowX).toBe('hidden');
  });

  it('scrolls in-page anchors within the shell rather than navigating', () => {
    const { el } = render();
    const target = document.createElement('div');
    target.id = 'anchor-probe';
    el.querySelector('.main')?.appendChild(target);

    const anchor = document.createElement('a');
    anchor.setAttribute('href', '#anchor-probe');
    el.querySelector('.main')?.appendChild(anchor);

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores anchors that are not in-page', () => {
    const { el } = render();
    const anchor = document.createElement('a');
    // Not `href="/portfolio"`: TestBed attaches the fixture to the live
    // document, so a real, un-prevented `<a>` click actually navigates the
    // Karma runner itself away. `javascript:void(0)` exercises the same code
    // path in the handler (a present href that does not start with `#`)
    // without moving the document.
    anchor.setAttribute('href', 'javascript:void(0)');
    el.querySelector('.main')?.appendChild(anchor);

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('restores the fragment in the URL without navigating', () => {
    const { el } = render();
    const main = el.querySelector('.main') as HTMLElement;

    const target = document.createElement('div');
    target.id = 'hash-probe';
    main.appendChild(target);
    const anchor = document.createElement('a');
    anchor.setAttribute('href', '#hash-probe');
    main.appendChild(anchor);

    const pathBefore = location.pathname;
    anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(location.hash).toBe('#hash-probe');
    expect(location.pathname).toBe(pathBefore);
  });

  it('exposes the motion sequence on the shell for CSS to select on', () => {
    expect(render().el.querySelector('.app')?.getAttribute('data-sfx')).toBe('a');
  });
});
