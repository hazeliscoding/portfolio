import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewportWindow } from './viewport-window';

describe('ViewportWindow', () => {
  let fixture: ComponentFixture<ViewportWindow>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewportWindow],
    }).compileComponents();
    fixture = TestBed.createComponent(ViewportWindow);
  });

  it('shows NO SIGNAL when no src is supplied', () => {
    fixture.componentRef.setInput('label', 'CAM 00');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toContain('NO SIGNAL');
  });

  it('renders the image and its alt text when src is supplied', () => {
    fixture.componentRef.setInput('src', 'images/projects/pr-sweep/board.png');
    fixture.componentRef.setInput('alt', 'status board');
    fixture.detectChanges();
    const img = (fixture.nativeElement as HTMLElement).querySelector('img');
    expect(img?.getAttribute('src')).toBe('images/projects/pr-sweep/board.png');
    expect(img?.getAttribute('alt')).toBe('status board');
  });

  it('renders the corner label', () => {
    fixture.componentRef.setInput('label', 'CAM 00');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('CAM 00');
  });
});
