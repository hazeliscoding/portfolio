import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { Badge } from '../../../ui/core/badge/badge';
import { MotionService } from '../../../ui/motion/motion.service';
import { Project, projectsData } from '../../../data/projects.data';
import { count } from '../../../core/count';
import { PageMeta } from '../../../core/page-meta';

/** The unfiltered state. Always the first pill; never derived from a tag. */
const ALL = 'ALL';

/** KAIRO's archive card shows five tags and drops the rest. */
const TAGS_PER_CARD = 5;

/** Everything one archive card renders, resolved once per filter change. */
export interface ArchiveCard {
  id: string;
  /** Zero-padded position in the whole archive, not in the filtered view. */
  index: string;
  title: string;
  year: string;
  description: string;
  image: string;
  alt: string;
  /** `CAM 01 // 04 SHOTS` — the real screenshot count, not a decoration. */
  cam: string;
  footer: string;
  tags: string[];
  /** Entrance stagger, with its unit — `app-window` sets it as a CSS time. */
  delay: string;
}

@Component({
  selector: 'portfolio-page',
  standalone: true,
  imports: [RouterLink, ChapterHeader, Window, ViewportWindow, Badge],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  readonly motion = inject(MotionService);
  private readonly pageMeta = inject(PageMeta);

  private readonly projects: Project[] = projectsData;

  /**
   * ALL, then one pill per tag that actually appears in the archive.
   *
   * The design hardcodes six (.NET, ANGULAR, ELECTRON, MCP, DESKTOP) against
   * its four invented records. Hardcoding those here would ship filters that
   * retrieve nothing — a control that cannot change what it controls. First
   * appearance order, so the pills read in the order the archive itself does.
   */
  readonly filters: string[] = [
    ALL,
    ...new Set(this.projects.flatMap((p) => p.tags ?? []).map((t) => t.toUpperCase())),
  ];

  readonly filter = signal(ALL);

  /**
   * The card under the pointer (or keyboard focus), by id.
   *
   * The design derives this from `i === 0`, so its first card is focused and
   * the rest are explicitly backgrounded. Driving it from real hover instead
   * means nothing is hovered on arrival, and `false` on every card would dim
   * the entire grid at rest — so the unhovered state is `null` (neutral), not
   * `false`.
   */
  private readonly hovered = signal<string | null>(null);

  private readonly visible = computed(() =>
    this.projects.filter((p) => this.matches(p, this.filter())),
  );

  readonly cards = computed<ArchiveCard[]>(() =>
    this.visible().map((p, i) => this.toCard(p, i)),
  );

  /**
   * `04 RECORDS RETRIEVED` — the instrument reading under the filter bar and
   * in the chapter header, from the filtered count.
   *
   * `count()` owns the noun form so the archive cannot say "01 RECORDS", and
   * the leading digits are padded after the fact: two-digit readings are a
   * KAIRO convention that a pluralisation helper has no business knowing.
   */
  readonly records = computed(() => {
    const n = this.visible().length;
    return `${count(n, 'RECORD', 'RECORDS').replace(/^\d+/, pad(n))} RETRIEVED`;
  });

  ngOnInit(): void {
    this.pageMeta.set({
      title: 'Projects - Hazel Granados',
      description: 'Project archive — selected work by Hazel Granados.',
      path: '/portfolio',
    });
  }

  pick(filter: string): void {
    this.filter.set(filter);
  }

  hover(id: string | null): void {
    this.hovered.set(id);
  }

  /** `true` focuses the window; `null` leaves it neutral. Never `false` here. */
  activeFor(id: string): true | null {
    return this.hovered() === id ? true : null;
  }

  /** Case-insensitive substring, per the design's `match`: ANGULAR hits "Angular". */
  private matches(project: Project, filter: string): boolean {
    return (
      filter === ALL || (project.tags ?? []).some((t) => t.toUpperCase().includes(filter))
    );
  }

  private toCard(project: Project, i: number): ArchiveCard {
    const index = pad(this.projects.indexOf(project) + 1);

    return {
      id: project.id,
      index,
      title: project.title,
      year: project.year ?? '',
      description: project.description,
      image: project.image,
      alt: `${project.title} screenshot`,
      cam: `CAM ${index} // ${pad(shotsOf(project))} SHOTS`,
      footer: footerOf(project),
      tags: (project.tags ?? []).slice(0, TAGS_PER_CARD),
      // 40ms, then 70ms per card, from the design.
      delay: `${40 + i * 70}ms`,
    };
  }
}

/**
 * The screenshot count the record really has. A project with no gallery still
 * has its hero capture, so it is one shot rather than none — "00 SHOTS" over a
 * visible screenshot reads as a broken counter.
 */
function shotsOf(project: Project): number {
  return project.images?.length ?? (project.image ? 1 : 0);
}

/** `STATUS : ACTIVE · ELECTRON · ANGULAR · ↵ OPEN`, the design's footer strip. */
function footerOf(project: Project): string {
  const status = (project.status ?? 'active').toUpperCase();
  const stack = (project.stack ?? '').toUpperCase();

  // A record with no declared stack drops the segment rather than printing an
  // empty one between two separators.
  return [`STATUS : ${status}`, stack, '↵ OPEN'].filter(Boolean).join(' · ');
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
