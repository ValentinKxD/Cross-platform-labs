import test from 'node:test';
import assert from 'node:assert/strict';
import { CalculationsService, ERROR_EMPTY, ERROR_NOT_FOUND, MemoryStorageAdapter } from '@postproject/core';
import { ERROR_BAD_ID, createHandlers } from '../ipcHandlers.js';

const setup = (options) => createHandlers(new CalculationsService(new MemoryStorageAdapter(), options));

test('add і list: розрахунок з’являється з підписами dateLabel, daysLabel, estimateLabel і detailsLabel', async () => {
  const handlers = setup();

  const added = await handlers.add({ weight: '2,5', distance: '540', deliveryType: 'standard' });
  assert.equal(added.ok, true);
  assert.equal(added.source, 'local');
  assert.equal(added.calculation.daysLabel, '2 дні');
  assert.equal(added.calculation.estimateLabel, '1168 ₴ · 2 дні');
  assert.equal(added.calculation.detailsLabel, '2,5 кг · 540 км · Стандартна');
  assert.match(added.calculation.dateLabel, /^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}$/);

  const { calculations, summary } = await handlers.list('');
  assert.equal(calculations.length, 1);
  assert.deepEqual(summary, { total: 1, issued: 0 });
});

test('add повертає помилку для порожніх і нетекстових значень', async () => {
  const handlers = setup();
  assert.deepEqual(await handlers.add({ weight: '', distance: '' }), { ok: false, error: ERROR_EMPTY });
  assert.deepEqual(await handlers.add({ weight: 5, distance: { km: 1 } }), { ok: false, error: ERROR_EMPTY });
  assert.deepEqual(await handlers.add(null), { ok: false, error: ERROR_EMPTY });
});

test('add використовує вартість від сервера, якщо він доступний', async () => {
  const handlers = setup({ estimate: async () => ({ cost: 1500, days: 4 }) });
  const added = await handlers.add({ weight: '1', distance: '100' });
  assert.equal(added.source, 'server');
  assert.equal(added.calculation.estimateLabel, '1500 ₴ · 4 дні');
});

test('list ігнорує запит неправильного типу, а рядковий запит фільтрує', async () => {
  const handlers = setup();
  await handlers.add({ weight: '1', distance: '100', deliveryType: 'standard' });
  await handlers.add({ weight: '1', distance: '100', deliveryType: 'express' });

  assert.equal((await handlers.list({ evil: true })).calculations.length, 2);
  const filtered = (await handlers.list('ЕКСПРЕС')).calculations;
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].deliveryType, 'express');
});

test('toggle і remove приймають id як число або рядок, некоректний id відхиляється', async () => {
  const handlers = setup();
  const { calculation } = await handlers.add({ weight: '1', distance: '100' });

  assert.equal((await handlers.toggle(String(calculation.id))).calculation.issued, true);
  assert.equal((await handlers.list()).summary.issued, 1);
  assert.deepEqual(await handlers.toggle('abc'), { ok: false, error: ERROR_BAD_ID });

  assert.deepEqual(await handlers.remove(calculation.id), { ok: true });
  assert.deepEqual(await handlers.remove(calculation.id), { ok: false, error: ERROR_NOT_FOUND });
  assert.deepEqual(await handlers.remove(1.5), { ok: false, error: ERROR_BAD_ID });
});
