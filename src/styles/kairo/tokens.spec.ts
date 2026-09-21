describe('KAIRO tokens', () => {
  const read = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  it('defines the canvas surface', () => {
    expect(read('--surface-canvas')).toBeTruthy();
  });

  it('resolves signal red to the KAIRO value', () => {
    const probe = document.createElement('div');
    probe.style.color = 'var(--signal-active)';
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).color;
    probe.remove();
    expect(resolved).toBe('rgb(232, 56, 44)');
  });

  it('defines the 4px spacing grid', () => {
    expect(read('--sp-1')).toBe('4px');
    expect(read('--sp-4')).toBe('16px');
  });

  it('defines the mechanical easing curve', () => {
    expect(read('--ease-mech')).toBe('cubic-bezier(0.3,0,0.1,1)');
  });
});
