import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Comments } from './comments';

describe('Comments', () => {
  let fixture: ComponentFixture<Comments>;
  let inserted: jasmine.Spy;

  /** The giscus script the component last handed to the page. */
  const script = () => inserted.calls.mostRecent().args[0] as HTMLScriptElement;

  beforeEach(async () => {
    // Captures the script rather than inserting it, so no test reaches giscus.app.
    inserted = spyOn(Element.prototype, 'replaceChildren');
    await TestBed.configureTestingModule({ imports: [Comments] }).compileComponents();
    fixture = TestBed.createComponent(Comments);
    fixture.componentRef.setInput('term', 'hello-world');
    fixture.detectChanges();
  });

  it('loads giscus for the discussion named by the post slug', () => {
    expect(script().src).toBe('https://giscus.app/client.js');
    expect(script().getAttribute('data-mapping')).toBe('specific');
    expect(script().getAttribute('data-term')).toBe('hello-world');
    expect(script().getAttribute('data-strict')).toBe('1');
  });

  // giscus shows an error instead of comments when either id is missing.
  it('names the repo and the category by their GitHub ids', () => {
    expect(script().getAttribute('data-repo-id')).toMatch(/^R_/);
    expect(script().getAttribute('data-category-id')).toMatch(/^DIC_/);
  });

  it('titles the section and says who can read and who can comment', () => {
    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('section.comments')!;
    expect(section.getAttribute('aria-labelledby')).toBe('comments-title');
    expect(el.querySelector('#comments-title')?.textContent?.trim()).toBe('Comments and reactions');
    expect(el.querySelector('.comments__note')?.textContent).toContain('Reading needs no account');
  });

  it('swaps the thread when the pager moves to another post', () => {
    fixture.componentRef.setInput('term', 'another-post');
    fixture.detectChanges();
    expect(inserted).toHaveBeenCalledTimes(2);
    expect(script().getAttribute('data-term')).toBe('another-post');
  });
});
