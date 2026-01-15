import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedProjectsSection } from './featured-projects-section';

describe('FeaturedProjectsSection', () => {
  let component: FeaturedProjectsSection;
  let fixture: ComponentFixture<FeaturedProjectsSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedProjectsSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedProjectsSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
