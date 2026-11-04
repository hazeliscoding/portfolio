import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { blogPosts } from './data/blog-posts.generated';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },

  {
    path: 'blog',
    renderMode: RenderMode.Prerender,
  },

  {
    path: 'blog/tags/:tag',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      const tags = new Set(blogPosts.flatMap((post) => post.tags));
      return [...tags].map((tag) => ({ tag }));
    },
  },

  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      return blogPosts.map((post) => ({ slug: post.slug }));
    },
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
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      const { projectsData } = await import('./data/projects.data');
      return projectsData.map((p) => ({ id: p.id }));
    },
  },

  {
    path: 'overglance',
    renderMode: RenderMode.Prerender,
  },

  {
    path: 'overglance/:doc',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      const { overglanceDocs } = await import('./data/overglance-docs.generated');
      return overglanceDocs.map((d) => ({ doc: d.slug }));
    },
  },

  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
