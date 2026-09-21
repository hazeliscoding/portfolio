import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SystemBar } from './system-bar';

@Component({
  standalone: true,
  imports: [SystemBar],
  template: `
    <app-system-bar position="bottom">
      <span barLeft>LEFT</span>
      <span barRight>RIGHT</span>
    </app-system-bar>
  `,
})
class Host {}

describe('SystemBar', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Host] }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('projects left and right slots', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.system-bar__left')?.textContent).toContain('LEFT');
    expect(el.querySelector('.system-bar__right')?.textContent).toContain('RIGHT');
  });

  it('reflects its position', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.system-bar')?.getAttribute('data-position')).toBe('bottom');
  });

  it('announces itself as a status region', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="status"]')).toBeTruthy();
  });
});
