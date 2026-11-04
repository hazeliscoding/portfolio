import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MotionService } from '../../../ui/motion/motion.service';
import { PageMeta, PERSON, SITE_ORIGIN, breadcrumbs } from '../../../core/page-meta';
import {
  OVERGLANCE_CHECKOUT_URL,
  OVERGLANCE_DOWNLOAD_URL,
  OVERGLANCE_FAQ,
  OVERGLANCE_MOCKUP,
  OVERGLANCE_PRICE,
  OVERGLANCE_SECTIONS,
  OVERGLANCE_THEMES,
  OVERGLANCE_TRUST,
} from '../../../data/overglance.data';
import { overglanceDocs, overglanceLaunchVideo } from '../../../data/overglance-docs.generated';

const PATH = '/overglance';
const PITCH = 'Your day and your agents, at a glance.';
const DESCRIPTION =
  'A pill at the top of your Windows screen that opens into a panel: your next meeting, what’s playing, your Claude and Codex limits with a pace forecast, and which coding agents are working or waiting for you. Free for 7 days, then $9.99 once for 3 PCs.';

@Component({
  selector: 'overglance-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './overglance-page.html',
  styleUrl: './overglance-page.scss',
})
export class OverglancePage implements OnInit {
  private readonly pageMeta = inject(PageMeta);
  readonly motion = inject(MotionService);

  readonly pitch = PITCH;
  readonly downloadUrl = OVERGLANCE_DOWNLOAD_URL;
  readonly checkoutUrl = OVERGLANCE_CHECKOUT_URL;
  readonly price = OVERGLANCE_PRICE;
  readonly mockup = OVERGLANCE_MOCKUP;
  readonly launchVideo = overglanceLaunchVideo;
  readonly sections = OVERGLANCE_SECTIONS;
  readonly themes = OVERGLANCE_THEMES;
  readonly trust = OVERGLANCE_TRUST;
  readonly faq = OVERGLANCE_FAQ;
  readonly docs = overglanceDocs;

  ngOnInit(): void {
    this.pageMeta.set({
      title: `Overglance - ${PITCH}`,
      description: DESCRIPTION,
      path: PATH,
      image: '/images/og/overglance.png',
      imageAlt: `Overglance: ${PITCH} The panel open on its Home tab, with agent rows, limits, calendar and music.`,
      jsonLd: [
        {
          '@type': 'SoftwareApplication',
          name: 'Overglance',
          description: DESCRIPTION,
          url: `${SITE_ORIGIN}${PATH}`,
          operatingSystem: 'Windows',
          applicationCategory: 'UtilitiesApplication',
          offers: { '@type': 'Offer', price: '9.99', priceCurrency: 'USD' },
          author: { '@id': PERSON['@id'] },
        },
        breadcrumbs(['Home', '/'], ['Overglance', PATH]),
      ],
    });
  }
}
