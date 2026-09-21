import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KeyValue } from './key-value';

describe('KeyValue', () => {
  let fixture: ComponentFixture<KeyValue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [KeyValue] }).compileComponents();
    fixture = TestBed.createComponent(KeyValue);
    fixture.componentRef.setInput('items', [
      { key: 'STATUS', value: 'ACTIVE' },
      { key: 'YEAR', value: '2026' },
    ]);
    fixture.detectChanges();
  });

  it('renders a definition list', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('dl')).toBeTruthy();
    expect(el.querySelectorAll('dt').length).toBe(2);
    expect(el.querySelectorAll('dd').length).toBe(2);
  });

  it('pairs keys with values', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('dt')[0].textContent?.trim()).toBe('STATUS');
    expect(el.querySelectorAll('dd')[0].textContent?.trim()).toBe('ACTIVE');
  });
});
