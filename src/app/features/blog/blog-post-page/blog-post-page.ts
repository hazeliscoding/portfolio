import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, Meta, Title, type SafeHtml } from '@angular/platform-browser';
import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { Badge } from '../../../ui/core/badge/badge';
import { BlogService, type BlogPost } from '../../../services/blog.service';

interface Heading {
  id: string;
  text: string;
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

@Component({
  selector: 'blog-post-page',
  standalone: true,
  imports: [RouterLink, ChapterHeader, Window, KeyValue, Badge],
  templateUrl: './blog-post-page.html',
  styleUrl: './blog-post-page.scss',
})
export class BlogPostPage {
  post = signal<BlogPost | null>(null);
  headings = signal<Heading[]>([]);
  bodyHtml = signal<SafeHtml>('');

  constructor(
    private route: ActivatedRoute,
    private blog: BlogService,
    private title: Title,
    private meta: Meta,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') ?? '';
      const found = this.blog.getPostBySlug(slug);
      this.post.set(found);
      this.headings.set(found ? this.extractHeadings(found.html) : []);
      // SAFETY: this HTML comes from markdown committed to this repository and
      // rendered at build time — it is exactly as trusted as the application
      // source. Angular's sanitizer strips `id`, which would break every CONTENTS
      // anchor, so the bypass is necessary here.
      // REMOVE THIS BYPASS if blog content ever becomes externally sourced:
      // CMS-fed, accepting outside contributions, or fetched at runtime.
      this.bodyHtml.set(found ? this.sanitizer.bypassSecurityTrustHtml(found.html) : '');

      if (found) {
        this.title.setTitle(`${found.title} - Hazel Granados`);
        this.meta.updateTag({ name: 'description', content: found.description });
      } else {
        this.title.setTitle('Post not found - Hazel Granados');
        this.meta.updateTag({
          name: 'description',
          content: 'This blog post could not be found.',
        });
      }
    });
  }

  record(): KeyValueItem[] {
    const p = this.post();
    if (!p) return [];
    return [
      { key: 'DATE', value: p.date },
      { key: 'SLUG', value: p.slug },
      { key: 'TAGS', value: String(p.tags.length) },
    ];
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
      out.push({ id: m[2], text });
    }
    return out;
  }
}
