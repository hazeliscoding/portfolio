import { Component, inject } from '@angular/core';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { BrandStyle, BroadcastSegment, Cta, Segment } from '../broadcast-segment/broadcast-segment';
import { Pilot, PilotRow, PilotTape } from '../pilot-tape/pilot-tape';
import { MotionService } from '../../../ui/motion/motion.service';
import { Project, ProjectKind, projectsData } from '../../../data/projects.data';
import { Platform, Release, releases } from '../../../data/releases.generated';
import { count } from '../../../core/count';
import { PageMeta } from '../../../core/page-meta';

/** The broadcast word each kind goes out under. */
const ON_AIR: Record<ProjectKind, string> = {
  app: 'ON AIR',
  site: 'LIVE',
  pilot: 'PILOTS',
};

/** The status badge's first word: what the project is, before which release. */
const STATUS: Record<ProjectKind, string> = {
  app: 'SHIPPED',
  site: 'LIVE',
  pilot: 'PILOT',
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
          channel: this.channelOf(p),
          title: p.title,
          mark: p.brand.mark,
        })),
    }))
    // A kind with nothing in it yet has no group, rather than a label over nothing.
    .filter((group) => group.channels.length);

  readonly segments: Segment[] = this.projects
    .filter((p) => p.kind !== 'pilot')
    .map((p, i) => this.toSegment(p, i));

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

  /** Zero-padded position in the whole archive, so a channel keeps its number in every group. */
  private channelOf(project: Project): string {
    return pad(this.projects.indexOf(project) + 1);
  }

  private toSegment(p: Project, i: number): Segment {
    const release = releaseOf(p);
    return {
      id: p.id,
      kind: p.kind as 'app' | 'site',
      channel: this.channelOf(p),
      title: p.title,
      slug: [p.medium.toUpperCase(), p.year].filter(Boolean).join(' · '),
      pitch: p.pitch,
      status: [STATUS[p.kind], release?.tag].filter(Boolean).join(' · '),
      icon: p.brand.icon,
      mark: p.brand.mark,
      style: styleOf(p),
      shot: p.image,
      alt: `${p.title} screenshot`,
      host: p.links.demo ? bareHost(p.links.demo) : '',
      phone: p.phone ?? '',
      cta: ctaOf(p, release),
      ticker: p.ticker ?? [],
      flip: i % 2 === 1,
      // 40ms, then 70ms per segment: the archive cards' stagger, kept.
      delay: `${40 + i * 70}ms`,
    };
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
      channel: this.channelOf(p),
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

/** `hazeliscoding/puzzle-boy` → `puzzle-boy`: the key releases.generated.ts files a repo under. */
function repoOf(url: string): string {
  return url.replace(/\/+$/, '').split('/').pop() ?? '';
}

function releaseOf(p: Project): Release | undefined {
  return p.links.github ? releases[repoOf(p.links.github)] : undefined;
}

function bareHost(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
}

function styleOf(p: Project): BrandStyle {
  return { '--ink': p.brand.ink, '--tint': p.brand.tint, '--glow': p.brand.glow ?? null };
}

/** `Windows`, `Windows & Linux`, `Windows, macOS & Linux`. */
export function platformList(platforms: Platform[]): string {
  return platforms.length < 2
    ? (platforms[0] ?? '')
    : `${platforms.slice(0, -1).join(', ')} & ${platforms[platforms.length - 1]}`;
}

/**
 * The one call to action. Platforms come from the release, never from the
 * write-up: that is how Prompuff's copy went stale while its macOS build
 * shipped. A single platform is named on the button; more go in the fine print.
 */
function ctaOf(p: Project, release: Release | undefined): Cta {
  if (p.install?.length) return { kind: 'install', commands: p.install };
  if (p.kind === 'site' && p.links.demo) {
    return {
      kind: 'visit',
      label: `VISIT ${p.title.toUpperCase()}`,
      href: p.links.demo,
      fine: ['Free', p.note, bareHost(p.links.demo)].filter(Boolean).join(' · '),
    };
  }
  const platforms = release?.platforms ?? [];
  return {
    kind: 'download',
    label: platforms.length === 1 ? `DOWNLOAD FOR ${platforms[0].toUpperCase()}` : 'DOWNLOAD',
    // The release page, not a binary: it offers every platform's file, and a
    // direct link would pick one for the visitor.
    href: release?.url ?? p.links.github ?? '',
    fine: ['Free', platformList(platforms), p.note].filter(Boolean).join(' · '),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
