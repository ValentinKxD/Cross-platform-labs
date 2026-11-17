import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { CalculationsService } from '@postproject/core';
import { FileStorageAdapter } from '../fileStorageAdapter.js';

async function tempDir(t) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'postproject-'));
  t.after(() => fs.rm(dir, { recursive: true, force: true }));
  return dir;
}

const sample = {
  id: 1,
  weightKg: 2.5,
  distanceKm: 540,
  deliveryType: 'standard',
  cost: 1168,
  days: 2,
  createdAt: '2026-11-15T10:00:00.000Z',
  issued: false,
};

test('load повертає [], якщо файлу немає', async (t) => {
  const dir = await tempDir(t);
  assert.deepEqual(await new FileStorageAdapter(path.join(dir, 'calculations.json')).load(), []);
});

test('save створює теку та файл, load читає дані назад', async (t) => {
  const dir = await tempDir(t);
  const filePath = path.join(dir, 'nested', 'calculations.json');
  const adapter = new FileStorageAdapter(filePath);

  await adapter.save([sample]);

  assert.deepEqual(JSON.parse(await fs.readFile(filePath, 'utf-8')), [sample]);
  assert.deepEqual(await adapter.load(), [sample]);
});

test('load повертає [] для пошкодженого файлу', async (t) => {
  const dir = await tempDir(t);
  const filePath = path.join(dir, 'calculations.json');
  await fs.writeFile(filePath, '{ пошкоджено', 'utf-8');
  assert.deepEqual(await new FileStorageAdapter(filePath).load(), []);
});

test('адаптер працює зі спільним CalculationsService між запусками застосунку', async (t) => {
  const dir = await tempDir(t);
  const filePath = path.join(dir, 'calculations.json');

  const added = await new CalculationsService(new FileStorageAdapter(filePath)).add({ weight: '3', distance: '900', deliveryType: 'express' });
  assert.equal(added.ok, true);

  const restarted = new CalculationsService(new FileStorageAdapter(filePath));
  assert.deepEqual(await restarted.list(), [added.calculation]);
});
