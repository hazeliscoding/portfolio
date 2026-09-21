import { TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { MotionService } from './motion.service';

describe('MotionService', () => {
  let events: Subject<any>;
  let service: MotionService;

  beforeEach(() => {
    events = new Subject<any>();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: Router, useValue: { events: events.asObservable() } },
      ],
    });
    service = TestBed.inject(MotionService);
  });

  it('starts at a, so prerendered output is deterministic', () => {
    expect(service.sfx()).toBe('a');
  });

  it('flips on NavigationEnd', () => {
    events.next(new NavigationEnd(1, '/', '/'));
    expect(service.sfx()).toBe('b');
  });

  it('alternates rather than latching', () => {
    events.next(new NavigationEnd(1, '/', '/'));
    events.next(new NavigationEnd(2, '/about', '/about'));
    expect(service.sfx()).toBe('a');
    events.next(new NavigationEnd(3, '/blog', '/blog'));
    expect(service.sfx()).toBe('b');
  });

  it('ignores router events that are not NavigationEnd', () => {
    // Flip off the initial value first. Asserting 'a' straight from construction
    // would pass even if the instanceof guard — or the whole subscription — were
    // deleted, because 'a' is also the untouched starting state.
    events.next(new NavigationEnd(1, '/', '/'));
    expect(service.sfx()).toBe('b');
    events.next({ id: 9, url: '/x' });
    expect(service.sfx()).toBe('b');
  });
});
