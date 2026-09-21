import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
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
    expect(center.children.length).toBe(2);
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
});
