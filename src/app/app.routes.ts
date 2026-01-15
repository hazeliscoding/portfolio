import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about-page/about-page').then((m) => m.AboutPage),
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('./features/portfolio/portfolio-page/portfolio-page').then(
        (m) => m.PortfolioPage,
      ),
  },
  {
    path: 'portfolio/:id',
    loadComponent: () =>
      import(
        './features/projectDetail/project-detail-page/project-detail-page'
      ).then((m) => m.ProjectDetailPage),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/error/error-page/error-page').then((m) => m.ErrorPage),
  },
];
