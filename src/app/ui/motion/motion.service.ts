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
 * Starts at 'a' and only changes on navigation, so prerendered output is
 * deterministic and hydration cannot mismatch.
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
