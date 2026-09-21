import { Component, input } from '@angular/core';

export interface KeyValueItem {
  key: string;
  value: string;
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
