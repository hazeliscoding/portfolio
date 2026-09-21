import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BlogPage } from './blog-page';
import { blogPosts } from '../../../data/blog-posts.generated';

describe('BlogPage', () => {
  let fixture: ComponentFixture<BlogPage>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(BlogPage);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  const rows = () => Array.from(el.querySelectorAll('.log__row'));

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the LOG_04 chapter header', () => {
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('LOG');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_04');
  });

  // Literal, because the repository ships exactly one post today and a test
  // that recomputes the string from `count()` would pass whatever the page
  // printed. Update it when a second entry lands — "2 ENTRIES" is the proof
  // the plural is coming from the helper.
  it('reports the entry count in the chapter meta', () => {
    expect(el.querySelector('.chapter__meta')?.textContent?.trim()).toBe('1 ENTRY');
  });

  // The design's meta reads "3 ENTRIES · RSS". This site serves no feed, and
  // the header must not advertise one.
  it('does not claim an RSS feed', () => {
    expect(el.textContent).not.toContain('RSS');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Blog');
  });

  it('introduces the log', () => {
    expect(el.querySelector('.log__intro')?.textContent?.trim()).toBe(
      'Short notes about building, learning, and shipping software.',
    );
  });

  it('renders the entries as one active, unpadded dialogue panel', () => {
    const win = el.querySelector('.window') as HTMLElement;
    expect(win.getAttribute('data-variant')).toBe('dialogue');
    expect(win.getAttribute('data-active')).toBe('true');
    expect(win.style.animationDelay).toBe('60ms');
    expect(
      el.querySelector('.window__body')?.classList.contains('window__body--padded'),
    ).toBe(false);
    expect(el.querySelector('.window__foot')?.textContent).toContain('OPEN ENTRY');
  });

  it('renders one row per post', () => {
    expect(rows().length).toBe(blogPosts.length);
  });

  it('links the whole row to its entry', () => {
    expect(rows()[0].getAttribute('href')).toBe(`/blog/${blogPosts[0].slug}`);
  });

  it('stamps each row with its date and four-digit entry number', () => {
    const stamp = rows()[0].querySelector('.log__stamp')?.textContent ?? '';
    expect(stamp).toContain(blogPosts[0].date);
    // Entries are numbered oldest-first, so the last row is always 0001.
    const all = rows();
    const last = all[all.length - 1].querySelector('.log__stamp')?.textContent ?? '';
    expect(last).toContain('0001');
  });

  it('renders the title and description of each entry', () => {
    expect(rows()[0].querySelector('.log__title')?.textContent?.trim()).toBe(
      blogPosts[0].title,
    );
    expect(rows()[0].querySelector('.log__desc')?.textContent?.trim()).toBe(
      blogPosts[0].description,
    );
  });

  it('renders every tag as an info badge', () => {
    const badges = Array.from(rows()[0].querySelectorAll('.log__tags .badge'));
    expect(badges.length).toBe(blogPosts[0].tags.length);
    expect(badges[0].getAttribute('data-tone')).toBe('info');
    expect(badges.map((b) => b.textContent?.trim())).toEqual(blogPosts[0].tags);
  });

  it('contains no emoji', () => {
    const text = el.textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
