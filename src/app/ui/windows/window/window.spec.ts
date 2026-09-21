import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { Window } from './window';

@Component({
  standalone: true,
  imports: [Window],
  template: `
    <app-window index="03" title="Archive" context="RECORDS" variant="inspector" delay="120ms">
      <p class="body-probe">contents</p>
    </app-window>
  `,
})
class Host {}

describe('Window', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('renders the zero-padded index', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.window__index')?.textContent?.trim()).toBe('03');
  });

  it('renders the title uppercased', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.window__title')?.textContent?.trim()).toBe('Archive');
    const transform = getComputedStyle(
      el.querySelector('.window__title') as Element,
    ).textTransform;
    expect(transform).toBe('uppercase');
  });

  it('renders the context after a // separator', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.window__head')?.textContent).toContain('//');
    expect(el.querySelector('.window__context')?.textContent?.trim()).toBe('RECORDS');
  });

  it('projects body content', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.body-probe')?.textContent).toBe('contents');
  });

  it('exposes the title as an accessible label', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('section')?.getAttribute('aria-label')).toBe('Archive');
  });

  it('applies the variant as a data attribute', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('section')?.getAttribute('data-variant')).toBe('inspector');
  });

  it('exposes the motion sequence so its entrance can re-trigger', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('section')?.getAttribute('data-sfx')).toBe('a');
  });

  it('applies a stagger delay when given one', () => {
    // Host sets delay="120ms"
    const el = fixture.nativeElement as HTMLElement;
    const section = el.querySelector('section') as HTMLElement;
    expect(section.style.animationDelay).toBe('120ms');
  });
});
