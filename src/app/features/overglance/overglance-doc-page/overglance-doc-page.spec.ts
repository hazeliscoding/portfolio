import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { of } from 'rxjs';
import { OverglanceDocPage } from './overglance-doc-page';
import { overglanceDocs } from '../../../data/overglance-docs.generated';

async function renderDoc(slug: string): Promise<ComponentFixture<OverglanceDocPage>> {
  await TestBed.configureTestingModule({
    imports: [OverglanceDocPage],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { paramMap: of(new Map([['doc', slug]])) } },
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(OverglanceDocPage);
  fixture.detectChanges();
  return fixture;
}

describe('OverglanceDocPage', () => {
  it('renders each policy from its Markdown, titled by its first heading', async () => {
    for (const doc of overglanceDocs) {
      TestBed.resetTestingModule();
      const el = (await renderDoc(doc.slug)).nativeElement as HTMLElement;
      expect(el.querySelector('h1')?.textContent).withContext(doc.slug).toBe(doc.title);
      expect(el.querySelector('.prose h2')).withContext(doc.slug).not.toBeNull();
      expect(TestBed.inject(Title).getTitle()).toBe(`${doc.title} - Overglance`);
      expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toContain(
        `/overglance/${doc.slug}`,
      );
    }
  });

  // The links between the policies were rewritten from the repo's PRIVACY.md
  // and friends to these routes; a leftover .md link would 404 here.
  it('links the policies to each other by route, never by .md file', () => {
    for (const doc of overglanceDocs) {
      expect(doc.markdown).withContext(doc.slug).not.toMatch(/\]\([A-Z]+\.md/);
    }
    const terms = overglanceDocs.find((d) => d.slug === 'terms')!;
    expect(terms.markdown).toContain('](/overglance/privacy)');
  });

  it('keeps the two blanks the owner fills before launch', () => {
    const support = overglanceDocs.find((d) => d.slug === 'support')!;
    expect(support.markdown).toContain('[An email address goes here before launch.]');
  });

  it('marks the page being read in the policy links', async () => {
    const el = (await renderDoc('refunds')).nativeElement as HTMLElement;
    const current = el.querySelector('.doc__link[aria-current="page"]');
    expect(current?.getAttribute('href')).toBe('/overglance/refunds');
    expect(el.querySelectorAll('.doc__link').length).toBe(overglanceDocs.length);
  });

  it('answers an unknown slug with the record fault and noindex', async () => {
    const el = (await renderDoc('nope')).nativeElement as HTMLElement;
    expect(el.querySelector('app-record-fault')).not.toBeNull();
    expect(el.querySelector('h1.doc__title')).toBeNull();
    expect(document.head.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex');
  });
});
