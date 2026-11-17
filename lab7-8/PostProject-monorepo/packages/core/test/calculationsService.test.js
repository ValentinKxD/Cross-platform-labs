import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CalculationsService,
  CalculationStorageAdapter,
  ERROR_EMPTY,
  ERROR_NOT_FOUND,
  ERROR_WEIGHT_MIN,
  GraphQLRequestError,
  MemoryStorageAdapter,
  MIN_WEIGHT_KG,
} from '@postproject/core';

const input = { weight: '2,5', distance: '540', deliveryType: 'standard' };

test('add зберігає розрахунок в адаптері за тарифом ядра, якщо сервера немає', async () => {
  const adapter = new MemoryStorageAdapter();
  const result = await new CalculationsService(adapter).add(input);

  assert.equal(result.ok, true);
  assert.equal(result.source, 'local');
  assert.equal(result.calculation.cost, 1168);
  assert.deepEqual(adapter.load(), [result.calculation]);
});

test('add бере вартість від сервера, а при недоступному сервері – рахує сам', async () => {
  const online = new CalculationsService(new MemoryStorageAdapter(), { estimate: async () => ({ cost: 1200, days: 3 }) });
  const fromServer = await online.add(input);
  assert.equal(fromServer.source, 'server');
  assert.equal(fromServer.calculation.cost, 1200);

  const offline = new CalculationsService(new MemoryStorageAdapter(), { estimate: async () => null });
  assert.equal((await offline.add(input)).source, 'local');
});

test('add не зберігає некоректний розрахунок і повертає повідомлення про помилку', async () => {
  const adapter = new MemoryStorageAdapter();
  const service = new CalculationsService(adapter);

  assert.deepEqual(await service.add({ weight: '', distance: '' }), { ok: false, error: ERROR_EMPTY });
  assert.deepEqual(await service.add({ ...input, weight: String(MIN_WEIGHT_KG / 2) }), { ok: false, error: ERROR_WEIGHT_MIN });
  assert.deepEqual(adapter.load(), []);
});

test('add повертає помилку валідації від сервера і нічого не зберігає', async () => {
  const adapter = new MemoryStorageAdapter();
  const estimate = async () => {
    throw new GraphQLRequestError([{ message: 'Помилка', extensions: { errors: ['Тариф не знайдено'] } }]);
  };
  assert.deepEqual(await new CalculationsService(adapter, { estimate }).add(input), { ok: false, error: 'Тариф не знайдено' });
  assert.deepEqual(adapter.load(), []);
});

test('add видає унікальні id навіть за однакового часу', async () => {
  const service = new CalculationsService(new MemoryStorageAdapter());
  const ids = [];
  for (let i = 0; i < 5; i += 1) ids.push((await service.add(input)).calculation.id);
  assert.equal(new Set(ids).size, 5);
});

test('toggleIssued вмикає та вимикає позначку «Оформлено»', async () => {
  const service = new CalculationsService(new MemoryStorageAdapter());
  const { calculation } = await service.add(input);

  assert.equal((await service.toggleIssued(calculation.id)).calculation.issued, true);
  assert.deepEqual(await service.summary(), { total: 1, issued: 1 });
  assert.equal((await service.toggleIssued(calculation.id)).calculation.issued, false);
  assert.deepEqual(await service.toggleIssued(12345), { ok: false, error: ERROR_NOT_FOUND });
});

test('remove видаляє розрахунок за id, а відсутній – повідомляє', async () => {
  const service = new CalculationsService(new MemoryStorageAdapter());
  const { calculation } = await service.add(input);

  assert.deepEqual(await service.remove(calculation.id), { ok: true });
  assert.deepEqual(await service.list(), []);
  assert.deepEqual(await service.remove(calculation.id), { ok: false, error: ERROR_NOT_FOUND });
});

test('list повертає розрахунки від новіших до старіших, підтримує пошук і ігнорує пошкоджені записи', async () => {
  const service = new CalculationsService(
    new MemoryStorageAdapter([
      { id: 1, weightKg: 1, distanceKm: 100, deliveryType: 'standard', cost: 265, days: 1, createdAt: '2026-11-01T10:00:00Z' },
      { id: 2, weightKg: 3, distanceKm: 900, deliveryType: 'express', cost: 2045, days: 2, createdAt: '2026-11-02T10:00:00Z' },
      { id: 'x' },
      null,
    ]),
  );

  assert.deepEqual((await service.list()).map((c) => c.id), [2, 1]);
  assert.deepEqual((await service.list('експрес')).map((c) => c.id), [2]);
});

test('сервіс працює з асинхронним адаптером і вимагає load() та save()', async () => {
  class AsyncAdapter extends CalculationStorageAdapter {
    data = [];
    async load() {
      return this.data;
    }
    async save(calculations) {
      this.data = calculations;
    }
  }
  const service = new CalculationsService(new AsyncAdapter());
  assert.equal((await service.add(input)).ok, true);
  assert.equal((await service.list()).length, 1);

  assert.throws(() => new CalculationsService({}), TypeError);
  assert.throws(() => new CalculationStorageAdapter().load(), /не реалізовано/);
});
