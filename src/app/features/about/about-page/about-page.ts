import { Component, OnInit } from '@angular/core';

import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { Button } from '../../../ui/core/button/button';
import { count } from '../../../core/count';
import { EMAIL, GITHUB, ICONS, RESUME_PDF } from '../../../core/site';
import { PageMeta, PERSON, SITE_ORIGIN } from '../../../core/page-meta';

const RESUME_DOCX = '/resume/resume-en.docx';

/**
 * Read off the PDF itself (`/Count 1` in its page tree) rather than asserted:
 * a fact printed about a file has to be true of the file.
 */
const RESUME_PAGES = 1;

/** Month the PDF last changed, from its last commit (2026-01-15). If the resume is replaced, this moves with it. */
const RESUME_UPDATED = '2026-01';

interface ToolboxShelf {
  label: string;
  items: string[];
}

@Component({
  selector: 'about-page',
  standalone: true,
  imports: [KeyValue, Button],
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

  /** The small facts beside the bio, each a labelled row rather than prose. */
  facts: KeyValueItem[] = [
    { key: 'Based in', value: 'Texas, USA' },
    { key: 'Pronouns', value: 'she/they' },
    { key: 'Studied', value: 'B.S. Computer Science, Texas A&M University–Victoria' },
    { key: 'Speaks', value: 'English (native)' },
  ];

  /**
   * The profile README's toolbox, with the stack this page listed before folded
   * into the shelf each belongs on.
   */
  toolbox: ToolboxShelf[] = [
    {
      label: 'Applications',
      items: ['C#', '.NET', 'ASP.NET Core', 'Entity Framework', 'Dapper', 'SQL', 'PostgreSQL', 'CQRS / MediatR', 'Angular', 'TypeScript'],
    },
    { label: 'Desktop', items: ['Avalonia UI', 'Electron', 'SQLite', 'Local-first apps'] },
    {
      label: 'Agents',
      items: ['Claude Code', 'GitHub Copilot', 'Codex', 'MCP', 'Agent skills', 'Behavioral evals'],
    },
    {
      label: 'Delivery',
      items: ['Azure', 'AWS', 'Terraform', 'Docker', 'Devcontainers', 'CI/CD', 'GitHub Actions'],
    },
    {
      label: 'Quality',
      items: ['xUnit', 'Testcontainers', 'Jest', 'Regression testing', 'Maintainable architecture'],
    },
    { label: 'Curiosities', items: ['Rust', 'Go', 'C++', 'Systems programming', 'Games'] },
  ];

  interests = [
    'Full-stack (.NET + Angular)',
    'AI engineering: evals & deterministic workflows',
    'Local-first desktop apps & developer experience',
    'Cloud & event-driven systems (AWS/Azure)',
    'Performance, testing & CI/CD',
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
  ];

  readonly resumePdf = RESUME_PDF;
  readonly resumeDocx = RESUME_DOCX;
  readonly resumeFine = `PDF · ${count(RESUME_PAGES, 'page', 'pages')} · updated ${RESUME_UPDATED}`;

  readonly mailto = `mailto:${EMAIL}`;
  readonly email = EMAIL;
  readonly links = [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/hazelgranados', icon: ICONS.linkedin },
    { label: 'GitHub', href: GITHUB, icon: ICONS.github },
  ];

  constructor(private pageMeta: PageMeta) {}

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
