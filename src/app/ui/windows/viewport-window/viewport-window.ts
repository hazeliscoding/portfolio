import { Component, input } from '@angular/core';

@Component({
  selector: 'app-viewport-window',
  standalone: true,
  imports: [],
  templateUrl: './viewport-window.html',
  styleUrl: './viewport-window.scss',
})
export class ViewportWindow {
  src = input('');
  alt = input('');
  ratio = input('4 / 3');
  pixelated = input(false);
  label = input('');
}
