import { Component, input } from '@angular/core';

export type BadgeTone =
  | 'neutral'
  | 'active'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.scss',
})
export class Badge {
  tone = input<BadgeTone>('neutral');
  filled = input(false);
}
