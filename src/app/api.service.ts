import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import * as Rx from 'rxjs';
import { CookieService } from 'ngx-cookie-service';

interface Headers {
  [header: string]: string;
}

interface ApiServiceInterface {
  get<T>(
    url: string,
    queryParams?: Partial<T>,
    authenticated?: boolean,
  ): Rx.Observable<ReadonlyArray<T>>;

  post<T>(url: string, body: T, authenticated: boolean): Rx.Observable<T>;

  put<T>(url: string, body: T, authenticated: boolean): Rx.Observable<T>;

  delete<T>(url: string, authenticated: boolean): Rx.Observable<T>;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService implements ApiServiceInterface {
  constructor(private httpClient: HttpClient, private cookie: CookieService) {}

  get<T>(url: string, queryParams?: Partial<T|{[P in keyof T]: ReadonlyArray<T[P]>}>, authenticated: boolean = true) {
    const headers = this.getHeaders(authenticated);
    const fullUrl = this.getFullUrl(url);

    let params = new HttpParams();
    if(queryParams !== undefined) {
      Object.entries(queryParams).forEach(
        ([key, value]) => {
          if (value instanceof Array) {
            value.forEach(v => {
              params = params.append(`${key}[]`, v.toString());
            });
          } else if (value !== undefined) {
            params = params.append(key, value.toString());
          }
        }
      );
    }
    return this.httpClient.get<ReadonlyArray<T>>(fullUrl, { params, headers });
  }

  post<T>(url: string, body: T, authenticated: boolean = true) {
    const headers = this.getHeaders(authenticated);
    const fullUrl = this.getFullUrl(url);
    return this.httpClient.post<T>(fullUrl, body, { headers });
  }

  put<T>(url: string, body: T, authenticated: boolean = true) {
    const headers = this.getHeaders(authenticated);
    const fullUrl = this.getFullUrl(url);
    return this.httpClient.put<T>(fullUrl, body, { headers });
  }

  delete<T>(url: string, authenticated: boolean = true) {
    const headers = this.getHeaders(authenticated);
    const fullUrl = this.getFullUrl(url);
    return this.httpClient.delete<T>(fullUrl, { headers });
  }

  private getAuthHeader(): Headers {
    return {
      // this should be using the auth service, but we need to break the circular dependency
      Authorization: `Token ${this.cookie.get(environment.authCookie)}`,
    };
  }

  private getHeaders(authenticated: boolean = true): Headers {
    const headers = { 'Content-Type': 'application/json' };
    if (authenticated) {
      return { ...headers, ...this.getAuthHeader() };
    }
    return headers;
  }

  private getFullUrl(url: string) {
    return `${environment.apiURL}/${url}`;
  }
}

export class ApiServiceMock implements ApiServiceInterface {
  constructor(private httpClient: HttpClient, private cookie: CookieService) {}

  get<T>(url: string, queryParams?: Partial<T>, authenticated: boolean = true) {
    return new Rx.BehaviorSubject([]).asObservable();
  }

  post<T>(url: string, body: T, authenticated: boolean = true) {
    return new Rx.BehaviorSubject({} as T).asObservable();
  }

  put<T>(url: string, body: T, authenticated: boolean = true) {
    return new Rx.BehaviorSubject({} as T).asObservable();
  }

  delete<T>(url: string, authenticated: boolean = true) {
    return new Rx.BehaviorSubject({} as T).asObservable();
  }
}
