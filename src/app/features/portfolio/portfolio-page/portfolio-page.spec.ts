import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PortfolioPage } from './portfolio-page';
import { platformList } from '../broadcast-segment/broadcast-segment';
import { projectsData } from '../../../data/projects.data';
import { releases } from '../../../data/releases.generated';

describe('PortfolioPage', () => {
  let fixture: ComponentFixture<PortfolioPage>;
  let el: HTMLElement;

  const text = (node: Element | null) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const segment = (id: string) => el.querySelector<HTMLElement>(`section.segment#${id}`)!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(PortfolioPage);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('opens on a single heading with the project count above it', () => {
    expect([...el.querySelectorAll('h1')].map(text)).toEqual(["Here's what I'm building."]);
    const pilots = projectsData.filter((p) => p.kind === 'pilot').length;
    expect(text(el.querySelector('.eyebrow'))).toBe(
      `${projectsData.length - pilots} shipped · ${pilots} building now · free and open source`,
    );
    // The monogram stands in for a photo, so it is decoration only.
    expect(el.querySelector('.hero__avatar')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Projects');
  });

  describe('project bar', () => {
    it('jumps to each project by its id, named, in archive order', () => {
      const links = [...el.querySelectorAll<HTMLAnchorElement>('nav.guide a.guide__link')];
      expect(links.map((a) => a.getAttribute('href'))).toEqual(projectsData.map((p) => `#${p.id}`));
      expect(links.map(text)).toEqual(projectsData.map((p) => p.title));
    });

    it('lands every jump on a band with that id', () => {
      for (const p of projectsData) {
        expect(el.querySelector(`#${p.id}`)).withContext(p.id).not.toBeNull();
      }
    });

    it('enters with the hero off the motion service', () => {
      expect(el.querySelector('.hero')?.getAttribute('data-sfx')).toBe(
        fixture.componentInstance.motion.sfx(),
      );
    });
  });

  describe('segments', () => {
    it('gives every app and live site a band under Shipped, in archive order', () => {
      const shipped = el.querySelector('section.group[aria-labelledby="shipped-title"]')!;
      expect([...shipped.querySelectorAll('section.segment')].map((s) => s.id)).toEqual([
        'xiv-vault',
        'gil-sweep',
        'prompuff',
        'sweepling',
        'sdl3-porter',
        'conatlas-tx',
      ]);
    });

    it('names the project and labels the section with it', () => {
      const s = segment('sweepling');
      // h3: the group above it holds the h2.
      expect(text(s.querySelector('h3'))).toBe('Sweepling');
      expect(s.getAttribute('aria-labelledby')).toBe('sweepling-name');
      expect(text(s.querySelector('.segment__slug'))).toBe('Tray app · 2026');
    });

    it('sets a mascot sticker on the screen only where the project has one', () => {
      const sticker = segment('sweepling').querySelector('.segment__devices img.segment__mascot');
      expect(sticker?.getAttribute('src')).toBe('images/projects/sweepling/primrose.png');
      expect(sticker?.getAttribute('alt')).toContain('Primrose');
      expect(segment('gil-sweep').querySelector('.segment__mascot')).toBeNull();
    });

    it('tints each segment with its own brand colours', () => {
      const s = segment('gil-sweep');
      expect(s.style.getPropertyValue('--ink')).toBe('#f0cf85');
      expect(s.style.getPropertyValue('--tint')).toBe('#d9a94a');
    });

    // Keyed to the generated data, not to a literal: the weekly refresh moves
    // the tag, and the point is that the badge follows it.
    it('reads the sticker from the latest release', () => {
      expect(text(segment('sweepling').querySelector('.segment__tag'))).toBe(
        `Shipped · ${releases['sweepling'].tag}`,
      );
      expect(text(segment('conatlas-tx').querySelector('.segment__tag'))).toBe(
        `Live now · ${releases['conatlas-tx'].tag}`,
      );
    });

    it('downloads from the release page, with the platforms the release ships', () => {
      const cta = segment('prompuff').querySelector<HTMLAnchorElement>('a.segment__cta')!;
      expect(cta.getAttribute('href')).toBe(releases['prompuff'].url);
      expect(cta.getAttribute('target')).toBe('_blank');
      expect(cta.getAttribute('rel')).toBe('noopener');
      expect(text(cta.querySelector('.segment__cta-fine'))).toContain(
        platformList(releases['prompuff'].platforms),
      );
    });

    it('names a lone platform on the button itself', () => {
      const { platforms } = releases['xiv-vault'];
      expect(platforms.length).toBe(1);
      expect(text(segment('xiv-vault').querySelector('.segment__cta-label'))).toBe(
        `Download for ${platforms[0]} ↗`,
      );
    });

    it('installs sdl3-porter by command instead of offering a download', () => {
      const s = segment('sdl3-porter');
      expect(s.querySelector('a.segment__cta')).toBeNull();
      const lines = [...s.querySelectorAll('.install__cmds > div')].map(text);
      expect(lines).toEqual([
        '> /plugin marketplace add hazeliscoding/sdl3-porter',
        '> /plugin install sdl3-porter@sdl3-porter',
      ]);
    });

    it('copies the install commands and says so', fakeAsync(() => {
      const write = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());
      segment('sdl3-porter').querySelector<HTMLButtonElement>('.install__copy')!.click();
      flushMicrotasks();
      fixture.detectChanges();

      expect(write).toHaveBeenCalledWith(
        '/plugin marketplace add hazeliscoding/sdl3-porter\n/plugin install sdl3-porter@sdl3-porter',
      );
      expect(text(segment('sdl3-porter').querySelector('.install__copy'))).toBe('Copied');

      tick(1500);
      fixture.detectChanges();
      expect(text(segment('sdl3-porter').querySelector('.install__copy'))).toBe('Copy');
    }));

    it('shows the live site in a browser, beside a phone, with a visit link', () => {
      const s = segment('conatlas-tx');
      expect(s.getAttribute('data-kind')).toBe('site');
      expect(segment('xiv-vault').getAttribute('data-kind')).toBe('app');
      expect(text(s.querySelector('.device__url'))).toBe('conatlas-tx.vercel.app');
      expect(s.querySelector('.phone img')).not.toBeNull();
      expect(s.querySelector('a.segment__cta')?.getAttribute('href')).toBe(
        'https://conatlas-tx.vercel.app',
      );
      expect(text(s.querySelector('.segment__cta-label'))).toBe('Visit ConAtlas TX ↗');
    });

    it('alternates the screenshot side from one segment to the next, in each group', () => {
      const flips = [...el.querySelectorAll('section.group')].map((g) =>
        [...g.querySelectorAll('section.segment')].map((s) => s.classList.contains('segment--flip')),
      );
      expect(flips).toEqual([
        [false, true, false, true, false, true],
        [false, true],
      ]);
    });

    it('prints every ticker fact from the data', () => {
      const facts = [...segment('xiv-vault').querySelectorAll('.segment__ticker li')].map(text);
      expect(facts).toEqual(projectsData.find((p) => p.id === 'xiv-vault')!.ticker!);
    });

    it('links each band to its project page', () => {
      expect(segment('gil-sweep').querySelector('a.segment__more')?.getAttribute('href')).toBe(
        '/portfolio/gil-sweep',
      );
    });

    it('marks every link that leaves the site for a screen reader', () => {
      for (const a of el.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]')) {
        expect(text(a)).withContext(a.href).toContain('(opens in a new tab)');
        expect(a.getAttribute('rel')).toBe('noopener');
      }
    });

    it('loads screenshots lazily', () => {
      // Every band but Axiomarium's, which draws its commands instead.
      const shots = [...el.querySelectorAll('img.device__shot')];
      expect(shots.length).toBe(projectsData.length - 1);
      expect(shots.every((img) => img.getAttribute('loading') === 'lazy')).toBe(true);
    });
  });

  describe('building now', () => {
    it('gives both experiments a band of their own, after the shipped ones', () => {
      const groups = [...el.querySelectorAll('section.group')];
      expect(groups.map((g) => text(g.querySelector('h2')))).toEqual(['Shipped.', 'Building now.']);
      expect([...groups[1].querySelectorAll('section.segment')].map((b) => b.id)).toEqual([
        'puzzle-boy',
        'axiomarium',
      ]);
      expect(segment('puzzle-boy').getAttribute('data-kind')).toBe('pilot');
      expect(text(segment('puzzle-boy').querySelector('.segment__slug'))).toBe('Game · 2026');
    });

    it('stickers each with where it stands and its latest build', () => {
      expect(text(segment('axiomarium').querySelector('.segment__tag'))).toBe(
        `Building now · ${releases['axiomarium'].tag}`,
      );
    });

    it('offers the latest build, with what state it is in', () => {
      const cta = segment('axiomarium').querySelector<HTMLAnchorElement>('a.segment__cta')!;
      expect(cta.getAttribute('href')).toBe(releases['axiomarium'].url);
      expect(text(cta.querySelector('.segment__cta-label'))).toBe('Try the latest build ↗');
      expect(text(cta.querySelector('.segment__cta-fine'))).toBe(
        `Free · ${platformList(releases['axiomarium'].platforms)} · early development`,
      );
    });

    it('points Puzzle Boy’s build at Community Edition', () => {
      expect(segment('puzzle-boy').querySelector('a.segment__cta')?.getAttribute('href')).toBe(
        releases['puzzle-boy-community'].url,
      );
    });

    it('lists Puzzle Boy’s three repos with their own releases', () => {
      const rows = [...segment('puzzle-boy').querySelectorAll('.segment__parts li')];
      expect(rows.map((r) => r.querySelector('a')?.getAttribute('href'))).toEqual([
        'https://github.com/hazeliscoding/puzzle-boy',
        'https://github.com/hazeliscoding/puzzle-boy-community',
        'https://github.com/hazeliscoding/puzzle-boy-engine',
      ]);
      expect(text(rows[0].querySelector('.segment__part-detail'))).toBe(
        `${releases['puzzle-boy'].tag} · bring your own copy`,
      );
      // The engine has never been released; it says what it is, not "undefined".
      expect(text(rows[2].querySelector('.segment__part-detail'))).toBe('library, not playable');
    });

    it('plays the reel lazily, and only the still under reduced motion', () => {
      const reel = segment('puzzle-boy').querySelector('picture.device__reel')!;
      expect(reel.querySelector('source')?.getAttribute('media')).toBe(
        '(prefers-reduced-motion: reduce)',
      );
      expect(reel.querySelector('source')?.getAttribute('srcset')).toBe(
        'images/projects/puzzle-boy/playing.png',
      );
      expect(reel.querySelector('img')?.getAttribute('loading')).toBe('lazy');
    });

    it('draws Axiomarium’s commands on its screen in place of a capture', () => {
      const s = segment('axiomarium');
      const screen = s.querySelector('.device__console')!;
      expect(screen.querySelectorAll(':scope > div').length).toBe(5);
      expect(screen.getAttribute('aria-label')).toBe('Axiomarium commands');
      expect(s.querySelector('img.device__shot')).toBeNull();
    });
  });

  it('lists platforms the way a sentence would', () => {
    expect(platformList([])).toBe('');
    expect(platformList(['Windows'])).toBe('Windows');
    expect(platformList(['Windows', 'Linux'])).toBe('Windows & Linux');
    expect(platformList(['Windows', 'macOS', 'Linux'])).toBe('Windows, macOS & Linux');
  });

  // Arrows are typography here, not emoji: ↗ marks a link that leaves the
  // site. Everything else Extended_Pictographic covers stays out.
  it('contains no emoji', () => {
    expect(/(?![←-⇿])\p{Extended_Pictographic}/u.test(el.textContent ?? '')).toBe(false);
  });

  // Sentence case throughout: the old station's shouted labels are gone.
  it('keeps the broadcast vocabulary out of the copy', () => {
    expect(el.textContent).not.toMatch(/ON AIR|OPEN RECORD|CH\.\d|RECORD ›|\[ /);
  });
});
