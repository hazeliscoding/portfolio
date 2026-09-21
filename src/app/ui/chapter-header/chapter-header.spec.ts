import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChapterHeader } from './chapter-header';

describe('ChapterHeader', () => {
  let fixture: ComponentFixture<ChapterHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChapterHeader],
    }).compileComponents();
    fixture = TestBed.createComponent(ChapterHeader);
    fixture.componentRef.setInput('code', 'HOME');
    fixture.componentRef.setInput('index', '01');
    fixture.componentRef.setInput('context', 'OPERATOR PROFILE');
    fixture.detectChanges();
  });

  it('renders the chapter code and index separately', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('HOME');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_01');
  });

  it('renders the context', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'OPERATOR PROFILE',
    );
  });

  it('no longer renders environmental type — the shell owns it', () => {
    fixture.componentRef.setInput('code', 'HOME');
    fixture.componentRef.setInput('index', '01');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.chapter__env')).toBeNull();
  });

  it('renders exactly one h1', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('h1').length).toBe(1);
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
