import { projectsData } from './projects.data';

describe('projectsData', () => {
  it('holds PR Sweep, then AniMatch', () => {
    expect(projectsData.map((p) => p.id)).toEqual(['pr-sweep', 'animatch']);
    expect(projectsData.map((p) => p.title)).toEqual(['PR Sweep', 'AniMatch']);
  });

  it('links AniMatch to its live site and its repository', () => {
    const animatch = projectsData.find((p) => p.id === 'animatch')!;
    expect(animatch.links.demo).toBe('https://animatch-moe.vercel.app');
    expect(animatch.links.github).toBe('https://github.com/hazeliscoding/animatch');
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
  });
});
