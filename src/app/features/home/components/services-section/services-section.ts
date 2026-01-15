import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppButton } from '../../../../core/shared/app-button/app-button';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'services-section',
  imports: [TerminalSection, AppButton, AppTitle],
  templateUrl: './services-section.html',
  styleUrl: './services-section.scss',
})
export class ServicesSection {
  services = [
    'Full-stack web application development',
    'Backend/API engineering',
    'Background processing & scheduled jobs',
    'Event-driven integrations',
    'Database design & optimization',
    'Cloud deployment & DevOps automation',
    'Observability & monitoring setup',
    'Automated testing & CI/CD pipelines',
  ];
}
