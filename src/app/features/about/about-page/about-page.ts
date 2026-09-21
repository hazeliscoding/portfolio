import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { Badge } from '../../../ui/core/badge/badge';

@Component({
  selector: 'about-page',
  standalone: true,
  imports: [ChapterHeader, Window, KeyValue, Badge],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage {
  /**
   * Paragraphs harvested verbatim from about-section.ts `paragraphs`, plus
   * the `location` field that the old template rendered in a trailing line.
   */
  bio: string[] = [
    "I'm Hazel Granados (she/they), a software developer with a B.S. in Computer Science from Texas A&M University–Victoria.",
    'I enjoy building modern web apps with strong UX, solid architecture, and maintainable code.',
    'I am always learning and looking for interesting problems to solve.',
    'Texas, USA',
  ];

  /** Harvested from education-section.ts `degrees[0]` (title/type/data fields). */
  education: KeyValueItem[] = [
    { key: 'Degree', value: 'B.S. Degree' },
    { key: 'Field', value: 'Computer Science' },
    { key: 'School', value: 'Texas A&M University–Victoria' },
  ];

  /** Harvested from languages-section.ts `languages[0]`, split on the em dash. */
  languages: KeyValueItem[] = [{ key: 'English', value: 'Native' }];

  /** Harvested verbatim from interests-section.ts `interests`. */
  interests: string[] = [
    'Full-stack (.NET + Angular)',
    'Cloud & serverless (AWS/Azure)',
    'Microservices & event-driven systems',
    'Performance, testing & CI/CD',
  ];

  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('About - Hazel Granados');
    this.meta.updateTag({
      name: 'description',
      content: 'About Hazel Granados — software developer.',
    });
  }
}
