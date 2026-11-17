import test from 'node:test';
import assert from 'node:assert/strict';
import { GraphQLError } from 'graphql';
import { ERROR_DISTANCE_MIN, ERROR_WEIGHT_MIN, MIN_WEIGHT_KG } from '@postproject/core';
import { resolvers } from '../resolvers.js';

test('calculateDelivery відхиляє дані за правилами спільного ядра ще до звернення до бази', async () => {
  await assert.rejects(
    resolvers.Query.calculateDelivery(null, { weightKg: MIN_WEIGHT_KG / 2, distanceKm: 0, deliveryType: 'standard' }),
    (error) => {
      assert.ok(error instanceof GraphQLError);
      assert.equal(error.extensions.code, 'BAD_USER_INPUT');
      assert.deepEqual(error.extensions.errors, [ERROR_WEIGHT_MIN, ERROR_DISTANCE_MIN]);
      return true;
    },
  );
});

test('поля накладної, відділення й події формуються функціями ядра', () => {
  const waybill = { status: 'in_transit', createdAt: new Date('2026-11-01T00:00:00.000Z'), days: 2 };
  assert.equal(resolvers.Waybill.statusTitle(waybill), 'У дорозі');
  assert.equal(resolvers.Waybill.expectedAt(waybill), '2026-11-03T00:00:00.000Z');
  assert.equal(resolvers.Branch.title({ city: 'Львів', number: 3 }), 'Львів, відділення № 3');
  assert.equal(resolvers.TrackingEvent.title({ status: 'accepted' }), 'Прийнято у відділенні');
});

test('захищені запити вимагають авторизації', () => {
  assert.throws(() => resolvers.Query.myWaybills(null, {}, { user: null }), /Потрібна авторизація/);
});
