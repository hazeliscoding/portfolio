import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechStackSection } from './tech-stack-section';

describe('TechStackSection', () => {
  let component: TechStackSection;
  let fixture: ComponentFixture<TechStackSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechStackSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechStackSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
