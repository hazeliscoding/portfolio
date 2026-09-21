import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { Badge } from '../../../ui/core/badge/badge';
import { StatusLight } from '../../../ui/core/status-light/status-light';
import { projectsData } from '../../../data/projects.data';

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
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Projects - Hazel Granados');
    this.meta.updateTag({
      name: 'description',
      content: 'Project archive — selected work by Hazel Granados.',
    });
  }
}
