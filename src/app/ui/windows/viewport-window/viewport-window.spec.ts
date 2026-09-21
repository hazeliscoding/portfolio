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

  it('backs the label so it stays legible over light images', () => {
    fixture.componentRef.setInput('label', 'CAM 00');
    fixture.detectChanges();
    const label = (fixture.nativeElement as HTMLElement).querySelector(
      '.viewport__label',
    ) as HTMLElement;
    const bg = getComputedStyle(label).backgroundColor;
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
  });

  it('renders a scanline only when an image is present', () => {
    fixture.componentRef.setInput('src', '');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.viewport__scan')).toBeNull();

    fixture.componentRef.setInput('src', 'images/projects/pr-sweep/board.png');
    fixture.detectChanges();
    const scan = (fixture.nativeElement as HTMLElement).querySelector('.viewport__scan');
    expect(scan).toBeTruthy();
    expect(scan?.getAttribute('aria-hidden')).toBe('true');
  });
});
