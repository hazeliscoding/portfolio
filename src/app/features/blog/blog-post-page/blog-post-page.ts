import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

import { Footer } from '../../../core/layout/footer/footer';
import { BlogService, type BlogPost } from '../../../services/blog.service';

@Component({
  selector: 'blog-post-page',
  standalone: true,
  imports: [CommonModule, RouterLink, Footer],
  templateUrl: './blog-post-page.html',
  styleUrl: './blog-post-page.scss',
})
export class BlogPostPage {
  post: BlogPost | null = null;

  constructor(
    private route: ActivatedRoute,
    private blog: BlogService,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug') ?? '';
      this.post = this.blog.getPostBySlug(slug);

      if (!this.post) {
        this.title.setTitle('Post not found - Hazel Granados');
        this.meta.updateTag({
          name: 'description',
          content: 'This blog post could not be found.',
        });
        return;
      }

      this.title.setTitle(`${this.post.title} - Hazel Granados`);

      this.meta.updateTag({
        name: 'description',
        content: this.post.description || `Blog post: ${this.post.title}`,
      });
    });
  }
}
