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
    const featured = projectsData.filter((p) => p.featured);
    const tabs = () => [...el.querySelectorAll<HTMLButtonElement>('.promo__tab')];
    const selected = () => tabs().findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const shown = () => [...el.querySelectorAll('.promo__slide--on')].map((s) => s.id);
    const progress = () => el.querySelector('.promo__progress');
    const slide = (i: number) => el.querySelectorAll('.promo__slide')[i];

    it('takes turns between the featured projects, in archive order', () => {
      expect(tabs().map(text)).toEqual(featured.map((p) => p.title));
      expect(featured.length).toBeGreaterThan(1);
    });

    it('starts on the first, with only its slide shown and its pitch as the headline', () => {
      expect(selected()).toBe(0);
      expect(shown()).toEqual([`promo-${featured[0].id}`]);
      expect(text(slide(0).querySelector('.promo__title'))).toBe(featured[0].pitch);
      expect(slide(0).querySelector('.promo__screen img')?.getAttribute('src')).toBe(featured[0].image);
    });

    it('loads only the first screenshot eagerly', () => {
      const shots = [...el.querySelectorAll('.promo__screen img')];
      expect(shots.map((img) => img.getAttribute('loading'))).toEqual(
        featured.map((_, i) => (i === 0 ? null : 'lazy')),
      );
    });

    it('wires each tab to its slide', () => {
      for (const tab of tabs()) {
        const panel = el.querySelector(`#${tab.getAttribute('aria-controls')}`);
        expect(panel?.getAttribute('role')).toBe('tabpanel');
        expect(panel?.getAttribute('aria-labelledby')).toBe(tab.id);
      }
    });

    it('moves on each time the progress bar runs out, wrapping round', () => {
      for (const expected of [1, 2, 0]) {
        progress()!.dispatchEvent(new Event('animationend'));
        fixture.detectChanges();
        expect(selected()).toBe(expected);
        expect(shown().length).toBe(1);
      }
    });

    it('hands over to a visitor who picks an app', () => {
      tabs()[2].click();
      fixture.detectChanges();
      expect(selected()).toBe(2);
      expect(shown()).toEqual([`promo-${featured[2].id}`]);
      expect(progress()).toBeNull();
      expect(el.querySelector('.promo__pause')?.getAttribute('aria-label')).toBe('Play the featured apps');
    });

    it('pauses and plays from its own control', () => {
      const pause = el.querySelector<HTMLButtonElement>('.promo__pause')!;
      expect(pause.getAttribute('aria-label')).toBe('Pause the featured apps');
      pause.click();
      fixture.detectChanges();
      expect(progress()).toBeNull();
      expect(pause.getAttribute('aria-label')).toBe('Play the featured apps');
      pause.click();
      fixture.detectChanges();
      expect(progress()).not.toBeNull();
    });

    it('moves between apps with the arrow keys, Home and End', () => {
      const list = el.querySelector('[role="tablist"]')!;
      const key = (k: string) => {
        list.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
        fixture.detectChanges();
      };
      key('ArrowLeft');
      expect(selected()).toBe(2);
      key('ArrowRight');
      expect(selected()).toBe(0);
      key('End');
      expect(selected()).toBe(2);
      key('Home');
      expect(selected()).toBe(0);
      expect(tabs().map((t) => t.tabIndex)).toEqual([0, -1, -1]);
    });

    it('announces a change only once the rotation has stopped', () => {
      const slides = el.querySelector('.promo__slides')!;
      expect(slides.getAttribute('aria-live')).toBe('off');
      tabs()[1].click();
      fixture.detectChanges();
      expect(slides.getAttribute('aria-live')).toBe('polite');
    });

    it('downloads from the release page in a new tab, and says so', () => {
      featured.forEach((p, i) => {
        const cta = slide(i).querySelector<HTMLAnchorElement>('.promo__cta')!;
        const repo = p.links.github!.split('/').pop()!;
        expect(cta.getAttribute('href')).withContext(p.id).toBe(releases[repo]?.url ?? p.links.github!);
        expect(cta.getAttribute('target')).toBe('_blank');
        expect(text(cta)).toContain('(opens in a new tab)');
      });
    });

    it('links each write-up', () => {
      featured.forEach((p, i) => {
        expect(slide(i).querySelector('.promo__more')?.getAttribute('href')).toBe(`/portfolio/${p.id}`);
      });
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
    it('links each repo to my PRs there, in a new tab', () => {
      const rows = [...el.querySelectorAll<HTMLAnchorElement>('.oss__row')];
      expect(rows.map((r) => r.getAttribute('href'))).toEqual(ossStats.projects.map((p) => p.url));
      for (const r of rows) expect(r.getAttribute('target')).toBe('_blank');
    });

    it('totals the merged PRs, then the ones still in review', () => {
      const summary = text(el.querySelector('.oss__summary'));
      expect(summary).toContain(`${ossStats.totalMergedPrs} merged PR`);
      expect(summary).toContain(`across ${ossStats.projectCount} project`);
      if (ossStats.totalOpenPrs) expect(summary).toContain(`and ${ossStats.totalOpenPrs} more in review`);
    });

    it('says what is merged and what is in review on each row, leaving out a zero', () => {
      const labels = [...el.querySelectorAll('.oss__stat--merged')].map(text);
      expect(labels).toEqual(
        ossStats.projects.map((p) =>
          [p.mergedPrs && `${p.mergedPrs} merged`, p.openPrs && `${p.openPrs} in review`]
            .filter(Boolean)
            .join(' · '),
        ),
      );
      expect(labels.every((label) => label && !/\b0 /.test(label))).toBe(true);
    });

    // Only what the GitHub profile's oss.json lists, as the generator recorded
    // it, so the PRs that list my own apps (winget-pkgs, up-for-grabs) and work
    // orgs never show.
    it('lists only the upstream projects the profile does', () => {
      expect(ossStats.listedRepos.length).toBeGreaterThan(0);
      for (const p of ossStats.projects) expect(ossStats.listedRepos).withContext(p.repo).toContain(p.repo);
    });

    it('abbreviates star counts without rounding them up', () => {
      expect(starCount(20989)).toBe('20.9k');
      expect(starCount(999)).toBe('999');
    });

    // Exact counts move almost daily, and the daily refresh would commit and
    // redeploy for a change no visitor can see.
    it('stores stars only as precisely as it shows them', () => {
      for (const p of ossStats.projects) {
        expect(p.stars < 1000 || p.stars % 100 === 0).withContext(`${p.repo}: ${p.stars}`).toBe(true);
      }
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
    // One per shipped project, as the cards below; the sheet has eight spots.
    const shipped = projectsData.filter((p) => p.kind !== 'pilot').length;
    expect(el.querySelectorAll('.hero__sticker').length).toBe(shipped);
    expect(shipped).toBeLessThanOrEqual(8);
  });
});
