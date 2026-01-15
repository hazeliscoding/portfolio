import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';

@Component({
  selector: 'education-section',
  imports: [TerminalSection],
  templateUrl: './education-section.html',
  styleUrl: './education-section.scss',
})
export class EducationSection {
  degrees = [
    {
      title: 'Computer Science',
      type: 'B.S. Degree',
      data: 'Texas A&M University–Victoria',
    },
  ];
}
