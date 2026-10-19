import { Directive, ElementRef, effect, inject, input } from '@angular/core';

/**
 * Sets the element's innerHTML, unless the prerendered page already carries
 * exactly that HTML.
 *
 * A plain `[innerHTML]` binding is re-applied when the client hydrates, which
 * replaces every node of the article with an identical copy. Measured on the
 * live site: 52 of 52 nodes in an entry's body removed and re-inserted, so the
 * whole entry painted a second time after the JavaScript ran, and that second
 * paint was the page's Largest Contentful Paint (3.3s on a throttled phone).
 *
 * The prerender stamps a fingerprint of the HTML on the element; the client
 * skips the write while the fingerprint still matches, and writes normally on
 * a client-side navigation to another entry.
 */
@Directive({ selector: '[appProseHtml]' })
export class ProseHtml {
  readonly html = input.required<string>({ alias: 'appProseHtml' });
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;

  constructor() {
    effect(() => {
      const html = this.html();
      const key = fingerprint(html);
      if (this.el.getAttribute('data-html') === key) return;
      this.el.innerHTML = html;
      this.el.setAttribute('data-html', key);
    });
  }
}

/** FNV-1a over the UTF-16 units: stable across server and browser, and cheap. */
export function fingerprint(text: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}
