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

function decodeEntities(text: string): string {
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
      // Angular's built-in HTML sanitizer strips `id` attributes (they are
      // not in its HTML_ATTRS allowlist), which would silently kill every
      // CONTENTS anchor. The markdown is authored in-repo and rendered at
      // build time — it is not user input — so it is safe to mark it
      // trusted and bypass that sanitizer for this one binding.
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
