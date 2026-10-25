import { Component, inject } from '@angular/core';

import { BroadcastSegment, Segment, toSegment } from '../broadcast-segment/broadcast-segment';
import { MotionService } from '../../../ui/motion/motion.service';
import { Project, projectsData } from '../../../data/projects.data';
import { PageMeta } from '../../../core/page-meta';

/** A project in the sticky bar: a jump link to its band. */
export interface Channel {
  id: string;
  title: string;
  mark: string;
}

@Component({
  selector: 'portfolio-page',
  standalone: true,
  imports: [BroadcastSegment],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  readonly motion = inject(MotionService);
  private readonly pageMeta = inject(PageMeta);

  private readonly projects: Project[] = projectsData;

  /** Every project, in archive order. */
  readonly guide: Channel[] = this.projects.map((p) => ({
    id: p.id,
    title: p.title,
    mark: p.brand.mark,
  }));

  /** Apps and live sites: ready to download or visit. */
  readonly shipped: Segment[] = this.projects
    .filter((p) => p.kind !== 'pilot')
    .map((p, i) => toSegment(p, i));

  /** Experiments, on the same bands: an early build to try, before 1.0. */
  readonly building: Segment[] = this.projects
    .filter((p) => p.kind === 'pilot')
    .map((p, i) => toSegment(p, i));

  ngOnInit(): void {
    this.pageMeta.set({
      title: 'Projects - Hazel Granados',
      description:
        'Projects by Hazel Granados: shipped desktop apps, a Claude Code plugin and a live website, plus what she is building now, each with its latest release and source.',
      path: '/portfolio',
    });
  }
}
