import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  standalone: true,
  imports: [Button],
  template: `
    <app-button variant="primary" index="01">EXECUTE</app-button>
    <app-button variant="command">Open archive</app-button>
    <app-button size="sm">Small</app-button>
    <app-button variant="primary" href="/resume.pdf" download="resume.pdf"
      >Download</app-button
    >
  `,
})
class Host {}

describe('Button', () => {
  let fixture: ComponentFixture<Host>;
  let buttons: HTMLElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    // `.button`, not `button`: the component renders an <a> when it has a
    // destination, and both forms carry the same class.
    buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLElement>('.button'),
    );
  });

  it('renders one real control per usage', () => {
    expect(buttons.length).toBe(4);
    expect(buttons[0].tagName.toLowerCase()).toBe('button');
  });

  it('projects its label and renders the index', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('EXECUTE');
    expect(el.querySelector('.button__index')?.textContent?.trim()).toBe('01');
  });

  it('projects the label for every variant, not just the first', () => {
    // Guards the one-<ng-content> rule in button.html: a second slot in an
    // @if branch silently renders an empty button here.
    expect(buttons[1].textContent).toContain('Open archive');
  });

  it('brackets the command variant without spacing the brackets off the label', () => {
    const label = buttons[1].querySelector('.button__label') as HTMLElement;
    expect(getComputedStyle(label, '::before').content).toBe('"["');
    expect(getComputedStyle(label, '::after').content).toBe('"]"');
  });

  it('renders an anchor when given somewhere to go, styled the same', () => {
    // A control that navigates should be a link — middle-clickable, copyable,
    // announced as a link. The visual is what the design specifies, and it is
    // identical either way, so the class and the data-attributes must match a
    // <button> exactly.
    const link = buttons[3];
    expect(link.tagName.toLowerCase()).toBe('a');
    expect(link.getAttribute('href')).toBe('/resume.pdf');
    expect(link.getAttribute('download')).toBe('resume.pdf');
    expect(link.classList.contains('button')).toBe(true);
    expect(link.getAttribute('data-variant')).toBe('primary');
    expect(link.textContent).toContain('Download');
  });

  it('does not let the global link rules repaint the anchor form', () => {
    // `a { color: var(--text-link) }` in _base.scss would turn a primary
    // control cyan and underline it the moment it became an anchor.
    const link = buttons[3];
    expect(getComputedStyle(link).textDecorationLine).toBe('none');
    expect(getComputedStyle(link).color).toBe(getComputedStyle(buttons[0]).color);
  });

  it('uses KAIRO\'s size ladder', () => {
    // 36 for md and 28 for sm, per the design system. Both clear WCAG 2.2
    // SC 2.5.8's 24px AA floor; the 44px AAA figure applies to `lg`, which is
    // what the touch-first controls in the bottom bar use.
    expect(getComputedStyle(buttons[0]).minHeight).toBe('36px');
    expect(getComputedStyle(buttons[2]).minHeight).toBe('28px');
  });
});
