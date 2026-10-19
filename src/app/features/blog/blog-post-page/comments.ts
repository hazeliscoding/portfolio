import { Component, ElementRef, afterRenderEffect, input, viewChild } from '@angular/core';

import { SITE_ORIGIN } from '../../../core/page-meta';
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
  // Always production's copy: giscus fetches it from its own iframe, and a
  // preview behind Vercel's login cannot answer that request.
  'data-theme': `${SITE_ORIGIN}/giscus-kairo.css`,
  'data-lang': 'en',
  'data-loading': 'lazy',
};

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [Window],
  templateUrl: './comments.html',
})
export class Comments {
  /** The post's slug, which names its discussion. */
  readonly term = input.required<string>();

  private readonly frame = viewChild.required<ElementRef<HTMLElement>>('frame');

  constructor() {
    // Browser only, so no prerendered page carries the third-party script. Runs
    // again when the pager swaps the post under this same component, replacing
    // the previous post's thread.
    afterRenderEffect(() => {
      const script = document.createElement('script');
      script.src = 'https://giscus.app/client.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      for (const [name, value] of Object.entries({ ...GISCUS, 'data-term': this.term() })) {
        script.setAttribute(name, value);
      }
      this.frame().nativeElement.replaceChildren(script);
    });
  }
}
