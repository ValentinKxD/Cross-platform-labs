import { CalculationStorageAdapter, type Calculation } from '@postproject/core';

export const STORAGE_KEY = 'postproject-calculations';

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class LocalStorageAdapter extends CalculationStorageAdapter {
  storage: KeyValueStorage;
  key: string;

  constructor(storage: KeyValueStorage = globalThis.localStorage, key = STORAGE_KEY) {
    super();
    this.storage = storage;
    this.key = key;
  }

  load(): unknown[] {
    try {
      const saved = this.storage.getItem(this.key);
      const calculations: unknown = saved ? JSON.parse(saved) : [];
      return Array.isArray(calculations) ? calculations : [];
    } catch {
      return [];
    }
  }

  save(calculations: Calculation[]) {
    this.storage.setItem(this.key, JSON.stringify(calculations));
  }
}
