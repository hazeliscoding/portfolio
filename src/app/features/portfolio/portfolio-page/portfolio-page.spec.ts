import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { PortfolioPage } from './portfolio-page';

describe('PortfolioPage', () => {
  let fixture: ComponentFixture<PortfolioPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(PortfolioPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the ARCHIVE_03 chapter header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('ARCHIVE');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_03');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Projects');
  });

  it('renders the pager as 01 of 01', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.archive__pager')?.textContent).toContain('RECORD 01 OF 01');
  });

  it('renders exactly one record window', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.archive__record').length).toBe(1);
    expect(el.textContent).toContain('PR Sweep');
  });

  it('renders the filter row', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.archive__filters')).toBeTruthy();
  });

  it('links the record to its detail route', () => {
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('.archive__record a, a.archive__record');
    expect(link?.getAttribute('href')).toBe('/portfolio/pr-sweep');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
