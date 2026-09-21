import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Badge } from './badge';

@Component({
  standalone: true,
  imports: [Badge],
  template: `<app-badge tone="active">ACTIVE</app-badge>`,
})
class Host {}

describe('Badge', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('projects its content', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('ACTIVE');
  });

  it('reflects its tone', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.badge')?.getAttribute('data-tone')).toBe('active');
  });
});
