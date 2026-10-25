import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MotionService } from '../../../ui/motion/motion.service';
import { blogPosts } from '../../../data/blog-posts.generated';
import { count } from '../../../core/count';
import { PageMeta, PERSON, SITE_ORIGIN, breadcrumbs } from '../../../core/page-meta';

/**
 * A tag's listing stays out of search until it gathers this many posts.
 * Below it the page is a near-copy of the blog with fewer cards — useful to a
 * reader following a tag, thin to a search engine.
 */
const INDEXABLE_TAG_ENTRIES = 3;

/** `Puzzle Boy · Part 2`, numbered by date like the post page's series card; '' for a lone post. */
function seriesLabel(post: (typeof blogPosts)[number]): string {
  if (!post.series) return '';
  // `blogPosts` is newest first, so the oldest part is the last one listed.
  const parts = blogPosts.filter((p) => p.series === post.series).reverse();
  return `${post.series} · Part ${parts.indexOf(post) + 1}`;
}

@Component({
  selector: 'blog-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
})
export class BlogPage {
  /** The cards rise in on every visit, so the page needs the cue too. */
  readonly motion = inject(MotionService);
  private readonly route = inject(ActivatedRoute);
  private readonly pageMeta = inject(PageMeta);

  /**
   * `blogPosts` as generated — newest first, sorted once in
   * `scripts/generate-blog.mjs` — and not re-sorted here, so the blog and a
   * tag listing always agree on the order.
   */
  private readonly allEntries = blogPosts.map((post) => ({ ...post, part: seriesLabel(post) }));

  /** Every tag in use with its post count, most-used first. */
  readonly tags = Object.entries(
    blogPosts
      .flatMap((post) => post.tags)
      .reduce<Record<string, number>>((acc, tag) => ({ ...acc, [tag]: (acc[tag] ?? 0) + 1 }), {}),
  )
    .map(([name, entries]) => ({ name, entries }))
    .sort((a, b) => b.entries - a.entries || a.name.localeCompare(b.name));

  /** The tag being listed on `/blog/tags/:tag`; null on `/blog`. */
  readonly tag = signal<string | null>(null);

  readonly entries = computed(() => {
    const tag = this.tag();
    return tag ? this.allEntries.filter((entry) => entry.tags.includes(tag)) : this.allEntries;
  });

  /** `5 posts`, printed beside the feed link. */
  readonly meta = computed(() => count(this.entries().length, 'post', 'posts'));

  ngOnInit(): void {
    // One instance serves /blog/tags/a then /blog/tags/b, so the tag is read
    // on every change rather than once.
    this.route.paramMap.subscribe((params) => {
      const tag = params.get('tag');
      this.tag.set(tag);

      if (!tag) {
        this.pageMeta.set({
          title: 'Blog - Hazel Granados',
          description:
            'Notes by Hazel Granados on building software: reverse engineering, coding agents, C# and .NET, and the open-source projects behind them.',
          path: '/blog',
          jsonLd: [
            { '@type': 'Blog', name: 'Hazel Granados — Blog', url: `${SITE_ORIGIN}/blog`, author: PERSON },
          ],
        });
        return;
      }

      const n = this.entries().length;
      this.pageMeta.set({
        title: `Entries tagged ${tag} - Hazel Granados`,
        description: n
          ? `${count(n, 'entry', 'entries')} tagged ${tag} on Hazel Granados's blog about building software.`
          : 'No entries carry this tag.',
        path: `/blog/tags/${tag}`,
        noindex: n < INDEXABLE_TAG_ENTRIES,
        jsonLd: [breadcrumbs(['Home', '/'], ['Blog', '/blog'], [tag, `/blog/tags/${tag}`])],
      });
    });
  }
}
