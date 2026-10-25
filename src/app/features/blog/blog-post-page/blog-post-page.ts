import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Button } from '../../../ui/core/button/button';
import { KeyValue, type KeyValueItem } from '../../../ui/data/key-value/key-value';
import { MotionService } from '../../../ui/motion/motion.service';
import { Window } from '../../../ui/windows/window/window';
import { RecordFault } from '../../../ui/record-fault/record-fault';
import { PageMeta, PERSON, SITE_ORIGIN, breadcrumbs } from '../../../core/page-meta';
import { BlogService, type BlogPost } from '../../../services/blog.service';
import { Comments } from './comments';
import { ProseHtml } from './prose-html';

interface Heading {
  /** The `id` the markdown renderer emitted; the contents link targets it. */
  id: string;
  text: string;
  /** `01` — the section number printed in mono ahead of the heading text. */
  idx: string;
}

/**
 * Decodes the handful of entities `marked` can emit inside heading text.
 * `&amp;` MUST be replaced last: if it ran first, an already-escaped
 * `&amp;lt;` (the literal text `&lt;`) would wrongly finish as `<` instead
 * of stopping at `&lt;`. See `decodeEntities.spec.ts` for a test that pins
 * this ordering and fails if it is ever changed.
 */
export function decodeEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * The post's length, counted from its own rendered markdown — the page prints
 * a word count and a reading time, and a declared number in frontmatter is
 * wrong the first time a paragraph is edited.
 *
 * Counted over the HTML with its tags stripped rather than over the markdown
 * source, so `##`, `-`, table pipes and link syntax are not counted as words
 * while the words inside a link are. A token has to contain a letter or a
 * digit to count, which keeps a lone em dash or bullet out of the total.
 */
export function countWords(html: string): number {
  const text = decodeEntities(html.replace(/<[^>]*>/g, ' '));
  return text.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/**
 * Fixed to en-US on purpose. The interface is English throughout, and a
 * locale-dependent separator would make the prerendered HTML depend on the
 * locale of whichever machine ran the build.
 */
function grouped(n: number): string {
  return n.toLocaleString('en-US');
}

/** Minutes at a steady 220 words a minute, never less than one. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 220));
}

@Component({
  selector: 'blog-post-page',
  standalone: true,
  imports: [RouterLink, Button, Comments, KeyValue, Window, RecordFault, ProseHtml],
  templateUrl: './blog-post-page.html',
  styleUrl: './blog-post-page.scss',
})
export class BlogPostPage {
  private readonly pageMeta = inject(PageMeta);
  private readonly route = inject(ActivatedRoute);
  private readonly blog = inject(BlogService);

  /** Drives the article's entrance animation; see blog-post-page.scss. */
  readonly motion = inject(MotionService);

  readonly post = signal<BlogPost | null>(null);
  /** Kept for the not-found branch, which reports the address that missed. */
  readonly slug = signal('');
  /**
   * The address the visitor asked for, handed to the fault panel. Derived from
   * the route parameter rather than read off `Router.url` inside that panel:
   * the panel sits in an `@else` block that stays mounted across one bad slug
   * to the next, so a value it captured once would name the previous miss.
   */
  readonly requestedPath = computed(() => `/blog/${this.slug()}`);
  readonly headings = signal<Heading[]>([]);
  readonly words = signal(0);

  /** The footer links: the parts either side in a series, else the entries either side. */
  readonly pager = computed(() => this.blog.getPager(this.post()?.slug ?? ''));

  /** Every part of this post's series, for the series card; empty when it stands alone. */
  readonly series = computed(() => this.blog.getSeries(this.post()?.slug ?? ''));

  /** `6 min read`, for the line above the title. */
  readonly readingTime = computed(() => `${readingMinutes(this.words())} min read`);

  readonly record = computed<KeyValueItem[]>(() => {
    const p = this.post();
    if (!p) return [];
    return [
      { key: 'Published', value: p.date },
      { key: 'Reading time', value: this.readingTime() },
      { key: 'Words', value: grouped(this.words()) },
      { key: 'Tags', value: String(p.tags.length) },
    ];
  });


  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') ?? '';
      const found = this.blog.getPostBySlug(slug);
      this.slug.set(slug);
      this.post.set(found);
      this.headings.set(found ? this.extractHeadings(found.html) : []);
      this.words.set(found ? countWords(found.html) : 0);
      // SAFETY: the body is written unsanitised by ProseHtml. This HTML comes
      // from markdown committed to this repository and rendered at build time —
      // it is exactly as trusted as the application source. Angular's sanitizer
      // strips `id`, which would break every contents link, so bypassing it is
      // necessary here.
      // SANITISE IT if blog content ever becomes externally sourced: CMS-fed,
      // accepting outside contributions, or fetched at runtime.

      if (found) {
        const path = `/blog/${found.slug}`;
        this.pageMeta.set({
          title: `${found.title} - Hazel Granados`,
          description: found.description,
          path,
          image: found.image || undefined,
          imageAlt: `${found.title} — blog post card, Hazel Granados`,
          article: { publishedTime: found.date, tags: found.tags },
          jsonLd: [
            {
              '@type': 'BlogPosting',
              headline: found.title,
              description: found.description,
              datePublished: found.date,
              dateModified: found.date,
              url: `${SITE_ORIGIN}${path}`,
              mainEntityOfPage: `${SITE_ORIGIN}${path}`,
              image: `${SITE_ORIGIN}${found.image || '/og-image.png'}`,
              keywords: found.tags,
              wordCount: this.words(),
              author: PERSON,
            },
            breadcrumbs(['Home', '/'], ['Blog', '/blog'], [found.title, path]),
          ],
        });
      } else {
        this.pageMeta.set({
          title: 'Post not found - Hazel Granados',
          description: 'No post exists at this address.',
          path: `/blog/${slug}`,
          // Same reason as the 404 route. The host answers an unknown slug with
          // a 404 status (scripts/postbuild.mjs), but a client-side navigation
          // gets no status at all, and the page must still disown itself.
          noindex: true,
        });
      }
    });
  }

  /**
   * Parses h2/h3 out of the rendered HTML with a regex rather than the DOM,
   * because this also runs during prerender where `document` is absent.
   * The id is read from the markup the renderer emitted — deriving it a second
   * time here would be a separate implementation of the same rule, free to drift.
   */
  private extractHeadings(html: string): Heading[] {
    const out: Heading[] = [];
    const re = /<h([23])[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      const text = decodeEntities(m[3].replace(/<[^>]+>/g, '').trim());
      if (!text) continue;
      out.push({ id: m[2], text, idx: String(out.length + 1).padStart(2, '0') });
    }
    return out;
  }
}
