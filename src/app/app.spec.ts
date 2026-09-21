import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';

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

  it('highlights no mode when the route matches none', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/definitely-not-a-route');
    fixture.detectChanges();
    expect(fixture.componentInstance.activeMode()).toBe('');
  });

  it('makes the wordmark a link home', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const mark = (fixture.nativeElement as HTMLElement).querySelector('.app__wordmark');
    expect(mark?.tagName).toBe('A');
    expect(mark?.getAttribute('href')).toBe('/');
  });

  it('does not advertise a keybinding it does not implement', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const hints = (fixture.nativeElement as HTMLElement).querySelector('.app__hints');
    expect(hints?.textContent).not.toContain('ESC BACK');
  });

  it('narrates navigation in the bottom bar', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const log = (fixture.nativeElement as HTMLElement).querySelector('.app__log');
    expect(log).toBeTruthy();

    // Asserting the element exists proves nothing about narration — it would
    // pass against a log wired to nothing at all. Navigate and require the
    // text to name where we went.
    const before = log?.textContent ?? '';
    await TestBed.inject(Router).navigateByUrl('/blog');
    fixture.detectChanges();
    const after = log?.textContent ?? '';
    expect(after).not.toBe(before);
    expect(after).toContain('NAV /blog');
  });

  it('keeps the log out of the accessibility tree, so it never interrupts', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const log = (fixture.nativeElement as HTMLElement).querySelector('.app__log');
    expect(log?.closest('[role="status"], [aria-live]')).toBeNull();
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

  it('projects each readout as a direct slot child so the bar gap applies', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const center = (fixture.nativeElement as HTMLElement).querySelector(
      '.system-bar__center',
    ) as HTMLElement;
    // 4, not 2: M4 adds a SYNC readout and a typing path readout to this same
    // centre slot (Step 5b), alongside the pre-existing NET and LOC readouts.
    expect(center.children.length).toBe(4);
    expect(center.children[0].tagName.toLowerCase()).toBe('app-readout');
  });

  it('offers a touch-reachable way to open the palette', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector('.app__command') as HTMLButtonElement;
    expect(btn).toBeTruthy();
    expect(btn.tagName.toLowerCase()).toBe('button');
    btn.click();
    fixture.detectChanges();
    expect(el.querySelector('.palette')).toBeTruthy();
  });

  it('vertically centres the bottom bar items', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const hints = (fixture.nativeElement as HTMLElement).querySelector(
      '.app__hints',
    ) as HTMLElement;
    expect(getComputedStyle(hints).alignItems).toBe('center');
  });

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

  it('scrolls in-page anchors within the content region rather than navigating', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    const target = document.createElement('div');
    target.id = 'anchor-probe';
    host.querySelector('.main')?.appendChild(target);

    const anchor = document.createElement('a');
    anchor.setAttribute('href', '#anchor-probe');
    host.querySelector('.main')?.appendChild(anchor);

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('ignores anchors that are not in-page', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const anchor = document.createElement('a');
    // Not `href="/portfolio"`: TestBed attaches the fixture to the live
    // document, so a real, un-prevented `<a>` click actually navigates the
    // Karma runner itself away (confirmed while capturing RED — it 404s and
    // disconnects the browser mid-suite). `javascript:void(0)` exercises the
    // exact same code path in the handler (a present href that does not
    // start with `#`) without moving the document.
    anchor.setAttribute('href', 'javascript:void(0)');
    host.querySelector('.main')?.appendChild(anchor);

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
  });

  it('restores the fragment in the URL without navigating', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const main = host.querySelector('.main') as HTMLElement;

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

  it('renders the environmental word at page level, hidden from assistive tech', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const env = (fixture.nativeElement as HTMLElement).querySelector('.app__env');
    expect(env).toBeTruthy();
    expect(env?.getAttribute('aria-hidden')).toBe('true');
  });

  it('starts with the boot overlay off, so the first render pass has no overlay', () => {
    const fixture = TestBed.createComponent(App);
    // Checked before the first `detectChanges()`, not after: Angular 21's
    // `afterNextRender` callback runs synchronously as part of the render
    // that `detectChanges()` triggers (only the resulting template re-render
    // is deferred), so by the time `detectChanges()` returns, `booting()`
    // has already flipped to `true` even though the DOM has not caught up
    // yet. Measured directly — `fixture.componentInstance.booting()` reads
    // `true` immediately after the first `detectChanges()` call, before any
    // `whenStable()`.
    //
    // Be clear about what this next line is worth: run before any change
    // detection, it is close to asserting a field initialiser, and it would
    // pass against a component whose reduced-motion gate was broken. It is
    // documentation of the starting state, not regression coverage. The
    // weight is carried by the DOM query below, by the paired
    // `mounts the boot overlay once the browser has rendered` spec, and
    // above all by the build-time grep of the prerendered HTML, which an
    // absent feature cannot satisfy.
    expect(fixture.componentInstance.booting()).toBe(false);
    fixture.detectChanges();
    // This is NOT proof of prerender safety on its own — it would pass
    // against a component that never mounts the overlay at all. The real
    // proof is Step 6's grep of the prerendered HTML, which cannot be
    // satisfied by an absent feature.
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

  it('renders the instrumentation readouts the motion animates', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.app__sync')).toBeTruthy();
    expect(el.querySelector('.app__path')?.textContent).toContain('HAZEL.EXE');
  });
});
