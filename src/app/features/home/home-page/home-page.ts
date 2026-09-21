import { Component, DOCUMENT, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { Badge, BadgeTone } from '../../../ui/core/badge/badge';
import { Button } from '../../../ui/core/button/button';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { projectsData } from '../../../data/projects.data';
import { blogPosts } from '../../../data/blog-posts.generated';
import { ossStats } from '../../../data/oss-stats.generated';
import { count } from '../../../core/count';
import { PageMeta } from '../../../core/page-meta';

const LAST_UPDATE = '2026-09-20';

const EMAIL = 'hazel.granados@protonmail.com';

/** Instrument formatting: KAIRO prints small counts as two digits. */
function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * 20,989 stars reads as `20.9k`, not `21.0k`. The figure is truncated rather
 * than rounded so the panel can never claim more stars than the generated
 * stats actually hold; under a thousand it prints the exact number.
 */
function starCount(n: number): string {
  return n >= 1000 ? `${Math.floor(n / 100) / 10}k` : String(n);
}

interface StackModule {
  label: string;
  tone: BadgeTone;
}

@Component({
  selector: 'home-page',
  standalone: true,
  imports: [RouterLink, ChapterHeader, Window, ViewportWindow, Badge, Button, KeyValue],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  private readonly doc = inject(DOCUMENT);
  private readonly pageMeta = inject(PageMeta);

  readonly lastUpdate = LAST_UPDATE;
  readonly email = EMAIL;
  /**
   * A real `href`, so the control is a link: it can be copied, opened in a
   * new tab, and is announced as a link rather than as an action on this
   * page. The address is also printed in the readout above for anyone who
   * would rather copy it than hand it to a mail client.
   */
  readonly mailto = `mailto:${EMAIL}`;

  /**
   * Window 00. The address is repeated as a readout rather than hidden behind
   * the button, so it can be read and copied without firing a mail client.
   */
  readonly contactKv: KeyValueItem[] = [
    { key: 'LINKEDIN', value: 'hazelgranados' },
    { key: 'GITHUB', value: 'hazeliscoding' },
    { key: 'EMAIL', value: EMAIL },
    { key: 'LOCATION', value: 'Texas, USA' },
  ];

  /**
   * Window 01. The first three are the tones KAIRO marks as the core of the
   * stack; the rest are supporting modules and stay neutral.
   */
  readonly stack: StackModule[] = [
    { label: 'C# / .NET 8', tone: 'info' },
    { label: 'ASP.NET Core', tone: 'info' },
    { label: 'Angular', tone: 'info' },
    { label: 'EF Core + PostgreSQL', tone: 'neutral' },
    { label: 'CQRS / MediatR', tone: 'neutral' },
    { label: 'AWS SQS/SNS', tone: 'neutral' },
    { label: 'Terraform', tone: 'neutral' },
    { label: 'AWS Parameter Store', tone: 'neutral' },
    { label: 'Docker', tone: 'neutral' },
    { label: 'xUnit + Testcontainers', tone: 'neutral' },
  ];

  /** Window 02. */
  readonly services = [
    'Full-stack web application development',
    'Backend/API engineering',
    'Background processing & scheduled jobs',
    'Event-driven integrations',
    'Database design & optimization',
    'Cloud deployment & DevOps automation',
    'Observability & monitoring setup',
    'Automated testing & CI/CD pipelines',
  ].map((label, i) => ({ idx: pad2(i + 1), label }));

  /** Window 03, from the generated stats file. */
  readonly ossKv: KeyValueItem[] = [
    { key: 'MERGED PRS', value: pad2(ossStats.totalMergedPrs) },
    { key: 'PROJECTS', value: pad2(ossStats.projectCount) },
    { key: 'STARS', value: starCount(ossStats.totalStars) },
  ];

  readonly ossUpdated = `UPDATED ${ossStats.updated}`;

  readonly ossRows = ossStats.projects.map((project) => ({
    // The generated repo is `owner/name`; the panel prints the bare name, as
    // the design does. The full path stays on the link's title.
    name: project.repo.split('/').pop() ?? project.repo,
    full: project.repo,
    url: project.url,
    meta: `${count(project.mergedPrs, 'PR', 'PRS')} · ★ ${starCount(project.stars)}`,
  }));

  /**
   * Window 04. `description` is the only summary a project carries — there is
   * no short field — so the row clips it to one line the way the design's own
   * `short` string is clipped.
   */
  readonly projects = projectsData
    .filter((project) => project.featured)
    .map((project, i) => ({
      id: project.id,
      idx: pad2(i + 1),
      title: project.title,
      summary: project.description,
      meta: [project.stack, project.year].filter(Boolean).join(' · '),
    }));

  /** Window 05. */
  readonly posts = blogPosts.map((post) => ({
    slug: post.slug,
    date: post.date,
    title: post.title,
    tagline: post.tags.map((tag) => tag.toUpperCase()).join(' · '),
  }));

  /**
   * Window contexts. Every count is measured off the arrays above rather than
   * written into the template, so a new project or a regenerated stats file
   * cannot leave the chrome claiming a number that is no longer true.
   */
  readonly stackContext = count(this.stack.length, 'MODULE', 'MODULES');
  readonly recordContext = count(this.projects.length, 'RECORD', 'RECORDS');
  /**
   * The services header is a bare figure in the design — no noun — so it is
   * padded rather than run through `count()`, which exists to get a noun's
   * number right.
   */
  readonly serviceContext = pad2(this.services.length);

  ngOnInit(): void {
    this.pageMeta.set({
      title: 'Hazel Granados — Software Developer',
      description: 'Software developer. Full-stack applications built with care.',
      path: '/',
    });
  }

}
