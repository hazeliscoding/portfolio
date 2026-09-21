import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusLight } from './status-light';

describe('StatusLight', () => {
  let fixture: ComponentFixture<StatusLight>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusLight],
    }).compileComponents();
    fixture = TestBed.createComponent(StatusLight);
    fixture.componentRef.setInput('label', 'ACTIVE');
    fixture.detectChanges();
  });

  it('renders a dot glyph and the label', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.status-light__dot')).toBeTruthy();
    expect(el.textContent).toContain('ACTIVE');
  });

  it('announces itself as a status region', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="status"]')).toBeTruthy();
  });

  it('does not blink unless asked', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.status-light__dot--blink')).toBeNull();
  });
});
