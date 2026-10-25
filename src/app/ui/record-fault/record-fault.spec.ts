import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { RecordFault } from './record-fault';

@Component({ selector: 'app-stub', template: '', standalone: true })
class Stub {}

describe('RecordFault', () => {
  let fixture: ComponentFixture<RecordFault>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecordFault],
      providers: [provideRouter([{ path: '**', component: Stub }])],
    }).compileComponents();
    await TestBed.inject(Router).navigateByUrl('/portfolio/not-a-record');
    fixture = TestBed.createComponent(RecordFault);
    fixture.detectChanges();
    el = fixture.nativeElement as HTMLElement;
  });

  it('names the address that actually missed', () => {
    const values = Array.from(el.querySelectorAll('.key-value__value')).map((d) =>
      d.textContent?.trim(),
    );
    expect(values).toContain('/portfolio/not-a-record');
    expect(values).toContain('404 Not found');
  });

  it('tints the address as the reading that explains the miss', () => {
    const path = el.querySelector('.key-value__value') as HTMLElement;
    expect(path.getAttribute('data-state')).toBe('danger');
  });

  it('is the page heading, in sentence case', () => {
    const h1s = el.querySelectorAll('h1');
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent?.trim()).toBe('This page wandered off.');
  });

  it('goes home by default, and offers the projects as the other way out', () => {
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('a.button'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', '/portfolio']);
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Go home', 'See my projects']);
    expect(el.querySelector('.fault__back')?.textContent?.trim()).toBe('← Home');
  });

  it('returns one level up, not always home', () => {
    fixture.componentRef.setInput('backLabel', 'All projects');
    fixture.componentRef.setInput('backRoute', '/portfolio');
    fixture.detectChanges();
    const back = el.querySelector('.fault__back') as HTMLAnchorElement;
    expect(back.textContent?.trim()).toBe('← All projects');
    expect(back.getAttribute('href')).toBe('/portfolio');

    // Real links, not scripted buttons: back first, then home.
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('a.button'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/portfolio', '/']);
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Back to all projects', 'Go home']);
  });

  it('keeps terminal vocabulary out of the copy', () => {
    const text = el.textContent ?? '';
    expect(text).not.toMatch(/NOT_FOUND|LOGGED|ARCHIVE_|\[/);
  });
});
