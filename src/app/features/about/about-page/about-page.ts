import { Component, OnInit } from '@angular/core';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { Button } from '../../../ui/core/button/button';
import { count } from '../../../core/count';
import { PageMeta } from '../../../core/page-meta';

/**
 * The two resume artefacts that really exist in `public/resume/`. Root-relative
 * so the href is the same string whichever route links it — a bare
 * `resume/...` only resolves correctly because of `<base href="/">`, which is a
 * dependency worth not having.
 */
const RESUME_PDF = '/resume/resume-en.pdf';
const RESUME_DOCX = '/resume/resume-en.docx';

/**
 * Read off the PDF itself (`/Count 1` in its page tree) rather than asserted:
 * the footer strip is an instrument reading, and an instrument that is wrong
 * about the thing it is pointed at is worse than no instrument.
 */
const RESUME_PAGES = 1;

/**
 * Month the PDF last changed, from its last commit (2026-01-15). The design
 * demo prints `UPDATED 2026-09`, which is the mock's own date — reproducing
 * that literally would publish a claim about the file that is not true. If the
 * resume is replaced, this moves with it.
 */
const RESUME_UPDATED = '2026-01';

/**
 * Panels on this screen. It is the chapter header's `N SECTIONS` reading, so it
 * has to equal the number of `<app-window>` elements in the template — the spec
 * asserts exactly that, which is what keeps the two from drifting apart.
 */
const SECTION_COUNT = 5;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

@Component({
  selector: 'about-page',
  standalone: true,
  imports: [ChapterHeader, Window, ViewportWindow, KeyValue, Button],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage implements OnInit {
  /** Paragraphs harvested verbatim from about-section.ts `paragraphs`. */
  bio: string[] = [
    "I'm Hazel Granados (she/they), a software developer with a B.S. in Computer Science from Texas A&M University–Victoria.",
    'I enjoy building modern web apps with strong UX, solid architecture, and maintainable code.',
    'I am always learning and looking for interesting problems to solve.',
  ];

  /**
   * The two-up readout under the bio. `LOCATION` is harvested from
   * about-section.ts `location`; `PRONOUNS` is the parenthetical the first bio
   * paragraph already states out loud, lifted into a field so it is
   * machine-readable as well as prose. Keys are structural labels, uppercase to
   * match every other KeyValue on the site.
   */
  profile: KeyValueItem[] = [
    { key: 'LOCATION', value: 'Texas, USA' },
    { key: 'PRONOUNS', value: 'she/they' },
  ];

  /**
   * Two rows, not the three this page used to carry. The design's education
   * inspector reads DEGREE / INSTITUTION, so the old `Degree: B.S. Degree` +
   * `Field: Computer Science` split is joined back into the one fact it always
   * was — "B.S. Computer Science" — which is also how the bio states it.
   */
  education: KeyValueItem[] = [
    { key: 'DEGREE', value: 'B.S. Computer Science' },
    { key: 'INSTITUTION', value: 'Texas A&M University–Victoria' },
  ];

  /**
   * Harvested from languages-section.ts `languages[0]` (`'English — Native'`),
   * split on the em dash into key/value. Both sides are verbatim; only the
   * split is a structural transformation, not an invented fact.
   */
  languages: KeyValueItem[] = [{ key: 'ENGLISH', value: 'Native' }];

  /** Harvested verbatim from interests-section.ts `interests`. */
  interests = [
    'Full-stack (.NET + Angular)',
    'Cloud & serverless (AWS/Azure)',
    'Microservices & event-driven systems',
    'Performance, testing & CI/CD',
  ].map((label, i) => ({ idx: pad(i + 1), label }));

  resumePdf = RESUME_PDF;
  resumeDocx = RESUME_DOCX;

  /** `DOSSIER · 5 SECTIONS` — the count is the panels below, not a literal. */
  get chapterMeta(): string {
    return `DOSSIER · ${count(SECTION_COUNT, 'SECTION', 'SECTIONS')}`;
  }

  /**
   * The design hardcodes the Interests window's context to `04`, which is its
   * own list length. Derived here so a fifth interest renumbers the header
   * instead of making it lie.
   */
  get interestCount(): string {
    return pad(this.interests.length);
  }

  get resumeFooter(): string {
    return `PDF · ${count(RESUME_PAGES, 'PAGE', 'PAGES')} · UPDATED ${RESUME_UPDATED}`;
  }

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
