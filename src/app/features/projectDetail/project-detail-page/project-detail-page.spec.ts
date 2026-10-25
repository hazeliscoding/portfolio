import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectDetailPage } from './project-detail-page';
import { Project, projectsData } from '../../../data/projects.data';
import { releases } from '../../../data/releases.generated';
import { ProjectsDataService } from '../../../services/projects-data.service';

const RECORD = projectsData[0];
const RELEASE = releases['xiv-vault'];

/**
 * Renders the project at `id`. Pass `archive` to stand in for the real data
 * when a test needs a kind of project the data does not hold today.
 */
async function renderRecord(
  id: string,
  archive?: Project[],
): Promise<ComponentFixture<ProjectDetailPage>> {
  await TestBed.configureTestingModule({
    imports: [ProjectDetailPage],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(new Map([['id', id]])) },
      },
      ...(archive
        ? [
            {
              provide: ProjectsDataService,
              useValue: {
                getAllProjects: () => archive,
                getProjectById: (wanted: string) => archive.find((p) => p.id === wanted),
              },
            },
          ]
        : []),
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(ProjectDetailPage);
  fixture.detectChanges();
  return fixture;
}

function textOf(el: Element | null | undefined): string {
  return el?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

/** The facts card's readout as `[key, value]` pairs. */
function facts(el: HTMLElement): [string, string][] {
  const keys = [...el.querySelectorAll('.detail__aside .key-value__key')].map(textOf);
  const values = [...el.querySelectorAll('.detail__aside .key-value__value')].map(textOf);
  return keys.map((k, i) => [k, values[i]]);
}

function actions(el: HTMLElement): HTMLAnchorElement[] {
  return [...el.querySelectorAll<HTMLAnchorElement>('.detail__actions a.button')];
}

describe('ProjectDetailPage', () => {
  let fixture: ComponentFixture<ProjectDetailPage>;
  let el: HTMLElement;

  beforeEach(async () => {
    fixture = await renderRecord(RECORD.id);
    el = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('makes the project name the one h1, with its pitch as the lede', () => {
    const h1s = el.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(textOf(h1s[0])).toBe(RECORD.title);
    expect(textOf(el.querySelector('.detail__lede'))).toBe(RECORD.pitch);
  });

  it('labels what it is and its version from the release data', () => {
    expect(textOf(el.querySelector('.detail__chips .badge'))).toBe(`Shipped app · ${RELEASE.tag}`);
  });

  it('leads with a download of the latest release, opening in a new tab', () => {
    const [download, source] = actions(el);
    expect(textOf(download)).toBe('Download for Windows ↗ (opens in a new tab)');
    expect(download.getAttribute('href')).toBe(RELEASE.url);
    expect(download.getAttribute('target')).toBe('_blank');
    expect(download.getAttribute('data-variant')).toBe('primary');

    expect(textOf(source)).toContain('View source');
    expect(source.getAttribute('href')).toBe(RECORD.links.github!);
    expect(source.getAttribute('data-variant')).toBe('secondary');
  });

  it('prints the fine print from the release, never the write-up', () => {
    expect(textOf(el.querySelector('.detail__fine'))).toBe(`Free · Windows · ${RECORD.note}`);
  });

  it('opens with the description, then every long description paragraph', () => {
    expect(textOf(el.querySelector('.detail__summary'))).toBe(RECORD.description);
    expect(el.querySelectorAll('.detail__para').length).toBe(RECORD.longDescription!.length);
  });

  it('renders a thumbnail button per screenshot, named by its caption', () => {
    const thumbs = [...el.querySelectorAll<HTMLElement>('.detail__thumb')];
    expect(thumbs.length).toBe(RECORD.images!.length);
    expect(thumbs.every((t) => t.tagName === 'BUTTON')).toBe(true);
    expect(thumbs[0].getAttribute('aria-label')).toBe(RECORD.images![0].caption);
  });

  it('captions the stage as a sentence and counts the shots', () => {
    const caption = RECORD.images![0].caption;
    expect(textOf(el.querySelector('.detail__caption span'))).toBe(
      `${caption.charAt(0).toUpperCase()}${caption.slice(1)}`,
    );
    expect(textOf(el.querySelector('.detail__count'))).toBe('1 of 5');
  });

  it('selects a shot when its thumbnail is clicked', () => {
    el.querySelectorAll<HTMLButtonElement>('.detail__thumb')[2].click();
    fixture.detectChanges();

    expect(textOf(el.querySelector('.detail__count'))).toBe('3 of 5');
    expect(el.querySelector('.detail__shot img')?.getAttribute('src')).toBe(RECORD.images![2].src);
  });

  it('marks the selected thumbnail by more than colour', () => {
    const active = el.querySelector('.detail__thumb--active');
    expect(active?.getAttribute('aria-current')).toBe('true');
    const others = el.querySelectorAll('.detail__thumb:not(.detail__thumb--active)');
    expect([...others].every((t) => t.getAttribute('aria-current') === null)).toBe(true);
  });

  it('advances the shot on ArrowRight', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(textOf(el.querySelector('.detail__count'))).toBe('2 of 5');
  });

  it('leaves ArrowRight alone while a text field has focus', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    input.remove();

    expect(textOf(el.querySelector('.detail__count'))).toBe('1 of 5');
  });

  it('lists the facts it has, in sentence case', () => {
    expect(facts(el)).toEqual([
      ['Kind', 'Shipped app'],
      ['Status', 'Active'],
      ['Version', RELEASE.tag],
      ['Platforms', 'Windows'],
      ['Stack', RECORD.stack!],
      ['Year', RECORD.year!],
      ['Source', 'github.com/hazeliscoding/xiv-vault'],
    ]);
  });

  it('renders every tag as a soft pill', () => {
    expect(el.querySelectorAll('.detail__tags .badge').length).toBe(RECORD.tags!.length);
  });

  it('links both neighbours, wrapping around the list', () => {
    const links = [...el.querySelectorAll('.detail__neighbour')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/portfolio/darnling',
      '/portfolio/gil-sweep',
    ]);
    expect(links.map((a) => textOf(a.querySelector('.detail__neighbour-title')))).toEqual([
      'Darnling',
      'Gil Sweep',
    ]);
  });

  it('offers a way back to all projects', () => {
    const back = el.querySelector('.detail__back');
    expect(back?.getAttribute('href')).toBe('/portfolio');
    expect(textOf(back)).toBe('← All projects');
  });

  it('keeps terminal vocabulary out of the copy', () => {
    expect(el.textContent ?? '').not.toMatch(/ARCHIVE_|RECORD|CAM \d|\[ /);
  });
});

describe('ProjectDetailPage (a project installed by command)', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    el = (await renderRecord('sdl3-porter')).nativeElement as HTMLElement;
  });

  it('shows the install commands and makes the source the next step', () => {
    const porter = projectsData.find((p) => p.id === 'sdl3-porter')!;
    expect([...el.querySelectorAll('.detail__cmd')].map(textOf)).toEqual(porter.install!);
    const buttons = actions(el);
    expect(buttons.length).toBe(1);
    expect(buttons[0].getAttribute('data-variant')).toBe('secondary');
  });
});

/** The projects page's segment fields the detail page reads. */
const SEGMENT = {
  kind: 'app',
  pitch: 'A pitch.',
  medium: 'Desktop',
  brand: { ink: '#ffffff', tint: '#ffffff', icon: 'icon.svg', mark: 'mark.svg' },
} satisfies Partial<Project>;

/** A deployed project, with a demo link. */
const LIVE: Project = {
  ...SEGMENT,
  kind: 'site',
  id: 'live-record',
  title: 'Live Record',
  description: 'A project with a live site.',
  image: 'images/projects/live-record/home.png',
  links: {
    github: 'https://github.com/hazeliscoding/live-record',
    demo: 'https://live-record.example.com/',
  },
  status: 'live',
  year: '2026',
  stack: 'Angular',
};

/** A published library. No real project has a package today. */
const PACKAGED: Project = {
  ...SEGMENT,
  id: 'packaged-record',
  title: 'Packaged Record',
  description: 'A project with a NuGet package.',
  image: 'images/projects/packaged-record/usage.png',
  links: {
    github: 'https://github.com/hazeliscoding/packaged-record',
    nuget: 'https://www.nuget.org/packages/PackagedRecord',
  },
  status: 'stable',
  year: '2024',
  stack: 'C# · .NET',
};

describe('ProjectDetailPage (a project with a live site)', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    el = (await renderRecord(LIVE.id, [LIVE])).nativeElement as HTMLElement;
  });

  it('lists the live site before the source', () => {
    const keys = facts(el).map(([k]) => k);
    expect(keys).toEqual(['Kind', 'Status', 'Stack', 'Year', 'Live', 'Source']);
    expect(facts(el)[4][1]).toBe('live-record.example.com');
  });

  it('leads with the live site and steps the source down to secondary', () => {
    const buttons = actions(el);
    expect(buttons.map((b) => textOf(b).replace(' ↗ (opens in a new tab)', ''))).toEqual([
      'Visit Live Record',
      'View source',
    ]);
    expect(buttons[0].getAttribute('href')).toBe(LIVE.links.demo!);
    expect(buttons[0].getAttribute('data-variant')).toBe('primary');
    expect(buttons[1].getAttribute('data-variant')).toBe('secondary');
  });

  it('has no neighbours to link when it is the only project', () => {
    expect(el.querySelector('.detail__adjacent')).toBeNull();
  });
});

describe('ProjectDetailPage (a project with a package)', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    el = (await renderRecord(PACKAGED.id, [PACKAGED])).nativeElement as HTMLElement;
  });

  it('lists the package before the source', () => {
    const keys = facts(el).map(([k]) => k);
    expect(keys).toEqual(['Kind', 'Status', 'Stack', 'Year', 'Package', 'Source']);
    expect(facts(el)[4][1]).toBe('nuget.org/packages/PackagedRecord');
  });

  it('leads with the package and steps the source down to secondary', () => {
    const buttons = actions(el);
    expect(buttons[0].getAttribute('href')).toBe(PACKAGED.links.nuget!);
    expect(textOf(buttons[0])).toContain('View on NuGet');
    expect(buttons[0].getAttribute('data-variant')).toBe('primary');
    expect(buttons[1].getAttribute('data-variant')).toBe('secondary');
  });
});

describe('ProjectDetailPage (no such project)', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    el = (await renderRecord('no-such-record')).nativeElement as HTMLElement;
  });

  it('reports the miss in the shared 404 card, not a local imitation', () => {
    // app-record-fault draws this. The selectors are its markup on purpose: if
    // this page ever grows its own copy again, they stop matching.
    expect(el.querySelector('app-record-fault .fault__panel')).toBeTruthy();
    expect(el.querySelector('.detail')).toBeNull();
  });

  it('names the address that missed', () => {
    const values = Array.from(el.querySelectorAll('.key-value__value')).map((d) => textOf(d));
    expect(values).toContain('/portfolio/no-such-record');
    expect(values).toContain('404 Not found');
  });

  it('offers a way back to all projects', () => {
    const back = el.querySelector('.fault__back');
    expect(back?.getAttribute('href')).toBe('/portfolio');
    expect(textOf(back)).toBe('← All projects');
  });
});
