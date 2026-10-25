import { DOCUMENT } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { of } from 'rxjs';
import { BlogPostPage, countWords, decodeEntities, readingMinutes } from './blog-post-page';
import { blogPosts } from '../../../data/blog-posts.generated';

describe('decodeEntities', () => {
  it('decodes the entities marked produces', () => {
    expect(decodeEntities('&lt;tag&gt;')).toBe('<tag>');
    expect(decodeEntities('&quot;quoted&quot;')).toBe('"quoted"');
    expect(decodeEntities("It&#39;s")).toBe("It's");
    expect(decodeEntities('A &amp; B')).toBe('A & B');
  });

  it('replaces &amp; last so escaped entities survive one decode', () => {
    // If &amp; were replaced first, this would wrongly become '<'.
    expect(decodeEntities('&amp;lt;')).toBe('&lt;');
  });
});

describe('countWords', () => {
  it('counts the words in the text, not the markup around it', () => {
    expect(countWords('<p>one two three</p>')).toBe(3);
    expect(countWords('<h2 id="a">one two</h2>\n<p>three</p>')).toBe(3);
  });

  it('counts the words inside a link once', () => {
    expect(countWords('<p>see <a href="https://example.com">the notes</a></p>')).toBe(3);
  });

  it('ignores tokens that are pure punctuation', () => {
    // A list bullet or a standalone em dash is not a word.
    expect(countWords('<p>one — two</p>')).toBe(2);
  });

  it('counts an entity-escaped word once', () => {
    expect(countWords('<p>Mc&amp;Co shipped</p>')).toBe(2);
  });

  it('returns zero for empty markup', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('<p></p>')).toBe(0);
  });
});

describe('BlogPostPage', () => {
  let fixture: ComponentFixture<BlogPostPage>;

  beforeEach(async () => {
    // Keeps the giscus script out of the page; comments.spec.ts covers it.
    spyOn(Element.prototype, 'replaceChildren');
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

  it('links each tag in the eyebrow to its listing', () => {
    const el = fixture.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('.post__eyebrow a'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/blog/tags/angular',
      '/blog/tags/portfolio',
      '/blog/tags/personal',
    ]);
  });

  // hello-world is the oldest entry: there is a newer one and nothing older.
  it('links the neighbouring entries, and only the ones that exist', () => {
    const el = fixture.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('.post__pager-link'));
    const newer = blogPosts[blogPosts.length - 2];
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('rel')).toBe('next');
    expect(links[0].getAttribute('href')).toBe(`/blog/${newer.slug}`);
    expect(links[0].textContent).toContain(newer.title);
  });

  it('describes the entry to search engines as a BlogPosting', () => {
    const script = TestBed.inject(DOCUMENT).head.querySelector(
      'script[type="application/ld+json"]',
    );
    const graph = JSON.parse(script?.textContent ?? '{}')['@graph'];
    const posting = graph.find((node: { '@type': string }) => node['@type'] === 'BlogPosting');
    expect(posting.headline).toBe('Hello, World!');
    expect(posting.datePublished).toBe('2026-01-16');
    expect(posting.author.name).toBe('Hazel Granados');
  });

  it('marks the page as an article for social cards', () => {
    const meta = TestBed.inject(Meta);
    expect(meta.getTag("property='og:type'")?.content).toBe('article');
    expect(meta.getTag("property='article:published_time'")?.content).toBe('2026-01-16');
    expect(meta.getTags("property='article:tag'").length).toBe(3);
  });

  it('offers a way back to the blog above the post', () => {
    const el = fixture.nativeElement as HTMLElement;
    const back = el.querySelector('.post__back');
    expect(back?.getAttribute('href')).toBe('/blog');
    expect(back?.textContent).toContain('All posts');
  });

  it('reports a word count and reading time computed from the rendered markdown', () => {
    const el = fixture.nativeElement as HTMLElement;
    const body = el.querySelector('.post__body')!;

    // Not a restatement of the implementation: this pins the printed numbers to
    // the words actually on the page, so a hardcoded or stale count fails.
    const words = countWords(body.innerHTML);
    expect(words).toBeGreaterThan(0);
    const record = el.querySelector('.post__record')?.textContent ?? '';
    expect(record).toContain(words.toLocaleString('en-US'));
    expect(el.querySelector('.post__eyebrow')?.textContent).toContain(
      `${readingMinutes(words)} min read`,
    );
  });

  it('sets the entry as a bare article, not inside a window', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('article.post__article')).toBeTruthy();
    expect(el.querySelector('.window article.post__article')).toBeNull();
  });

  it('renders the post title as the article heading', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.post__title')?.textContent).toContain('Hello, World!');
  });

  it('prints the date, the reading time and the tags as the eyebrow', () => {
    const el = fixture.nativeElement as HTMLElement;
    const words = countWords(el.querySelector('.post__body')!.innerHTML);
    const eyebrow = el.querySelector('.post__eyebrow')?.textContent?.trim() ?? '';
    expect(eyebrow).toBe(`2026-01-16 · ${readingMinutes(words)} min read · angular · portfolio · personal`);
  });

  it('renders the post description under the title', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.post__description')?.textContent).toContain(
      'My first post on this portfolio site.',
    );
  });

  it('renders the rendered markdown into the reading column', () => {
    const el = fixture.nativeElement as HTMLElement;
    const body = el.querySelector('.post__body');
    expect(body?.innerHTML.length).toBeGreaterThan(0);
  });

  it('applies the prose rhythm to the rendered markdown', () => {
    const el = fixture.nativeElement as HTMLElement;
    const body = el.querySelector('.post__body')!;
    expect(body.classList.contains('prose')).toBe(true);

    const p = body.querySelector('p')!;
    expect(getComputedStyle(p).marginBottom).toBe('20px'); // --sp-5

    const h2 = body.querySelector('h2')!;
    const h2Style = getComputedStyle(h2);
    expect(h2Style.marginTop).toBe('48px'); // --sp-12
    expect(h2Style.fontSize).toBe('28px');
    expect(h2Style.fontWeight).toBe('600');
  });

  it('sets the running text at the reading measure', () => {
    const el = fixture.nativeElement as HTMLElement;
    const p = el.querySelector('.post__body p')!;
    const style = getComputedStyle(p);
    expect(style.fontSize).toBe('17px');
    // 1.75 x 17px. Compared as a number: browsers disagree on how many
    // decimals a used line-height keeps.
    expect(parseFloat(style.lineHeight)).toBeCloseTo(29.75, 1);
  });

  it('builds an on-this-page card from the post headings', () => {
    const el = fixture.nativeElement as HTMLElement;
    const contents = el.querySelector('.post__contents');
    expect(contents).toBeTruthy();
    expect(contents?.textContent).toContain('optimizing for');
    // Smoke check only: the fixture's only heading uses a curly apostrophe
    // (U+2019), which marked never escapes, so this assertion passes whether
    // or not decodeEntities works correctly. The `decodeEntities` describe
    // block above is what actually exercises the decoding, including the
    // &amp;-must-be-last ordering.
    expect(contents?.textContent).not.toContain('&#');
  });

  it('numbers each contents row', () => {
    const el = fixture.nativeElement as HTMLElement;
    const markers = Array.from(el.querySelectorAll('.post__toc-idx')).map((s) =>
      s.textContent?.trim(),
    );
    expect(markers.length).toBeGreaterThan(0);
    expect(markers[0]).toBe('01');
  });

  it('links each contents entry to the heading id emitted in the rendered markup', () => {
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

  it('sums the post up in an about card: date, reading time, words and tags', () => {
    const el = fixture.nativeElement as HTMLElement;
    const record = el.querySelector('.post__record')?.textContent ?? '';
    expect(record).toContain('About this post');
    expect(record).toContain('Published');
    expect(record).toContain('2026-01-16');
    expect(record).toContain('Reading time');
    expect(record).toContain('Words');
    expect(record).toContain('Tags');
    const values = Array.from(el.querySelectorAll('.post__record .key-value__value'));
    expect(values[values.length - 1].textContent?.trim()).toBe('3');
  });

  it('offers the quiet return control inside the about card, as a link', () => {
    const el = fixture.nativeElement as HTMLElement;
    // `.button`, not `button`: it navigates, so app-button renders it as an <a>.
    const control = el.querySelector('.post__return .button');
    expect(control?.tagName.toLowerCase()).toBe('a');
    expect(control?.getAttribute('href')).toBe('/blog');
    expect(control?.textContent).toContain('All posts');
    expect(control?.getAttribute('data-variant')).toBe('text');
  });

  it('puts the comments between the entry and the pager', () => {
    const el = fixture.nativeElement as HTMLElement;
    const comments = el.querySelector('article #comments')!;
    const pager = el.querySelector('.post__pager')!;
    expect(comments.compareDocumentPosition(el.querySelector('.post__body')!)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING,
    );
    expect(comments.compareDocumentPosition(pager)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('jumps to the comments from the about card', () => {
    const el = fixture.nativeElement as HTMLElement;
    const jump = el.querySelector('.post__return a[href="#comments"]');
    expect(jump?.textContent).toContain('Comments');
  });

  it('ships exactly one h1 — the post title', () => {
    const el = fixture.nativeElement as HTMLElement;
    const headings = Array.from(el.querySelectorAll('h1')).map((h) => h.textContent?.trim());
    expect(headings).toEqual(['Hello, World!']);
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});

describe('BlogPostPage (a part of a series)', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    spyOn(Element.prototype, 'replaceChildren');
    await TestBed.configureTestingModule({
      imports: [BlogPostPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(new Map([['slug', 'a-ps2-minigame-in-a-unity-remaster']])) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(BlogPostPage);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('lists every part in a series card, oldest first, marking this one', () => {
    const series = el.querySelector('.post__series')!;
    expect(series.querySelector('.window__context')?.textContent?.trim()).toBe('Puzzle Boy');
    const rows = Array.from(series.querySelectorAll('.post__toc-row'));
    expect(rows.map((row) => row.getAttribute('href'))).toEqual([
      '/blog/a-ps2-minigame-in-a-unity-remaster',
      '/blog/one-repo-became-three',
    ]);
    expect(rows.map((row) => row.getAttribute('aria-current'))).toEqual(['page', null]);
    expect(rows.map((row) => row.querySelector('.post__toc-idx')?.textContent?.trim())).toEqual([
      'Part 1',
      'Part 2',
    ]);
  });

  it('pages on to the next part, labelled as a part', () => {
    const next = el.querySelector('.post__pager-link[rel="next"]')!;
    expect(next.getAttribute('href')).toBe('/blog/one-repo-became-three');
    expect(next.textContent).toContain('Part 2');
  });
});

describe('BlogPostPage (unknown entry)', () => {
  let fixture: ComponentFixture<BlogPostPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPostPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(new Map([['slug', 'no-such-entry']])) },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(BlogPostPage);
    fixture.detectChanges();
  });

  // The panel itself is the 404 screen's, and its own spec covers what it says.
  it('hands the miss to the shared not-found panel, with the address and a way back to the blog', () => {
    const el = fixture.nativeElement as HTMLElement;
    const fault = el.querySelector('app-record-fault');
    expect(fault?.textContent).toContain('/blog/no-such-entry');
    expect(fault?.querySelector('a[href="/blog"]')).toBeTruthy();
  });

  it('keeps the miss out of search', () => {
    expect(TestBed.inject(Meta).getTag('name="robots"')?.content).toBe('noindex');
  });

  it('renders no article', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.post__article')).toBeNull();
  });
});
