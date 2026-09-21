import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ErrorPage } from './error-page';

describe('ErrorPage', () => {
  let fixture: ComponentFixture<ErrorPage>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorPage);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reports the failure as a machine report', () => {
    expect(el.textContent).toContain('NO RECORD AT THIS ADDRESS');
  });

  it('renders the alert window variant, focused', () => {
    const window = el.querySelector('[data-variant="alert"]');
    expect(window).toBeTruthy();
    // `active` is what puts the red rule and the corner bracket on the panel.
    // Neutral is the default, and a neutral 404 reads like any other card.
    expect(window?.getAttribute('data-active')).toBe('true');
  });

  it('logs the event in the window footer', () => {
    expect(el.querySelector('.window__foot')?.textContent).toContain(
      'THIS EVENT HAS BEEN LOGGED',
    );
  });

  it('takes its own chapter in the system, not a bare panel', () => {
    expect(el.querySelector('.chapter__code')?.textContent).toBe('ERROR');
    expect(el.querySelector('.chapter__index')?.textContent).toBe('_404');
    expect(el.querySelector('.chapter__meta')?.textContent).toContain('ROUTE ERROR');
  });

  it('reads the attempted path off the router instead of hardcoding one', () => {
    const router = TestBed.inject(Router);
    // The design demo prints a fixed /portfolio/unknown-record. The PATH
    // readout is the one reading on this page that has to be true.
    const path = el.querySelector('.key-value__value[data-state="danger"]');
    expect(path?.textContent?.trim()).toBe(router.url);
    expect(el.textContent).not.toContain('/portfolio/unknown-record');
  });

  it('states the status code as a readout', () => {
    expect(el.textContent).toContain('404 NOT_FOUND');
  });

  it('offers a way back', () => {
    expect(el.querySelector('.chapter__back')?.textContent).toContain('HOME_01');
  });

  it('offers both recovery routes as real links', () => {
    // Every control on this page navigates, so every control is an <a> with an
    // href — middle-clickable, copyable, and announced as a link. They were
    // <button>s wired to the router until Button grew a link mode.
    const home = el.querySelector<HTMLAnchorElement>('a.button[data-variant="primary"]');
    const archive = el.querySelector<HTMLAnchorElement>('a.button[data-variant="command"]');
    expect(home?.textContent).toContain('Home >');
    expect(home?.getAttribute('href')).toBe('/');
    expect(archive?.textContent).toContain('Open archive');
    expect(archive?.getAttribute('href')).toBe('/portfolio');
  });

  it('leaves the command variant to draw its own brackets', () => {
    // The brackets are ::before/::after in button.scss so they sit tight
    // against the label. Passing "[Open archive]" would print [[Open archive]].
    const archive = el.querySelector('.button[data-variant="command"] .button__label');
    expect(archive?.textContent).toBe('Open archive');
  });

  it('leaves environmental type to the shell', () => {
    // The shell renders one oversized background word per route (404 here).
    // A second one owned by the page put two of them on screen at once.
    expect(el.querySelector('.error__env')).toBeNull();
  });

  it('contains no emoji', () => {
    const text = el.textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
