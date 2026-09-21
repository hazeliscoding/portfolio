import {
  Component,
  ElementRef,
  HostListener,
  afterNextRender,
  input,
  output,
  viewChild,
} from '@angular/core';
import { blogPosts } from '../../data/blog-posts.generated';
import { projectsData } from '../../data/projects.data';

interface BootLine {
  prefix: string;
  text: string;
  /** Colour of the status prefix column. */
  tone: 'active' | 'faint' | 'success';
  /** Statements read primary; detail reads secondary. */
  emphasis: 'primary' | 'secondary';
  /** Milliseconds after mount at which this line appears. */
  delay: number;
}

function count(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

// The delay ladder is not uniform. It is fast at the head, slows through the
// middle, then lands — the rhythm is what makes it read as a machine working
// rather than a list animating. Taken from the mockup verbatim.
const BOOT_LINES: BootLine[] = [
  {
    prefix: '>',
    text: 'HAZEL.EXE // BOOT SEQUENCE 4.02',
    tone: 'active',
    emphasis: 'primary',
    delay: 0,
  },
  {
    prefix: '..',
    text: 'LOADING MODULES : HOME ABOUT PROJECTS BLOG',
    tone: 'faint',
    emphasis: 'secondary',
    delay: 350,
  },
  {
    prefix: 'OK',
    text: 'CONNECTION ESTABLISHED — NODE TX-01',
    tone: 'success',
    emphasis: 'secondary',
    delay: 750,
  },
  {
    prefix: 'OK',
    text: `${count(projectsData.length, 'RECORD', 'RECORDS')} · ${count(
      blogPosts.length,
      'LOG ENTRY',
      'LOG ENTRIES',
    )} RETRIEVED`,
    tone: 'success',
    emphasis: 'secondary',
    delay: 1150,
  },
  {
    prefix: '..',
    text: 'OPERATOR : HAZEL GRANADOS · STATUS : OPEN TO WORK',
    tone: 'faint',
    emphasis: 'secondary',
    delay: 1600,
  },
  {
    prefix: '>',
    text: 'ENTERING SYSTEM',
    tone: 'active',
    emphasis: 'primary',
    delay: 2100,
  },
];

@Component({
  selector: 'app-boot',
  standalone: true,
  imports: [],
  templateUrl: './boot.html',
  styleUrl: './boot.scss',
})
export class Boot {
  /** Supplied by the shell, which already ticks once a second. */
  clock = input.required<string>();
  dismissed = output<void>();

  lines = BOOT_LINES;

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  constructor() {
    // Take focus so a keyboard or screen-reader user is not left interacting
    // with content the overlay covers. afterNextRender never runs on the
    // server, which is the guarantee we want — this component is browser-only.
    afterNextRender(() => this.root().nativeElement.focus());
  }

  @HostListener('click')
  onClick(): void {
    this.dismissed.emit();
  }

  // Bound to the document, not the host: the footer promises ANY key, and that
  // has to hold whether or not focus happens to be inside the overlay.
  @HostListener('document:keydown')
  onKeydown(): void {
    this.dismissed.emit();
  }
}
