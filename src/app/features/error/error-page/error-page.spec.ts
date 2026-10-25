import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
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

  it('draws the shared 404 card, headed in sentence case', () => {
    expect(el.querySelector('app-record-fault .fault__panel')).toBeTruthy();
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('This page wandered off.');
  });

  it('reads the attempted path off the router instead of hardcoding one', () => {
    const router = TestBed.inject(Router);
    const path = el.querySelector('.key-value__value[data-state="danger"]');
    expect(path?.textContent?.trim()).toBe(router.url);
    expect(el.textContent).toContain('404 Not found');
  });

  it('offers both recovery routes as real links', () => {
    // Every control on this page navigates, so every control is an <a> with an
    // href — middle-clickable, copyable, and announced as a link.
    const links = [...el.querySelectorAll<HTMLAnchorElement>('a.button')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', '/portfolio']);
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Go home', 'See my projects']);
    expect(el.querySelector('.fault__back')?.textContent?.trim()).toBe('← Home');
  });

  it('keeps itself out of search results', () => {
    const robots = TestBed.inject(Meta).getTag("name='robots'");
    expect(robots?.content).toBe('noindex');
    expect(TestBed.inject(Title).getTitle()).toBe('Page not found - Hazel Granados');
  });
});
