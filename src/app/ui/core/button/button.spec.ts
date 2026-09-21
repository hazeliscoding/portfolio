import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Button } from './button';

@Component({
  standalone: true,
  imports: [Button],
  template: `<app-button variant="primary" index="01">EXECUTE</app-button>`,
})
class Host {}

describe('Button', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('renders a real button element', () => {
    expect((fixture.nativeElement as HTMLElement).querySelector('button')).toBeTruthy();
  });

  it('projects its label and renders the index', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('EXECUTE');
    expect(el.querySelector('.button__index')?.textContent?.trim()).toBe('01');
  });

  it('meets the minimum target height', () => {
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      'button',
    ) as HTMLElement;
    expect(getComputedStyle(btn).minHeight).toBe('44px');
  });
});
