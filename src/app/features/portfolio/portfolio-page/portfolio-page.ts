import { Component, inject } from '@angular/core';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import {
  BroadcastSegment,
  Segment,
  channelOf,
  releaseOf,
  repoOf,
  styleOf,
  toSegment,
} from '../broadcast-segment/broadcast-segment';
import { Pilot, PilotRow, PilotTape } from '../pilot-tape/pilot-tape';
import { MotionService } from '../../../ui/motion/motion.service';
import { Project, ProjectKind, projectsData } from '../../../data/projects.data';
import { releases } from '../../../data/releases.generated';
import { count } from '../../../core/count';
import { PageMeta } from '../../../core/page-meta';

/** The broadcast word each kind goes out under. */
const ON_AIR: Record<ProjectKind, string> = {
  app: 'ON AIR',
  site: 'LIVE',
  pilot: 'PILOTS',
};

/** A channel in the guide strip. */
export interface Channel {
  id: string;
  channel: string;
  title: string;
  mark: string;
}

/** One group of the guide, in broadcast order. */
export interface ChannelGroup {
  kind: ProjectKind;
  label: string;
  channels: Channel[];
}

@Component({
  selector: 'portfolio-page',
  standalone: true,
  imports: [ChapterHeader, BroadcastSegment, PilotTape],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  readonly motion = inject(MotionService);
  private readonly pageMeta = inject(PageMeta);

  private readonly projects: Project[] = projectsData;

  readonly records = `${count(this.projects.length, 'RECORD', 'RECORDS').replace(
    /^\d+/,
    pad(this.projects.length),
  )} RETRIEVED`;

  readonly guide: ChannelGroup[] = (['app', 'site', 'pilot'] as const)
    .map((kind) => ({
      kind,
      label: ON_AIR[kind],
      channels: this.projects
        .filter((p) => p.kind === kind)
        .map((p) => ({
          id: p.id,
          channel: channelOf(p),
          title: p.title,
          mark: p.brand.mark,
        })),
    }))
    // A kind with nothing in it yet has no group, rather than a label over nothing.
    .filter((group) => group.channels.length);

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
      channel: channelOf(p),
      title: p.title,
      slug: [p.medium.toUpperCase(), p.year].filter(Boolean).join(' · '),
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

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
