import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PortfolioPage, platformList } from './portfolio-page';
import { projectsData } from '../../../data/projects.data';
import { releases } from '../../../data/releases.generated';

describe('PortfolioPage', () => {
  let fixture: ComponentFixture<PortfolioPage>;
  let el: HTMLElement;

  const text = (node: Element | null) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const segment = (id: string) => el.querySelector<HTMLElement>(`section.segment#${id}`)!;
  const tape = (id: string) => el.querySelector<HTMLElement>(`article.tape#${id}`)!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(PortfolioPage);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('renders the ARCHIVE_03 chapter header with the record count', () => {
    expect(text(el.querySelector('.chapter__code'))).toBe('ARCHIVE');
    expect(text(el.querySelector('.chapter__index'))).toBe('_03');
    expect(text(el.querySelector('.chapter__meta'))).toBe('08 RECORDS RETRIEVED');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Projects');
  });

  describe('channel guide', () => {
    it('groups the channels ON AIR, then LIVE, then PILOTS', () => {
      const groups = [...el.querySelectorAll('.guide__group')];
      expect(groups.map((g) => text(g.querySelector('.guide__label')))).toEqual([
        'ON AIR',
        'LIVE',
        'PILOTS',
      ]);
      expect(groups.map((g) => g.querySelectorAll('.guide__channel').length)).toEqual([5, 1, 2]);
    });

    it('jumps to each project by its id, numbered by its place in the archive', () => {
      const channels = [...el.querySelectorAll<HTMLAnchorElement>('a.guide__channel')];
      expect(channels.map((a) => a.getAttribute('href'))).toEqual(
        projectsData.map((p) => `#${p.id}`),
      );
      expect(text(channels[5].querySelector('.guide__number'))).toBe('06');
      expect(text(channels[5].querySelector('.guide__title'))).toBe('ConAtlas TX');
    });

    it('enters off the motion service', () => {
      expect(el.querySelector('.guide')?.getAttribute('data-sfx')).toBe(
        fixture.componentInstance.motion.sfx(),
      );
    });
  });

  describe('segments', () => {
    it('gives every app and live site a segment, in archive order, and no pilot one', () => {
      expect([...el.querySelectorAll('section.segment')].map((s) => s.id)).toEqual([
        'xiv-vault',
        'gil-sweep',
        'prompuff',
        'pr-sweep',
        'sdl3-porter',
        'conatlas-tx',
      ]);
    });

    it('names the project and labels the section with it', () => {
      const s = segment('pr-sweep');
      expect(text(s.querySelector('h2'))).toBe('PR Sweep');
      expect(s.getAttribute('aria-labelledby')).toBe('pr-sweep-name');
      expect(text(s.querySelector('.segment__channel'))).toBe('CH.04');
      expect(text(s.querySelector('.segment__slug'))).toBe('DESKTOP · 2026');
    });

    it('tints each segment with its own brand colours', () => {
      const s = segment('gil-sweep');
      expect(s.style.getPropertyValue('--ink')).toBe('#f0cf85');
      expect(s.style.getPropertyValue('--tint')).toBe('#d9a94a');
    });

    // Keyed to the generated data, not to a literal: the weekly refresh moves
    // the tag, and the point is that the badge follows it.
    it('reads the status badge from the latest release', () => {
      expect(text(segment('pr-sweep').querySelector('.segment__status'))).toBe(
        `SHIPPED · ${releases['pr-sweep'].tag}`,
      );
      expect(text(segment('conatlas-tx').querySelector('.segment__status'))).toBe(
        `LIVE · ${releases['conatlas-tx'].tag}`,
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
        `[ DOWNLOAD FOR ${platforms[0].toUpperCase()} ↗ ]`,
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
      expect(text(segment('sdl3-porter').querySelector('.install__copy'))).toBe('COPIED');

      tick(1500);
      fixture.detectChanges();
      expect(text(segment('sdl3-porter').querySelector('.install__copy'))).toBe('COPY');
    }));

    it('puts the live site on air as LIVE, in a browser, with a visit link', () => {
      const s = segment('conatlas-tx');
      expect(s.querySelector('.segment__live')).not.toBeNull();
      expect(s.querySelector('.segment__onair')).toBeNull();
      expect(text(s.querySelector('.crt__url'))).toBe('conatlas-tx.vercel.app');
      expect(s.querySelector('.phone img')).not.toBeNull();
      expect(s.querySelector('a.segment__cta')?.getAttribute('href')).toBe(
        'https://conatlas-tx.vercel.app',
      );
      expect(text(s.querySelector('.segment__cta-label'))).toBe('[ VISIT CONATLAS TX ↗ ]');
    });

    it('alternates the screenshot side from one segment to the next', () => {
      const flips = [...el.querySelectorAll('section.segment')].map((s) =>
        s.classList.contains('segment--flip'),
      );
      expect(flips).toEqual([false, true, false, true, false, true]);
    });

    it('prints every ticker fact from the data', () => {
      const facts = [...segment('xiv-vault').querySelectorAll('.segment__ticker li')].map(text);
      expect(facts).toEqual(projectsData.find((p) => p.id === 'xiv-vault')!.ticker!);
    });

    it('opens each record from its segment', () => {
      expect(segment('gil-sweep').querySelector('a.segment__record')?.getAttribute('href')).toBe(
        '/portfolio/gil-sweep',
      );
    });

    it('loads screenshots lazily', () => {
      const shots = [...el.querySelectorAll('img.crt__shot')];
      expect(shots.length).toBe(6);
      expect(shots.every((img) => img.getAttribute('loading') === 'lazy')).toBe(true);
    });
  });

  describe('pilots', () => {
    it('puts both experiments on test tapes after the segments', () => {
      expect([...el.querySelectorAll('article.tape')].map((t) => t.id)).toEqual([
        'puzzle-boy',
        'axiomarium',
      ]);
      expect([...tape('puzzle-boy').querySelectorAll('.tape__label > span')].map(text)).toEqual([
        'PILOT 07',
        'GAME · 2026',
      ]);
    });

    it('lists Puzzle Boy’s three repos with their own releases', () => {
      const rows = [...tape('puzzle-boy').querySelectorAll('.tape__rows li')];
      expect(rows.map((r) => r.querySelector('a')?.getAttribute('href'))).toEqual([
        'https://github.com/hazeliscoding/puzzle-boy',
        'https://github.com/hazeliscoding/puzzle-boy-community',
        'https://github.com/hazeliscoding/puzzle-boy-engine',
      ]);
      expect(text(rows[0].querySelector('.tape__detail'))).toBe(
        `${releases['puzzle-boy'].tag} · bring your own copy`,
      );
      // The engine has never been released; it says what it is, not "undefined".
      expect(text(rows[2].querySelector('.tape__detail'))).toBe('library, not playable');
    });

    it('points Puzzle Boy’s source and build at Community Edition', () => {
      const links = [...tape('puzzle-boy').querySelectorAll<HTMLAnchorElement>('.tape__links a')];
      expect(links.map((a) => a.getAttribute('href'))).toEqual([
        'https://github.com/hazeliscoding/puzzle-boy-community',
        releases['puzzle-boy-community'].url,
        '/portfolio/puzzle-boy',
      ]);
    });

    it('plays the reel lazily, and only the still under reduced motion', () => {
      const reel = tape('puzzle-boy').querySelector('picture.tape__reel')!;
      expect(reel.querySelector('source')?.getAttribute('media')).toBe(
        '(prefers-reduced-motion: reduce)',
      );
      expect(reel.querySelector('source')?.getAttribute('srcset')).toBe(
        'images/projects/puzzle-boy/playing.png',
      );
      expect(reel.querySelector('img')?.getAttribute('loading')).toBe('lazy');
    });

    it('shows Axiomarium’s commands and where it stands', () => {
      const t = tape('axiomarium');
      expect(t.querySelectorAll('.tape__console > div').length).toBe(5);
      expect([...t.querySelectorAll('.tape__rows li > span')].map(text)).toEqual([
        'Status',
        `early development · ${releases['axiomarium'].tag}`,
      ]);
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
});
