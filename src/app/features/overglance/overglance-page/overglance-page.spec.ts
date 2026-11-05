import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { OverglancePage } from './overglance-page';
import {
  OVERGLANCE_CHECKOUT_URL,
  OVERGLANCE_DOWNLOAD_URL,
  OVERGLANCE_SECTIONS,
} from '../../../data/overglance.data';
import { overglanceDocs } from '../../../data/overglance-docs.generated';

describe('OverglancePage', () => {
  let fixture: ComponentFixture<OverglancePage>;
  let el: HTMLElement;

  const text = (node: Element | null) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim();
  const all = (selector: string) => [...el.querySelectorAll(selector)];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OverglancePage],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(OverglancePage);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('opens on the lockup as its one heading, the pitch and the price', () => {
    const headings = all('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].querySelector('img')?.getAttribute('alt')).toBe('Overglance');
    expect(text(el.querySelector('.hero__pitch'))).toBe('Your day and your agents, at a glance.');
    expect(text(el.querySelector('.hero__fine'))).toBe('Free for 7 days, then $9.99 once for 3 PCs');
  });

  it('downloads from the public releases repo, in a new tab', () => {
    const download = el.querySelector<HTMLAnchorElement>('.hero__cta')!;
    expect(download.getAttribute('href')).toBe(OVERGLANCE_DOWNLOAD_URL);
    expect(download.getAttribute('href')).toContain('overglance-releases/releases/latest');
    expect(download.getAttribute('target')).toBe('_blank');
    expect(download.textContent).toContain('(opens in a new tab)');
  });

  // The checkout link waits on Polar; a Buy button with nowhere to go would be worse than none.
  it('shows a Buy button exactly when the checkout link is set', () => {
    expect(el.querySelector('.hero__cta--buy') !== null).toBe(OVERGLANCE_CHECKOUT_URL !== '');
  });

  it('offers the one-line PowerShell install beside the download', () => {
    expect(el.querySelector('app-install-box')?.textContent).toContain(
      'irm https://www.hazeliscoding.dev/overglance/install.ps1 | iex',
    );
  });

  it('plays the launch video with the still as its poster, and never by itself', () => {
    const video = el.querySelector('video.hero__video')!;
    expect(video.getAttribute('src')).toBe('overglance/launch.mp4');
    expect(video.getAttribute('poster')).toBe('overglance/midnight-home.webp');
    expect(video.hasAttribute('autoplay')).toBeFalse();
    expect(el.querySelector('.hero__shot')).toBeNull();
  });

  it('gives each thing it shows a section with a heading and, where there is one, a sized screenshot', () => {
    const sections = all('section.feature');
    expect(sections.map((s) => s.id)).toEqual(OVERGLANCE_SECTIONS.map((s) => s.id));
    for (const [i, s] of OVERGLANCE_SECTIONS.entries()) {
      expect(text(sections[i].querySelector('h2'))).toBe(s.heading);
      const img = sections[i].querySelector('img');
      expect(img === null).withContext(s.id).toBe(!s.image);
      if (s.image) {
        expect(img?.getAttribute('width')).toBe(String(s.image.width));
        expect(img?.getAttribute('height')).toBe(String(s.image.height));
        expect(img?.getAttribute('alt')).toBe(s.image.alt);
      }
    }
  });

  it('ends on links to the five policy pages', () => {
    const links = all('.policies__link');
    expect(links.map(text)).toEqual(overglanceDocs.map((d) => d.title));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(
      overglanceDocs.map((d) => `/overglance/${d.slug}`),
    );
    expect(overglanceDocs.map((d) => d.slug)).toEqual(['privacy', 'terms', 'refunds', 'support', 'data']);
  });

  it('sets the document title and its own social card', () => {
    expect(TestBed.inject(Title).getTitle()).toBe('Overglance - Your day and your agents, at a glance.');
    expect(document.head.querySelector('meta[property="og:image"]')?.getAttribute('content')).toContain(
      '/images/og/overglance.png',
    );
  });

  it('contains no emoji in its copy', () => {
    const copy = el.cloneNode(true) as HTMLElement;
    copy.querySelectorAll('[aria-hidden="true"]').forEach((n) => n.remove());
    expect(/\p{Extended_Pictographic}/u.test(copy.textContent ?? '')).toBe(false);
  });
});
