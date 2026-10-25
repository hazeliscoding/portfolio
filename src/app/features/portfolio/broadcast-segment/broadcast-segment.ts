import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MotionService } from '../../../ui/motion/motion.service';
import { Project, ProjectKind } from '../../../data/projects.data';
import { Platform, Release, releases } from '../../../data/releases.generated';
import { BroadcastScreen } from '../broadcast-screen/broadcast-screen';
import { InstallBox } from '../install-box/install-box';

/** The sticker's first words: what the project is, before which release. */
const STATUS: Record<ProjectKind, string> = {
  app: 'Shipped',
  site: 'Live now',
  pilot: 'Building now',
};

/** A project's colours, as the custom properties its segment or tape reads. */
export type BrandStyle = Record<'--ink' | '--tint' | '--glow', string | null>;

/** What the call to action does: download a release, visit a site, or install by command. */
export type Cta =
  | { kind: 'download'; label: string; href: string; fine: string }
  | { kind: 'visit'; label: string; href: string; fine: string }
  | { kind: 'install'; commands: string[] };

/** One repository of a project that spans several, with its own latest release. */
export interface SegmentPart {
  label: string;
  url: string;
  detail: string;
}

/** Everything one project's band renders, resolved once by the page. */
export interface Segment {
  id: string;
  kind: ProjectKind;
  title: string;
  /** `Desktop · 2026` — what it is and when, under the name. */
  slug: string;
  pitch: string;
  status: string;
  icon: string;
  mark: string;
  style: BrandStyle;
  shot: string;
  /** What replaces a looping shot under reduced motion; empty for a still one. */
  still: string;
  /** A CLI's commands, drawn on the screen in place of a capture. */
  console: { command: string; note: string }[];
  alt: string;
  /** A live site's address bar, its host without the protocol. */
  host: string;
  phone: string;
  mascot: Project['mascot'];
  cta: Cta;
  ticker: string[];
  parts: SegmentPart[];
  /** Every other segment puts its screenshot on the left, as thatlev's bands do. */
  flip: boolean;
  delay: string;
}

/** One project as a product band: sticker, name, pitch, call to action, screen and facts. */
@Component({
  selector: 'app-broadcast-segment',
  standalone: true,
  imports: [RouterLink, BroadcastScreen, InstallBox],
  templateUrl: './broadcast-segment.html',
  styleUrl: './broadcast-segment.scss',
})
export class BroadcastSegment {
  readonly motion = inject(MotionService);
  readonly segment = input.required<Segment>();
}

/**
 * A project as its segment. Shared by the projects page and the home page's
 * featured band, so a project reads the same way on both. `i` is its place in
 * the page's run, which sets the flip and the entrance stagger.
 */
export function toSegment(p: Project, i: number): Segment {
  const release = releaseOf(p);
  return {
    id: p.id,
    kind: p.kind,
    title: p.title,
    slug: [p.medium, p.year].filter(Boolean).join(' · '),
    pitch: p.pitch,
    status: [STATUS[p.kind], release?.tag].filter(Boolean).join(' · '),
    icon: p.brand.icon,
    mark: p.brand.mark,
    style: styleOf(p),
    // An experiment's reel is its screenshot; a CLI shows its commands instead.
    shot: p.reel?.src ?? p.image,
    still: p.reel?.still ?? '',
    console: p.reel ? [] : (p.console ?? []),
    alt: p.reel
      ? `${p.title} in play`
      : p.console?.length
        ? `${p.title} commands`
        : `${p.title} screenshot`,
    host: p.links.demo ? bareHost(p.links.demo) : '',
    phone: p.phone ?? '',
    mascot: p.mascot,
    cta: ctaOf(p, release),
    ticker: p.ticker ?? [],
    parts: (p.parts ?? []).map((part) => ({
      label: part.label,
      url: part.url,
      detail: [releases[repoOf(part.url)]?.tag, part.note].filter(Boolean).join(' · '),
    })),
    flip: i % 2 === 1,
    // 40ms, then 70ms per segment: the archive cards' stagger, kept.
    delay: `${40 + i * 70}ms`,
  };
}

/** `hazeliscoding/puzzle-boy` → `puzzle-boy`: the key releases.generated.ts files a repo under. */
export function repoOf(url: string): string {
  return url.replace(/\/+$/, '').split('/').pop() ?? '';
}

export function releaseOf(p: Project): Release | undefined {
  return p.links.github ? releases[repoOf(p.links.github)] : undefined;
}

export function styleOf(p: Project): BrandStyle {
  return { '--ink': p.brand.ink, '--tint': p.brand.tint, '--glow': p.brand.glow ?? null };
}

/** `Windows`, `Windows & Linux`, `Windows, macOS & Linux`. */
export function platformList(platforms: Platform[]): string {
  return platforms.length < 2
    ? (platforms[0] ?? '')
    : `${platforms.slice(0, -1).join(', ')} & ${platforms[platforms.length - 1]}`;
}

function bareHost(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
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
      label: `Visit ${p.title}`,
      href: p.links.demo,
      fine: ['Free', p.note, bareHost(p.links.demo)].filter(Boolean).join(' · '),
    };
  }
  const platforms = release?.platforms ?? [];
  if (p.kind === 'pilot') {
    return {
      kind: 'download',
      label: 'Try the latest build',
      href: release?.url ?? p.links.github ?? '',
      fine: ['Free', platformList(platforms), p.status].filter(Boolean).join(' · '),
    };
  }
  return {
    kind: 'download',
    label: platforms.length === 1 ? `Download for ${platforms[0]}` : `Download ${p.title}`,
    // The release page, not a binary: it offers every platform's file, and a
    // direct link would pick one for the visitor.
    href: release?.url ?? p.links.github ?? '',
    fine: ['Free', platformList(platforms), p.note].filter(Boolean).join(' · '),
  };
}
