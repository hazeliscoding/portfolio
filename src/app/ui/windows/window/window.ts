import { Component, computed, inject, input } from '@angular/core';
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

  /**
   * Three states, not two — KAIRO's Window distinguishes them and the panels
   * read differently in each.
   *
   * `true`  — focused: variant accent on the top rule, strong border, corner
   *           bracket.
   * `null`  — neutral (the default): grey top rule, faint border, full opacity.
   * `false` — explicitly backgrounded: as neutral, but dimmed to
   *           `--opacity-inactive`. The projects grid uses this to push every
   *           card except the hovered one back.
   *
   * A plain boolean cannot express the middle state, and collapsing it is what
   * put a coloured accent on every panel on the page instead of on the one
   * that owns attention.
   */
  active = input<boolean | null>(null);
  padded = input(true);
  /** Rendered as the window's bottom meta strip. Empty renders no strip. */
  footer = input('');
  /**
   * Entrance stagger, as a CSS time with its unit — `'120ms'`, not `'120'`.
   * A unitless value is invalid CSS, so the browser drops it silently and the
   * panel arrives with the rest, which looks identical to forgetting the input.
   * Empty (the default) removes the inline style rather than setting an empty
   * one.
   */
  delay = input('');

  /** `null` leaves the attribute off entirely, so CSS can match its absence. */
  activeAttr = computed(() => {
    const value = this.active();
    return value === null ? null : String(value);
  });
}
