import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { Badge } from '../../../ui/core/badge/badge';
import { MotionService } from '../../../ui/motion/motion.service';
import { blogPosts } from '../../../data/blog-posts.generated';
import { entryNumber } from '../../../core/navigation';
import { count } from '../../../core/count';
import { PageMeta } from '../../../core/page-meta';

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

  /**
   * `blogPosts` as generated — newest first, sorted once in
   * `scripts/generate-blog.mjs`. Read in that order and NOT re-sorted here:
   * `entryNumber` counts positions from the end of this exact array, so a
   * second sort with a different tie-break would renumber the entries.
   */
  readonly entries = blogPosts.map((post, index) => ({
    ...post,
    // Oldest entry is 0001; the newest carries the highest number.
    number: entryNumber(index),
  }));

  /**
   * The design reads `3 ENTRIES · RSS`. The count is real; the RSS half is
   * dropped, because this site serves no feed — there is no feed route, no
   * generated feed.xml in `public/`, and no `<link rel="alternate">` in
   * `index.html`. Advertising one would send readers to a 404.
   */
  readonly meta = count(this.entries.length, 'ENTRY', 'ENTRIES');

  constructor(private pageMeta: PageMeta) {}

  ngOnInit(): void {
    this.pageMeta.set({
      title: 'Blog - Hazel Granados',
      description: 'Notes on building software, by Hazel Granados.',
      path: '/blog',
    });
  }
}
