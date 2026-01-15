import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TerminalSection } from './terminal-section';

describe('TerminalSection', () => {
  let component: TerminalSection;
  let fixture: ComponentFixture<TerminalSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TerminalSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TerminalSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
