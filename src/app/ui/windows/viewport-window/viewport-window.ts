import { Component, input } from '@angular/core';

@Component({
  selector: 'app-viewport-window',
  standalone: true,
  imports: [],
  templateUrl: './viewport-window.html',
  styleUrl: './viewport-window.scss',
})
export class ViewportWindow {
  src = input('');
  alt = input('');
  ratio = input('4 / 3');
  pixelated = input(false);
  label = input('');
  /**
   * Opt-in, and off by default. KAIRO puts the travelling scanline on the
   * project detail screen's single large viewport — the one framed as a live
   * feed — and nowhere else. Running it inside every viewport meant four
   * archive cards and a thumbnail strip all sweeping at once, which reads as a
   * screensaver rather than as one camera being monitored.
   */
  scan = input(false);
  /**
   * Drops the viewport's own hairline frame.
   *
   * A viewport nested directly inside a Window's body would otherwise draw a
   * second border a pixel inside the panel's, which reads as a rendering
   * fault rather than as two frames. The design expresses this by passing
   * `style="border: none"` (project detail) or by killing three sides
   * (archive cards, where the bottom border stays as the rule under the
   * capture) — inline styles this component had no input for, so the pages
   * were reaching past the host with `::ng-deep` to do it instead.
   *
   * `'all'` removes every side; `'sides'` keeps only the bottom rule.
   */
  frame = input<'default' | 'none' | 'sides'>('default');
}
