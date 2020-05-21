import { BaseEntity, Collection, CollectionState, ID } from '../interfaces';
import * as Rx from 'rxjs';

export interface Example extends BaseEntity {
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly user: ID;
  readonly public_title: string;
  readonly public_description: string;
}

export const examplesCollection: Collection<Example> = {
  endpoint: '/',
  authenticatedOnly: true,
  state: new Rx.BehaviorSubject<CollectionState<Example>>({}),
};
