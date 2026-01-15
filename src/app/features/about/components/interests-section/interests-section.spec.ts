import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterestsSection } from './interests-section';

describe('InterestsSection', () => {
  let component: InterestsSection;
  let fixture: ComponentFixture<InterestsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterestsSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterestsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
