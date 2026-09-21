import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { Window } from '../../../ui/windows/window/window';
import { PageMeta } from '../../../core/page-meta';

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
    private pageMeta: PageMeta,
    private router: Router,
  ) {
    this.currentPath = this.router.url;
  }

  ngOnInit(): void {
    this.pageMeta.set({
      title: 'Record not found - Hazel Granados',
      description: 'No record exists at this address.',
      path: this.currentPath,
      noindex: true,
    });
  }
}
