import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppButton } from '../../../../core/shared/app-button/app-button';

@Component({
  selector: 'presentation-section',
  imports: [TerminalSection, AppButton],
  templateUrl: './presentation-section.html',
  styleUrl: './presentation-section.scss',
})
export class PresentationSection { }
