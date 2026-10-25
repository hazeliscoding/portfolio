import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { RecordFault } from '../../../ui/record-fault/record-fault';
import { PageMeta } from '../../../core/page-meta';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [RecordFault],
  templateUrl: './error-page.html',
  styleUrl: './error-page.scss',
})
export class ErrorPage implements OnInit {
  private readonly pageMeta = inject(PageMeta);
  private readonly router = inject(Router);

  /**
   * Read once, at construction. `Router.url` is already the new URL by the time
   * a routed component is created — the router assigns `currentUrlTree` before
   * it activates routes — so this is the address the visitor asked for. It is
   * not re-read afterwards because the wildcard route's component is only torn
   * down and rebuilt when the next navigation matches a *different* route
   * config, and every in-app control on this site points at a real route.
   */
  readonly currentPath = this.router.url;

  ngOnInit(): void {
    // The host serves this page as 404.html with a 404 status (see
    // scripts/postbuild.mjs). `noindex` is the second line of defence, for a
    // client-side navigation that never receives a status, and it also
    // suppresses the canonical link — see PageMeta.
    this.pageMeta.set({
      title: 'Page not found - Hazel Granados',
      description: 'Nothing lives at this address.',
      path: this.currentPath,
      noindex: true,
    });
  }
}
