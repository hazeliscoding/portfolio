import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'languages-section',
  imports: [TerminalSection, AppTitle],
  templateUrl: './languages-section.html',
  styleUrl: './languages-section.scss',
})
export class LanguagesSection {
  languages = ['English — Native'];
}
