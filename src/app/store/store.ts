import {
  Collection as _C,
  BaseEntity,
  CollectionState,
  ID,
} from './interfaces';
import { ApiService } from '../api.service';
import { WebsocketsService } from '../websockets.service';
import { take, map, filter } from 'rxjs/operators';
import * as Rx from 'rxjs';
import { Injectable, OnDestroy } from '@angular/core';
import { examplesCollection } from './example';

export const collectionSlugs = ['examples'] as const;

type CSlug = typeof collectionSlugs[number];

export const collections: Record<CSlug, _C<BaseEntity>> = {
  examples: examplesCollection,
} as const;

@Injectable({
  providedIn: 'root',
})
export class Store implements OnDestroy {
  private wsSub: Rx.Subscription;
  private collections = collections;

  constructor(private http: ApiService, private ws: WebsocketsService) {
    this.wsSub = this.initiateWebsocket(ws);
  }

  collection<T extends BaseEntity>(
    collection: CSlug,
    filters: Partial<T | { [P in keyof T]: ReadonlyArray<T[P]> }> = {},
  ): Rx.Observable<ReadonlyArray<T>> {
    const c = this.collections[collection];
    return c.state.asObservable().pipe(
      map((s: CollectionState<T>) => [...Object.values(s)]),
      map((s) =>
        s.filter((o) => {
          const filterKeys = Object.keys(filters);
          if (filterKeys.length === 0) {
            return true;
          }
          return filterKeys.every((key) => {
            if (filters[key] instanceof Array) {
              return filters[key].includes(o[key]);
            }
            return o[key] === filters[key];
          });
        }),
      ),
    );
  }

  document<T extends BaseEntity>(collection: CSlug, id: ID): Rx.Observable<T> {
    const c = this.collections[collection];
    return c.state.asObservable().pipe(
      map((s: CollectionState<T>) => s[id]),
      filter((o) => !!o),
    );
  }

  fetch<T extends BaseEntity>(
    collection: CSlug,
    params: Partial<T | { [P in keyof T]: ReadonlyArray<T[P]> }> = {},
  ): Promise<ReadonlyArray<T>> {
    const c = this.collections[collection];
    const e = c.endpoint; // ?id=123  200 []
    return this.http
      .get<T>(e, params)
      .pipe(take(1))
      .toPromise()
      .then((o) => {
        const resp = o.reduce((prev, cur) => ({ ...prev, [cur.id]: cur }), {});
        c.state.next({ ...c.state.value, ...resp });
        return o;
      });
  }

  fetchById<T extends BaseEntity>(collection: CSlug, id: ID): Promise<T> {
    const c = this.collections[collection];
    const e = `${c.endpoint}/${id}`; // 404
    return this.http
      .get<T>(e)
      .pipe(
        map((a) => (a instanceof Array ? a[0] : a)), // hehe
        take(1),
      )
      .toPromise()
      .then((o) => {
        c.state.next(this.addToState(c.state.value as CollectionState<T>, o));
        return o;
      });
  }

  create<T extends BaseEntity>(
    collection: CSlug,
    object: Partial<T>,
  ): Promise<T> {
    const c = this.collections[collection];
    const e = c.endpoint;
    return this.http
      .post<T>(e, object as T) // TODO: replace with payload types
      .toPromise()
      .then((o) => {
        c.state.next(this.addToState(c.state.value as CollectionState<T>, o));
        return o;
      });
  }

  update<T extends BaseEntity>(
    collection: CSlug,
    object: Partial<T>,
  ): Promise<T> {
    const c = this.collections[collection];
    const e = c.endpoint;
    return this.http
      .put(e, object as T) // TODO: replace with payload types
      .toPromise()
      .then((o) => {
        c.state.next(this.addToState(c.state.value as CollectionState<T>, o));
        return o;
      });
  }

  remove<T extends BaseEntity>(collection: CSlug, object: T) {
    const c = this.collections[collection];
    const e = `${c.endpoint}/${object.id}`;
    this.http
      .delete<T>(e)
      .toPromise()
      .then((o) => {
        c.state.next(
          this.deleteFromState<T>(c.state.value as CollectionState<T>, object),
        );
        return o;
      });
  }

  private addToState<T extends BaseEntity>(
    state: CollectionState<T>,
    object: T,
  ): CollectionState<T> {
    return { ...state, [object.id]: object };
  }

  private deleteFromState<T extends BaseEntity>(
    state: CollectionState<T>,
    object: T,
  ): CollectionState<T> {
    return {
      ...Object.values(state)
        .filter((o) => o.id !== object.id) // hehe
        .reduce(
          (prev: CollectionState<T>, curr: T) => ({
            ...prev,
            [curr.id]: curr,
          }),
          {},
        ),
    };
  }

  private initiateWebsocket(ws: WebsocketsService) {
    return this.ws.events
      .pipe(
        map((event) => {
          const e = event.message;
          const collection = this.collections[e.resource];
          if (!collection) {
            return;
          }
          switch (e.action) {
            case 'add': {
              collection.state.next(
                this.addToState(collection.state.value, e.payload),
              );
              break;
            }
            case 'update': {
              collection.state.next(
                this.addToState(collection.state.value, e.payload),
              );
              break;
            }
            case 'delete': {
              collection.state.next(
                this.deleteFromState(collection.state.value, e.payload),
              );
            }
          }
        }),
      )
      .subscribe();
  }

  ngOnDestroy() {
    if (this.wsSub) {
      this.wsSub.unsubscribe();
    }
  }
}
