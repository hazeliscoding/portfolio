import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewportWindow } from '../windows/viewport-window/viewport-window';
import { Window } from '../windows/window/window';

/**
 * What this file can and cannot prove.
 *
 * It proves the disabling rules still EXIST. It cannot prove they APPLY —
 * Karma has no way to toggle `prefers-reduced-motion`, so the media query is
 * never evaluated here and a rule that loses on specificity looks identical to
 * one that wins. That distinction has already bitten this project once, on the
 * shell's own `.app__env` / `.app__path` / `.app__sync` rules, which read
 * perfectly in the stylesheet and never applied.
 *
 * The real evidence is `getComputedStyle(el).animationName === 'none'`
 * measured in a browser with reduced motion emulated, recorded in the M6
 * report. Treat this file as a guard against someone deleting a rule, nothing
 * more.
 *
 * The components are instantiated rather than merely imported because Angular
 * injects component-scoped styles into `document.styleSheets` only while an
 * instance is alive. Without the fixture below, these selectors are not in the
 * document at all and every assertion fails for a reason that has nothing to
 * do with reduced motion.
 */
@Component({
  standalone: true,
  imports: [Window, ViewportWindow],
  template: `
    <app-window index="01" title="Probe"><p>contents</p></app-window>
    <app-viewport-window src="/probe.png" alt="probe" label="PROBE" />
  `,
})
class StyleHost {}

describe('reduced motion', () => {
  let fixture: ComponentFixture<StyleHost>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [StyleHost] }).compileComponents();
    fixture = TestBed.createComponent(StyleHost);
    fixture.detectChanges();
  });

  // Returns the two declarations separately. An earlier version returned
  // `animation || display`, which made the scanline assertion unfalsifiable:
  // its rule sets both, so deleting `animation: none` still matched on
  // `display: none`. Verified by mutation — that version passed with the
  // animation disable removed.
  const ruleFor = (
    selector: string,
    media: string,
  ): { animation: string; display: string } | null => {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue; // cross-origin stylesheet
      }
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSMediaRule && rule.conditionText.includes(media)) {
          for (const inner of Array.from(rule.cssRules)) {
            if (inner instanceof CSSStyleRule && inner.selectorText.includes(selector)) {
              return { animation: inner.style.animation, display: inner.style.display };
            }
          }
        }
      }
    }
    return null;
  };

  it('disables the looping scanline outright rather than zeroing its period', () => {
    const declared = ruleFor('.viewport__scan', 'prefers-reduced-motion');
    expect(declared).not.toBeNull();
    // Both, and specifically `animation`: a zeroed period on an infinite
    // animation is degenerate, not disabled, and `display: none` alone would
    // leave the animation running on a hidden element.
    expect(declared?.animation).toMatch(/none/);
    expect(declared?.display).toMatch(/none/);
  });

  it('disables the window entrance outright, since its from-state is invisible', () => {
    const declared = ruleFor('.window[data-sfx', 'prefers-reduced-motion');
    expect(declared).not.toBeNull();
    expect(declared?.animation).toMatch(/none/);
  });

  it('keeps the fixture alive, without which the rules above are unreachable', () => {
    expect(fixture.nativeElement.querySelector('.window')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.viewport')).toBeTruthy();
  });
});
