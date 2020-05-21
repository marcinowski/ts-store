import { TestBed, async, inject } from '@angular/core/testing';

import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthGuard', ['isLoggedIn']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthGuard,
          useValue: authSpy,
        },
      ],
    });
  });

  it('should ...', inject([AuthGuard], (guard: AuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
