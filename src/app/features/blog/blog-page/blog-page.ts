import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { Badge } from '../../../ui/core/badge/badge';
import { MotionService } from '../../../ui/motion/motion.service';
import { blogPosts } from '../../../data/blog-posts.generated';
import { entryNumber } from '../../../core/navigation';
import { count } from '../../../core/count';
import { PageMeta, PERSON, SITE_ORIGIN, breadcrumbs } from '../../../core/page-meta';

/**
 * A tag's listing stays out of search until it gathers this many entries.
 * Below it the page is a near-copy of the log with fewer rows — useful to a
 * reader following a tag, thin to a search engine.
 */
const INDEXABLE_TAG_ENTRIES = 3;

@Component({
  selector: 'blog-page',
  standalone: true,
  imports: [RouterLink, ChapterHeader, Window, Badge],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
})
export class BlogPage {
  /** The standfirst fades in with the panel, so the page needs the cue too. */
  readonly motion = inject(MotionService);
  private readonly route = inject(ActivatedRoute);
  private readonly pageMeta = inject(PageMeta);

  /**
   * `blogPosts` as generated — newest first, sorted once in
   * `scripts/generate-blog.mjs`. Read in that order and NOT re-sorted here:
   * `entryNumber` counts positions from the end of this exact array, so a
   * second sort with a different tie-break would renumber the entries. A tag
   * listing filters this list, so an entry keeps its number everywhere.
   */
  private readonly allEntries = blogPosts.map((post, index) => ({
    ...post,
    // Oldest entry is 0001; the newest carries the highest number.
    number: entryNumber(index),
  }));

  /** Every tag in use with its entry count, most-used first. */
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

  /** `3 ENTRIES`, followed by the RSS link the header projects. */
  readonly meta = computed(() => count(this.entries().length, 'ENTRY', 'ENTRIES'));

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
