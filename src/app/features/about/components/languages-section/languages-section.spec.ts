import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LanguagesSection } from './languages-section';

describe('LanguagesSection', () => {
  let component: LanguagesSection;
  let fixture: ComponentFixture<LanguagesSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LanguagesSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LanguagesSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
