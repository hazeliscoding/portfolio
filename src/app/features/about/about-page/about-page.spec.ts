import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AboutPage } from './about-page';

describe('AboutPage', () => {
  let fixture: ComponentFixture<AboutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(AboutPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the PROFILE_02 chapter header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.chapter__code')?.textContent?.trim()).toBe('PROFILE');
    expect(el.querySelector('.chapter__index')?.textContent?.trim()).toBe('_02');
  });

  it('sets the document title', () => {
    expect(TestBed.inject(Title).getTitle()).toContain('About');
  });

  it('renders five dossier windows', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.about__window').length).toBe(5);
  });

  it('links both resume formats', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[href$="resume-en.pdf"]')).toBeTruthy();
    expect(el.querySelector('a[href$="resume-en.docx"]')).toBeTruthy();
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
