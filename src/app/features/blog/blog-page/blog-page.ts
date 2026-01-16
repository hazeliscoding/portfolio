import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';

import { AppTitle } from '../../../core/shared/app-title/app-title';
import { Footer } from '../../../core/layout/footer/footer';
import { BlogService, type BlogPost } from '../../../services/blog.service';

@Component({
  selector: 'blog-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AppTitle, Footer],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.scss',
})
export class BlogPage {
  posts: BlogPost[] = [];

  constructor(
    private blog: BlogService,
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.posts = this.blog.getAllPosts();

    this.title.setTitle('Blog - Hazel Granados');
    this.meta.updateTag({
      name: 'description',
      content:
        'Personal blog posts by Hazel Granados — notes about building, learning, and shipping software.',
    });
  }
}
