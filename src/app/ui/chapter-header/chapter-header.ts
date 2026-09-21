import { Component, input } from '@angular/core';

@Component({
  selector: 'app-chapter-header',
  standalone: true,
  imports: [],
  templateUrl: './chapter-header.html',
  styleUrl: './chapter-header.scss',
})
export class ChapterHeader {
  code = input('');
  index = input('');
  context = input('');
  status = input('');
  environmental = input('');
}
