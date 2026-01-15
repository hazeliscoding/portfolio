import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalLine } from './terminal-line';

describe('TerminalLine', () => {
  let component: TerminalLine;
  let fixture: ComponentFixture<TerminalLine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminalLine]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerminalLine);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
