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

  it('holds through the initial navigation, so hydration restarts nothing', () => {
    events.next(new NavigationEnd(1, '/portfolio', '/portfolio'));
    expect(service.sfx()).toBe('a');
  });

  it('flips on the first navigation after landing', () => {
    events.next(new NavigationEnd(1, '/', '/'));
    events.next(new NavigationEnd(2, '/about', '/about'));
    expect(service.sfx()).toBe('b');
  });

  it('alternates rather than latching', () => {
    events.next(new NavigationEnd(1, '/', '/'));
    events.next(new NavigationEnd(2, '/about', '/about'));
    events.next(new NavigationEnd(3, '/blog', '/blog'));
    expect(service.sfx()).toBe('a');
    events.next(new NavigationEnd(4, '/', '/'));
    expect(service.sfx()).toBe('b');
  });

  it('ignores router events that are not NavigationEnd', () => {
    // An earlier event must not be taken for the initial navigation, or the
    // real one would flip the attribute during hydration after all.
    events.next({ id: 1, url: '/x' });
    events.next(new NavigationEnd(1, '/', '/'));
    expect(service.sfx()).toBe('a');
    // Flip off the initial value first. Asserting 'a' here alone would pass
    // even if the instanceof guard — or the whole subscription — were deleted,
    // because 'a' is also the untouched starting state.
    events.next(new NavigationEnd(2, '/about', '/about'));
    expect(service.sfx()).toBe('b');
    events.next({ id: 9, url: '/x' });
    expect(service.sfx()).toBe('b');
  });
});
