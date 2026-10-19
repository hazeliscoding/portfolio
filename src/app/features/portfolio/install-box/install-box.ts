import { Component, input, signal } from '@angular/core';

/** Install-by-command in place of a download button, with a copy control. */
@Component({
  selector: 'app-install-box',
  standalone: true,
  templateUrl: './install-box.html',
  styleUrl: './install-box.scss',
})
export class InstallBox {
  readonly commands = input.required<string[]>();

  /** True for a moment after copying, for the button to say so. */
  readonly copied = signal(false);

  copy(): void {
    navigator.clipboard?.writeText(this.commands().join('\n')).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 1500);
    });
  }
}
