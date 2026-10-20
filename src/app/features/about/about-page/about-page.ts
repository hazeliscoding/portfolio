import { Component, OnInit } from '@angular/core';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { Button } from '../../../ui/core/button/button';
import { Badge, BadgeTone } from '../../../ui/core/badge/badge';
import { count } from '../../../core/count';
import { PageMeta, PERSON, SITE_ORIGIN } from '../../../core/page-meta';

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
const SECTION_COUNT = 7;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

interface StackModule {
  label: string;
  tone: BadgeTone;
}

@Component({
  selector: 'about-page',
  standalone: true,
  imports: [ChapterHeader, Window, ViewportWindow, KeyValue, Button, Badge],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage implements OnInit {
  /** Kept in step with the GitHub profile README (hazeliscoding/hazeliscoding). */
  bio: string[] = [
    "I'm Hazel Granados (she/they), a full-stack developer with a B.S. in Computer Science from Texas A&M University–Victoria. I build with C#, .NET, Angular and cloud tooling.",
    "Lately I'm moving into AI engineering grounded in evaluation rather than vibes: agent workflows that behave the same way every run, regression fixtures, and evals that prove a skill helps before I trust it. sdl3-porter is the first result.",
    'I love local-first desktop apps and developer experience, and I believe a good tool should be reliable, approachable, and a little bit cozy.',
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

  interests = [
    'Full-stack (.NET + Angular)',
    'AI engineering: evals & deterministic workflows',
    'Local-first desktop apps & developer experience',
    'Cloud & event-driven systems (AWS/Azure)',
    'Performance, testing & CI/CD',
  ].map((label, i) => ({ idx: pad(i + 1), label }));

  /**
   * Moved here from the home page when it became a broadcast. The first three
   * are the tones KAIRO marks as the core of the stack; the rest are
   * supporting modules and stay neutral.
   */
  stack: StackModule[] = [
    { label: 'C# / .NET 8', tone: 'info' },
    { label: 'ASP.NET Core', tone: 'info' },
    { label: 'Angular', tone: 'info' },
    { label: 'Claude Code + MCP', tone: 'neutral' },
    { label: 'Agent skills + evals', tone: 'neutral' },
    { label: 'EF Core + PostgreSQL', tone: 'neutral' },
    { label: 'CQRS / MediatR', tone: 'neutral' },
    { label: 'Avalonia / Electron', tone: 'neutral' },
    { label: 'AWS + Azure', tone: 'neutral' },
    { label: 'Terraform', tone: 'neutral' },
    { label: 'Docker', tone: 'neutral' },
    { label: 'xUnit + Testcontainers', tone: 'neutral' },
  ];

  services = [
    'Full-stack web application development',
    'AI agent workflows & evals',
    'Desktop applications (Avalonia, Electron)',
    'Backend/API engineering',
    'Background processing & scheduled jobs',
    'Event-driven integrations',
    'Database design & optimization',
    'Cloud deployment & DevOps automation',
    'Observability & monitoring setup',
    'Automated testing & CI/CD pipelines',
  ].map((label, i) => ({ idx: pad(i + 1), label }));

  /** Window contexts, measured off the lists so a new entry cannot leave a header miscounting. */
  stackContext = count(this.stack.length, 'MODULE', 'MODULES');
  serviceCount = pad(this.services.length);

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
      description:
        'Hazel Granados is a full-stack developer moving into AI engineering, with a B.S. in Computer Science from Texas A&M University–Victoria. Background and resume.',
      path: '/about',
      jsonLd: [
        { '@type': 'ProfilePage', url: `${SITE_ORIGIN}/about`, mainEntity: { '@id': PERSON['@id'] } },
        PERSON,
      ],
    });
  }
}
