import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private currentPath = '/';
  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentPath = (event as NavigationEnd).urlAfterRedirects.split('?')[0];
      });
  }

  isMenuOpen = false;

  isActive(route: string) {
    if (route === '/') {
      return this.currentPath === '/';
    }

    return this.currentPath === route || this.currentPath.startsWith(`${route}/`);
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;

    if (this.isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
}
