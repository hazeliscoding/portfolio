import { Component } from '@angular/core';
import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [TerminalSection],
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss',
})
export class ErrorPage {
  currentPath = '';

  constructor(private router: Router) {
    this.currentPath = this.router.url;
  }
}
