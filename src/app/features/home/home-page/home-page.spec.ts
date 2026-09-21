import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the HOME_01 chapter header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('HOME');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_01');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('Hazel Granados');
  });

  it('renders the operator profile window', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('OPERATOR PROFILE');
  });

  it('renders exactly one featured record', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.home__record').length).toBe(1);
    expect(el.textContent).toContain('PR Sweep');
  });

  it('renders the contact email', () => {
    const el = fixture.nativeElement as HTMLElement;
    const mail = el.querySelector('a[href^="mailto:"]');
    expect(mail?.getAttribute('href')).toBe('mailto:hazel.granados@protonmail.com');
  });

  it('renders the LinkedIn and GitHub links', () => {
    const el = fixture.nativeElement as HTMLElement;
    const linkedin = el.querySelector('a[href="https://www.linkedin.com/in/hazelgranados/"]');
    const github = el.querySelector('a[href="https://github.com/hazeliscoding"]');
    expect(linkedin).toBeTruthy();
    expect(github).toBeTruthy();
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });

  it('lays out log rows rather than leaving them inline', () => {
    const row = (fixture.nativeElement as HTMLElement).querySelector(
      '.home__log-row',
    ) as HTMLElement;
    expect(getComputedStyle(row).display).toBe('flex');
  });
});
