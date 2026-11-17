import { CalculationsService, createServerEstimator } from '@postproject/core';
import { LocalStorageAdapter } from './storage/localStorageAdapter';
import { GRAPHQL_URL } from './config';

export const calculationsService = new CalculationsService(new LocalStorageAdapter(), {
  estimate: createServerEstimator({ url: GRAPHQL_URL }),
});
