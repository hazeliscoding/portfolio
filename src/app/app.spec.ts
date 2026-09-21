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
});
