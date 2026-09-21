import { Component, computed, input, output, signal } from '@angular/core';

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

  filtered = computed(() => {
    const q = this.query().toLowerCase();
    if (!q) return this.commands();
    return this.commands().filter(
      (c) =>
        c.label.toLowerCase().includes(q) || (c.mode ?? '').toLowerCase().includes(q),
    );
  });

  onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close.emit();
    }
  }
}
