import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AboutPage } from './about-page';

describe('AboutPage', () => {
  let fixture: ComponentFixture<AboutPage>;
  let el: HTMLElement;

  const text = (selector: string) =>
    el.querySelector(selector)?.textContent?.replace(/\s+/g, ' ').trim();

  const all = (selector: string) => [...el.querySelectorAll(selector)];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the PROFILE_02 chapter header', () => {
    expect(text('.chapter__code')).toBe('PROFILE');
    expect(text('.chapter__index')).toBe('_02');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('About');
  });

  it('renders five dossier windows', () => {
    expect(all('app-window').length).toBe(5);
  });

  // The header's reading is the page's own panel count. Asserted against the
  // DOM rather than against the string, so adding or removing a window without
  // moving SECTION_COUNT fails here instead of shipping a wrong number.
  it('counts the sections it actually renders in the chapter meta', () => {
    expect(text('.chapter__meta')).toBe(`DOSSIER · ${all('app-window').length} SECTIONS`);
  });

  it('lays the panels out in the design order, variants and stagger', () => {
    expect(all('.window').map((w) => w.getAttribute('data-variant'))).toEqual([
      'dialogue',
      'data',
      'inspector',
      'inspector',
      'command',
    ]);
    expect(all('.window__index').map((i) => i.textContent?.trim())).toEqual([
      '01',
      '03',
      '02',
      '04',
      '05',
    ]);
    expect(all('.window').map((w) => (w as HTMLElement).style.animationDelay)).toEqual([
      '40ms',
      '160ms',
      '80ms',
      '120ms',
      '200ms',
    ]);
  });

  it('focuses only the operator panel', () => {
    expect(all('.window[data-active="true"]').length).toBe(1);
    expect(all('.window')[0].getAttribute('data-active')).toBe('true');
  });

  it('frames the operator portrait as CAM 00', () => {
    expect(text('.about__portrait .viewport__label')).toBe('CAM 00');
  });

  it('records location and pronouns as labelled rows, not bio prose', () => {
    const paras = all('.about__para').map((p) => p.textContent?.trim());
    expect(paras).not.toContain('Texas, USA');

    const dt = all('.about__prose dt').map((d) => d.textContent?.trim());
    const dd = all('.about__prose dd').map((d) => d.textContent?.trim());
    expect(dt).toEqual(['LOCATION', 'PRONOUNS']);
    expect(dd).toEqual(['Texas, USA', 'she/they']);
  });

  // Two rows, not three: the design's education inspector reads DEGREE /
  // INSTITUTION, and the degree and its field are one fact.
  it('reads education as DEGREE and INSTITUTION', () => {
    const education = all('app-window')[2];
    expect([...education.querySelectorAll('dt')].map((d) => d.textContent?.trim())).toEqual([
      'DEGREE',
      'INSTITUTION',
    ]);
    expect([...education.querySelectorAll('dd')].map((d) => d.textContent?.trim())).toEqual([
      'B.S. Computer Science',
      'Texas A&M University–Victoria',
    ]);
  });

  it('numbers the interests and counts them in the window context', () => {
    const rows = all('.about__interest');
    expect(rows.length).toBe(4);
    expect(all('.about__idx').map((i) => i.textContent?.trim())).toEqual([
      '01',
      '02',
      '03',
      '04',
    ]);
    // The list runs edge to edge, so its window draws no body padding.
    expect(all('.window__body')[1].classList.contains('window__body--padded')).toBe(false);
    expect(all('.window__context')[1].textContent?.trim()).toBe('04');
  });

  it('links both resume formats as downloads', () => {
    const pdf = el.querySelector<HTMLAnchorElement>('a[href$="resume-en.pdf"]');
    const docx = el.querySelector<HTMLAnchorElement>('a[href$="resume-en.docx"]');
    expect(pdf).toBeTruthy();
    expect(docx).toBeTruthy();
    expect(pdf?.hasAttribute('download')).toBe(true);
    expect(docx?.hasAttribute('download')).toBe(true);
    // A download is a link, never a scripted button: the page is server
    // rendered and must work before hydration.
    expect(el.querySelector('.about__exports button')).toBeNull();
  });

  it('states the real resume export in the footer strip', () => {
    expect(text('.window__foot')).toBe('PDF · 1 PAGE · UPDATED 2026-01');
  });

  it('contains no emoji', () => {
    expect(/\p{Extended_Pictographic}/u.test(el.textContent ?? '')).toBe(false);
  });
});
