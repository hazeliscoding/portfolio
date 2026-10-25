import { TestBed } from '@angular/core/testing';
import { BlogService, pagerFor } from './blog.service';
import { blogPosts } from '../data/blog-posts.generated';

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

  it('lists a series oldest first, and nothing for an entry that stands alone', () => {
    expect(blog.getSeries('one-repo-became-three').map((post) => post.slug)).toEqual([
      'a-ps2-minigame-in-a-unity-remaster',
      'one-repo-became-three',
    ]);
    expect(blog.getSeries('hello-world')).toEqual([]);
  });

  it('pages the newest entry to nothing newer', () => {
    expect(blog.getPager(blogPosts[0].slug).newer).toBeNull();
  });
});

describe('pagerFor', () => {
  // Newest first, with an entry that came out between the two parts.
  const posts = [
    { slug: 'part-2', title: 'Two', series: 'S' },
    { slug: 'between', title: 'Between', series: '' },
    { slug: 'part-1', title: 'One', series: 'S' },
    { slug: 'first', title: 'First', series: '' },
  ];

  it('pages an entry that stands alone to the entries either side', () => {
    expect(pagerFor(posts, 'between')).toEqual({
      older: { slug: 'part-1', title: 'One', label: 'Older post' },
      newer: { slug: 'part-2', title: 'Two', label: 'Newer post' },
    });
  });

  it('pages a part to the parts either side, past the entries between them', () => {
    expect(pagerFor(posts, 'part-1').newer).toEqual({ slug: 'part-2', title: 'Two', label: 'Part 2' });
    expect(pagerFor(posts, 'part-2').older).toEqual({ slug: 'part-1', title: 'One', label: 'Part 1' });
  });

  it('falls back to the entry published that way where a part has no part', () => {
    expect(pagerFor(posts, 'part-1').older).toEqual({ slug: 'first', title: 'First', label: 'Older post' });
    expect(pagerFor(posts, 'part-2').newer).toBeNull();
  });

  it('pages nothing for an unknown entry', () => {
    expect(pagerFor(posts, 'no-such-entry')).toEqual({ older: null, newer: null });
  });
});
