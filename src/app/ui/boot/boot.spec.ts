import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Boot } from './boot';

describe('Boot', () => {
  let fixture: ComponentFixture<Boot>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Boot] }).compileComponents();
    fixture = TestBed.createComponent(Boot);
    fixture.componentRef.setInput('clock', '12:34:56');
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('renders the overlay', () => {
    expect(el.querySelector('.boot')).toBeTruthy();
  });

  it('announces itself as a status region rather than a dialog', () => {
    expect(el.querySelector('.boot')?.getAttribute('role')).toBe('status');
  });

  it('is focusable so a keyboard user is not stranded behind it', () => {
    expect((el.querySelector('.boot') as HTMLElement).tabIndex).toBe(-1);
  });

  it('emits dismissed on click', () => {
    let fired = false;
    fixture.componentInstance.dismissed.subscribe(() => (fired = true));
    el.querySelector('.boot')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(fired).toBe(true);
  });

  it('emits dismissed on ANY key, not just Escape', () => {
    const keys = ['Escape', 'Enter', 'a', ' ', 'ArrowLeft'];
    let fired = 0;
    fixture.componentInstance.dismissed.subscribe(() => (fired += 1));
    for (const key of keys) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    }
    expect(fired).toBe(keys.length);
  });

  it('takes focus on mount so focus is not left behind the overlay', async () => {
    await fixture.whenStable();
    expect(document.activeElement).toBe(el.querySelector('.boot'));
  });

  it('shows the real record counts rather than a hardcoded number', () => {
    const log = el.querySelector('.boot__log')?.textContent ?? '';
    expect(log).toMatch(/\d+ RECORDS? · \d+ LOG (ENTRY|ENTRIES) RETRIEVED/);
  });

  it('renders the progress bar as a track plus a fill', () => {
    expect(el.querySelector('.boot__bar')).toBeTruthy();
    expect(el.querySelector('.boot__bar .boot__bar-fill')).toBeTruthy();
  });

  it('renders a live prompt with a blinking cursor', () => {
    expect(el.querySelector('.boot__cursor')).toBeTruthy();
  });

  it('shows the clock it was given', () => {
    expect(el.querySelector('.boot__clock')?.textContent).toContain('12:34:56');
  });

  it('carries the exact skip affordance copy', () => {
    expect(el.querySelector('.boot__foot')?.textContent).toContain(
      'CLICK OR PRESS ANY KEY TO SKIP',
    );
  });

  it('hides the decorative log and environmental word from assistive tech', () => {
    expect(el.querySelector('.boot__log')?.getAttribute('aria-hidden')).toBe('true');
    expect(el.querySelector('.boot__env')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('leaves the title and the skip hint exposed, so the announcement is useful', () => {
    expect(el.querySelector('.boot__title')?.getAttribute('aria-hidden')).toBeNull();
    expect(el.querySelector('.boot__foot')?.getAttribute('aria-hidden')).toBeNull();
  });

  it('contains no emoji', () => {
    expect(/\p{Extended_Pictographic}/u.test(el.textContent ?? '')).toBe(false);
  });
});
