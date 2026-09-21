import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ProjectDetailPage } from './project-detail-page';

describe('ProjectDetailPage', () => {
  let fixture: ComponentFixture<ProjectDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectDetailPage],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: of(new Map([['id', 'pr-sweep']])) },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ProjectDetailPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the ARCHIVE chapter header with the record index', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('ARCHIVE');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_03');
  });

  it('renders the project title', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('PR Sweep');
  });

  it('renders the primary viewport and a thumbnail per image', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.detail__viewport')).toBeTruthy();
    expect(el.querySelectorAll('.detail__thumb').length).toBe(4);
  });

  it('renders every long description paragraph as README body', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.detail__para').length).toBe(3);
  });

  it('renders the record inspector with status, year and stack', () => {
    const el = fixture.nativeElement as HTMLElement;
    const text = el.querySelector('.detail__inspector')?.textContent ?? '';
    expect(text).toContain('STATUS');
    expect(text).toContain('YEAR');
    expect(text).toContain('2026');
  });

  it('links to the GitHub repository', () => {
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector('a[href*="github.com"]');
    expect(link?.getAttribute('href')).toBe('https://github.com/hazeliscoding/pr-sweep');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });

  it('offers a way back to the archive', () => {
    const back = (fixture.nativeElement as HTMLElement).querySelector('.detail__back');
    expect(back?.getAttribute('href')).toBe('/portfolio');
  });

  it('marks the active thumbnail by more than colour', () => {
    const el = fixture.nativeElement as HTMLElement;
    const active = el.querySelector('.detail__thumb--active');
    expect(active?.getAttribute('aria-current')).toBe('true');
    const others = el.querySelectorAll('.detail__thumb:not(.detail__thumb--active)');
    expect([...others].every((t) => t.getAttribute('aria-current') === null)).toBe(true);
  });
});
