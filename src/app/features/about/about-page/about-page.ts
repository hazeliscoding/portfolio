import { Component } from '@angular/core';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { Badge } from '../../../ui/core/badge/badge';
import { PageMeta } from '../../../core/page-meta';

@Component({
  selector: 'about-page',
  standalone: true,
  imports: [ChapterHeader, Window, KeyValue, Badge],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage {
  /** Paragraphs harvested verbatim from about-section.ts `paragraphs`. */
  bio: string[] = [
    "I'm Hazel Granados (she/they), a software developer with a B.S. in Computer Science from Texas A&M University–Victoria.",
    'I enjoy building modern web apps with strong UX, solid architecture, and maintainable code.',
    'I am always learning and looking for interesting problems to solve.',
  ];

  /**
   * Harvested from about-section.ts `location`, which the old component
   * rendered in its own block rather than as prose. `key: 'Location'` is a
   * structural label (KeyValueItem needs one); the value is verbatim.
   */
  location: KeyValueItem[] = [{ key: 'Location', value: 'Texas, USA' }];

  /**
   * Values harvested from education-section.ts `degrees[0]` (title/type/data
   * fields). Keys (`Degree`/`Field`/`School`) are structural labels required
   * by KeyValueItem's shape, not harvested facts — matching the convention
   * already used elsewhere in this codebase (e.g. project-detail-page.ts's
   * STATUS/YEAR/STACK).
   */
  education: KeyValueItem[] = [
    { key: 'Degree', value: 'B.S. Degree' },
    { key: 'Field', value: 'Computer Science' },
    { key: 'School', value: 'Texas A&M University–Victoria' },
  ];

  /**
   * Harvested from languages-section.ts `languages[0]` (`'English — Native'`),
   * split on the em dash into key/value. Both sides are verbatim; only the
   * split is a structural transformation, not an invented fact.
   */
  languages: KeyValueItem[] = [{ key: 'English', value: 'Native' }];

  /** Harvested verbatim from interests-section.ts `interests`. */
  interests: string[] = [
    'Full-stack (.NET + Angular)',
    'Cloud & serverless (AWS/Azure)',
    'Microservices & event-driven systems',
    'Performance, testing & CI/CD',
  ];

  constructor(
    private pageMeta: PageMeta,
  ) {}

  ngOnInit(): void {
    this.pageMeta.set({
      title: 'About - Hazel Granados',
      description: 'About Hazel Granados — software developer.',
      path: '/about',
    });
  }
}
