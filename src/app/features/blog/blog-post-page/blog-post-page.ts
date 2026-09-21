import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

import { Button } from '../../../ui/core/button/button';
import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { KeyValue, type KeyValueItem } from '../../../ui/data/key-value/key-value';
import { MotionService } from '../../../ui/motion/motion.service';
import { Window } from '../../../ui/windows/window/window';
import { RecordFault } from '../../../ui/record-fault/record-fault';
import { count } from '../../../core/count';
import { entryNumber } from '../../../core/navigation';
import { PageMeta } from '../../../core/page-meta';
import { blogPosts } from '../../../data/blog-posts.generated';
import { BlogService, type BlogPost } from '../../../services/blog.service';

interface Heading {
  /** The `id` the markdown renderer emitted; the CONTENTS anchor targets it. */
  id: string;
  text: string;
  /** `§01` — the section marker printed in mono ahead of the heading text. */
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
 * The entry's length, counted from the post's own rendered markdown — the
 * design prints `2,400 WORDS` in the chapter meta and a declared number in
 * frontmatter is wrong the first time a paragraph is edited.
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

@Component({
  selector: 'blog-post-page',
  standalone: true,
  imports: [RouterLink, Button, ChapterHeader, KeyValue, Window, RecordFault],
  templateUrl: './blog-post-page.html',
  styleUrl: './blog-post-page.scss',
})
export class BlogPostPage {
  private readonly pageMeta = inject(PageMeta);
  private readonly route = inject(ActivatedRoute);
  private readonly blog = inject(BlogService);
  private readonly sanitizer = inject(DomSanitizer);

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
  readonly bodyHtml = signal<SafeHtml>('');
  readonly words = signal(0);

  /**
   * Derived from the entry's position in `blogPosts` through the same helper
   * the shell uses, so the chapter index, the top bar's path label and the
   * environmental word can never print three different numbers for one entry.
   */
  readonly entry = computed(() => {
    const p = this.post();
    if (!p) return '';
    return entryNumber(blogPosts.findIndex((candidate) => candidate.slug === p.slug));
  });

  /** `2026-01-16 · ANGULAR · PORTFOLIO · PERSONAL`. */
  readonly eyebrow = computed(() => {
    const p = this.post();
    if (!p) return '';
    return [p.date, ...p.tags.map((tag) => tag.toUpperCase())].join(' · ');
  });

  readonly wordsMeta = computed(() => {
    const n = this.words();
    // count() owns the plural rule for the whole site (core/count.ts). It
    // prints the number ungrouped, and the design prints it grouped, so the
    // digits it produced are swapped for the grouped form rather than the
    // singular/plural test being written out a second time here.
    return count(n, 'WORD', 'WORDS').replace(String(n), grouped(n));
  });

  readonly record = computed<KeyValueItem[]>(() => {
    const p = this.post();
    if (!p) return [];
    return [
      { key: 'DATE', value: p.date },
      { key: 'ENTRY', value: this.entry() },
      { key: 'WORDS', value: grouped(this.words()) },
      // Two digits, like every other count in the instrument chrome.
      { key: 'TAGS', value: String(p.tags.length).padStart(2, '0') },
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
      // SAFETY: this HTML comes from markdown committed to this repository and
      // rendered at build time — it is exactly as trusted as the application
      // source. Angular's sanitizer strips `id`, which would break every CONTENTS
      // anchor, so the bypass is necessary here.
      // REMOVE THIS BYPASS if blog content ever becomes externally sourced:
      // CMS-fed, accepting outside contributions, or fetched at runtime.
      this.bodyHtml.set(found ? this.sanitizer.bypassSecurityTrustHtml(found.html) : '');

      if (found) {
        this.pageMeta.set({
          title: `${found.title} - Hazel Granados`,
          description: found.description,
          path: `/blog/${found.slug}`,
        });
      } else {
        this.pageMeta.set({
          title: 'Record not found - Hazel Granados',
          description: 'No entry exists at this address.',
          path: `/blog/${slug}`,
          // Same reason as the 404 route: the host serves this with a 200, so
          // without it a crawler indexes a "record not found" page under
          // whatever bad link it followed.
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
      out.push({ id: m[2], text, idx: `§${String(out.length + 1).padStart(2, '0')}` });
    }
    return out;
  }
}
