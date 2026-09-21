import { Component, inject, input } from '@angular/core';
import { MotionService } from '../motion/motion.service';

@Component({
  selector: 'app-chapter-header',
  standalone: true,
  imports: [],
  templateUrl: './chapter-header.html',
  styleUrl: './chapter-header.scss',
})
export class ChapterHeader {
  motion = inject(MotionService);

  code = input('');
  index = input('');
  context = input('');
  status = input('');
}
