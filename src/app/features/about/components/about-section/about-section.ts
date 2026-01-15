import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'about-section',
  imports: [TerminalSection, AppTitle],
  templateUrl: './about-section.html',
  styleUrl: './about-section.scss',
})
export class AboutSection {
  location = 'Texas, USA';
  paragraphs = [
    "I'm Hazel Granados (she/they), a software developer with a B.S. in Computer Science from Texas A&M University–Victoria.",
    'I enjoy building modern web apps with strong UX, solid architecture, and maintainable code.',
    'I am always learning and looking for interesting problems to solve.',
  ];
}
