import { Component, inject } from '@angular/core';

import {
  BroadcastSegment,
  Segment,
  releaseOf,
  repoOf,
  styleOf,
  toSegment,
} from '../broadcast-segment/broadcast-segment';
import { Pilot, PilotRow, PilotTape } from '../pilot-tape/pilot-tape';
import { MotionService } from '../../../ui/motion/motion.service';
import { Project, projectsData } from '../../../data/projects.data';
import { releases } from '../../../data/releases.generated';
import { count } from '../../../core/count';
import { PageMeta } from '../../../core/page-meta';

/** A project in the sticky bar: a jump link to its band or card. */
export interface Channel {
  id: string;
  title: string;
  mark: string;
}

@Component({
  selector: 'portfolio-page',
  standalone: true,
  imports: [BroadcastSegment, PilotTape],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  readonly motion = inject(MotionService);
  private readonly pageMeta = inject(PageMeta);

  private readonly projects: Project[] = projectsData;

  readonly projectCount = count(this.projects.length, 'project', 'projects');

  /** Every project, in archive order. */
  readonly guide: Channel[] = this.projects.map((p) => ({
    id: p.id,
    title: p.title,
    mark: p.brand.mark,
  }));

  readonly segments: Segment[] = this.projects
    .filter((p) => p.kind !== 'pilot')
    .map((p, i) => toSegment(p, i));

  readonly pilots: Pilot[] = this.projects
    .filter((p) => p.kind === 'pilot')
    .map((p, i) => this.toPilot(p, i));

  ngOnInit(): void {
    this.pageMeta.set({
      title: 'Projects - Hazel Granados',
      description:
        'Projects by Hazel Granados: shipped desktop apps and a Claude Code plugin, a live website, and experiments, each with its latest release and source.',
      path: '/portfolio',
    });
  }

  private toPilot(p: Project, i: number): Pilot {
    const release = releaseOf(p);
    const rows: PilotRow[] = p.parts
      ? p.parts.map((part) => ({
          label: part.label,
          url: part.url,
          detail: [releases[repoOf(part.url)]?.tag, part.note].filter(Boolean).join(' · '),
        }))
      : // A single-repo pilot reports where it stands instead of listing parts.
        [
          {
            label: 'Status',
            url: '',
            detail: [p.status, release?.tag].filter(Boolean).join(' · '),
          },
        ];
    return {
      id: p.id,
      title: p.title,
      slug: [p.medium, p.year].filter(Boolean).join(' · '),
      pitch: p.pitch,
      icon: p.brand.icon,
      style: styleOf(p),
      reel: p.reel,
      console: p.console,
      rows,
      source: p.links.github ?? '',
      build: release?.url ?? '',
      delay: `${40 + i * 70}ms`,
    };
  }
}
