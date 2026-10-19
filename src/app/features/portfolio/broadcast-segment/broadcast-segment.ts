import { Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MotionService } from '../../../ui/motion/motion.service';
import { BroadcastScreen } from '../broadcast-screen/broadcast-screen';
import { InstallBox } from '../install-box/install-box';

/** A project's colours, as the custom properties its segment or tape reads. */
export type BrandStyle = Record<'--ink' | '--tint' | '--glow', string | null>;

/** What the call to action does: download a release, visit a site, or install by command. */
export type Cta =
  | { kind: 'download'; label: string; href: string; fine: string }
  | { kind: 'visit'; label: string; href: string; fine: string }
  | { kind: 'install'; commands: string[] };

/** Everything one ON AIR or LIVE segment renders, resolved once by the page. */
export interface Segment {
  id: string;
  kind: 'app' | 'site';
  channel: string;
  title: string;
  /** `DESKTOP · 2026` — what it is and when, for the channel bug. */
  slug: string;
  pitch: string;
  status: string;
  icon: string;
  mark: string;
  style: BrandStyle;
  shot: string;
  alt: string;
  /** A live site's address bar, its host without the protocol. */
  host: string;
  phone: string;
  cta: Cta;
  ticker: string[];
  /** Every other segment puts its screenshot on the left, as thatlev's bands do. */
  flip: boolean;
  delay: string;
}

/** One project as a broadcast segment: channel bug, name, release, call to action, screen, ticker. */
@Component({
  selector: 'app-broadcast-segment',
  standalone: true,
  imports: [RouterLink, BroadcastScreen, InstallBox],
  templateUrl: './broadcast-segment.html',
  styleUrl: './broadcast-segment.scss',
})
export class BroadcastSegment {
  readonly motion = inject(MotionService);
  readonly segment = input.required<Segment>();
}
