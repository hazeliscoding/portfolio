import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';

@Component({
  selector: 'contact-section',
  imports: [TerminalSection],
  templateUrl: './contact-section.html',
  styleUrl: './contact-section.scss',
})
export class ContactSection {
  formatEmail = (email: any) => {
    if (email.includes('@')) {
      return email
        .replace(/@/g, '@<wbr>')
        .replace(/_/g, '_<wbr>')
        .replace(/\./g, '<wbr>.')
        .replace(/granados/g, 'granados<wbr>')
        .replace(/hazel/g, 'hazel<wbr>');
    }

    return email;
  };
}
