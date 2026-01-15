import { Component } from '@angular/core';
import { TerminalSection } from '../../../../core/layout/terminal-section/terminal-section';

@Component({
  selector: 'download-section',
  imports: [TerminalSection],
  templateUrl: './download-section.html',
  styleUrl: './download-section.scss',
})
export class DownloadSection {
  downloadResume(format: 'docx' | 'pdf') {
    const sourceFileName = `resume-en.${format}`;
    const downloadedFileName = `resume-en.${format}`;
    const filePath = `resume/${sourceFileName}`;

    const link = document.createElement('a');
    link.href = filePath;
    link.download = downloadedFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
