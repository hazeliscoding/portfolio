import { Component, input } from '@angular/core';

/**
 * A segment's screen: the capture in a device bezel, inside a browser frame when
 * there is a site address, with a phone beside it when there is a phone shot. A
 * looping shot gives way to its still under reduced motion, and a CLI shows its
 * commands instead of a capture.
 */
@Component({
  selector: 'app-broadcast-screen',
  standalone: true,
  templateUrl: './broadcast-screen.html',
  styleUrl: './broadcast-screen.scss',
})
export class BroadcastScreen {
  readonly shot = input.required<string>();
  readonly alt = input.required<string>();
  readonly still = input('');
  readonly console = input<{ command: string; note: string }[]>([]);
  /** A live site's host, for the address bar; none for an app. */
  readonly host = input('');
  readonly phone = input('');
  readonly phoneAlt = input('');
}
