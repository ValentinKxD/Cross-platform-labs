import { CalculationStorageAdapter, type Calculation } from '@postproject/core';

export const STORAGE_KEY = 'postproject-calculations';

export interface AsyncKeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

export class AsyncStorageAdapter extends CalculationStorageAdapter {
  storage: AsyncKeyValueStorage;
  key: string;

  constructor(storage: AsyncKeyValueStorage, key = STORAGE_KEY) {
    super();
    this.storage = storage;
    this.key = key;
  }

  async load(): Promise<unknown[]> {
    try {
      const saved = await this.storage.getItem(this.key);
      const calculations: unknown = saved ? JSON.parse(saved) : [];
      return Array.isArray(calculations) ? calculations : [];
    } catch {
      return [];
    }
  }

  async save(calculations: Calculation[]) {
    await this.storage.setItem(this.key, JSON.stringify(calculations));
  }
}
