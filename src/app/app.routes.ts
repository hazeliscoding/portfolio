import { Routes } from '@angular/router';

// The site is being redesigned, so every URL lands on the notice. The known
// paths stay declared individually because the server routes prerender them
// by name — that way links already shared out for blog posts and project
// pages serve the notice as a static page instead of a host 404.
// The previous route table is one `git revert` away in the history.
const construction = () =>
  import('./features/construction/construction-page/construction-page').then(
    (m) => m.ConstructionPage,
  );

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
  { path: 'blog/:slug', loadComponent: construction },
  { path: 'about', loadComponent: construction },
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
  { path: '**', loadComponent: construction },
];
