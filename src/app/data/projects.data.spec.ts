import { projectsData } from './projects.data';

describe('projectsData', () => {
  it('holds PR Sweep, XIV Vault, Gil Sweep, Prompuff and sdl3-porter, in that order', () => {
    expect(projectsData.map((p) => p.id)).toEqual([
      'pr-sweep',
      'xiv-vault',
      'gil-sweep',
      'prompuff',
      'sdl3-porter',
    ]);
    expect(projectsData.map((p) => p.title)).toEqual([
      'PR Sweep',
      'XIV Vault',
      'Gil Sweep',
      'Prompuff',
      'sdl3-porter',
    ]);
  });

  it('links XIV Vault to its repository', () => {
    const xivVault = projectsData.find((p) => p.id === 'xiv-vault')!;
    expect(xivVault.links.github).toBe('https://github.com/hazeliscoding/xiv-vault');
  });

  it('links Gil Sweep to its repository', () => {
    const gilSweep = projectsData.find((p) => p.id === 'gil-sweep')!;
    expect(gilSweep.links.github).toBe('https://github.com/hazeliscoding/gil-sweep');
  });

  it('links Prompuff to its repository', () => {
    const prompuff = projectsData.find((p) => p.id === 'prompuff')!;
    expect(prompuff.links.github).toBe('https://github.com/hazeliscoding/prompuff');
  });

  it('links sdl3-porter to its repository', () => {
    const porter = projectsData.find((p) => p.id === 'sdl3-porter')!;
    expect(porter.links.github).toBe('https://github.com/hazeliscoding/sdl3-porter');
  });

  it('has no project referencing a deleted blog post', () => {
    const ids = projectsData.map((p) => p.id);
    expect(ids).not.toContain('mcp-gateway');
    expect(ids).not.toContain('incident-control-plane');
    expect(ids).not.toContain('agent-eval-platform');
  });

  it('retains the images the detail page renders', () => {
    expect(projectsData[0].images?.length).toBe(5);
    expect(projectsData[1].images?.length).toBe(5);
    expect(projectsData[2].images?.length).toBe(5);
    expect(projectsData[3].images?.length).toBe(5);
    expect(projectsData[4].images?.length).toBe(4);
  });
});
