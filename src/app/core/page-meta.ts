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
const SOCIAL_IMAGE_ALT =
  'hazel.exe — operator profile terminal card, Hazel Granados, software developer';

/**
 * The one person this site is about, referenced by `@id` from every page's
 * structured data so search engines resolve every author and every page's
 * subject to the same entity.
 */
export const PERSON = {
  '@type': 'Person',
  '@id': `${SITE_ORIGIN}/#person`,
  name: 'Hazel Granados',
  url: `${SITE_ORIGIN}/`,
  jobTitle: 'Full-Stack Developer',
  knowsAbout: ['C#', '.NET', 'Angular', 'TypeScript', 'AI engineering', 'LLM evaluation'],
  sameAs: ['https://github.com/hazeliscoding', 'https://www.linkedin.com/in/hazelgranados'],
};

/** A schema.org BreadcrumbList from `[name, path]` pairs, root first. */
export function breadcrumbs(...items: [name: string, path: string][]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: `${SITE_ORIGIN}${path}`,
    })),
  };
}

export interface PageMetaInput {
  /** Full tab title, e.g. `About - Hazel Granados`. */
  title: string;
  /** One prose sentence. Not a keyword list — search engines stopped rewarding those decades ago, and it is what a human reads under a shared link. */
  description: string;
  /** Route path with a leading slash, e.g. `/blog/hello-world`. */
  path: string;
  /**
   * Keep the page out of search results. The host now answers an unknown path
   * with a real 404, but a route can still match and find nothing (a slug with
   * no post), and a thin page can exist for readers rather than search. A
   * noindex page gets no canonical either — canonicalising a page you are
   * asking not to be indexed sends two contradictory signals. It is also left
   * out of the sitemap, which scripts/postbuild.mjs reads off these tags.
   */
  noindex?: boolean;
  /** Root-relative social card for this page; the site card when absent. */
  image?: string;
  /** Describes `image`; required with it, since the site card's alt would lie. */
  imageAlt?: string;
  /**
   * Marks the page as an article: `og:type=article` plus its date and tags.
   * The date also becomes the page's `<lastmod>` in the sitemap.
   */
  article?: { publishedTime: string; tags: string[] };
  /** schema.org nodes for this page, emitted together as one JSON-LD `@graph`. */
  jsonLd?: object[];
}

@Injectable({ providedIn: 'root' })
export class PageMeta {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set({
    title,
    description,
    path,
    noindex = false,
    image,
    imageAlt,
    article,
    jsonLd,
  }: PageMetaInput): void {
    const url = `${SITE_ORIGIN}${path}`;
    const imageUrl = image ? `${SITE_ORIGIN}${image}` : SOCIAL_IMAGE;
    const alt = image ? (imageAlt ?? title) : SOCIAL_IMAGE_ALT;

    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });

    // Angular derives the `property=` selector when `name` is absent, so these
    // update the existing index.html tags rather than appending duplicates.
    this.meta.updateTag({ property: 'og:type', content: article ? 'article' : 'website' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: imageUrl });
    this.meta.updateTag({ property: 'og:image:alt', content: alt });

    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
    this.meta.updateTag({ name: 'twitter:image:alt', content: alt });

    // Removed first, every time: a page that is not an article must not keep
    // the previous post's date and tags after a client-side navigation.
    this.meta.removeTag("property='article:published_time'");
    this.meta.getTags("property='article:tag'").forEach((tag) => this.meta.removeTagElement(tag));
    if (article) {
      this.meta.addTag({ property: 'article:published_time', content: article.publishedTime });
      this.meta.addTags(article.tags.map((tag) => ({ property: 'article:tag', content: tag })));
    }

    this.setJsonLd(jsonLd);

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

  /**
   * Replace-or-remove, like the canonical: one script per page, never one per
   * navigation. `<` is escaped so a `</script>` inside a title cannot end the
   * element early.
   */
  private setJsonLd(nodes: object[] | undefined): void {
    this.doc.head.querySelector('script[type="application/ld+json"]')?.remove();
    if (!nodes?.length) return;

    const script = this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': nodes,
    }).replace(/</g, '\\u003c');
    this.doc.head.appendChild(script);
  }
}
