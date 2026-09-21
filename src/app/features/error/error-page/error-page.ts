import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { Window } from '../../../ui/windows/window/window';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [RouterLink, Window],
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss',
})
export class ErrorPage {
  currentPath = '';

  constructor(
    private router: Router,
    private title: Title,
  ) {
    this.currentPath = this.router.url;
  }

  ngOnInit(): void {
    this.title.setTitle('Record not found - Hazel Granados');
  }
}
