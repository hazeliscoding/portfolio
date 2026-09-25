import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { Badge } from '../../../ui/core/badge/badge';
import { Button } from '../../../ui/core/button/button';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { RecordFault } from '../../../ui/record-fault/record-fault';
import { MotionService } from '../../../ui/motion/motion.service';
import { Project, ProjectImage } from '../../../data/projects.data';
import { blogPosts } from '../../../data/blog-posts.generated';
import { ProjectsDataService } from '../../../services/projects-data.service';
import { PageMeta } from '../../../core/page-meta';
import { MODE_CODES } from '../../../core/navigation';
import { count } from '../../../core/count';

/** One frame of the record's camera feed. */
interface Shot {
  src: string;
  caption: string;
  /** Zero-padded position, printed as the thumbnail's viewport label. */
  idx: string;
  /** The thumbnail button's accessible name. */
  name: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

@Component({
  selector: 'project-detail-page',
  standalone: true,
  imports: [
    RouterLink,
    ChapterHeader,
    Window,
    ViewportWindow,
    Badge,
    Button,
    KeyValue,
    RecordFault,
  ],
  templateUrl: './project-detail-page.html',
  styleUrl: './project-detail-page.scss',
})
export class ProjectDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly projectsService = inject(ProjectsDataService);
  private readonly pageMeta = inject(PageMeta);
  motion = inject(MotionService);

  /** Every record in the archive — the source of this record's number and its neighbours. */
  readonly records = this.projectsService.getAllProjects();

  /**
   * `ARCHIVE_03`, taken from the shell's table rather than typed again here.
   * The return label and the location the system bar prints are the same
   * name, and they must not be able to drift apart.
   */
  readonly archiveCode = MODE_CODES['projects'];

  readonly project = signal<Project | undefined>(undefined);
  readonly requestedId = signal('');
  /** Index of the shot on the large viewport. */
  readonly shot = signal(0);

  readonly requestedPath = computed(() => `/portfolio/${this.requestedId()}`);

  private readonly recordIndex = computed(() => {
    const p = this.project();
    return p ? this.records.indexOf(p) : -1;
  });

  /**
   * The chapter on a record screen IS the record, so there is no `_NN` index
   * after it — the number moves into the meta line instead, where it reads as
   * a position in the archive rather than as a chapter number.
   */
  readonly chapterTitle = computed(() => this.project()?.title.toUpperCase() ?? '');

  /** `01 OF 01` — this record's position in the archive. */
  readonly recordPosition = computed(
    () => `${pad(this.recordIndex() + 1)} OF ${pad(this.records.length)}`,
  );

  readonly chapterMeta = computed(() => {
    const p = this.project();
    if (!p) return '';
    const position = `RECORD ${this.recordPosition()}`;
    return p.stack ? `${position} · ${p.stack.toUpperCase()}` : position;
  });

  readonly shots = computed<Shot[]>(() => {
    const p = this.project();
    if (!p) return [];
    // `images` is the real gallery. The single `image` is the fallback for a
    // record that has not been shot yet; it has no caption of its own and one
    // is not invented for it.
    const frames: ProjectImage[] =
      p.images?.length ? p.images : p.image ? [{ src: p.image, caption: '' }] : [];
    return frames.map((frame, i) => ({
      src: frame.src,
      caption: frame.caption,
      idx: pad(i + 1),
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

  readonly shotContext = computed(() => {
    const total = this.shots().length;
    return total ? `${pad(this.shot() + 1)} OF ${pad(total)}` : '';
  });

  readonly shotLabel = computed(() => {
    const p = this.project();
    return p ? `CAM ${pad(this.shot() + 1)} // ${p.id.toUpperCase()}` : '';
  });

  /**
   * The caption lives in the window's footer strip, not under each thumbnail:
   * captions are sentences, and printing four of them in a 56px-wide cell is
   * what used to push the strip wider than the page.
   *
   * The advance hint is appended only when there is somewhere to advance to.
   * A one-shot record that says "CLICK OR → FOR NEXT" is an instrument
   * reporting a control that does nothing.
   */
  readonly shotFooter = computed(() => {
    const caption = this.currentShot()?.caption.toUpperCase() ?? '';
    const hint = this.shots().length > 1 ? 'CLICK OR → FOR NEXT' : '';
    return [caption, hint].filter(Boolean).join(' · ');
  });

  readonly paragraphs = computed(() => this.project()?.longDescription ?? []);

  readonly readmeContext = computed(() =>
    count(this.paragraphs().length, 'PARAGRAPH', 'PARAGRAPHS'),
  );

  readonly sourceUrl = computed(() => this.project()?.links.github ?? '');

  /** The readout prints the repository, not the protocol: `github.com/owner/repo`. */
  readonly sourceLabel = computed(() => this.sourceUrl().replace(/^https?:\/\//, ''));

  /** A deployed project leads with its live site; the source button steps down to secondary. */
  readonly demoUrl = computed(() => this.project()?.links.demo ?? '');

  readonly demoLabel = computed(() =>
    this.demoUrl().replace(/^https?:\/\//, '').replace(/\/$/, ''),
  );

  /**
   * KAIRO's record panel offers "Read the writeup" when a project has a
   * companion log entry. `Project` carries no `writeup` field today and
   * `projects.data.ts` is not this screen's to change, so this reads one if
   * the data ever grows it and only offers the link when the entry it names
   * actually exists. With today's data it is always empty and the button does
   * not render — inventing a destination would be worse than omitting it.
   */
  readonly writeupRoute = computed(() => {
    const slug = (this.project() as (Project & { writeup?: string }) | undefined)?.writeup;
    if (!slug) return '';
    return blogPosts.some((post) => post.slug === slug) ? `/blog/${slug}` : '';
  });

  readonly record = computed<KeyValueItem[]>(() => {
    const p = this.project();
    if (!p) return [];
    const items: KeyValueItem[] = [];
    // Only fields the record actually carries. A key with an empty value reads
    // as a broken instrument rather than as an absent fact.
    if (p.status) items.push({ key: 'STATUS', value: p.status.toUpperCase(), state: 'ok' });
    if (p.year) items.push({ key: 'YEAR', value: p.year });
    if (p.stack) items.push({ key: 'STACK', value: p.stack });
    items.push({ key: 'SCREENSHOTS', value: pad(this.shots().length) });
    if (this.demoLabel()) items.push({ key: 'LIVE', value: this.demoLabel() });
    if (this.sourceLabel()) items.push({ key: 'SOURCE', value: this.sourceLabel() });
    return items;
  });

  /**
   * The design wraps around a four-record archive, so every record has a
   * neighbour on both sides. This archive has one, and wrapping a single
   * record would link it to itself — a control that looks like navigation and
   * reloads the page you are on. Below two records the panel reports the
   * absence instead.
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
        this.pageMeta.set({
          title: `${found.title} - Hazel Granados`,
          description: found.description,
          path: `/portfolio/${found.id}`,
        });
        return;
      }

      // An id with no record is a 404 served with a 200, exactly like the
      // error route. Without this it would inherit the previous page's tags
      // and get indexed under a URL that holds nothing.
      this.pageMeta.set({
        title: 'Record not found - Hazel Granados',
        description: 'No record exists at this address.',
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

  openSource(): void {
    const url = this.sourceUrl();
    if (url) window.open(url, '_blank', 'noopener');
  }

  openDemo(): void {
    const url = this.demoUrl();
    if (url) window.open(url, '_blank', 'noopener');
  }

  /**
   * ArrowRight advances the feed, as in the design. Scoped the same way the
   * shell scopes its own shortcuts: never while a text field has focus — the
   * command palette's input is one — and never with a modifier held, so
   * browser and OS chords keep working.
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
