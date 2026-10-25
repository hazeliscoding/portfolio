import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HomePage, lede, starCount } from './home-page';
import { projectsData } from '../../../data/projects.data';
import { ossStats } from '../../../data/oss-stats.generated';
import { blogPosts } from '../../../data/blog-posts.generated';
import { releases } from '../../../data/releases.generated';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let el: HTMLElement;

  const text = (node: Element | null | undefined) =>
    (node?.textContent ?? '').replace(/\s+/g, ' ').trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Hazel Granados');
  });

  it('has exactly one h1, and names Hazel above it', () => {
    expect(el.querySelectorAll('h1').length).toBe(1);
    expect(text(el.querySelector('.hero__eyebrow'))).toContain('Hazel Granados');
  });

  describe('featured band', () => {
    const first = projectsData.find((p) => p.featured)!;

    it('airs the first featured project, its pitch as the headline', () => {
      expect(text(el.querySelector('.promo__title'))).toBe(first.pitch);
      expect(el.querySelector<HTMLImageElement>('.promo__screen img')?.getAttribute('src')).toBe(first.image);
    });

    it('downloads from the release page in a new tab, and says so', () => {
      const cta = el.querySelector<HTMLAnchorElement>('.promo__cta')!;
      const repo = first.links.github!.split('/').pop()!;
      expect(cta.getAttribute('href')).toBe(releases[repo]?.url ?? first.links.github!);
      expect(cta.getAttribute('target')).toBe('_blank');
      expect(text(cta)).toContain('(opens in a new tab)');
    });

    it('links its write-up', () => {
      expect(el.querySelector('.promo__more')?.getAttribute('href')).toBe(`/portfolio/${first.id}`);
    });
  });

  it('opens with a description clause, not the whole paragraph', () => {
    expect(lede('An app that does a thing — and then much more.')).toBe('An app that does a thing.');
    expect(lede('It works. It also does more.')).toBe('It works.');
  });

  describe('shipped cards', () => {
    const shipped = projectsData.filter((p) => p.kind !== 'pilot');

    it('shows every shipped app and live site, in archive order, and no pilots', () => {
      expect([...el.querySelectorAll('.card__title')].map(text)).toEqual(shipped.map((p) => p.title));
    });

    it('gives each card exactly one link, to its project page', () => {
      const cards = [...el.querySelectorAll('.card')];
      cards.forEach((card, i) => {
        const links = card.querySelectorAll('a');
        expect(links.length).toBe(1);
        expect(links[0].getAttribute('href')).toBe(`/portfolio/${shipped[i].id}`);
      });
    });

    it('reads versions from release data', () => {
      const withRelease = shipped.find((p) => p.links.github && releases[p.links.github.split('/').pop()!]);
      if (!withRelease) return;
      const card = [...el.querySelectorAll('.card')][shipped.indexOf(withRelease)];
      expect(text(card.querySelector('.card__meta'))).toContain(
        releases[withRelease.links.github!.split('/').pop()!].tag,
      );
    });

    it('links to the whole projects page with its count', () => {
      const all = el.querySelector('.picks .section-head__more');
      expect(all?.getAttribute('href')).toBe('/portfolio');
      expect(text(all)).toContain(String(projectsData.length));
    });
  });

  describe('open source', () => {
    it('links each repo to its merged-PR search in a new tab', () => {
      const rows = [...el.querySelectorAll<HTMLAnchorElement>('.oss__row')];
      expect(rows.map((r) => r.getAttribute('href'))).toEqual(ossStats.projects.map((p) => p.url));
      for (const r of rows) expect(r.getAttribute('target')).toBe('_blank');
    });

    it('totals the merged PRs', () => {
      expect(text(el.querySelector('.oss__summary'))).toContain(`${ossStats.totalMergedPrs} merged PR`);
    });

    it('abbreviates star counts without rounding them up', () => {
      expect(starCount(20989)).toBe('20.9k');
      expect(starCount(999)).toBe('999');
    });
  });

  it('links the three latest posts, dated', () => {
    const posts = [...el.querySelectorAll('.post')];
    expect(posts.length).toBe(Math.min(3, blogPosts.length));
    posts.forEach((post, i) => {
      expect(post.querySelector('a')?.getAttribute('href')).toBe(`/blog/${blogPosts[i].slug}`);
      expect(post.querySelector('time')?.getAttribute('datetime')).toBe(blogPosts[i].date);
    });
  });

  it('introduces the maker and links About and email', () => {
    expect(text(el.querySelector('.maker__caption'))).toBe("Hi, I'm Hazel.");
    expect(el.querySelector('.maker__cta')?.getAttribute('href')).toBe('/about');
    expect(el.querySelector('.maker__mail')?.getAttribute('href')).toMatch(/^mailto:/);
  });

  it('answers the common questions in native disclosures', () => {
    const items = el.querySelectorAll('.faq details');
    expect(items.length).toBeGreaterThanOrEqual(3);
    for (const item of items) expect(item.querySelector('summary')).toBeTruthy();
  });

  it('keeps the decorative sticker sheet out of the accessibility tree', () => {
    expect(el.querySelector('.hero__stickers')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelectorAll('.hero__sticker').length).toBe(projectsData.length);
  });
});
