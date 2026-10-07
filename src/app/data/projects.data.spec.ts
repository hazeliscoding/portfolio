import { projectsData } from './projects.data';

describe('projectsData', () => {
  it('contains exactly one project', () => {
    expect(projectsData.length).toBe(1);
  });

  it('is PR Sweep', () => {
    expect(projectsData[0].id).toBe('pr-sweep');
    expect(projectsData[0].title).toBe('PR Sweep');
  });

  it('has no project referencing a deleted blog post', () => {
    const ids = projectsData.map((p) => p.id);
    expect(ids).not.toContain('mcp-gateway');
    expect(ids).not.toContain('incident-control-plane');
    expect(ids).not.toContain('agent-eval-platform');
  });

  it('retains the images the detail page renders', () => {
    expect(projectsData[0].images?.length).toBe(4);
  });
});
