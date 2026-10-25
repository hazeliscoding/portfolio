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

  it('introduces Hazel as the page heading', () => {
    expect(all('h1').length).toBe(1);
    expect(text('h1')).toBe("Hi, I'm Hazel.");
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toBe('About - Hazel Granados');
  });

  it('records location, pronouns, degree and language as labelled rows, not bio prose', () => {
    const keys = all('.facts .key-value__key').map((k) => k.textContent?.trim());
    const values = all('.facts .key-value__value').map((v) => v.textContent?.trim());
    expect(keys).toEqual(['Based in', 'Pronouns', 'Studied', 'Speaks']);
    expect(values).toContain('Texas, USA');
    expect(values).toContain('she/they');
    expect(values).toContain('B.S. Computer Science, Texas A&M University–Victoria');
  });

  it('shelves the toolbox by category, one card each', () => {
    const shelves = fixture.componentInstance.toolbox;
    expect(all('.shelf__title').map((t) => t.textContent?.trim())).toEqual(shelves.map((s) => s.label));
    expect(all('.shelf__items li').length).toBe(shelves.reduce((n, s) => n + s.items.length, 0));
  });

  it('lists every service and interest', () => {
    expect(all('.checks li').length).toBe(fixture.componentInstance.services.length);
    expect(all('.pills li').length).toBe(fixture.componentInstance.interests.length);
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
    expect(el.querySelector('.hero__actions button')).toBeNull();
  });

  it('states the real resume export under the buttons', () => {
    expect(text('.hero__fine')).toBe('PDF · 1 page · updated 2026-01');
  });

  it('ends on a way to say hello, with the profiles flagged as opening a tab', () => {
    expect(el.querySelector('.hello__mail')?.getAttribute('href')).toMatch(/^mailto:/);
    const profiles = all('.hello__links a');
    expect(profiles.length).toBe(2);
    for (const a of profiles) {
      expect(a.getAttribute('target')).toBe('_blank');
      expect(a.textContent).toContain('(opens in a new tab)');
    }
  });

  it('contains no emoji in its copy', () => {
    // The decorative arrows are aria-hidden, and `↗` counts as pictographic.
    const copy = el.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
    expect(/\p{Extended_Pictographic}/u.test(copy.textContent ?? '')).toBe(false);
  });
});
