import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';
import { AppTitle } from '../../../../core/shared/app-title/app-title';

@Component({
  selector: 'tech-stack-section',
  imports: [TerminalSection, AppTitle],
  templateUrl: './tech-stack-section.html',
  styleUrl: './tech-stack-section.scss',
})
export class TechStackSection {}
