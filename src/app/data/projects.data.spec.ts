import { projectsData } from './projects.data';

describe('projectsData', () => {
  it('holds the five apps, then the live site, then the two pilots, in that order', () => {
    expect(projectsData.map((p) => p.id)).toEqual([
      'xiv-vault',
      'gil-sweep',
      'prompuff',
      'sweepling',
      'sdl3-porter',
      'conatlas-tx',
      'puzzle-boy',
      'axiomarium',
    ]);
    expect(projectsData.map((p) => p.kind)).toEqual([
      'app',
      'app',
      'app',
      'app',
      'app',
      'site',
      'pilot',
      'pilot',
    ]);
  });

  it('links Puzzle Boy to Community Edition, the one that plays without Nocturne', () => {
    const puzzleBoy = projectsData.find((p) => p.id === 'puzzle-boy')!;
    expect(puzzleBoy.links.github).toBe('https://github.com/hazeliscoding/puzzle-boy-community');
    expect(puzzleBoy.parts?.map((part) => part.url.split('/').pop())).toEqual([
      'puzzle-boy',
      'puzzle-boy-community',
      'puzzle-boy-engine',
    ]);
  });

  it('gives the live site its address', () => {
    const conAtlas = projectsData.find((p) => p.id === 'conatlas-tx')!;
    expect(conAtlas.links.demo).toBe('https://conatlas-tx.vercel.app');
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

  it('gives every project the pitch, medium and colours its segment prints', () => {
    for (const p of projectsData) {
      expect(p.pitch).withContext(p.id).not.toBe('');
      expect(p.medium).withContext(p.id).not.toBe('');
      expect(p.brand.ink).withContext(p.id).toMatch(/^#[0-9a-f]{6}$/);
      expect(p.brand.tint).withContext(p.id).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  // A logo path that drifts from the file renders as a broken image in the
  // middle of the segment, and nothing else would notice.
  it('serves every project logo', async () => {
    for (const p of projectsData) {
      for (const src of new Set([p.brand.icon, p.brand.mark])) {
        const res = await fetch(src);
        expect(res.ok).withContext(src).toBeTrue();
        expect(res.headers.get('content-type')).withContext(src).toContain('svg');
      }
    }
  });

  it('retains the images the detail page renders', () => {
    expect(projectsData[0].images?.length).toBe(5);
    expect(projectsData[1].images?.length).toBe(5);
    expect(projectsData[2].images?.length).toBe(5);
    expect(projectsData[3].images?.length).toBe(2);
    expect(projectsData[4].images?.length).toBe(4);
    expect(projectsData[5].images?.length).toBe(3);
    expect(projectsData[6].images?.length).toBe(3);
    expect(projectsData[7].images?.length).toBe(2);
  });
});
