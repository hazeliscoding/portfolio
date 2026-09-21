import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MotionService } from '../motion/motion.service';

@Component({
  selector: 'app-chapter-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './chapter-header.html',
  styleUrl: './chapter-header.scss',
})
export class ChapterHeader {
  motion = inject(MotionService);

  /** The chapter word, e.g. `HOME`. Set in the title's own weight. */
  code = input('');
  /**
   * Rendered as `_NN` in the active red after the code. Optional: a record
   * detail screen's chapter IS the record's title, and appending an index to
   * it would invent a number the page does not have.
   */
  index = input('');
  /** Right-aligned instrument line — record counts, word counts, timestamps. */
  meta = input('');
  /**
   * The return affordance, e.g. `ARCHIVE_03`. Rendered as `< ARCHIVE_03`
   * before the title. Empty renders nothing.
   */
  backLabel = input('');
  backRoute = input('/');
  /**
   * Whether the chapter is the page's heading.
   *
   * True everywhere the content has no title of its own. False on a blog
   * entry, where the post's `<h1>` is the heading and the chapter is a
   * location label — two `<h1>`s on one page is not what either the design or
   * a screen reader wants. Styling is identical either way.
   */
  heading = input(true);
}
