import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
// this guy is not really reactive
import { CookieService } from 'ngx-cookie-service';
import { take, map } from 'rxjs/operators';
import * as Rx from 'rxjs';
import { ApiService } from './api.service';

export interface AuthState {
  userId: string;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState$ = new Rx.ReplaySubject<AuthState | undefined>();

  constructor(private http: ApiService, private cookie: CookieService) {
    if (this.cookie.check(environment.authCookie)) {
      this.authState$.next({
        userId: this.getUserID(),
        token: this.getLoginToken(),
      });
    }
  }

  get authState() {
    return this.authState$.asObservable();
  }

  // this is not really reactive, but has to do for now
  login(username: string, password: string): Rx.Observable<boolean> {
    if (this.isLoggedIn()) {
      return Rx.of(true);
    }
    return this.http
      .post(
        'api-token-auth/',
        {
          username,
          password,
        },
        false,
      )
      .pipe(
        take(1),
        map((result: any) => {
          // umph
          if (result && result.token) {
            this.cookie.set(environment.authCookie, result.token);
            this.cookie.set(environment.authId, result.user_id);
            this.authState$.next({
              userId: result.authId,
              token: result.token,
            });
            return true;
          } else {
            // if sign up failed then user probably has invalid cookies
            this.cookie.deleteAll();
          }
        }),
      );
  }

  signup(
    username: string,
    password: string,
    email: string,
  ): Rx.Observable<boolean> {
    if (this.isLoggedIn()) {
      return Rx.of(false);
    }
    return this.http
      .post(
        'users/',
        {
          username,
          password,
          email,
        },
        false,
      )
      .pipe(
        take(1),
        map((result: any) => {
          return result !== {};
        }),
      );
  }

  isLoggedIn(): boolean {
    return (
      this.cookie.check(environment.authCookie) &&
      this.cookie.check(environment.authId)
    );
  }

  getLoginToken(): string {
    return this.cookie.get(environment.authCookie);
  }

  getUserID(): string {
    return this.cookie.get(environment.authId);
  }

  logout() {
    if (this.isLoggedIn) {
      return this.cookie.deleteAll();
    }
  }
}
