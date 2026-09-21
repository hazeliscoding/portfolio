import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ChapterHeader } from './chapter-header';

describe('ChapterHeader', () => {
  let fixture: ComponentFixture<ChapterHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterHeader],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ChapterHeader);
    fixture.componentRef.setInput('code', 'HOME');
    fixture.componentRef.setInput('index', '01');
    fixture.componentRef.setInput('meta', 'LAST UPDATE 2026-09-20');
    fixture.detectChanges();
  });

  it('renders the chapter code and index separately', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('HOME');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_01');
  });

  it('renders the right-hand instrument line', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'LAST UPDATE 2026-09-20',
    );
  });

  it('omits the index entirely when there is none', () => {
    // A record detail screen's chapter is the record's own title. Rendering a
    // bare "_" after it would be a number the page does not have.
    fixture.componentRef.setInput('index', '');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.chapter__index')).toBeNull();
  });

  it('does not restate the path the top bar already shows', () => {
    // HAZEL.EXE // <mode> belongs to the system bar. It was rendered here too,
    // which put the same string on screen twice on every route.
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('HAZEL.EXE');
  });

  it('renders a back affordance only when given one', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__back')).toBeNull();

    fixture.componentRef.setInput('backLabel', 'ARCHIVE_03');
    fixture.componentRef.setInput('backRoute', '/portfolio');
    fixture.detectChanges();
    const back = el.querySelector('.chapter__back') as HTMLAnchorElement;
    expect(back.textContent?.trim()).toBe('< ARCHIVE_03');
    expect(back.getAttribute('href')).toBe('/portfolio');
  });

  it('no longer renders environmental type — the shell owns it', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.chapter__env')).toBeNull();
  });

  it('renders exactly one h1', () => {
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('h1').length).toBe(1);
  });

  it('steps down to a paragraph when the page has its own heading', () => {
    // A blog entry's <h1> is the post title; the chapter is a location label.
    // Same box, same type, different element — so the h1 form is measured
    // first and the p form has to match it.
    const el = fixture.nativeElement as HTMLElement;
    const asHeading = getComputedStyle(el.querySelector('.chapter__title') as HTMLElement);
    const size = asHeading.fontSize;
    const weight = asHeading.fontWeight;

    fixture.componentRef.setInput('heading', false);
    fixture.detectChanges();

    expect(el.querySelectorAll('h1').length).toBe(0);
    const title = el.querySelector('.chapter__title') as HTMLElement;
    expect(title.tagName.toLowerCase()).toBe('p');
    expect(title.textContent).toContain('HOME');
    expect(getComputedStyle(title).fontSize).toBe(size);
    expect(getComputedStyle(title).fontWeight).toBe(weight);
    expect(getComputedStyle(title).marginBlockStart).toBe('0px');
  });

  it('exposes the motion sequence for the title reveal', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__title')?.getAttribute('data-sfx')).toBe('a');
  });

  it('carries a blinking caret so the interface is never fully still', () => {
    const el = fixture.nativeElement as HTMLElement;
    const caret = el.querySelector('.chapter__caret');
    expect(caret).toBeTruthy();
    expect(caret?.getAttribute('aria-hidden')).toBe('true');
  });
});
