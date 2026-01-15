import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationSection } from './presentation-section';

describe('PresentationSection', () => {
  let component: PresentationSection;
  let fixture: ComponentFixture<PresentationSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PresentationSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentationSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
