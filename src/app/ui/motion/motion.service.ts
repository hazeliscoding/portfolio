import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, skip } from 'rxjs';

/**
 * Drives CSS animation re-triggering across route changes.
 *
 * A CSS animation only restarts if its `animation-name` changes. So the
 * keyframe library defines every entrance animation twice — `win-a` and
 * `win-b` are identical — and components bind this alternating value into a
 * `data-sfx` attribute the stylesheet selects on. Flipping the attribute
 * swaps the animation name, which restarts the animation.
 *
 * Starts at 'a' and flips on every navigation EXCEPT the initial one. Angular
 * fires that first `NavigationEnd` twice over — once during the server render,
 * once again in the browser — so flipping on it shipped `data-sfx="b"` in the
 * prerendered HTML, read 'a' for ~15ms of bootstrap, then 'b' again: every
 * entrance animation restarted once on first load. The boot overlay hid that
 * until it stopped playing on pages other than home. Skipping the initial
 * navigation keeps the attribute at 'a' on the server and in the browser
 * alike, so hydration finds it unchanged and nothing restarts.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly router = inject(Router);
  private readonly state = signal<'a' | 'b'>('a');

  readonly sfx = this.state.asReadonly();

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        skip(1),
      )
      .subscribe(() => this.state.update((current) => (current === 'a' ? 'b' : 'a')));
  }
}
