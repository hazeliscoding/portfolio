import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectsDataService } from '../../../services/projects-data.service';
import { TerminalSection } from '../../../core/layout/terminal-section/terminal-section';

@Component({
  selector: 'project-detail-page',
  standalone: true,
  imports: [CommonModule, TerminalSection],
  templateUrl: './project-detail-page.html',
  styleUrl: './project-detail-page.scss',
})
export class ProjectDetailPage {
  private route = inject(ActivatedRoute);
  private projectsService = inject(ProjectsDataService);

  project = this.projectsService.getProjectById(
    this.route.snapshot.paramMap.get('id') || '',
  );
}
