import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ChapterHeader } from '../../../ui/chapter-header/chapter-header';
import { Window } from '../../../ui/windows/window/window';
import { Column, DataTable, Row } from '../../../ui/data/data-table/data-table';
import { blogPosts } from '../../../data/blog-posts.generated';
import { count } from '../../../core/count';
import { PageMeta } from '../../../core/page-meta';

@Component({
  selector: 'blog-page',
  standalone: true,
  imports: [ChapterHeader, Window, DataTable],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
})
export class BlogPage {
  columns: Column[] = [
    { key: 'date', label: 'DATE', width: '120px', nowrap: true },
    { key: 'entry', label: 'ENTRY' },
    { key: 'tags', label: 'TAGS', width: '280px' },
  ];

  posts = [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  rows: Row[] = this.posts.map((p) => ({
    id: p.slug,
    cells: {
      date: p.date,
      entry: p.title,
      tags: p.tags.join(' // '),
    },
  }));

  selectedId = this.rows[0]?.id ?? '';

  get report(): string {
    const n = this.rows.length;
    return `${count(n, 'RECORD', 'RECORDS')} RETRIEVED`;
  }

  constructor(
    private pageMeta: PageMeta,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.pageMeta.set({
      title: 'Blog - Hazel Granados',
      description: 'Notes on building software, by Hazel Granados.',
      path: '/blog',
    });
  }

  open(slug: string): void {
    this.router.navigate(['/blog', slug]);
  }
}
