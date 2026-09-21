import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Readout } from './readout';

describe('Readout', () => {
  let fixture: ComponentFixture<Readout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Readout] }).compileComponents();
    fixture = TestBed.createComponent(Readout);
    fixture.componentRef.setInput('label', 'NET');
    fixture.componentRef.setInput('value', 'ONLINE');
    fixture.detectChanges();
  });

  it('renders label and value', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.readout__label')?.textContent?.trim()).toBe('NET');
    expect(el.querySelector('.readout__value')?.textContent?.trim()).toBe('ONLINE');
  });

  it('defaults to the neutral state', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.readout')?.getAttribute('data-state')).toBe('neutral');
  });

  it('reflects an explicit state', () => {
    fixture.componentRef.setInput('state', 'ok');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.readout')?.getAttribute('data-state')).toBe('ok');
  });
});
