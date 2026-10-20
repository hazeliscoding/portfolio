import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Button } from '../../../ui/core/button/button';
import { MotionService } from '../../../ui/motion/motion.service';
import { BroadcastSegment, toSegment } from '../../portfolio/broadcast-segment/broadcast-segment';
import { projectsData } from '../../../data/projects.data';
import { blogPosts } from '../../../data/blog-posts.generated';
import { ossStats } from '../../../data/oss-stats.generated';
import { count } from '../../../core/count';
import { PageMeta, PERSON, SITE_ORIGIN } from '../../../core/page-meta';

const LAST_UPDATE = '2026-10-19';

const EMAIL = 'hazel.granados@protonmail.com';

/** How many posts the LATEST strip carries; the blog has the rest. */
const LATEST_POSTS = 3;

/**
 * The contact rows' icons, inline so they take the text colour. GitHub's is
 * the Octicons mark, LinkedIn's the Simple Icons logo, mail and pin Material's.
 */
const ICONS = {
  mail: {
    viewBox: '0 0 24 24',
    d: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
  },
  github: {
    viewBox: '0 0 16 16',
    d: 'M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z',
  },
  linkedin: {
    viewBox: '0 0 24 24',
    d: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  pin: {
    viewBox: '0 0 24 24',
    d: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
  },
};

/**
 * 20,989 stars reads as `20.9k`, not `21.0k`. The figure is truncated rather
 * than rounded so the strip can never claim more stars than the generated
 * stats actually hold; under a thousand it prints the exact number.
 */
function starCount(n: number): string {
  return n >= 1000 ? `${Math.floor(n / 100) / 10}k` : String(n);
}

/**
 * The home screen as a broadcast: a lower third introduces the operator, NOW
 * PLAYING cycles the featured projects' segments exactly as /portfolio airs
 * them, and two strips carry the latest posts and the open-source PRs.
 */
@Component({
  selector: 'home-page',
  standalone: true,
  imports: [RouterLink, ChapterHeader, Button, BroadcastSegment],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  readonly motion = inject(MotionService);
  private readonly pageMeta = inject(PageMeta);

  readonly lastUpdate = LAST_UPDATE;
  /**
   * A real `href`, so the control is a link: it can be copied, opened in a
   * new tab, and is announced as a link rather than as an action on this
   * page. The address is also printed in the readout beside it for anyone who
   * would rather copy it than hand it to a mail client.
   */
  readonly mailto = `mailto:${EMAIL}`;

  /** Every row links somewhere except the location; the profiles open in a new tab. */
  readonly contacts = [
    { label: 'Email', value: EMAIL, href: this.mailto, external: false, icon: ICONS.mail },
    {
      label: 'GitHub',
      value: 'hazeliscoding',
      href: 'https://github.com/hazeliscoding',
      external: true,
      icon: ICONS.github,
    },
    {
      label: 'LinkedIn',
      value: 'hazelgranados',
      href: 'https://www.linkedin.com/in/hazelgranados',
      external: true,
      icon: ICONS.linkedin,
    },
    { label: 'Location', value: 'Texas, USA', href: '', external: false, icon: ICONS.pin },
  ];

  /** The featured projects, in archive order, as the segments /portfolio draws. */
  readonly channels = projectsData
    .filter((project) => project.featured)
    .map((project, i) => toSegment(project, i));

  readonly channelCount = projectsData.length;

  /** The channel on screen. */
  readonly active = signal(0);

  /**
   * Whether the channels advance on their own. The clock is the active tab's
   * progress bar: its CSS animation runs 8s and its `animationend` changes the
   * channel, so hovering pauses both at once, and under reduced motion there is
   * no animation and so no rotation at all.
   */
  readonly playing = signal(true);

  readonly posts = blogPosts.slice(0, LATEST_POSTS).map((post) => ({
    slug: post.slug,
    date: post.date,
    title: post.title,
  }));

  readonly ossRows = ossStats.projects.map((project) => ({
    // The generated repo is `owner/name`; the strip prints the bare name. The
    // full path stays on the link's title.
    name: project.repo.split('/').pop() ?? project.repo,
    full: project.repo,
    url: project.url,
    meta: `${count(project.mergedPrs, 'PR', 'PRS')} · ★ ${starCount(project.stars)}`,
  }));

  next(): void {
    this.active.update((i) => (i + 1) % this.channels.length);
  }

  /** A visitor choosing a channel takes over from the rotation until they press play. */
  pick(i: number): void {
    this.active.set(i);
    this.playing.set(false);
  }

  /** The tablist's arrow keys, Home and End, with focus following the selection. */
  onTabKey(event: KeyboardEvent): void {
    const n = this.channels.length;
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
        { '@type': 'WebSite', name: 'hazel.exe', url: `${SITE_ORIGIN}/`, author: { '@id': PERSON['@id'] } },
      ],
    });
  }
}
