import { TestBed } from '@angular/core/testing';

import { WebsocketsService } from './websockets.service';
import { AuthService } from './auth.service';

// skipping for now until we find a better way of instantiating websocket
xdescribe('WebsocketsService', () => {
  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: authSpy,
        },
      ],
    });
  });

  it('should be created', () => {
    const service: WebsocketsService = TestBed.get(WebsocketsService);
    expect(service).toBeTruthy();
  });
});
