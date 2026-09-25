import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectDetailPage } from './project-detail-page';
import { projectsData } from '../../../data/projects.data';

const RECORD = projectsData[0];

async function renderRecord(id: string): Promise<ComponentFixture<ProjectDetailPage>> {
  await TestBed.configureTestingModule({
    imports: [ProjectDetailPage],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { paramMap: of(new Map([['id', id]])) },
      },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(ProjectDetailPage);
  fixture.detectChanges();
  return fixture;
}

/** Panels are identified by the title in their chrome, not by DOM order. */
function panel(el: HTMLElement, title: string): HTMLElement {
  const found = [...el.querySelectorAll<HTMLElement>('.window')].find(
    (w) => w.querySelector('.window__title')?.textContent?.trim() === title,
  );
  if (!found) throw new Error(`no window titled "${title}"`);
  return found;
}

function textOf(el: Element | null | undefined): string {
  return el?.textContent?.trim() ?? '';
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

  it('makes the chapter the record itself, with no chapter index', () => {
    expect(textOf(el.querySelector('.chapter__code'))).toBe(RECORD.title.toUpperCase());
    expect(el.querySelector('.chapter__index')).toBeNull();
  });

  it('reports the record position and stack in the chapter meta', () => {
    expect(textOf(el.querySelector('.chapter__meta'))).toBe(
      'RECORD 01 OF 04 · ELECTRON · ANGULAR',
    );
  });

  it('prints the record description directly under the header', () => {
    expect(textOf(el.querySelector('.detail__lede'))).toBe(RECORD.description);
  });

  it('renders a thumbnail button per screenshot, named by its caption', () => {
    const thumbs = [...el.querySelectorAll<HTMLElement>('.detail__thumb')];
    expect(thumbs.length).toBe(RECORD.images!.length);
    expect(thumbs.every((t) => t.tagName === 'BUTTON')).toBe(true);
    expect(thumbs[0].getAttribute('aria-label')).toBe(RECORD.images![0].caption);
  });

  it('keeps the caption in the window footer rather than under each thumbnail', () => {
    expect(textOf(panel(el, 'Viewport').querySelector('.window__foot'))).toBe(
      `${RECORD.images![0].caption.toUpperCase()} · CLICK OR → FOR NEXT`,
    );
    // The thumbnail carries only its zero-padded index.
    expect(textOf(el.querySelector('.detail__thumb'))).toBe('01');
  });

  it('counts the frames in the viewport window context', () => {
    expect(textOf(panel(el, 'Viewport').querySelector('.window__context'))).toBe('01 OF 04');
  });

  it('selects a frame when its thumbnail is clicked', () => {
    const thumbs = el.querySelectorAll<HTMLButtonElement>('.detail__thumb');
    thumbs[2].click();
    fixture.detectChanges();

    expect(textOf(panel(el, 'Viewport').querySelector('.window__context'))).toBe('03 OF 04');
    expect(el.querySelector('.detail__hero img')?.getAttribute('src')).toBe(
      RECORD.images![2].src,
    );
  });

  it('marks the selected thumbnail by more than colour', () => {
    const active = el.querySelector('.detail__thumb--active');
    expect(active?.getAttribute('aria-current')).toBe('true');
    const others = el.querySelectorAll('.detail__thumb:not(.detail__thumb--active)');
    expect([...others].every((t) => t.getAttribute('aria-current') === null)).toBe(true);
  });

  it('advances the frame on ArrowRight', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    fixture.detectChanges();

    expect(textOf(panel(el, 'Viewport').querySelector('.window__context'))).toBe('02 OF 04');
  });

  it('leaves ArrowRight alone while a text field has focus', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    input.remove();

    expect(textOf(panel(el, 'Viewport').querySelector('.window__context'))).toBe('01 OF 04');
  });

  it('renders every long description paragraph, and counts them', () => {
    expect(el.querySelectorAll('.detail__para').length).toBe(RECORD.longDescription!.length);
    expect(textOf(panel(el, 'Readme').querySelector('.window__context'))).toBe(
      '3 PARAGRAPHS',
    );
  });

  it('reads out the record', () => {
    const readout = panel(el, 'Record');
    const keys = [...readout.querySelectorAll('.key-value__key')].map(textOf);
    const values = [...readout.querySelectorAll('.key-value__value')].map(textOf);

    expect(keys).toEqual(['STATUS', 'YEAR', 'STACK', 'SCREENSHOTS', 'SOURCE']);
    expect(values).toEqual([
      'ACTIVE',
      RECORD.year!,
      RECORD.stack!,
      '04',
      'github.com/hazeliscoding/pr-sweep',
    ]);
  });

  it('offers the source and the way back, and no writeup the data does not have', () => {
    const labels = [...panel(el, 'Record').querySelectorAll('.detail__actions .button')].map(
      textOf,
    );
    expect(labels).toEqual(['View source >', '< All projects']);
  });

  it('opens the real repository from the source button', () => {
    const open = spyOn(window, 'open');
    const source = [...el.querySelectorAll<HTMLButtonElement>('.detail__actions .button')].find(
      (b) => textOf(b) === 'View source >',
    );
    source!.click();

    expect(open).toHaveBeenCalledWith(RECORD.links.github!, '_blank', 'noopener');
  });

  it('renders every tag as a badge', () => {
    expect(panel(el, 'Tags').querySelectorAll('.badge').length).toBe(RECORD.tags!.length);
  });

  it('links both neighbours, wrapping around the archive', () => {
    expect(el.querySelector('.detail__adjacent-empty')).toBeNull();
    const links = [...el.querySelectorAll('.detail__adjacent-link')];
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/portfolio/jage',
      '/portfolio/animatch',
    ]);
    expect(links.map(textOf)).toEqual(['< JAGE', 'ANIMATCH >']);
  });

  it('offers a way back to the archive, labelled with the archive code', () => {
    const back = el.querySelector('.chapter__back');
    expect(back?.getAttribute('href')).toBe('/portfolio');
    expect(textOf(back)).toBe('< ARCHIVE_03');
    expect(el.querySelector('app-button[routerLink="/portfolio"]')).toBeTruthy();
  });

  it('contains no emoji', () => {
    const text = el.textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});

describe('ProjectDetailPage (a record with a live site)', () => {
  const LIVE = projectsData.find((p) => p.links.demo)!;
  let el: HTMLElement;

  beforeEach(async () => {
    el = (await renderRecord(LIVE.id)).nativeElement as HTMLElement;
  });

  it('reads out the live site before the source', () => {
    const readout = panel(el, 'Record');
    const keys = [...readout.querySelectorAll('.key-value__key')].map(textOf);
    const values = [...readout.querySelectorAll('.key-value__value')].map(textOf);

    expect(keys).toEqual(['STATUS', 'YEAR', 'STACK', 'SCREENSHOTS', 'LIVE', 'SOURCE']);
    expect(values[4]).toBe('animatch-moe.vercel.app');
  });

  it('leads with the live site and steps the source down to secondary', () => {
    const buttons = [...panel(el, 'Record').querySelectorAll('.detail__actions .button')];
    expect(buttons.map(textOf)).toEqual(['Open live site >', 'View source >', '< All projects']);
    expect(buttons[0].getAttribute('data-variant')).toBe('primary');
    expect(buttons[1].getAttribute('data-variant')).toBe('secondary');
  });

  it('opens the live site from its button', () => {
    const open = spyOn(window, 'open');
    const live = [...el.querySelectorAll<HTMLButtonElement>('.detail__actions .button')].find(
      (b) => textOf(b) === 'Open live site >',
    );
    live!.click();

    expect(open).toHaveBeenCalledWith(LIVE.links.demo!, '_blank', 'noopener');
  });
});

describe('ProjectDetailPage (a record with a package)', () => {
  const PACKAGED = projectsData.find((p) => p.links.nuget)!;
  let el: HTMLElement;

  beforeEach(async () => {
    el = (await renderRecord(PACKAGED.id)).nativeElement as HTMLElement;
  });

  it('reads out the package before the source', () => {
    const readout = panel(el, 'Record');
    const keys = [...readout.querySelectorAll('.key-value__key')].map(textOf);
    const values = [...readout.querySelectorAll('.key-value__value')].map(textOf);

    expect(keys).toEqual(['STATUS', 'YEAR', 'STACK', 'SCREENSHOTS', 'PACKAGE', 'SOURCE']);
    expect(values[4]).toBe('nuget.org/packages/QuickbaseNet');
  });

  it('leads with the package and steps the source down to secondary', () => {
    const buttons = [...panel(el, 'Record').querySelectorAll('.detail__actions .button')];
    expect(buttons.map(textOf)).toEqual(['View on NuGet >', 'View source >', '< All projects']);
    expect(buttons[0].getAttribute('data-variant')).toBe('primary');
    expect(buttons[1].getAttribute('data-variant')).toBe('secondary');
  });

  it('opens the package page from its button', () => {
    const open = spyOn(window, 'open');
    const nuget = [...el.querySelectorAll<HTMLButtonElement>('.detail__actions .button')].find(
      (b) => textOf(b) === 'View on NuGet >',
    );
    nuget!.click();

    expect(open).toHaveBeenCalledWith(PACKAGED.links.nuget!, '_blank', 'noopener');
  });
});

describe('ProjectDetailPage (no such record)', () => {
  let el: HTMLElement;

  beforeEach(async () => {
    el = (await renderRecord('no-such-record')).nativeElement as HTMLElement;
  });

  it('reports the fault in the shared 404 panel, not a local imitation', () => {
    // app-record-fault draws this. The selectors below are its markup on
    // purpose: if this page ever grows its own copy again, they stop matching.
    const fault = el.querySelector('.window[data-variant="alert"]');
    expect(fault).toBeTruthy();
    expect(textOf(fault?.querySelector('.window__title'))).toBe('Record not found');
    expect(textOf(el.querySelector('.fault__report'))).toBe('NO RECORD AT THIS ADDRESS');
    expect(el.querySelector('.fault__panel')).toBeTruthy();
  });

  it('names the address that missed', () => {
    const values = Array.from(el.querySelectorAll('.key-value__value')).map((d) =>
      textOf(d),
    );
    expect(values).toContain('/portfolio/no-such-record');
    expect(values).toContain('404 NOT_FOUND');
  });

  it('takes the error chapter rather than pretending to be a record', () => {
    expect(textOf(el.querySelector('.chapter__code'))).toBe('ERROR');
    expect(textOf(el.querySelector('.chapter__index'))).toBe('_404');
    expect(el.querySelector('.detail')).toBeNull();
  });

  it('offers a way back to the archive', () => {
    expect(el.querySelector('.chapter__back')?.getAttribute('href')).toBe('/portfolio');
  });
});
