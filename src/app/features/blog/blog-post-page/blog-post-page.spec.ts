import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BlogPostPage } from './blog-post-page';

describe('BlogPostPage', () => {
  let fixture: ComponentFixture<BlogPostPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(new Map([['slug', 'hello-world']])) },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BlogPostPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the LOG chapter header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('LOG');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_04');
  });

  it('renders the post title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Hello, World!');
  });

  it('renders the rendered markdown into the reading column', () => {
    const el = fixture.nativeElement as HTMLElement;
    const body = el.querySelector('.post__body');
    expect(body?.innerHTML.length).toBeGreaterThan(0);
  });

  it('builds a CONTENTS inspector from the post headings', () => {
    const el = fixture.nativeElement as HTMLElement;
    const contents = el.querySelector('.post__contents');
    expect(contents).toBeTruthy();
    expect(contents?.textContent).toContain('optimizing for');
    // marked HTML-escapes heading text (e.g. an apostrophe becomes &#39;);
    // the CONTENTS list must render the decoded text, not the raw entity.
    expect(contents?.textContent).not.toContain('&#');
  });

  it('links each CONTENTS entry to the heading id emitted in the rendered markup', () => {
    const el = fixture.nativeElement as HTMLElement;
    const body = el.querySelector('.post__body');
    const headingIds = Array.from(body?.querySelectorAll('h2, h3') ?? []).map((h) =>
      h.getAttribute('id'),
    );
    expect(headingIds.length).toBeGreaterThan(0);
    expect(headingIds.every((id) => !!id)).toBe(true);

    const contents = el.querySelector('.post__contents');
    const hrefs = Array.from(contents?.querySelectorAll('a') ?? []).map((a) =>
      a.getAttribute('href'),
    );
    for (const id of headingIds) {
      expect(hrefs).toContain('#' + id);
    }
  });

  it('renders a RECORD inspector with the date and tags', () => {
    const el = fixture.nativeElement as HTMLElement;
    const record = el.querySelector('.post__record')?.textContent ?? '';
    expect(record).toContain('DATE');
    expect(record).toContain('2026-01-16');
  });

  it('offers a way back to the log', () => {
    const el = fixture.nativeElement as HTMLElement;
    const back = el.querySelector('a[href="/blog"]');
    expect(back?.textContent).toContain('BACK');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
