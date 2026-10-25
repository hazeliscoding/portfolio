import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MotionService } from '../../../ui/motion/motion.service';
import { platformList, releaseOf, styleOf, toSegment } from '../../portfolio/broadcast-segment/broadcast-segment';
import { Project, projectsData } from '../../../data/projects.data';
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

/** What a card's fine print says it costs and runs on. */
function fineOf(p: Project): string {
  if (p.kind === 'site') return 'Free · Website';
  const platforms = releaseOf(p)?.platforms ?? [];
  return ['Free', platforms.length ? platformList(platforms) : p.medium].join(' · ');
}

/**
 * The home page as a maker's shop front: the featured app on a dark band, an
 * open-source strip, the hero, everything shipped as cards, open-source work,
 * the latest writing, a note from the maker, and the questions people ask.
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

  /** The first featured project airs on the dark band, as its projects-page segment does. */
  readonly featured = (() => {
    const p = projectsData.find((project) => project.featured)!;
    const segment = toSegment(p, 0);
    return {
      ...segment,
      lede: lede(p.description),
      caption: p.ticker?.[0] ?? '',
      medium: p.medium,
      platforms: platformList(releaseOf(p)?.platforms ?? []) || p.medium,
    };
  })();

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

  /** The hero's sticker sheet: every project's icon, decorative. */
  readonly stickers = projectsData.map((p) => p.brand.icon);

  readonly posts = blogPosts.slice(0, LATEST_POSTS).map((post) => ({
    slug: post.slug,
    date: post.date,
    title: post.title,
    description: post.description,
    tags: post.tags.slice(0, 3),
  }));

  readonly oss = {
    summary: `${count(ossStats.totalMergedPrs, 'merged PR', 'merged PRs')} across ${count(
      ossStats.projectCount,
      'project',
      'projects',
    )}`,
    rows: ossStats.projects.map((project) => ({
      // The generated repo is `owner/name`; the row prints the bare name and
      // keeps the owner beside it.
      name: project.repo.split('/').pop() ?? project.repo,
      owner: project.repo.split('/')[0],
      url: project.url,
      merged: count(project.mergedPrs, 'merged PR', 'merged PRs'),
      stars: starCount(project.stars),
    })),
  };

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
