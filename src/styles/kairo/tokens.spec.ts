describe('Design tokens', () => {
  const read = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  it('defines the canvas surface', () => {
    expect(read('--surface-canvas')).toBeTruthy();
  });

  it('resolves the accent to the shop purple', () => {
    const probe = document.createElement('div');
    probe.style.color = 'var(--signal-active)';
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    expect(resolved).toBe('rgb(102, 81, 207)');
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
