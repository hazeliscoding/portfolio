import { projectsData } from './projects.data';

describe('projectsData', () => {
  it('holds PR Sweep, AniMatch, QuickbaseNet and JAGE, in that order', () => {
    expect(projectsData.map((p) => p.id)).toEqual(['pr-sweep', 'animatch', 'quickbase-net', 'jage']);
    expect(projectsData.map((p) => p.title)).toEqual([
      'PR Sweep',
      'AniMatch',
      'QuickbaseNet',
      'JAGE',
    ]);
  });

  it('links AniMatch to its live site and its repository', () => {
    const animatch = projectsData.find((p) => p.id === 'animatch')!;
    expect(animatch.links.demo).toBe('https://animatch-moe.vercel.app');
    expect(animatch.links.github).toBe('https://github.com/hazeliscoding/animatch');
  });

  it('links QuickbaseNet to its NuGet package and its repository', () => {
    const quickbase = projectsData.find((p) => p.id === 'quickbase-net')!;
    expect(quickbase.links.nuget).toBe('https://www.nuget.org/packages/QuickbaseNet');
    expect(quickbase.links.github).toBe('https://github.com/hazeliscoding/quickbase-net');
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
    expect(projectsData[2].images?.length).toBe(3);
    expect(projectsData[3].images?.length).toBe(4);
  });
});
