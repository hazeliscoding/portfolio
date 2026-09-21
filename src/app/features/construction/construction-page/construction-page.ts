import { Component } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'construction-page',
  standalone: true,
  imports: [],
  templateUrl: './construction-page.html',
  styleUrl: './construction-page.scss',
})
export class ConstructionPage {
  email = 'hazel.granados@protonmail.com';
  github = 'https://github.com/hazeliscoding';

  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('Under Construction - Hazel Granados');
    this.meta.updateTag({
      name: 'description',
      content:
        'This site is being redesigned from scratch. Back soon — Hazel Granados, software developer.',
    });
  }
}
