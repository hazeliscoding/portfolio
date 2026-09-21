import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

/**
 * Sets everything a route needs to present itself outside the site: the tab
 * title, the description, the Open Graph and Twitter cards, and the canonical
 * link.
 *
 * Before this existed, `<title>` and `<meta name="description">` were set per
 * route but the social tags were not — every page shipped the homepage's card
 * with `og:url` pointing at `/`. Facebook and LinkedIn key a shared object on
 * `og:url`, so sharing a project or a post deduplicated onto the homepage.
 */
export const SITE_ORIGIN = 'https://www.hazeliscoding.dev';

/**
 * The apex 307-redirects to www (verified), so www is the canonical host. Every
 * absolute URL this service emits uses it. Mixing the two is what creates the
 * split this service exists to close.
 */
export const SOCIAL_IMAGE = `${SITE_ORIGIN}/og-image.png`;

export interface PageMetaInput {
  /** Full tab title, e.g. `About - Hazel Granados`. */
  title: string;
  /** One prose sentence. Not a keyword list — search engines stopped rewarding those decades ago, and it is what a human reads under a shared link. */
  description: string;
  /** Route path with a leading slash, e.g. `/blog/hello-world`. */
  path: string;
  /**
   * Keep the page out of search results. The host serves the 404 with a 200
   * (it is an SPA fallback), so without this a crawler that finds a bad link
   * indexes a "record not found" page under whatever URL produced it. A
   * noindex page gets no canonical either — canonicalising a page you are
   * asking not to be indexed sends two contradictory signals.
   */
  noindex?: boolean;
}

@Injectable({ providedIn: 'root' })
export class PageMeta {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set({ title, description, path, noindex = false }: PageMetaInput): void {
    const url = `${SITE_ORIGIN}${path}`;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });

    // Angular derives the `property=` selector when `name` is absent, so these
    // update the existing index.html tags rather than appending duplicates.
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: SOCIAL_IMAGE });

    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: SOCIAL_IMAGE });

    if (noindex) {
      this.meta.updateTag({ name: 'robots', content: 'noindex' });
      this.removeCanonical();
    } else {
      this.meta.removeTag("name='robots'");
      this.setCanonical(url);
    }
  }

  /**
   * Angular ships no Link service, so this is done by hand. Create-or-update,
   * never append: a second canonical is worse than none, because search engines
   * discard the whole signal when they conflict.
   */
  private setCanonical(url: string): void {
    const head = this.doc.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private removeCanonical(): void {
    this.doc.head.querySelector('link[rel="canonical"]')?.remove();
  }
}
