import { Component, input, output } from '@angular/core';

export interface Column {
  key: string;
  label: string;
  width?: string;
}

export interface Row {
  id: string;
  cells: Record<string, string>;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
})
export class DataTable {
  columns = input<Column[]>([]);
  rows = input<Row[]>([]);
  selectedId = input('');
  density = input<'dense' | 'comfortable'>('dense');
  endLabel = input('');
  select = output<string>();
}
