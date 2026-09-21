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

  it('names the address that actually faulted', () => {
    // Not the design demo's fixed /portfolio/unknown-record — printing that
    // would tell every visitor the wrong URL failed.
    const values = Array.from(el.querySelectorAll('.key-value__value')).map(
      (d) => d.textContent?.trim(),
    );
    expect(values).toContain('/portfolio/not-a-record');
    expect(values).toContain('404 NOT_FOUND');
  });

  it('tints the path as the reading that carries the verdict', () => {
    const path = el.querySelector('.key-value__value') as HTMLElement;
    expect(path.getAttribute('data-state')).toBe('danger');
  });

  it('renders the alert window with its logged footer', () => {
    const win = el.querySelector('.window') as HTMLElement;
    expect(win.getAttribute('data-variant')).toBe('alert');
    expect(win.getAttribute('data-active')).toBe('true');
    expect(el.querySelector('.window__foot')?.textContent).toContain(
      'THIS EVENT HAS BEEN LOGGED',
    );
  });

  it('returns one level up, not always home', () => {
    fixture.componentRef.setInput('backLabel', 'ARCHIVE_03');
    fixture.componentRef.setInput('backRoute', '/portfolio');
    fixture.detectChanges();
    const back = el.querySelector('.chapter__back') as HTMLAnchorElement;
    expect(back.textContent?.trim()).toBe('< ARCHIVE_03');
    expect(back.getAttribute('href')).toBe('/portfolio');
  });

  it('does not double-bracket the command control', () => {
    // The `command` Button variant draws its own [ ] in CSS.
    const labels = Array.from(el.querySelectorAll('.button__label')).map((s) =>
      s.textContent?.trim(),
    );
    expect(labels).toContain('Open archive');
    expect(labels.some((l) => l?.startsWith('['))).toBe(false);
  });

  it('offers its recovery routes as real links', () => {
    // Navigation, so anchors — not scripted buttons. On the one page a visitor
    // reaches by following something broken, the way out should be the thing a
    // browser already knows how to open.
    const links = Array.from(el.querySelectorAll<HTMLAnchorElement>('a.button'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/', '/portfolio']);
  });
});
