import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { KeyValue, KeyValueItem } from '../data/key-value/key-value';
import { Button } from '../core/button/button';

/**
 * The "nothing at this address" card.
 *
 * Three routes can produce it — the wildcard, a `/portfolio/:id` with no
 * matching project, and a `/blog/:slug` with no matching post — and they share
 * one card rather than drawing three that drift apart.
 *
 * The only thing that legitimately varies is where "back" goes, so that is the
 * only thing this takes as input.
 */
@Component({
  selector: 'app-record-fault',
  standalone: true,
  imports: [RouterLink, KeyValue, Button],
  templateUrl: './record-fault.html',
  styleUrl: './record-fault.scss',
})
export class RecordFault {
  private readonly router = inject(Router);

  /** The way back's label, one level up from the route that missed, e.g. `All projects`. */
  backLabel = input('Home');
  backRoute = input('/');

  /**
   * The address that actually missed, so the card never names the wrong URL.
   *
   * Supplied by the host page, because the page is what knows. Reading
   * `Router.url` here instead looked equivalent and was not: this component
   * lives inside an `@else` block, so navigating from one missing page to
   * another leaves the block true, Angular keeps the existing instance, and a
   * value captured at construction goes stale — the card then names the
   * *previous* bad URL, which is worse than naming none.
   *
   * The `Router.url` fallback covers the wildcard route, where the URL is all
   * there is to go on.
   */
  path = input('');

  private readonly effectivePath = computed(() => this.path() || this.router.url);

  /** `Back to all projects`, or just `Go home` when back is home. */
  readonly backAction = computed(() =>
    this.backRoute() === '/' ? 'Go home' : `Back to ${this.backLabel().toLowerCase()}`,
  );

  /** The second way out: home, unless back already goes home. */
  readonly other = computed(() =>
    this.backRoute() === '/'
      ? { label: 'See my projects', route: '/portfolio' }
      : { label: 'Go home', route: '/' },
  );

  /** The address carries the warning tint: it is the reading that explains the miss. */
  readonly report = computed<KeyValueItem[]>(() => [
    { key: 'Address', value: this.effectivePath(), state: 'danger' },
    { key: 'Status', value: '404 Not found' },
  ]);
}
