import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TARIFFS,
  calculateDelivery,
  createCalculation,
  describeCalculation,
  errorMessages,
  ERROR_SERVER_UNAVAILABLE,
  filterCalculationsByQuery,
  formatDate,
  formatDateTime,
  formatDays,
  sanitizeCalculations,
  sortCalculationsByDate,
  summarizeCalculations,
} from '@postproject/core';

const item = (id, createdAt, extra = {}) => ({
  id,
  weightKg: 1,
  distanceKm: 100,
  deliveryType: 'standard',
  cost: 265,
  days: 1,
  createdAt,
  issued: false,
  ...extra,
});

test('calculateDelivery рахує вартість і дні за тарифами стандартної та експрес-доставки', () => {
  assert.deepEqual(calculateDelivery(2.5, 540, 'standard'), { cost: 1168, days: 2 });
  assert.deepEqual(calculateDelivery(2.5, 540, 'express'), { cost: 1318, days: 1 });
  assert.deepEqual(calculateDelivery(2.5, 540, TARIFFS.standard), calculateDelivery(2.5, 540, 'standard'));
  assert.throws(() => calculateDelivery(1, 50, 'air'));
});

test('createCalculation бере оцінку сервера або рахує за тарифом і зберігає дату створення', () => {
  const now = new Date('2026-11-15T10:30:00Z');
  const params = { weightKg: 2.5, distanceKm: 540, deliveryType: 'standard' };
  assert.deepEqual(createCalculation(params, null, 7, now), {
    id: 7,
    ...params,
    cost: 1168,
    days: 2,
    createdAt: '2026-11-15T10:30:00.000Z',
    issued: false,
  });
  assert.equal(createCalculation(params, { cost: 999, days: 3 }, 8, now).cost, 999);
});

test('formatDate і formatDateTime: дд.мм.рррр, некоректна дата – порожній рядок', () => {
  const date = new Date(2026, 0, 5, 9, 7).toISOString();
  assert.equal(formatDate(date), '05.01.2026');
  assert.equal(formatDateTime(date), '05.01.2026 09:07');
  assert.equal(formatDate('не дата'), '');
  assert.equal(formatDateTime(undefined), '');
});

test('formatDays узгоджує слово «день» із числом', () => {
  assert.deepEqual([1, 3, 5, 11, 21, 22].map(formatDays), ['1 день', '3 дні', '5 днів', '11 днів', '21 день', '22 дні']);
});

test('sortCalculationsByDate ставить новіші першими й не змінює вихідний масив', () => {
  const source = [item(1, '2026-11-01T10:00:00Z'), item(2, '2026-11-03T10:00:00Z'), item(3, '2026-11-02T10:00:00Z')];
  assert.deepEqual(sortCalculationsByDate(source).map((c) => c.id), [2, 3, 1]);
  assert.deepEqual(source.map((c) => c.id), [1, 2, 3]);
});

test('filterCalculationsByQuery шукає без урахування регістру; порожній запит повертає все', () => {
  const list = [item(1, '2026-11-01T10:00:00Z'), item(2, '2026-11-02T10:00:00Z', { deliveryType: 'express', distanceKm: 540 })];
  assert.deepEqual(filterCalculationsByQuery(list, 'ЕКСПРЕС').map((c) => c.id), [2]);
  assert.deepEqual(filterCalculationsByQuery(list, '540 км').map((c) => c.id), [2]);
  assert.equal(filterCalculationsByQuery(list, '  ').length, 2);
  assert.equal(describeCalculation(list[1]), '1 кг · 540 км · Експрес');
});

test('sanitizeCalculations відкидає некоректні записи й приводить старі рядкові id до чисел', () => {
  const valid = item(1, '2026-11-01T10:00:00Z');
  const legacy = { ...item(2, ''), id: '1794758992591' };
  const result = sanitizeCalculations([valid, null, { id: 3 }, item(4, '', { deliveryType: 'air' }), legacy]);
  assert.deepEqual(result.map((c) => c.id), [1, 1794758992591]);
  assert.deepEqual(sanitizeCalculations('not array'), []);
});

test('summarizeCalculations рахує всі та оформлені розрахунки', () => {
  assert.deepEqual(summarizeCalculations([item(1, ''), item(2, '', { issued: true })]), { total: 2, issued: 1 });
});

test('errorMessages бере деталі з extensions.errors, інакше – повідомлення про недоступний сервер', () => {
  const graphQLError = { errors: [{ message: 'Помилка валідації', extensions: { errors: ['Перша', 'Друга'] } }] };
  assert.deepEqual(errorMessages(graphQLError), ['Перша', 'Друга']);
  assert.deepEqual(errorMessages({ errors: [{ message: 'Потрібна авторизація.' }] }), ['Потрібна авторизація.']);
  assert.deepEqual(errorMessages(new TypeError('Failed to fetch')), [ERROR_SERVER_UNAVAILABLE]);
});
