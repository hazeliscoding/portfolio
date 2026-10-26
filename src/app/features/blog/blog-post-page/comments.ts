import { Component, ElementRef, afterRenderEffect, inject, input, untracked, viewChild } from '@angular/core';

import { SITE_ORIGIN } from '../../../core/page-meta';
import { Theme, ThemeService } from '../../../core/theme';
import { Window } from '../../../ui/windows/window/window';

/**
 * giscus: comments and reactions stored as GitHub Discussions in this repo's
 * "Blog comments" category, one discussion per post, opened by its first
 * comment. The two ids come from GitHub; the README says how to read them.
 */
const GISCUS: Record<string, string> = {
  'data-repo': 'hazeliscoding/portfolio',
  'data-repo-id': 'R_kgDOM1aHaA',
  'data-category': 'Blog comments',
  'data-category-id': 'DIC_kwDOM1aHaM4DJAkQ',
  'data-mapping': 'specific',
  // Finds the discussion by a hash of the slug in its body, not by GitHub's
  // fuzzy title search, which could hand one post another post's thread.
  'data-strict': '1',
  'data-reactions-enabled': '1',
  'data-emit-metadata': '0',
  'data-input-position': 'bottom',
  'data-lang': 'en',
  'data-loading': 'lazy',
};

/**
 * The site's own giscus theme for each of its themes. Always production's
 * copy: giscus fetches it from its own iframe, and a preview behind Vercel's
 * login cannot answer that request.
 */
export function giscusTheme(theme: Theme): string {
  return `${SITE_ORIGIN}/${theme === 'dark' ? 'giscus-kairo-dark.css' : 'giscus-kairo.css'}`;
}

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [Window],
  templateUrl: './comments.html',
  styles: `
    .comments__title {
      font: 600 28px/1.2 var(--font-display);
      letter-spacing: var(--tracking-heading);
    }

    .comments__note {
      margin: var(--sp-2) 0 var(--sp-5);
      font-size: 15px;
      color: var(--text-muted);
    }
  `,
})
export class Comments {
  /** The post's slug, which names its discussion. */
  readonly term = input.required<string>();

  private readonly frame = viewChild.required<ElementRef<HTMLElement>>('frame');
  private readonly theme = inject(ThemeService);

  constructor() {
    // Browser only, so no prerendered page carries the third-party script. Runs
    // again when the pager swaps the post under this same component, replacing
    // the previous post's thread.
    afterRenderEffect(() => {
      const script = document.createElement('script');
      script.src = 'https://giscus.app/client.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      // Read untracked: a theme change restyles the open thread below, rather
      // than reloading it and losing a half-written comment.
      const theme = giscusTheme(untracked(this.theme.theme));
      for (const [name, value] of Object.entries({ ...GISCUS, 'data-term': this.term(), 'data-theme': theme })) {
        script.setAttribute(name, value);
      }
      this.frame().nativeElement.replaceChildren(script);
    });

    // giscus's own message for a live theme change. Before its iframe exists
    // there is nothing to tell, and the script above already asked for the
    // right theme.
    afterRenderEffect(() => {
      const theme = giscusTheme(this.theme.theme());
      this.frame()
        .nativeElement.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
        ?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, 'https://giscus.app');
    });
  }
}
