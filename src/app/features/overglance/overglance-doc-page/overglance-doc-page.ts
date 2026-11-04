import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { marked } from 'marked';

import { RecordFault } from '../../../ui/record-fault/record-fault';
import { ProseHtml } from '../../blog/blog-post-page/prose-html';
import { PageMeta, breadcrumbs } from '../../../core/page-meta';
import { overglanceDocs, type OverglanceDoc } from '../../../data/overglance-docs.generated';

/**
 * One of Overglance's trust pages, rendered from its Markdown as written. The
 * text is the app's own policy, so nothing here rewrites it.
 */
@Component({
  selector: 'overglance-doc-page',
  standalone: true,
  imports: [RouterLink, RecordFault, ProseHtml],
  templateUrl: './overglance-doc-page.html',
  styleUrl: './overglance-doc-page.scss',
})
export class OverglanceDocPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly pageMeta = inject(PageMeta);

  readonly docs = overglanceDocs;
  readonly doc = signal<OverglanceDoc | undefined>(undefined);
  readonly requestedSlug = signal('');
  readonly requestedPath = computed(() => `/overglance/${this.requestedSlug()}`);
  readonly html = computed(() => {
    const d = this.doc();
    return d ? (marked.parse(d.markdown) as string) : '';
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('doc') ?? '';
      const found = overglanceDocs.find((d) => d.slug === slug);
      this.requestedSlug.set(slug);
      this.doc.set(found);

      if (found) {
        this.pageMeta.set({
          title: `${found.title} - Overglance`,
          description: found.description,
          path: this.requestedPath(),
          jsonLd: [breadcrumbs(['Home', '/'], ['Overglance', '/overglance'], [found.title, this.requestedPath()])],
        });
        return;
      }

      // A slug with no page is a 404, as a project id with no project is.
      this.pageMeta.set({
        title: 'Page not found - Overglance',
        description: 'No page lives at this address.',
        path: this.requestedPath(),
        noindex: true,
      });
    });
  }
}
