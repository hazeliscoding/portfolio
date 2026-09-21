import { Component, input } from '@angular/core';
import { SignalState } from '../../core/signal-state';

export interface KeyValueItem {
  key: string;
  value: string;
  /**
   * Tints the value. KAIRO uses it for readings that carry a verdict — a
   * STATUS of ACTIVE in success green, a 404's PATH in alert red — and leaves
   * it unset for plain facts, which read in primary text.
   */
  state?: SignalState;
}

@Component({
  selector: 'app-key-value',
  standalone: true,
  imports: [],
  templateUrl: './key-value.html',
  styleUrl: './key-value.scss',
})
export class KeyValue {
  items = input<KeyValueItem[]>([]);
  columns = input(1);
}
