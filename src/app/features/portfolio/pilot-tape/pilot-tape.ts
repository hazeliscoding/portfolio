import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MotionService } from '../../../ui/motion/motion.service';
import { Project } from '../../../data/projects.data';
import { BrandStyle } from '../broadcast-segment/broadcast-segment';

/** One repository row on a pilot's card. */
export interface PilotRow {
  label: string;
  url: string;
  detail: string;
}

/** Everything one experiment card renders, resolved once by the page. */
export interface Pilot {
  id: string;
  title: string;
  slug: string;
  pitch: string;
  icon: string;
  style: BrandStyle;
  reel: Project['reel'];
  console: Project['console'];
  rows: PilotRow[];
  source: string;
  build: string;
  delay: string;
}

/**
 * An experiment as a light card: quieter than a shipped band, with small links
 * instead of a big call to action.
 */
@Component({
  selector: 'app-pilot-tape',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './pilot-tape.html',
  styleUrl: './pilot-tape.scss',
})
export class PilotTape {
  readonly motion = inject(MotionService);
  readonly pilot = input.required<Pilot>();
}
