import { Injectable } from '@angular/core';
import { projectsData } from '../data/projects.data';

@Injectable({ providedIn: 'root' })
export class ProjectsDataService {
  getProjectById(id: string) {
    return projectsData.find((project) => project.id === id);
  }

  getAllProjects() {
    return projectsData;
  }

  getFeaturedProjects() {
    return projectsData.filter((project) => project.featured);
  }
}
