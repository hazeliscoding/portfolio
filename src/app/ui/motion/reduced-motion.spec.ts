describe('reduced motion', () => {
  const ruleFor = (selector: string, media: string): string | null => {
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
              return inner.style.animation || inner.style.display || '';
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
    expect(declared).toMatch(/none/);
  });

  it('disables the window entrance outright, since its from-state is invisible', () => {
    const declared = ruleFor('.window[data-sfx', 'prefers-reduced-motion');
    expect(declared).not.toBeNull();
    expect(declared).toMatch(/none/);
  });
});
