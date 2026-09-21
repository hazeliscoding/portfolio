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
  delay = input('');
}
