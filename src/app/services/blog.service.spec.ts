import { TestBed } from '@angular/core/testing';
import { BlogService } from './blog.service';

describe('BlogService', () => {
  let blog: BlogService;

  beforeEach(() => {
    blog = TestBed.inject(BlogService);
  });

  // The Manikin Kid's alt quotes a line of dialogue. Unescaped, the first
  // quotation mark ended the attribute and the rest became junk attributes.
  it('escapes quotation marks inside image alt text', () => {
    const doc = new DOMParser().parseFromString(
      blog.getPostBySlug('a-ps2-minigame-in-a-unity-remaster')!.html,
      'text/html',
    );
    const img = doc.querySelector('img[src$="manikin-kid.jpg"]')!;
    expect(img.getAttribute('alt')).toContain('"Do you see that spinning blue cube?');
  });

  it('sizes every image and lazy-loads all but the first', () => {
    const imgs = Array.from(
      new DOMParser()
        .parseFromString(blog.getPostBySlug('a-ps2-minigame-in-a-unity-remaster')!.html, 'text/html')
        .querySelectorAll('img'),
    );
    expect(imgs.length).toBeGreaterThan(1);
    expect(imgs.every((img) => img.getAttribute('width') && img.getAttribute('height'))).toBe(true);
    expect(imgs[0].hasAttribute('loading')).toBe(false);
    expect(imgs.slice(1).every((img) => img.getAttribute('loading') === 'lazy')).toBe(true);
  });
});
