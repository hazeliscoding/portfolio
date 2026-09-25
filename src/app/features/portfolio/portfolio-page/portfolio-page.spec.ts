import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PortfolioPage } from './portfolio-page';
import { projectsData } from '../../../data/projects.data';

describe('PortfolioPage', () => {
  let fixture: ComponentFixture<PortfolioPage>;
  let el: HTMLElement;

  const text = (selector: string) =>
    (el.querySelector(selector)?.textContent ?? '').trim();

  const filterPills = () =>
    Array.from(el.querySelectorAll<HTMLButtonElement>('.archive__filter'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(PortfolioPage);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the ARCHIVE_03 chapter header', () => {
    expect(text('.chapter__code')).toBe('ARCHIVE');
    expect(text('.chapter__index')).toBe('_03');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Projects');
  });

  // Padded to two digits like every other instrument reading; the singular
  // form is covered by the filter test below, where one record survives.
  it('reads the record count in the filter bar and the chapter meta', () => {
    expect(text('.archive__count')).toBe('02 RECORDS RETRIEVED');
    expect(text('.chapter__meta')).toBe('02 RECORDS RETRIEVED');
  });

  it('derives the filters from the real tags, leading with ALL', () => {
    const labels = filterPills().map((b) => b.textContent?.trim());
    const tags = new Set(projectsData.flatMap((p) => p.tags ?? []));

    expect(labels[0]).toBe('[ALL]');
    expect(labels.length).toBe(tags.size + 1);
    expect(labels).toContain('[ELECTRON]');
    expect(labels).toContain('[GITHUB GRAPHQL]');
    expect(filterPills()[0].getAttribute('aria-pressed')).toBe('true');
  });

  it('renders one card per record, linking to the detail route', () => {
    const cards = el.querySelectorAll('a.archive__card');
    expect(cards.length).toBe(projectsData.length);
    expect(cards[0].getAttribute('href')).toBe('/portfolio/pr-sweep');
    expect(cards[1].getAttribute('href')).toBe('/portfolio/animatch');
    expect(el.textContent).toContain('PR Sweep');
    expect(el.textContent).toContain('AniMatch');
  });

  it('labels the viewport with the real screenshot count', () => {
    expect(text('.viewport__label')).toBe('CAM 01 // 04 SHOTS');
    expect(el.querySelector('.viewport__img')?.getAttribute('alt')).toBe(
      'PR Sweep screenshot',
    );
  });

  it('states status, stack and the open affordance in the footer', () => {
    expect(text('.window__foot')).toBe('STATUS : ACTIVE · ELECTRON · ANGULAR · ↵ OPEN');
  });

  // PR Sweep carries eight tags; the card shows five and drops the rest.
  it('shows at most five tags per card', () => {
    const card = el.querySelector('a.archive__card')!;
    expect(card.querySelectorAll('app-badge').length).toBe(5);
    // The sixth tag is the first one dropped.
    expect(card.textContent).not.toContain('Playwright');
  });

  // The design derives `active` from `i === 0`, which dims every other card.
  // Driven by real hover, nothing is hovered on arrival — so no card may be
  // dimmed, and none may claim the accent either.
  it('leaves every card neutral until one is hovered', () => {
    expect(el.querySelector('.window[data-active]')).toBeNull();

    el.querySelector('a.archive__card')!.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    expect(el.querySelector('.window')?.getAttribute('data-active')).toBe('true');

    el.querySelector('a.archive__card')!.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(el.querySelector('.window[data-active]')).toBeNull();
  });

  it('filters on a case-insensitive substring of the record tags', () => {
    const electron = filterPills().find((b) => b.textContent?.trim() === '[ELECTRON]')!;
    electron.click();
    fixture.detectChanges();

    expect(electron.getAttribute('aria-pressed')).toBe('true');
    expect(el.querySelectorAll('a.archive__card').length).toBe(1);
    expect(text('.archive__count')).toBe('01 RECORD RETRIEVED');
  });

  it('retrieves nothing for a term no record carries', () => {
    fixture.componentInstance.pick('MCP');
    fixture.detectChanges();

    expect(el.querySelectorAll('a.archive__card').length).toBe(0);
    expect(text('.archive__count')).toBe('00 RECORDS RETRIEVED');
  });

  // Keyed to the service, not to a literal: the value alternates per
  // navigation, and the point is that the bar re-enters when it flips.
  it('runs the filter bar entrance off the motion service', () => {
    expect(el.querySelector('.archive__filters')?.getAttribute('data-sfx')).toBe(
      fixture.componentInstance.motion.sfx(),
    );
  });

  it('contains no emoji', () => {
    expect(/\p{Extended_Pictographic}/u.test(el.textContent ?? '')).toBe(false);
  });
});
