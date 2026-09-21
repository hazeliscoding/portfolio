import { Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text' | 'command';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './button.html',
  styleUrl: './button.scss',
})
export class Button {
  variant = input<ButtonVariant>('secondary');
  size = input<ButtonSize>('md');
  index = input('');
  disabled = input(false);

  /**
   * Give it a destination and it renders an `<a>` instead of a `<button>`,
   * styled identically. A control that navigates should be a link: it can then
   * be middle-clicked, opened in a new tab, copied, and announced as a link
   * rather than as something that acts on this page.
   *
   * `routerLink` for in-app routes, `href` for anything that leaves the SPA —
   * a file download, a mailto:, an external profile.
   */
  routerLink = input<string | unknown[] | null>(null);
  href = input('');
  /** Filename for a download link. Ignored unless `href` is set. */
  download = input('');
  /** Opens an `href` in a new tab with the usual rel hardening. */
  external = input(false);
}
