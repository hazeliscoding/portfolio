import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-button.html',
  styleUrl: './app-button.scss',
})
export class AppButton {
  @Input() route: string = '';
  @Input() scrollTo: string = '';

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
  ) { }

  get safeHref(): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(this.route || '#');
  }

  handleClick(event: Event) {
    if (this.scrollTo) {
      event.preventDefault();
      this.scrollToElement(this.scrollTo);
    } else if (this.route) {
      event.preventDefault();
      this.router.navigate([this.route]);
    }
  }

  private scrollToElement(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
