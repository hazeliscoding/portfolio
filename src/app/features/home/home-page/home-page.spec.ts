import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HomePage } from './home-page';
import { count } from '../../../core/count';
import { ossStats } from '../../../data/oss-stats.generated';
import { blogPosts } from '../../../data/blog-posts.generated';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let el: HTMLElement;

  /** Every window carries its title as the section's aria-label. */
  const win = (title: string) => el.querySelector<HTMLElement>(`[aria-label="${title}"]`)!;
  const text = (node: Element | null | undefined) => node?.textContent?.trim() ?? '';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the HOME_01 chapter header with the last-update reading', () => {
    expect(text(el.querySelector('.chapter__code'))).toBe('HOME');
    expect(text(el.querySelector('.chapter__index'))).toBe('_01');
    expect(text(el.querySelector('.chapter__meta'))).toBe('LAST UPDATE 2026-09-20');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Hazel Granados');
  });

  // The design has six windows and no separate contact panel — contact lives
  // in the Operator readout. The order is the reading order of the two
  // columns, not the window numbering.
  it('renders exactly the six design windows, in column order', () => {
    const titles = Array.from(el.querySelectorAll('.window__title')).map(text);
    expect(titles).toEqual([
      'Operator',
      'Services',
      'Open source',
      'Stack',
      'Featured projects',
      'Log',
    ]);
  });

  it('puts the contact details in the Operator readout rather than a panel', () => {
    const values = Array.from(win('Operator').querySelectorAll('.key-value__value')).map(text);
    expect(values).toContain('hazel.granados@protonmail.com');
    expect(values).toContain('hazeliscoding');
    expect(values).toContain('hazelgranados');
  });

  it('offers the contact and dossier controls', () => {
    const labels = Array.from(win('Operator').querySelectorAll('.button__label')).map(text);
    expect(labels).toEqual(['Contact >', 'Dossier']);
  });

  it('renders every featured record as a link into the archive', () => {
    const records = Array.from(el.querySelectorAll('a.home__record'));
    expect(records.length).toBe(1);
    expect(records[0].getAttribute('href')).toBe('/portfolio/pr-sweep');
    expect(text(records[0].querySelector('.home__record-title'))).toBe('PR Sweep');
    expect(text(records[0].querySelector('.home__record-idx'))).toBe('01');
  });

  it('counts the records it actually rendered', () => {
    const rows = el.querySelectorAll('.home__record').length;
    expect(text(win('Featured projects').querySelector('.window__context'))).toBe(
      count(rows, 'RECORD', 'RECORDS'),
    );
  });

  it('counts the stack modules it actually rendered', () => {
    const badges = win('Stack').querySelectorAll('.badge').length;
    expect(text(win('Stack').querySelector('.window__context'))).toBe(
      count(badges, 'MODULE', 'MODULES'),
    );
  });

  it('tones the first three stack entries as core modules', () => {
    const tones = Array.from(win('Stack').querySelectorAll('.badge')).map((b) =>
      b.getAttribute('data-tone'),
    );
    expect(tones.slice(0, 3)).toEqual(['info', 'info', 'info']);
    expect(tones.slice(3).every((tone) => tone === 'neutral')).toBe(true);
  });

  it('counts the services it actually rendered, padded to two digits', () => {
    const rows = el.querySelectorAll('.home__service').length;
    expect(text(win('Services').querySelector('.window__context'))).toBe(
      String(rows).padStart(2, '0'),
    );
  });

  it('reports the open-source stats from the generated file', () => {
    const values = Array.from(win('Open source').querySelectorAll('.key-value__value')).map(text);
    expect(Number(values[0])).toBe(ossStats.totalMergedPrs);
    expect(values[0]).toMatch(/^\d\d/);
    expect(Number(values[1])).toBe(ossStats.projectCount);
    expect(text(win('Open source').querySelector('.window__foot'))).toBe(
      `UPDATED ${ossStats.updated}`,
    );
  });

  // Truncated, not rounded: the panel must never claim more stars than the
  // generated stats hold.
  it('abbreviates the star count without rounding it up', () => {
    const shown = text(win('Open source').querySelectorAll('.key-value__value')[2]);
    const stars = parseFloat(shown) * (shown.endsWith('k') ? 1000 : 1);
    expect(stars).toBeLessThanOrEqual(ossStats.totalStars);
    expect(stars).toBeGreaterThan(ossStats.totalStars - 100);
  });

  it('links each open-source row to its merged-PR search', () => {
    const links = Array.from(win('Open source').querySelectorAll('a.home__oss-name'));
    expect(links.length).toBe(ossStats.projects.length);
    expect(links[0].getAttribute('href')).toBe(ossStats.projects[0].url);
    expect(links[0].getAttribute('rel')).toBe('noopener');
  });

  it('renders every log entry as a link, dated and tagged', () => {
    const rows = Array.from(el.querySelectorAll('a.home__log-row'));
    expect(rows.length).toBe(blogPosts.length);
    expect(rows[0].getAttribute('href')).toBe(`/blog/${blogPosts[0].slug}`);
    expect(text(rows[0].querySelector('.home__log-date'))).toBe(blogPosts[0].date);
    expect(text(rows[0].querySelector('.home__log-tags'))).toBe(
      blogPosts[0].tags.map((tag) => tag.toUpperCase()).join(' · '),
    );
  });

  it('contains no emoji', () => {
    const content = el.textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(content)).toBe(false);
  });

  it('lays record and log rows out on the design grid', () => {
    const record = el.querySelector('.home__record') as HTMLElement;
    const log = el.querySelector('.home__log-row') as HTMLElement;
    expect(getComputedStyle(record).display).toBe('grid');
    expect(getComputedStyle(log).display).toBe('grid');
  });

  it('leads the log row with the date', () => {
    const row = el.querySelector('.home__log-row') as HTMLElement;
    expect(row.firstElementChild?.classList.contains('home__log-date')).toBe(true);
  });

  // The Operator window is the one that owns attention on this screen; the
  // rest are neutral. Painting an accent on all six is the failure this input
  // exists to prevent, so only the two the design marks may carry it.
  it('focuses only the Operator and Featured projects windows', () => {
    const focused = Array.from(el.querySelectorAll('[data-active="true"]')).map((w) =>
      w.getAttribute('aria-label'),
    );
    expect(focused).toEqual(['Operator', 'Featured projects']);
  });
});
