import { Component, input } from '@angular/core';
import { SignalState } from '../signal-state';

@Component({
  selector: 'app-status-light',
  standalone: true,
  imports: [],
  templateUrl: './status-light.html',
  styleUrl: './status-light.scss',
})
export class StatusLight {
  state = input<SignalState>('ok');
  label = input('');
  blink = input(false);
}
