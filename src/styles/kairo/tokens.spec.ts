describe('Design tokens', () => {
  const read = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  it('defines the canvas surface', () => {
    expect(read('--surface-canvas')).toBeTruthy();
  });

  // Pinned to the light theme, which the test browser may not be in.
  it('resolves the accent to the shop purple', () => {
    document.documentElement.dataset['theme'] = 'light';
    const probe = document.createElement('div');
    probe.style.color = 'var(--signal-active)';
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    delete document.documentElement.dataset['theme'];
    expect(resolved).toBe('rgb(102, 81, 207)');
  });

  // The dark palette is CSS alone, keyed off data-theme, so the prerendered
  // page is right before any script runs.
  it('switches the surfaces and the accent for the dark theme', () => {
    const root = document.documentElement;
    const before = root.dataset['theme'];
    root.dataset['theme'] = 'dark';
    try {
      expect(read('--surface-canvas')).toBe('#131219');
      expect(read('--signal-active')).toBe('#a796fa');
      expect(read('--theme-moon')).toBe('0');
      root.dataset['theme'] = 'light';
      expect(read('--surface-canvas')).toBe('#fbfbfd');
      expect(read('--theme-moon')).toBe('1');
    } finally {
      if (before) root.dataset['theme'] = before;
      else delete root.dataset['theme'];
    }
  });

  it('defines the 4px spacing grid', () => {
    expect(read('--sp-1')).toBe('4px');
    expect(read('--sp-4')).toBe('16px');
  });

  it('defines the settling easing curve', () => {
    expect(read('--ease-mech')).toBe('cubic-bezier(0.22,1,0.36,1)');
  });

  it('sets headings and copy in Bricolage and code in JetBrains Mono', () => {
    expect(read('--font-display')).toContain('Bricolage Grotesque');
    expect(read('--font-ui')).toContain('Bricolage Grotesque');
    expect(read('--font-mono')).toContain('JetBrains Mono');
  });
});
