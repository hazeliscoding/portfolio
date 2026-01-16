import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'interests-section',
  imports: [TerminalSection, AppTitle],
  templateUrl: './interests-section.html',
  styleUrl: './interests-section.scss',
})
export class InterestsSection {
  interests = [
    'Full-stack (.NET + Angular)',
    'Cloud & serverless (AWS/Azure)',
    'Microservices & event-driven systems',
    'Performance, testing & CI/CD',
  ];
}
