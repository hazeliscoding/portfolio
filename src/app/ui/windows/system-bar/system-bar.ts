import { Component, input } from '@angular/core';

@Component({
  selector: 'app-system-bar',
  standalone: true,
  imports: [],
  templateUrl: './system-bar.html',
  styleUrl: './system-bar.scss',
})
export class SystemBar {
  position = input<'top' | 'bottom'>('top');
}
