import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommandPalette, PaletteCommand } from './command-palette';

const COMMANDS: PaletteCommand[] = [
  { id: 'home', label: 'Home', mode: '01', hint: '1', route: '/' },
  { id: 'archive', label: 'Projects · archive', mode: '03', hint: '3', route: '/portfolio' },
  { id: 'log', label: 'Blog · log', mode: '04', hint: '4', route: '/blog' },
];

function press(el: Element, key: string): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  el.dispatchEvent(event);
  return event;
}

describe('CommandPalette', () => {
  let fixture: ComponentFixture<CommandPalette>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandPalette],
    }).compileComponents();
    fixture = TestBed.createComponent(CommandPalette);
    fixture.componentRef.setInput('commands', COMMANDS);
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('renders nothing when closed', () => {
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(el.querySelector('.palette')).toBeNull();
  });

  it('lists every command when the query is empty', () => {
    expect(el.querySelectorAll('.palette__item').length).toBe(3);
  });

  it('filters by label', () => {
    fixture.componentInstance.query.set('arch');
    fixture.detectChanges();
    const items = el.querySelectorAll('.palette__item');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('Projects · archive');
  });

  it('filters by mode', () => {
    fixture.componentInstance.query.set('04');
    fixture.detectChanges();
    expect(el.querySelectorAll('.palette__item').length).toBe(1);
  });

  it('says so when nothing matches', () => {
    fixture.componentInstance.query.set('zzz');
    fixture.detectChanges();
    expect(el.querySelectorAll('.palette__item').length).toBe(0);
    expect(el.textContent).toContain('NO MATCHING COMMAND');
  });

  it('emits run with the command id on click', () => {
    let emitted = '';
    fixture.componentInstance.run.subscribe((id: string) => (emitted = id));
    (el.querySelector('.palette__item') as HTMLElement).click();
    expect(emitted).toBe('home');
  });

  it('moves the selection with the arrow keys and runs it on Enter', () => {
    let emitted = '';
    fixture.componentInstance.run.subscribe((id: string) => (emitted = id));
    const dialog = el.querySelector('[role="dialog"]') as HTMLElement;

    press(dialog, 'ArrowDown');
    fixture.detectChanges();
    expect(el.querySelectorAll('.palette__item')[1].getAttribute('aria-selected')).toBe('true');

    press(dialog, 'Enter');
    expect(emitted).toBe('archive');
  });

  it('will not walk the selection off either end of the list', () => {
    const dialog = el.querySelector('[role="dialog"]') as HTMLElement;
    press(dialog, 'ArrowUp');
    fixture.detectChanges();
    expect(el.querySelectorAll('.palette__item')[0].getAttribute('aria-selected')).toBe('true');

    for (let i = 0; i < 6; i++) press(dialog, 'ArrowDown');
    fixture.detectChanges();
    expect(el.querySelectorAll('.palette__item')[2].getAttribute('aria-selected')).toBe('true');
  });

  it('re-homes the selection when the query narrows the list under it', () => {
    const dialog = el.querySelector('[role="dialog"]') as HTMLElement;
    press(dialog, 'ArrowDown');
    press(dialog, 'ArrowDown');
    fixture.detectChanges();

    fixture.componentInstance.query.set('arch');
    fixture.detectChanges();
    const items = el.querySelectorAll('.palette__item');
    expect(items.length).toBe(1);
    expect(items[0].getAttribute('aria-selected')).toBe('true');
  });

  it('emits close on Escape', () => {
    let closed = false;
    fixture.componentInstance.close.subscribe(() => (closed = true));
    press(el.querySelector('input') as HTMLElement, 'Escape');
    fixture.detectChanges();
    expect(closed).toBe(true);
  });

  it('is announced as a modal dialog', () => {
    expect(el.querySelector('[role="dialog"]')?.getAttribute('aria-modal')).toBe('true');
  });

  it('moves focus into the input when opened', () => {
    expect(document.activeElement).toBe(el.querySelector('input'));
  });

  it('publishes the highlighted row to assistive tech', () => {
    // Focus stays in the input for the whole interaction, so the only way a
    // screen reader learns which command is selected is activedescendant.
    const input = el.querySelector('input') as HTMLInputElement;
    const option = el.querySelectorAll('.palette__item')[0];
    expect(input.getAttribute('aria-activedescendant')).toBe(option.id);
    expect(input.getAttribute('aria-controls')).toBe('palette-list');
  });
});
