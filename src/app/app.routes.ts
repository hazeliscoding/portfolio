import { Routes } from '@angular/router';

// Paths stay declared individually because the server routes prerender them by
// name — Angular rejects a server route with no matching app route.

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home-page/home-page').then((m) => m.HomePage),
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/blog/blog-page/blog-page').then((m) => m.BlogPage),
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./features/blog/blog-post-page/blog-post-page').then(
        (m) => m.BlogPostPage,
      ),
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
