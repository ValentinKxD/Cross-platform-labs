import test from 'node:test';
import assert from 'node:assert/strict';
import { CalculationsService, type Calculation } from '@postproject/core';
import { LocalStorageAdapter, STORAGE_KEY, type KeyValueStorage } from '../src/storage/localStorageAdapter.ts';

function createFakeStorage(initial: Record<string, string> = {}): KeyValueStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (Object.hasOwn(data, key) ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

const sample: Calculation = {
  id: 1,
  weightKg: 2.5,
  distanceKm: 540,
  deliveryType: 'standard',
  cost: 1168,
  days: 2,
  createdAt: '2026-11-15T10:00:00.000Z',
  issued: false,
};

test('load повертає порожній масив, якщо сховище порожнє', () => {
  assert.deepEqual(new LocalStorageAdapter(createFakeStorage()).load(), []);
});

test('save записує JSON під ключем postproject-calculations, а load читає його назад', () => {
  const storage = createFakeStorage();
  const adapter = new LocalStorageAdapter(storage);

  adapter.save([sample]);

  assert.equal(storage.data[STORAGE_KEY], JSON.stringify([sample]));
  assert.deepEqual(adapter.load(), [sample]);
});

test('load повертає [] для пошкодженого JSON та для не-масиву', () => {
  assert.deepEqual(new LocalStorageAdapter(createFakeStorage({ [STORAGE_KEY]: '{не json' })).load(), []);
  assert.deepEqual(new LocalStorageAdapter(createFakeStorage({ [STORAGE_KEY]: '{"a":1}' })).load(), []);
});

test('адаптер працює зі спільним CalculationsService після «перезавантаження сторінки»', async () => {
  const storage = createFakeStorage();
  const added = await new CalculationsService(new LocalStorageAdapter(storage)).add({ weight: '1', distance: '300', deliveryType: 'express' });
  assert.equal(added.ok, true);

  const reloaded = new CalculationsService(new LocalStorageAdapter(storage));
  assert.deepEqual(await reloaded.list(), added.ok ? [added.calculation] : []);
});

test('збереження в localStorage веб-версії ЛР №4 читається без змін', async () => {
  const legacy = [{ ...sample, id: 1794758992591 }];
  const service = new CalculationsService(new LocalStorageAdapter(createFakeStorage({ [STORAGE_KEY]: JSON.stringify(legacy) })));
  assert.deepEqual(await service.list(), legacy);
});
