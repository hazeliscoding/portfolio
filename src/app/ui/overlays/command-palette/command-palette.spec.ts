import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandPalette, PaletteCommand } from './command-palette';

const COMMANDS: PaletteCommand[] = [
  { id: 'home', label: 'HOME', mode: 'SYSTEM', route: '/' },
  { id: 'archive', label: 'ARCHIVE', mode: 'RECORDS', route: '/portfolio' },
  { id: 'log', label: 'LOG', mode: 'RECORDS', route: '/blog' },
];

describe('CommandPalette', () => {
  let fixture: ComponentFixture<CommandPalette>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandPalette],
    }).compileComponents();
    fixture = TestBed.createComponent(CommandPalette);
    fixture.componentRef.setInput('commands', COMMANDS);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
  });

  it('renders nothing when closed', () => {
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.palette')).toBeNull();
  });

  it('lists every command when the query is empty', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.palette__item').length).toBe(3);
  });

  it('filters by label', () => {
    fixture.componentInstance.query.set('arch');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll('.palette__item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('ARCHIVE');
  });

  it('filters by mode', () => {
    fixture.componentInstance.query.set('records');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.palette__item').length).toBe(2);
  });

  it('reports how many records matched', () => {
    fixture.componentInstance.query.set('arch');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('1 RECORD');
  });

  it('emits run with the command id on click', () => {
    let emitted = '';
    fixture.componentInstance.run.subscribe((id: string) => (emitted = id));
    const first = (fixture.nativeElement as HTMLElement).querySelector(
      '.palette__item',
    ) as HTMLElement;
    first.click();
    expect(emitted).toBe('home');
  });

  it('emits close on Escape', () => {
    let closed = false;
    fixture.componentInstance.close.subscribe(() => (closed = true));
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input',
    ) as HTMLInputElement;
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(closed).toBe(true);
  });

  it('is announced as a modal dialog', () => {
    const el = fixture.nativeElement as HTMLElement;
    const dialog = el.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
  });

  it('moves focus into the input when opened', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector('input');
    expect(document.activeElement).toBe(input);
  });

  it('closes on Escape when focus is on a command button', () => {
    let closed = false;
    fixture.componentInstance.close.subscribe(() => (closed = true));
    const button = (fixture.nativeElement as HTMLElement).querySelector(
      '.palette__item',
    ) as HTMLElement;
    button.focus();
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();
    expect(closed).toBe(true);
  });

  it('cycles Tab from the last focusable back to the first', () => {
    const el = fixture.nativeElement as HTMLElement;
    const items = el.querySelectorAll<HTMLElement>('.palette__item');
    const last = items[items.length - 1];
    last.focus();
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    });
    last.dispatchEvent(event);
    fixture.detectChanges();
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(el.querySelector('input'));
  });
});
