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
});
