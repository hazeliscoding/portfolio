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
    fixture.componentRef.setInput('environmental', 'HAZEL');
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

  it('hides the environmental type from assistive tech', () => {
    const el = fixture.nativeElement as HTMLElement;
    const env = el.querySelector('.chapter__env');
    expect(env?.getAttribute('aria-hidden')).toBe('true');
    expect(env?.textContent?.trim()).toBe('HAZEL');
  });

  it('renders exactly one h1', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('h1').length).toBe(1);
  });
});
