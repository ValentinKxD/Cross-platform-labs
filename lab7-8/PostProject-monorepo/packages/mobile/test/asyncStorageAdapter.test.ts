import test from 'node:test';
import assert from 'node:assert/strict';
import { CalculationsService } from '@postproject/core';
import { AsyncStorageAdapter, STORAGE_KEY, type AsyncKeyValueStorage } from '../src/storage/asyncStorageAdapter.ts';

function createFakeAsyncStorage(initial: Record<string, string> = {}): AsyncKeyValueStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: async (key) => (Object.hasOwn(data, key) ? data[key] : null),
    setItem: async (key, value) => {
      data[key] = value;
    },
  };
}

test('load повертає порожній масив, якщо в AsyncStorage нічого немає', async () => {
  assert.deepEqual(await new AsyncStorageAdapter(createFakeAsyncStorage()).load(), []);
});

test('save записує JSON у AsyncStorage, а load читає його назад', async () => {
  const storage = createFakeAsyncStorage();
  const adapter = new AsyncStorageAdapter(storage);
  const sample = {
    id: 1,
    weightKg: 1,
    distanceKm: 100,
    deliveryType: 'standard' as const,
    cost: 265,
    days: 1,
    createdAt: '2026-11-15T10:00:00.000Z',
    issued: false,
  };

  await adapter.save([sample]);

  assert.equal(storage.data[STORAGE_KEY], JSON.stringify([sample]));
  assert.deepEqual(await adapter.load(), [sample]);
});

test('load повертає [] для пошкодженого JSON і помилки сховища', async () => {
  assert.deepEqual(await new AsyncStorageAdapter(createFakeAsyncStorage({ [STORAGE_KEY]: '[{' })).load(), []);
  const broken: AsyncKeyValueStorage = {
    getItem: async () => {
      throw new Error('storage unavailable');
    },
    setItem: async () => undefined,
  };
  assert.deepEqual(await new AsyncStorageAdapter(broken).load(), []);
});

test('адаптер працює зі спільним CalculationsService і читає старі записи ЛР №5 з рядковими id', async () => {
  const legacy = [
    { id: '1794758992591', weightKg: 2.5, distanceKm: 540, deliveryType: 'express', cost: 1318, days: 1, createdAt: '2026-11-01T10:00:00.000Z', issued: true },
  ];
  const storage = createFakeAsyncStorage({ [STORAGE_KEY]: JSON.stringify(legacy) });
  const service = new CalculationsService(new AsyncStorageAdapter(storage));

  assert.deepEqual((await service.list()).map((item) => item.id), [1794758992591]);
  const added = await service.add({ weight: '1', distance: '100' });
  assert.equal(added.ok, true);
  assert.deepEqual(await service.summary(), { total: 2, issued: 1 });
});
