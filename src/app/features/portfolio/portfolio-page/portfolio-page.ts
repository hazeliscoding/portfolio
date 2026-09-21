import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { Badge } from '../../../ui/core/badge/badge';
import { StatusLight } from '../../../ui/core/status-light/status-light';
import { projectsData } from '../../../data/projects.data';
import { PageMeta } from '../../../core/page-meta';

@Component({
  selector: 'portfolio-page',
  standalone: true,
  imports: [RouterLink, ChapterHeader, Window, ViewportWindow, Badge, StatusLight],
  templateUrl: './portfolio-page.html',
  styleUrl: './portfolio-page.scss',
})
export class PortfolioPage {
  projects = projectsData;

  get total(): string {
    return String(this.projects.length).padStart(2, '0');
  }

  indexOf(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  constructor(
    private pageMeta: PageMeta,
  ) {}

  ngOnInit(): void {
    this.pageMeta.set({
      title: 'Projects - Hazel Granados',
      description: 'Project archive — selected work by Hazel Granados.',
      path: '/portfolio',
    });
  }
}
