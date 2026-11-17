import AsyncStorage from '@react-native-async-storage/async-storage';
import { CalculationsService, createServerEstimator } from '@postproject/core';
import { AsyncStorageAdapter } from './storage/asyncStorageAdapter';
import { GRAPHQL_URL } from './config';

export const calculationsService = new CalculationsService(new AsyncStorageAdapter(AsyncStorage), {
  estimate: createServerEstimator({ url: GRAPHQL_URL }),
});
