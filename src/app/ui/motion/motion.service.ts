import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

/**
 * Drives CSS animation re-triggering across route changes.
 *
 * A CSS animation only restarts if its `animation-name` changes. So the
 * keyframe library defines every entrance animation twice — `win-a` and
 * `win-b` are identical — and components bind this alternating value into a
 * `data-sfx` attribute the stylesheet selects on. Flipping the attribute
 * swaps the animation name, which restarts the animation.
 *
 * Starts at 'a' and only changes on navigation, so the value is deterministic
 * and hydration cannot mismatch.
 *
 * It does NOT follow that prerendered HTML carries 'a'. Angular's initial
 * navigation fires a `NavigationEnd` during the server render, so every
 * prerendered page ships `data-sfx="b"`. The client then repeats the same
 * sequence — constructed at 'a', flipped to 'b' by its own initial navigation
 * — which means the attribute briefly reads 'a' during bootstrap. Measured:
 * 'b' in the served HTML, 'a' at 96ms, 'b' again at 111ms.
 *
 * That 15ms divergence restarts every entrance animation once on first load.
 * It is invisible today because the boot overlay covers the first 2700ms, and
 * under reduced motion there is no overlay but also no animation. Worth
 * knowing before anyone removes or short-circuits the overlay: the
 * double-trigger would become visible, not appear.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly router = inject(Router);
  private readonly state = signal<'a' | 'b'>('a');

  readonly sfx = this.state.asReadonly();

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.state.update((current) => (current === 'a' ? 'b' : 'a'));
      }
    });
  }
}
