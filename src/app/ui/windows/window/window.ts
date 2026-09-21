import { Component, inject, input } from '@angular/core';
import { MotionService } from '../../motion/motion.service';

export type WindowVariant =
  | 'data'
  | 'media'
  | 'dialogue'
  | 'command'
  | 'inspector'
  | 'system'
  | 'alert'
  | 'transient'
  | 'viewport';

@Component({
  selector: 'app-window',
  standalone: true,
  imports: [],
  templateUrl: './window.html',
  styleUrl: './window.scss',
})
export class Window {
  motion = inject(MotionService);

  variant = input<WindowVariant>('data');
  title = input('');
  index = input('');
  context = input('');
  status = input('');
  active = input(false);
  padded = input(true);
  /**
   * Entrance stagger, as a CSS time with its unit — `'120ms'`, not `'120'`.
   * A unitless value is invalid CSS, so the browser drops it silently and the
   * panel arrives with the rest, which looks identical to forgetting the input.
   * Empty (the default) removes the inline style rather than setting an empty
   * one.
   */
  delay = input('');
}
