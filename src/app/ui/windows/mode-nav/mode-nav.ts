import { Component, input, output } from '@angular/core';

export interface Mode {
  id: string;
  label: string;
  index: string;
  route: string;
}

@Component({
  selector: 'app-mode-nav',
  standalone: true,
  imports: [],
  templateUrl: './mode-nav.html',
  styleUrl: './mode-nav.scss',
})
export class ModeNav {
  modes = input<Mode[]>([]);
  activeId = input('');
  header = input('MODE');
  select = output<string>();
}
