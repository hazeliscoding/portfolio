import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HomePage } from './home-page';
import { projectsData } from '../../../data/projects.data';
import { ossStats } from '../../../data/oss-stats.generated';
import { blogPosts } from '../../../data/blog-posts.generated';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;
  let el: HTMLElement;

  const text = (node: Element | null | undefined) =>
    (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const tabs = () => [...el.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const selected = () => tabs().findIndex((t) => t.getAttribute('aria-selected') === 'true');
  const shown = () => [...el.querySelectorAll('.now__panel--on')].map((p) => p.id);
  const progress = () => el.querySelector('.now__progress');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('renders the HOME_01 chapter header with the last-update reading', () => {
    expect(text(el.querySelector('.chapter__code'))).toBe('HOME');
    expect(text(el.querySelector('.chapter__index'))).toBe('_01');
    expect(text(el.querySelector('.chapter__meta'))).toBe('LAST UPDATE 2026-10-19');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Hazel Granados');
  });

  describe('lower third', () => {
    it('names the operator as the page heading', () => {
      expect(text(el.querySelector('h1'))).toBe('Hazel Granados');
      expect(el.querySelectorAll('h1').length).toBe(1);
    });

    it('links the email and both profiles, each named for a screen reader', () => {
      const links = [...el.querySelectorAll<HTMLAnchorElement>('a.lower__link')];
      expect(links.map((a) => a.getAttribute('href'))).toEqual([
        'mailto:hazel.granados@protonmail.com',
        'https://github.com/hazeliscoding',
        'https://www.linkedin.com/in/hazelgranados',
      ]);
      expect(links.map((a) => text(a.querySelector('.sr-only')))).toEqual([
        'Email:',
        'GitHub:',
        'LinkedIn:',
      ]);
      expect(links.map((a) => a.getAttribute('target'))).toEqual([null, '_blank', '_blank']);
      expect(links[1].getAttribute('rel')).toBe('noopener');
    });

    it('prints the location without a link', () => {
      const rows = [...el.querySelectorAll('.lower__contact li')];
      expect(rows.length).toBe(4);
      expect(rows[3].querySelector('a')).toBeNull();
      expect(text(rows[3])).toBe('Location: Texas, USA');
    });

    it('draws an icon on every contact row, hidden from screen readers', () => {
      const icons = [...el.querySelectorAll('.lower__contact svg')];
      expect(icons.length).toBe(4);
      expect(icons.every((i) => i.getAttribute('aria-hidden') === 'true')).toBe(true);
    });

    it('offers the contact and dossier controls', () => {
      const labels = [...el.querySelectorAll('.lower .button__label')].map(text);
      expect(labels).toEqual(['Contact >', 'Dossier']);
    });
  });

  describe('now playing', () => {
    it('tunes to the featured projects, in archive order, numbered as in the archive', () => {
      expect(tabs().map((t) => text(t.querySelector('.now__title')))).toEqual([
        'XIV Vault',
        'Gil Sweep',
        'Prompuff',
      ]);
      expect(tabs().map((t) => text(t.querySelector('.now__number')))).toEqual(
        ['xiv-vault', 'gil-sweep', 'prompuff'].map((id) =>
          String(projectsData.findIndex((p) => p.id === id) + 1).padStart(2, '0'),
        ),
      );
    });

    it('airs each channel as the projects page segment', () => {
      const segments = [...el.querySelectorAll('.now__panel section.segment')];
      expect(segments.map((s) => s.id)).toEqual(['xiv-vault', 'gil-sweep', 'prompuff']);
    });

    it('starts on the first channel with only its segment shown', () => {
      expect(selected()).toBe(0);
      expect(shown()).toEqual(['now-xiv-vault']);
    });

    it('wires each tab to its panel', () => {
      for (const tab of tabs()) {
        const panel = el.querySelector(`#${tab.getAttribute('aria-controls')}`);
        expect(panel?.getAttribute('role')).toBe('tabpanel');
        expect(panel?.getAttribute('aria-labelledby')).toBe(tab.id);
      }
    });

    it('changes channel each time the progress bar runs out, wrapping round', () => {
      for (const expected of [1, 2, 0]) {
        progress()!.dispatchEvent(new Event('animationend'));
        fixture.detectChanges();
        expect(selected()).toBe(expected);
        expect(shown().length).toBe(1);
      }
    });

    it('hands the remote to a visitor who picks a channel', () => {
      tabs()[2].click();
      fixture.detectChanges();
      expect(selected()).toBe(2);
      expect(shown()).toEqual(['now-prompuff']);
      expect(progress()).toBeNull();
      expect(text(el.querySelector('.now__pause'))).toBe('[ PLAY ]');
    });

    it('pauses and plays from its own control', () => {
      const pause = el.querySelector<HTMLButtonElement>('.now__pause')!;
      expect(pause.getAttribute('aria-label')).toBe('Pause the channels');
      pause.click();
      fixture.detectChanges();
      expect(progress()).toBeNull();
      expect(pause.getAttribute('aria-label')).toBe('Play the channels');
      pause.click();
      fixture.detectChanges();
      expect(progress()).not.toBeNull();
    });

    it('moves between channels with the arrow keys, Home and End', () => {
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

    it('announces a channel change only once the rotation has stopped', () => {
      const screen = el.querySelector('.now__screen')!;
      expect(screen.getAttribute('aria-live')).toBe('off');
      tabs()[1].click();
      fixture.detectChanges();
      expect(screen.getAttribute('aria-live')).toBe('polite');
    });

    it('links to the whole archive', () => {
      const all = el.querySelector('a.now__all')!;
      expect(all.getAttribute('href')).toBe('/portfolio');
      expect(text(all)).toBe(`ALL ${projectsData.length} CHANNELS ›`);
    });
  });

  describe('strips', () => {
    it('links the latest posts, dated', () => {
      const rows = [...el.querySelectorAll<HTMLAnchorElement>('.strip:not(.strip--oss) a.strip__item')];
      expect(rows.length).toBe(Math.min(3, blogPosts.length));
      expect(rows[0].getAttribute('href')).toBe(`/blog/${blogPosts[0].slug}`);
      expect(text(rows[0].querySelector('.strip__meta'))).toBe(blogPosts[0].date);
    });

    it('links each open-source repo to its merged-PR search', () => {
      const links = [...el.querySelectorAll('.strip--oss a.strip__item')];
      expect(links.length).toBe(ossStats.projects.length);
      expect(links[0].getAttribute('href')).toBe(ossStats.projects[0].url);
      expect(links[0].getAttribute('rel')).toBe('noopener');
    });

    // Truncated, not rounded: the strip must never claim more stars than the
    // generated stats hold.
    it('abbreviates star counts without rounding them up', () => {
      const meta = text(el.querySelector('.strip--oss .strip__meta'));
      const shown = meta.split('★ ')[1];
      const stars = parseFloat(shown) * (shown.endsWith('k') ? 1000 : 1);
      expect(stars).toBeLessThanOrEqual(ossStats.projects[0].stars);
      expect(stars).toBeGreaterThan(ossStats.projects[0].stars - 100);
    });
  });

  // The segments are /portfolio's own, ↗ on their calls to action included, so
  // they are left out; this guards the home page's copy.
  it('contains no emoji outside the segments', () => {
    const own = el.cloneNode(true) as HTMLElement;
    own.querySelector('.now__screen')?.remove();
    expect(/\p{Extended_Pictographic}/u.test(own.textContent ?? '')).toBe(false);
  });
});
