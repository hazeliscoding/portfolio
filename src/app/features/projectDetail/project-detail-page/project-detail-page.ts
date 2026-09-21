import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { Badge } from '../../../ui/core/badge/badge';
import { KeyValue, KeyValueItem } from '../../../ui/data/key-value/key-value';
import { Project } from '../../../data/projects.data';
import { ProjectsDataService } from '../../../services/projects-data.service';
import { PageMeta } from '../../../core/page-meta';

@Component({
  selector: 'project-detail-page',
  standalone: true,
  imports: [RouterLink, ChapterHeader, Window, ViewportWindow, Badge, KeyValue],
  templateUrl: './project-detail-page.html',
  styleUrl: './project-detail-page.scss',
})
export class ProjectDetailPage {
  project = signal<Project | undefined>(undefined);
  activeImage = signal('');

  constructor(
    private pageMeta: PageMeta,
    private route: ActivatedRoute,
    private projectsService: ProjectsDataService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      const found = this.projectsService.getProjectById(id);
      this.project.set(found);
      this.activeImage.set(found?.image ?? '');

      if (found) {
        this.pageMeta.set({
          title: `${found.title} - Hazel Granados`,
          description: found.description,
          path: `/portfolio/${found.id}`,
        });
      }
    });
  }

  inspector(): KeyValueItem[] {
    const p = this.project();
    if (!p) return [];
    return [
      { key: 'STATUS', value: (p.status ?? '').toUpperCase() },
      { key: 'YEAR', value: p.year ?? '' },
      { key: 'STACK', value: p.stack ?? '' },
      { key: 'RECORD', value: '01 OF 01' },
    ];
  }

  select(src: string): void {
    this.activeImage.set(src);
  }
}
