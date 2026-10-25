import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { Badge } from '../../../ui/core/badge/badge';
import { Button } from '../../../ui/core/button/button';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { RecordFault } from '../../../ui/record-fault/record-fault';
import { MotionService } from '../../../ui/motion/motion.service';
import { Project, ProjectImage, ProjectKind } from '../../../data/projects.data';
import { blogPosts } from '../../../data/blog-posts.generated';
import { ProjectsDataService } from '../../../services/projects-data.service';
import { PageMeta, PERSON, SITE_ORIGIN, breadcrumbs } from '../../../core/page-meta';
import { platformList, releaseOf, styleOf } from '../../portfolio/broadcast-segment/broadcast-segment';

/** One screenshot in the gallery. */
interface Shot {
  src: string;
  caption: string;
  /** The thumbnail button's accessible name. */
  name: string;
}

/** What a project is, in words a visitor uses. */
const KIND: Record<ProjectKind, string> = {
  app: 'Shipped app',
  site: 'Live site',
  pilot: 'Building now',
};

/** A link as the page prints it: no protocol, no `www.`, no trailing slash. */
function bareUrl(url: string): string {
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

@Component({
  selector: 'project-detail-page',
  standalone: true,
  imports: [RouterLink, Window, ViewportWindow, Badge, Button, KeyValue, RecordFault],
  templateUrl: './project-detail-page.html',
  styleUrl: './project-detail-page.scss',
})
export class ProjectDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsDataService);
  private readonly pageMeta = inject(PageMeta);
  motion = inject(MotionService);

  /** Every project, the source of this one's neighbours. */
  readonly records = this.projectsService.getAllProjects();

  readonly project = signal<Project | undefined>(undefined);
  readonly requestedId = signal('');
  /** Index of the shot on the stage. */
  readonly shot = signal(0);

  readonly requestedPath = computed(() => `/portfolio/${this.requestedId()}`);

  private readonly recordIndex = computed(() => {
    const p = this.project();
    return p ? this.records.indexOf(p) : -1;
  });

  /** The project's own colours, for the stage's glow. */
  readonly brandStyle = computed(() => {
    const p = this.project();
    return p ? styleOf(p) : null;
  });

  readonly release = computed(() => {
    const p = this.project();
    return p ? releaseOf(p) : undefined;
  });

  /** `Shipped app · v1.4.0`, from the release data rather than the write-up. */
  readonly kindLabel = computed(() => {
    const p = this.project();
    if (!p) return '';
    return [KIND[p.kind], this.release()?.tag].filter(Boolean).join(' · ');
  });

  readonly shots = computed<Shot[]>(() => {
    const p = this.project();
    if (!p) return [];
    // `images` is the real gallery. The single `image` is the fallback for a
    // project that has not been shot yet; it has no caption of its own and one
    // is not invented for it.
    const frames: ProjectImage[] =
      p.images?.length ? p.images : p.image ? [{ src: p.image, caption: '' }] : [];
    return frames.map((frame, i) => ({
      src: frame.src,
      caption: frame.caption,
      name: frame.caption || `Screenshot ${i + 1}`,
    }));
  });

  readonly currentShot = computed(() => this.shots()[this.shot()] ?? null);

  readonly heroSrc = computed(() => this.currentShot()?.src ?? '');

  readonly heroAlt = computed(() => {
    const p = this.project();
    if (!p) return '';
    const caption = this.currentShot()?.caption;
    return caption ? `${p.title} — ${caption}` : `${p.title} screenshot`;
  });

  /** `2 of 5`, printed only when there is more than one shot to count. */
  readonly shotCount = computed(() => {
    const total = this.shots().length;
    return total > 1 ? `${this.shot() + 1} of ${total}` : '';
  });

  /** Captions are lower-case notes in the data; the stage prints them as sentences. */
  readonly shotCaption = computed(() => capitalize(this.currentShot()?.caption ?? ''));

  readonly paragraphs = computed(() => this.project()?.longDescription ?? []);

  readonly sourceUrl = computed(() => this.project()?.links.github ?? '');

  /**
   * The one thing to do besides reading the source: visit a live site, open a
   * published package, or download the latest release. Platforms come from the
   * release, never the write-up, so they cannot go stale.
   */
  readonly primary = computed<{ label: string; href: string } | null>(() => {
    const p = this.project();
    if (!p) return null;
    if (p.links.demo) return { label: `Visit ${p.title}`, href: p.links.demo };
    if (p.links.nuget) return { label: 'View on NuGet', href: p.links.nuget };
    const release = this.release();
    if (!release?.platforms.length) return null;
    const one = release.platforms.length === 1;
    return { label: one ? `Download for ${release.platforms[0]}` : `Download ${p.title}`, href: release.url };
  });

  /** Commands that install it, for a project with nothing to download. */
  readonly install = computed(() => this.project()?.install ?? []);

  /** `Free · Windows & Linux · app and CLI, updates itself` */
  readonly fine = computed(() => {
    const p = this.project();
    if (!p || (!this.primary() && !this.install().length)) return '';
    const platforms = p.links.demo ? '' : platformList(this.release()?.platforms ?? []);
    return ['Free', platforms, p.note].filter(Boolean).join(' · ');
  });

  /**
   * Offers "Read the write-up" when a project names a companion post.
   * `Project` carries no `writeup` field today, so this reads one if the data
   * ever grows it and only offers the link when the post actually exists.
   */
  readonly writeupRoute = computed(() => {
    const slug = (this.project() as (Project & { writeup?: string }) | undefined)?.writeup;
    if (!slug) return '';
    return blogPosts.some((post) => post.slug === slug) ? `/blog/${slug}` : '';
  });

  readonly facts = computed<KeyValueItem[]>(() => {
    const p = this.project();
    if (!p) return [];
    // Only facts the project actually has. A key with an empty value reads as
    // a broken page rather than as an absent fact.
    const items: KeyValueItem[] = [{ key: 'Kind', value: KIND[p.kind] }];
    if (p.status) items.push({ key: 'Status', value: capitalize(p.status), state: 'ok' });
    if (this.release()) items.push({ key: 'Version', value: this.release()!.tag });
    const platforms = platformList(this.release()?.platforms ?? []);
    if (platforms) items.push({ key: 'Platforms', value: platforms });
    if (p.stack) items.push({ key: 'Stack', value: p.stack });
    if (p.year) items.push({ key: 'Year', value: p.year });
    if (p.links.demo) items.push({ key: 'Live', value: bareUrl(p.links.demo) });
    if (p.links.nuget) items.push({ key: 'Package', value: bareUrl(p.links.nuget) });
    if (p.links.github) items.push({ key: 'Source', value: bareUrl(p.links.github) });
    return items;
  });

  /**
   * The neighbours wrap around the list, so every project has one on both
   * sides. Below two projects wrapping would link a page to itself, so there
   * are none.
   */
  readonly neighbours = computed(() => {
    const all = this.records;
    const i = this.recordIndex();
    if (i < 0 || all.length < 2) return null;
    return {
      prev: all[(i - 1 + all.length) % all.length],
      next: all[(i + 1) % all.length],
    };
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      const found = this.projectsService.getProjectById(id);

      this.requestedId.set(id);
      this.project.set(found);
      this.shot.set(0);

      if (found) {
        const path = `/portfolio/${found.id}`;
        this.pageMeta.set({
          title: `${found.title} - Hazel Granados`,
          description: found.description,
          path,
          jsonLd: [
            {
              // Every project with a repository is code; the rest are plain works.
              '@type': found.links.github ? 'SoftwareSourceCode' : 'CreativeWork',
              name: found.title,
              description: found.description,
              url: `${SITE_ORIGIN}${path}`,
              ...(found.links.github && { codeRepository: found.links.github }),
              ...(found.tags?.length && { keywords: found.tags }),
              author: { '@id': PERSON['@id'] },
            },
            breadcrumbs(['Home', '/'], ['Projects', '/portfolio'], [found.title, path]),
          ],
        });
        return;
      }

      // An id with no project is a 404, exactly like the error route. Without
      // this it would inherit the previous page's tags and could be indexed
      // under a URL that holds nothing.
      this.pageMeta.set({
        title: 'Project not found - Hazel Granados',
        description: 'No project lives at this address.',
        path: this.requestedPath(),
        noindex: true,
      });
    });
  }

  select(index: number): void {
    this.shot.set(index);
  }

  nextShot(): void {
    const total = this.shots().length;
    if (total < 2) return;
    this.shot.update((current) => (current + 1) % total);
  }

  /**
   * ArrowRight advances the gallery. Scoped the same way the shell scopes its
   * own shortcuts: never while a text field has focus — the search palette's
   * input is one — and never with a modifier held, so browser and OS chords
   * keep working.
   */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowRight') return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (this.isTypingTarget(event.target)) return;
    this.nextShot();
  }

  private isTypingTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    return !!el && ['INPUT', 'TEXTAREA'].includes(el.tagName);
  }
}
