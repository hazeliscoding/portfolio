import {
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface PaletteCommand {
  id: string;
  label: string;
  /** Left gutter tag — the mode or class the command belongs to. */
  mode?: string;
  /** Right-aligned affordance: the key that also reaches it, a year, a date. */
  hint?: string;
  route: string;
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  imports: [],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.scss',
})
export class CommandPalette {
  open = input(false);
  commands = input<PaletteCommand[]>([]);
  placeholder = input('command_');
  run = output<string>();
  close = output<void>();

  query = signal('');
  /** Index into `filtered()`. Moved by the arrow keys and by hovering. */
  activeIndex = signal(0);

  private inputEl = viewChild<ElementRef<HTMLInputElement>>('paletteInput');
  private restoreFocusTo: HTMLElement | null = null;

  filtered = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.commands();
    return this.commands().filter(
      (c) => c.label.toLowerCase().includes(q) || (c.mode ?? '').toLowerCase().includes(q),
    );
  });

  /**
   * Clamped rather than stored raw. `filtered()` shrinks as the user types,
   * and an index left pointing past the end makes Enter run nothing while the
   * list still shows a highlighted row.
   */
  selectedIndex = computed(() => {
    const max = this.filtered().length - 1;
    if (max < 0) return -1;
    return Math.min(this.activeIndex(), max);
  });

  selectedId = computed(() => this.filtered()[this.selectedIndex()]?.id ?? null);

  constructor() {
    // Moves focus into the palette when it opens and returns it to whatever
    // opened it on close. Angular does not focus newly-inserted elements, and
    // without this the palette — the only navigation below 840px — opens with
    // the user's focus stranded behind the scrim.
    effect(() => {
      const el = this.inputEl();
      if (this.open()) {
        if (!this.restoreFocusTo) {
          this.restoreFocusTo = document.activeElement as HTMLElement | null;
        }
        el?.nativeElement.focus();
      } else if (this.restoreFocusTo) {
        this.restoreFocusTo.focus();
        this.restoreFocusTo = null;
      }
    });
  }

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    // Every keystroke re-ranks the list, so the highlight returns to the top
    // rather than staying on whatever row happens to hold the old position.
    this.activeIndex.set(0);
  }

  optionId(index: number): string {
    return `palette-option-${index}`;
  }

  /**
   * Bound to the dialog so Escape fires wherever focus sits. Selection is
   * moved with the arrow keys and committed with Enter: this is a combobox
   * driving a listbox, so focus never leaves the input and the highlighted row
   * is announced through `aria-activedescendant` instead.
   */
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.close.emit();
        return;
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.set(Math.min(this.selectedIndex() + 1, this.filtered().length - 1));
        return;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set(Math.max(this.selectedIndex() - 1, 0));
        return;
      case 'Enter': {
        const id = this.selectedId();
        if (id) {
          event.preventDefault();
          this.run.emit(id);
        }
        return;
      }
      default:
        return;
    }
  }
}
