import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { ChapterHeader } from '../chapter-header/chapter-header';
import { Window } from '../windows/window/window';
import { KeyValue, KeyValueItem } from '../data/key-value/key-value';
import { Button } from '../core/button/button';

/**
 * The "no record at this address" screen.
 *
 * Three routes can produce it — the wildcard, a `/portfolio/:id` with no
 * matching record, and a `/blog/:slug` with no matching entry — and KAIRO
 * draws one fault panel, not three. It lived inline in all three pages after
 * the redesign and had already drifted: two of them had the alert window with
 * the key-value readout and the Home / Open archive controls, and the third
 * still had an older, smaller panel with a bare text link and no chapter
 * header at all.
 *
 * The only thing that legitimately varies is where "back" goes, so that is the
 * only thing this takes as input.
 */
@Component({
  selector: 'app-record-fault',
  standalone: true,
  imports: [ChapterHeader, Window, KeyValue, Button],
  templateUrl: './record-fault.html',
  styleUrl: './record-fault.scss',
})
export class RecordFault {
  private readonly router = inject(Router);

  /** Where one level up is from the route that faulted, e.g. `ARCHIVE_03`. */
  backLabel = input('HOME_01');
  backRoute = input('/');

  /**
   * The address that actually produced the fault. The design demo prints a
   * fixed `/portfolio/unknown-record`; printing that would tell every visitor
   * the wrong URL failed, so this is the one reading on the panel that has to
   * be true.
   *
   * Supplied by the host page, because the page is what knows. Reading
   * `Router.url` here instead looked equivalent and was not: this component
   * lives inside an `@else` block, so navigating from one missing record to
   * another leaves the block true, Angular keeps the existing instance, and a
   * value captured at construction goes stale — the panel then names the
   * *previous* bad URL, which is worse than naming none.
   *
   * The `Router.url` fallback covers the wildcard route, where the URL is all
   * there is to go on.
   */
  path = input('');

  private readonly effectivePath = computed(() => this.path() || this.router.url);

  /**
   * PATH carries the alert tint because it is the reading that holds the
   * verdict; CODE is a plain fact and stays in primary text.
   */
  readonly report = computed<KeyValueItem[]>(() => [
    { key: 'PATH', value: this.effectivePath(), state: 'danger' },
    { key: 'CODE', value: '404 NOT_FOUND' },
  ]);
}
