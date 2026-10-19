import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ProseHtml, fingerprint } from './prose-html';

@Component({
  imports: [ProseHtml],
  template: `<div [appProseHtml]="html()"></div>`,
})
class Host {
  // Notifies on every set, even of an equal string, so a test can re-run the
  // directive's effect against HTML it already wrote.
  readonly html = signal('<p>one</p>', { equal: () => false });
}

describe('ProseHtml', () => {
  it('writes the HTML and stamps its fingerprint', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(div.innerHTML).toBe('<p>one</p>');
    expect(div.getAttribute('data-html')).toBe(fingerprint('<p>one</p>'));
  });

  // The hydration case: nodes already carrying this HTML's fingerprint (as the
  // prerendered ones do) must survive, not be replaced by identical copies.
  it('leaves matching HTML in place instead of rewriting it', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div') as HTMLElement;
    const prerendered = document.createElement('p');
    prerendered.textContent = 'one';
    div.replaceChildren(prerendered);

    fixture.componentInstance.html.set('<p>one</p>');
    fixture.detectChanges();
    expect(div.firstChild).toBe(prerendered);

    fixture.componentInstance.html.set('<p>two</p>');
    fixture.detectChanges();
    expect(div.innerHTML).toBe('<p>two</p>');
  });

  it('fingerprints different HTML differently, and the same HTML the same', () => {
    expect(fingerprint('<p>a</p>')).toBe(fingerprint('<p>a</p>'));
    expect(fingerprint('<p>a</p>')).not.toBe(fingerprint('<p>b</p>'));
  });
});
