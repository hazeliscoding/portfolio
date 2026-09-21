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
  mode?: string;
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

  private inputEl = viewChild<ElementRef<HTMLInputElement>>('paletteInput');
  private dialogEl = viewChild<ElementRef<HTMLElement>>('paletteDialog');
  private restoreFocusTo: HTMLElement | null = null;

  filtered = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.commands();
    return this.commands().filter(
      (c) =>
        c.label.toLowerCase().includes(q) || (c.mode ?? '').toLowerCase().includes(q),
    );
  });

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
  }

  /**
   * Bound to the dialog rather than the input, so Escape fires wherever focus
   * sits. Tab is cycled inside the dialog because `aria-modal="true"` promises
   * assistive technology that everything outside is inert.
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close.emit();
      return;
    }
    if (event.key !== 'Tab') return;

    const focusable =
      this.dialogEl()?.nativeElement.querySelectorAll<HTMLElement>('input, button');
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
