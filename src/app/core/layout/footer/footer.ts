import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  @Input() key: string = '';

  getCurrentYear() {
    return new Date().getFullYear()
  }
}
