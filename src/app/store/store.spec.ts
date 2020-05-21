import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Store } from './store';
import { ApiService, ApiServiceMock } from '../api.service';
import { WebsocketsService } from '../websockets.service';
import { TestScheduler } from 'rxjs/testing';
import * as Rx from 'rxjs';

const testScheduler = new TestScheduler((actual: string, expected: string) => {
  expect(actual).toEqual(expected);
});

// it has to wait for better days
xdescribe('Store', () => {
  beforeEach(async(() => {
    const badgerWSMock = jasmine.createSpyObj('WebsocketsService', ['events']);
    badgerWSMock.events = new Rx.Observable();
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {
          provide: ApiService,
          useValue: ApiServiceMock,
        },
        {
          provide: WebsocketsService,
          useValue: badgerWSMock,
        },
        Store,
      ],
    }).compileComponents();
  }));

  xit('should work', () => {
    const store: Store = TestBed.get(Store);
    testScheduler.run(helpers => {
      const { expectObservable } = helpers;
      const obs = store.collection('users');
      // const action = store.fetch('users', {});
      const expected = 'e';
      expectObservable(obs).toBe(expected);
    });
  });
});
