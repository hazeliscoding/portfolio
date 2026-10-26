import { projectsData } from './projects.data';

describe('projectsData', () => {
  // The GitHub profile README's order: what has shipped, then what is being built.
  it('holds what has shipped, then what is being built, in the profile README’s order', () => {
    expect(projectsData.map((p) => p.id)).toEqual([
      'xiv-vault',
      'gil-sweep',
      'prompuff',
      'sweepling',
      'conatlas-tx',
      'staypaw',
      'sdl3-porter',
      'axiomarium',
      'shybun',
      'tattlehop',
      'carmine-workbench',
      'darnling',
    ]);
    expect(projectsData.map((p) => p.kind)).toEqual([
      'app',
      'app',
      'app',
      'app',
      'site',
      'app',
      'app',
      'pilot',
      'pilot',
      'pilot',
      'pilot',
      'pilot',
    ]);
  });

  // A band draws a screenshot, a CLI's commands or bare art; with none of
  // them its screen would render empty.
  it('gives every project something to show where its screen goes', () => {
    for (const p of projectsData) {
      const shows = [p.image, p.console?.length, p.art].filter(Boolean).length;
      expect(shows).withContext(p.id).toBeGreaterThan(0);
      if (p.art) expect(p.image).withContext(`${p.id} has art, so no screenshot`).toBe('');
    }
  });

  it('says where each project still being built stands', () => {
    for (const p of projectsData.filter((project) => project.kind === 'pilot')) {
      expect(p.status).withContext(p.id).toBeTruthy();
    }
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
    const counts = Object.fromEntries(projectsData.map((p) => [p.id, p.images?.length ?? 0]));
    expect(counts).toEqual({
      'xiv-vault': 5,
      'gil-sweep': 5,
      prompuff: 5,
      sweepling: 2,
      'conatlas-tx': 3,
      staypaw: 2,
      'sdl3-porter': 4,
      axiomarium: 2,
      shybun: 0,
      tattlehop: 0,
      'carmine-workbench': 1,
      darnling: 0,
    });
  });

  // Art is a PNG in the repo, like the screenshots; a drifted path would
  // leave the band with a broken image where its screen goes.
  it('serves every project’s art', async () => {
    for (const p of projectsData.filter((project) => project.art)) {
      const res = await fetch(p.art!.src);
      expect(res.ok).withContext(p.art!.src).toBeTrue();
      expect(res.headers.get('content-type')).withContext(p.art!.src).toContain('png');
    }
  });
});
