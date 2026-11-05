import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MotionService } from '../../../ui/motion/motion.service';
import { BrandStyle, Cta, platformList, releaseOf, styleOf, toSegment } from '../../portfolio/broadcast-segment/broadcast-segment';
import { Project, projectsData } from '../../../data/projects.data';
import { OVERGLANCE_BAND, OVERGLANCE_DOWNLOAD_URL, OVERGLANCE_MOCKUP, OVERGLANCE_PRICE } from '../../../data/overglance.data';
import { blogPosts } from '../../../data/blog-posts.generated';
import { ossStats } from '../../../data/oss-stats.generated';
import { count } from '../../../core/count';
import { EMAIL, GITHUB, ICONS } from '../../../core/site';
import { PageMeta, PERSON, SITE_ORIGIN } from '../../../core/page-meta';

/** How many posts the writing section carries; the blog has the rest. */
const LATEST_POSTS = 3;

/**
 * 20,989 stars reads as `20.9k`, not `21.0k`. The figure is truncated rather
 * than rounded so the page can never claim more stars than the generated
 * stats actually hold; under a thousand it prints the exact number.
 */
export function starCount(n: number): string {
  return n >= 1000 ? `${Math.floor(n / 100) / 10}k` : String(n);
}

/**
 * A description's opening clause, for the featured band: the text before its
 * first dash, or its first sentence, ending in a full stop.
 */
export function lede(description: string): string {
  const clause = description.split(' — ')[0].split(/(?<=[.?!])\s/)[0].trim();
  return /[.?!]$/.test(clause) ? clause : `${clause}.`;
}

/** One turn on the band: a featured project read as its segment, or Overglance, whose page stands in for a card. */
interface Slide {
  id: string;
  title: string;
  pitch: string;
  lede: string;
  caption: string;
  medium: string;
  platforms: string;
  icon: string;
  mark: string;
  style: BrandStyle;
  shot: string;
  alt: string;
  width: number;
  height: number;
  cta: Cta;
  ctaLabel: string;
  /** Where "How it works" goes. */
  more: string[];
  /** Whether the caption needs a strip of its own above the shot: the pill sits at the shot's top edge. */
  headroom: boolean;
}

/** Overglance leads the band: the one app for sale shouldn't be the one the home page never shows. */
const overglance: Slide = {
  id: 'overglance',
  title: 'Overglance',
  pitch: OVERGLANCE_BAND.pitch,
  lede: OVERGLANCE_BAND.lede,
  caption: OVERGLANCE_BAND.caption,
  medium: 'Desktop',
  platforms: 'Windows',
  icon: OVERGLANCE_BAND.brand.icon,
  mark: OVERGLANCE_BAND.brand.icon,
  style: { '--ink': OVERGLANCE_BAND.brand.ink, '--tint': OVERGLANCE_BAND.brand.tint, '--glow': null },
  shot: OVERGLANCE_MOCKUP.src,
  alt: OVERGLANCE_MOCKUP.alt,
  width: OVERGLANCE_MOCKUP.width,
  height: OVERGLANCE_MOCKUP.height,
  cta: { kind: 'download', label: 'Try Overglance free', href: OVERGLANCE_DOWNLOAD_URL, fine: `${OVERGLANCE_PRICE} · Windows` },
  ctaLabel: 'Try Overglance free',
  more: ['/overglance'],
  headroom: true,
};

/** What a card's fine print says it costs and runs on. */
function fineOf(p: Project): string {
  if (p.kind === 'site') return 'Free · Website';
  const platforms = releaseOf(p)?.platforms ?? [];
  return ['Free', platforms.length ? platformList(platforms) : p.medium].join(' · ');
}

/**
 * The home page as a maker's shop front: the featured apps taking turns on a
 * dark band, an open-source strip, the hero, everything shipped as cards,
 * open-source work, the latest writing, a note from the maker, and the
 * questions people ask.
 */
@Component({
  selector: 'home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  readonly motion = inject(MotionService);
  private readonly pageMeta = inject(PageMeta);

  readonly mailto = `mailto:${EMAIL}`;
  readonly email = EMAIL;
  readonly github = GITHUB;
  readonly githubIcon = ICONS.github;

  /** Overglance, then the featured projects in archive order, each read as its projects-page segment. */
  readonly featured: Slide[] = [
    overglance,
    ...projectsData
      .filter((p) => p.featured)
      .map((p, i) => {
        const s = toSegment(p, i);
        return {
          id: s.id,
          title: s.title,
          pitch: s.pitch,
          lede: lede(p.description),
          caption: p.ticker?.[0] ?? '',
          medium: p.medium,
          platforms: platformList(releaseOf(p)?.platforms ?? []) || p.medium,
          icon: s.icon,
          mark: s.mark,
          style: s.style,
          shot: s.shot,
          alt: s.alt,
          width: 1280,
          height: 800,
          cta: s.cta,
          ctaLabel: `Get ${s.title} free`,
          more: ['/portfolio', s.id],
          headroom: false,
        };
      }),
  ];

  /** The featured app on the band. */
  readonly active = signal(0);

  /**
   * Whether the band moves on by itself. The clock is the active tab's progress
   * bar: its CSS animation runs 8s and its `animationend` shows the next app, so
   * hovering or focusing the band pauses both at once, and under reduced motion
   * there is no animation and so no rotation at all.
   */
  readonly playing = signal(true);

  /** Every shipped app and live site, in archive order. Pilots stay on the projects page. */
  readonly picks = projectsData
    .filter((p) => p.kind !== 'pilot')
    .map((p) => ({
      id: p.id,
      title: p.title,
      pitch: p.pitch,
      medium: p.medium,
      version: releaseOf(p)?.tag ?? (p.kind === 'site' ? 'Live' : ''),
      fine: fineOf(p),
      icon: p.brand.icon,
      shot: p.image,
      style: styleOf(p),
    }));

  readonly projectCount = projectsData.length;

  /** The hero's sticker sheet: every shipped project's icon, decorative, as the cards below it. */
  readonly stickers = projectsData.filter((p) => p.kind !== 'pilot').map((p) => p.brand.icon);

  readonly posts = blogPosts.slice(0, LATEST_POSTS).map((post) => ({
    slug: post.slug,
    date: post.date,
    title: post.title,
    description: post.description,
    tags: post.tags.slice(0, 3),
  }));

  readonly oss = {
    // Worded as the GitHub profile's open-source section is, from the same list.
    summary:
      `${count(ossStats.totalMergedPrs, 'merged PR', 'merged PRs')} across ${count(
        ossStats.projectCount,
        'project',
        'projects',
      )}` + (ossStats.totalOpenPrs ? `, and ${ossStats.totalOpenPrs} more in review` : ''),
    rows: ossStats.projects.map((project) => ({
      // The generated repo is `owner/name`; the row prints the bare name and
      // keeps the owner beside it.
      name: project.repo.split('/').pop() ?? project.repo,
      owner: project.repo.split('/')[0],
      url: project.url,
      // `2 merged · 3 in review`, or just one of them.
      prs: [
        project.mergedPrs && `${project.mergedPrs} merged`,
        project.openPrs && `${project.openPrs} in review`,
      ]
        .filter(Boolean)
        .join(' · '),
      stars: starCount(project.stars),
    })),
  };

  next(): void {
    this.active.update((i) => (i + 1) % this.featured.length);
  }

  /** A visitor choosing an app takes over from the rotation until they press play. */
  pick(i: number): void {
    this.active.set(i);
    this.playing.set(false);
  }

  /** The tablist's arrow keys, Home and End, with focus following the selection. */
  onTabKey(event: KeyboardEvent): void {
    const n = this.featured.length;
    const to = { ArrowRight: this.active() + 1, ArrowLeft: this.active() - 1 + n, Home: 0, End: n - 1 }[
      event.key
    ];
    if (to === undefined) return;
    event.preventDefault();
    this.pick(to % n);
    (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('[role="tab"]')[to % n]?.focus();
  }

  ngOnInit(): void {
    this.pageMeta.set({
      title: 'Hazel Granados — Full-Stack Developer & AI Engineer',
      description:
        'Hazel Granados is a full-stack developer (C#, .NET, Angular) moving into AI engineering: deterministic agent workflows and evals that prove they work.',
      path: '/',
      jsonLd: [
        PERSON,
        { '@type': 'WebSite', name: 'hazeliscoding', url: `${SITE_ORIGIN}/`, author: { '@id': PERSON['@id'] } },
      ],
    });
  }
}
