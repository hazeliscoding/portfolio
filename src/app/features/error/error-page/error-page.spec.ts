import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ErrorPage } from './error-page';

describe('ErrorPage', () => {
  let fixture: ComponentFixture<ErrorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorPage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(ErrorPage);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('reports the failure as a machine report', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'NO RECORD AT THIS ADDRESS',
    );
  });

  it('renders the alert window variant', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[data-variant="alert"]')).toBeTruthy();
  });

  it('shows the requested path', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('.error__path')).toBeTruthy();
  });

  it('offers a way back', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('a[href="/"]')?.textContent).toContain('BACK');
  });

  it('hides the environmental type from assistive tech', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.error__env')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('contains no emoji', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(/\p{Extended_Pictographic}/u.test(text)).toBe(false);
  });
});
