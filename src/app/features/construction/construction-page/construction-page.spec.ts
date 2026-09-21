import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructionPage } from './construction-page';

describe('ConstructionPage', () => {
  let component: ConstructionPage;
  let fixture: ComponentFixture<ConstructionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstructionPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ConstructionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should tell visitors the site is being reworked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.gn-panel__head')?.textContent).toContain(
      'under construction',
    );
    expect(compiled.querySelector('.construction__body')?.textContent).toContain(
      'being redesigned',
    );
  });

  it('should offer a way to reach Hazel', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const hrefs = Array.from(compiled.querySelectorAll('a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toContain('mailto:hazel.granados@protonmail.com');
    expect(hrefs).toContain('https://github.com/hazeliscoding');
  });
});
