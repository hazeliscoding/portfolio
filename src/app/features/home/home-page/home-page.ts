import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { ViewportWindow } from '../../../ui/windows/viewport-window/viewport-window';
import { StatusLight } from '../../../ui/core/status-light/status-light';
import { Badge } from '../../../ui/core/badge/badge';
import { projectsData } from '../../../data/projects.data';
import { blogPosts } from '../../../data/blog-posts.generated';
import { ossStats } from '../../../data/oss-stats.generated';
import { count } from '../../../core/count';

const LAST_UPDATE = '2026-09-20';

@Component({
  selector: 'home-page',
  standalone: true,
  imports: [RouterLink, ChapterHeader, Window, ViewportWindow, StatusLight, Badge],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  lastUpdate = LAST_UPDATE;
  projects = projectsData.filter((p) => p.featured);
  posts = blogPosts;
  oss = ossStats;

  stack = [
    { idx: '01', label: 'C# / .NET 8' },
    { idx: '02', label: 'ASP.NET Core' },
    { idx: '03', label: 'Angular' },
    { idx: '04', label: 'EF Core + PostgreSQL' },
    { idx: '05', label: 'CQRS / MediatR' },
    { idx: '06', label: 'AWS SQS/SNS' },
    { idx: '07', label: 'Terraform' },
    { idx: '08', label: 'AWS Parameter Store' },
    { idx: '09', label: 'Docker' },
    { idx: '10', label: 'xUnit + Testcontainers' },
  ];

  services = [
    { label: 'Full-stack web application development' },
    { label: 'Backend/API engineering' },
    { label: 'Background processing & scheduled jobs' },
    { label: 'Event-driven integrations' },
    { label: 'Database design & optimization' },
    { label: 'Cloud deployment & DevOps automation' },
    { label: 'Observability & monitoring setup' },
    { label: 'Automated testing & CI/CD pipelines' },
  ];

  get total(): string {
    return String(this.projects.length).padStart(2, '0');
  }

  get logStatus(): string {
    return count(this.posts.length, 'ENTRY', 'ENTRIES');
  }

  indexOf(i: number): string {
    return String(i + 1).padStart(2, '0');
  }

  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Hazel Granados — Software Developer');
    this.meta.updateTag({
      name: 'description',
      content: 'Software developer. Full-stack applications built with care.',
    });
  }
}
