import { Component, input } from '@angular/core';

@Component({
  selector: 'app-terminal-line',
  imports: [],
  templateUrl: './terminal-line.html',
  styleUrl: './terminal-line.scss',
})
export class TerminalLine {
  short = input(false);
  command = input('whoami');
  error = input(false);

  username = 'hazel';
  hostname = 'ubuntu';
  path = '~';
  prompt = '$';
}
