import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import * as Rx from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebsocketsService {
  private ws: WebSocket;
  private eventStream$: Rx.Observable<any>; // any for now, later typed from the store

  constructor(private auth: AuthService) {
    this.ws = new WebSocket(environment.websocketURL); // don't bake that in
    Rx.combineLatest(Rx.fromEvent(this.ws, 'open'), this.auth.authState)
      .pipe(
        map(([_, state]) =>
          this.ws.send(
            JSON.stringify({ user_id: state.userId, token: state.token }),
          ),
        ),
      )
      .subscribe(); // login
    this.eventStream$ = Rx.fromEvent(this.ws, 'message').pipe(
      map((event: MessageEvent) => JSON.parse(event.data)),
    ); // create a constant stream of data
  }

  get events() {
    return this.eventStream$;
  }
}
