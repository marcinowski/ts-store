import * as Rx from 'rxjs';

export type ID = string;

export interface BaseEntity {
  id: ID;
}

export interface CollectionState<T extends BaseEntity> {
  // this should be typed as `[key: ID]: T` but https://github.com/microsoft/TypeScript/issues/1778
  [key: string]: T;
}

export interface Collection<T extends BaseEntity> {
  endpoint: string;
  state: Rx.BehaviorSubject<CollectionState<T>>;
  authenticatedOnly: boolean;
}
