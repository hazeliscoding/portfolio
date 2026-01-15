import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },

  {
    path: 'about',
    renderMode: RenderMode.Prerender,
  },

  {
    path: 'portfolio',
    renderMode: RenderMode.Prerender,
  },

  {
    path: 'portfolio/:id',
    renderMode: RenderMode.Client,
  },

  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
