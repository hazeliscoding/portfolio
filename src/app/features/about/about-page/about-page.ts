import { Component } from '@angular/core';
import { AboutSection } from '../components/about-section/about-section';
import { EducationSection } from '../components/education-section/education-section';
import { InterestsSection } from '../components/interests-section/interests-section';
import { LanguagesSection } from '../components/languages-section/languages-section';
import { DownloadSection } from '../components/download-section/download-section';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'about-page',
  standalone: true,
  imports: [
    AboutSection,
    EducationSection,
    InterestsSection,
    LanguagesSection,
    DownloadSection,
  ],
  templateUrl: './about-page.html',
  styleUrl: './about-page.scss',
})
export class AboutPage {
  constructor(
    private title: Title,
    private meta: Meta,
  ) {}

  ngOnInit(): void {
    this.title.setTitle('About - Hazel Granados');
    this.meta.updateTag({
      name: 'description',
      content: 'Learn more about Hazel Granados.',
    });
  }
}
