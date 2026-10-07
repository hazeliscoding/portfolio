import { projectsData } from './projects.data';

describe('projectsData', () => {
  it('holds PR Sweep, XIV Vault and Gil Sweep, in that order', () => {
    expect(projectsData.map((p) => p.id)).toEqual(['pr-sweep', 'xiv-vault', 'gil-sweep']);
    expect(projectsData.map((p) => p.title)).toEqual(['PR Sweep', 'XIV Vault', 'Gil Sweep']);
  });

  it('links XIV Vault to its repository', () => {
    const xivVault = projectsData.find((p) => p.id === 'xiv-vault')!;
    expect(xivVault.links.github).toBe('https://github.com/hazeliscoding/xiv-vault');
  });

  it('links Gil Sweep to its repository', () => {
    const gilSweep = projectsData.find((p) => p.id === 'gil-sweep')!;
    expect(gilSweep.links.github).toBe('https://github.com/hazeliscoding/gil-sweep');
  });

  it('has no project referencing a deleted blog post', () => {
    const ids = projectsData.map((p) => p.id);
    expect(ids).not.toContain('mcp-gateway');
    expect(ids).not.toContain('incident-control-plane');
    expect(ids).not.toContain('agent-eval-platform');
  });

  it('retains the images the detail page renders', () => {
    expect(projectsData[0].images?.length).toBe(4);
    expect(projectsData[1].images?.length).toBe(5);
    expect(projectsData[2].images?.length).toBe(5);
  });
});
