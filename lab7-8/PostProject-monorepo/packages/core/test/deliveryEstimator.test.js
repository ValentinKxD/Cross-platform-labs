import test from 'node:test';
import assert from 'node:assert/strict';
import { CALCULATE_DELIVERY_QUERY, GraphQLRequestError, createServerEstimator } from '@postproject/core';

const params = { weightKg: 2.5, distanceKm: 540, deliveryType: 'standard' };

test('estimator надсилає GraphQL-запит calculateDelivery і повертає вартість', async () => {
  let request;
  const estimate = createServerEstimator({
    url: 'http://api.test/',
    fetch: async (url, options) => {
      request = { url, ...options, body: JSON.parse(options.body) };
      return { json: async () => ({ data: { calculateDelivery: { cost: 1168, days: 2 } } }) };
    },
  });

  assert.deepEqual(await estimate(params), { cost: 1168, days: 2 });
  assert.equal(request.url, 'http://api.test/');
  assert.equal(request.method, 'POST');
  assert.equal(request.body.query, CALCULATE_DELIVERY_QUERY);
  assert.deepEqual(request.body.variables, params);
});

test('estimator повертає null, якщо сервер недоступний або не відповідає вчасно', async () => {
  const unreachable = createServerEstimator({ url: 'x', fetch: async () => { throw new TypeError('Failed to fetch'); } });
  assert.equal(await unreachable(params), null);

  const slow = createServerEstimator({
    url: 'x',
    timeoutMs: 10,
    fetch: (_url, { signal }) =>
      new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))),
  });
  assert.equal(await slow(params), null);
});

test('estimator викидає GraphQLRequestError для помилок валідації сервера', async () => {
  const estimate = createServerEstimator({
    url: 'x',
    fetch: async () => ({ json: async () => ({ errors: [{ message: 'Помилка валідації даних розрахунку' }] }) }),
  });
  await assert.rejects(estimate(params), GraphQLRequestError);
});
