import { TestBed, async, inject } from '@angular/core/testing';

import { LoggedOutGuard } from './logged-out.guard';

describe('LoggedoutGuard', () => {
  beforeEach(() => {
    const spy = jasmine.createSpyObj('LoggedOutGuard', ['isLoggedIn']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: LoggedOutGuard,
          useValue: spy,
        },
      ],
    });
  });

  it('should ...', inject([LoggedOutGuard], (guard: LoggedOutGuard) => {
    expect(guard).toBeTruthy();
  }));
});
