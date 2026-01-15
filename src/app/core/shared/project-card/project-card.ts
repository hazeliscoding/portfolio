import { Component, Input } from '@angular/core';
import { Project } from '../../../data/projects.data';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'project-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-card.html',
  styleUrl: './project-card.scss',
})
export class ProjectCard {
  @Input() project!: Project;

  constructor(private router: Router) {}

  navigateToDetail() {
    this.router.navigate(['/portfolio', this.project.id]);
  }
}
