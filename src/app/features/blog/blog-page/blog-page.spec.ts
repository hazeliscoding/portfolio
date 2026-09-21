import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { BlogPage } from './blog-page';

describe('BlogPage', () => {
  let fixture: ComponentFixture<BlogPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(BlogPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the LOG_04 chapter header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('LOG');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_04');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Blog');
  });

  it('renders DATE, ENTRY and TAGS columns', () => {
    const el = fixture.nativeElement as HTMLElement;
    const heads = Array.from(el.querySelectorAll('th')).map((h) => h.textContent?.trim());
    expect(heads).toEqual(['DATE', 'ENTRY', 'TAGS']);
  });

  it('renders one row per post', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('tbody tr').length).toBe(1);
  });

  it('reports the record count as a machine report', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      '1 RECORD RETRIEVED',
    );
  });

  it('terminates the log so one row reads as complete', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.data-table__end')?.textContent).toContain('END OF LOG');
  });

  it('selects the first row', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('tbody tr')?.getAttribute('aria-selected')).toBe('true');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
