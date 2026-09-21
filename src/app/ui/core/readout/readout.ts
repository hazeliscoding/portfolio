import { Component, input } from '@angular/core';
import { SignalState } from '../signal-state';

@Component({
  selector: 'app-readout',
  standalone: true,
  imports: [],
  templateUrl: './readout.html',
  styleUrl: './readout.scss',
})
export class Readout {
  label = input('');
  value = input('');
  state = input<SignalState>('neutral');
}
