import { Component, input } from '@angular/core';

@Component({
  selector: 'app-title',
  imports: [],
  templateUrl: './app-title.html',
  styleUrl: './app-title.scss',
})
export class AppTitle {
  title = input('title');
}
