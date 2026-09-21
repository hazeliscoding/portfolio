import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModeNav, Mode } from './mode-nav';

const MODES: Mode[] = [
  { id: 'home', label: 'HOME', index: '01', route: '/' },
  { id: 'archive', label: 'ARCHIVE', index: '03', route: '/portfolio' },
];

describe('ModeNav', () => {
  let fixture: ComponentFixture<ModeNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ModeNav] }).compileComponents();
    fixture = TestBed.createComponent(ModeNav);
    fixture.componentRef.setInput('modes', MODES);
    fixture.componentRef.setInput('activeId', 'archive');
    fixture.detectChanges();
  });

  it('renders the MODE header by default', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('MODE');
  });

  it('renders one entry per mode with its index', () => {
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('.mode-nav__item');
    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('01');
    expect(items[0].textContent).toContain('HOME');
  });

  it('marks only the active mode', () => {
    const el = fixture.nativeElement as HTMLElement;
    const active = el.querySelectorAll('.mode-nav__item--active');
    expect(active.length).toBe(1);
    expect(active[0].textContent).toContain('ARCHIVE');
  });

  it('exposes the active mode to assistive tech', () => {
    const el = fixture.nativeElement as HTMLElement;
    const active = el.querySelector('.mode-nav__item--active');
    expect(active?.getAttribute('aria-current')).toBe('page');
  });

  it('emits the mode id on click', () => {
    let emitted = '';
    fixture.componentInstance.select.subscribe((id: string) => (emitted = id));
    const first = (fixture.nativeElement as HTMLElement).querySelector(
      '.mode-nav__item',
    ) as HTMLElement;
    first.click();
    expect(emitted).toBe('home');
  });

  it('labels the nav landmark', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('nav')?.getAttribute('aria-label')).toBe('Mode');
  });
});
