import fs from 'node:fs/promises';
import path from 'node:path';
import { CalculationStorageAdapter } from '@postproject/core';

export class FileStorageAdapter extends CalculationStorageAdapter {
  constructor(filePath) {
    super();
    this.filePath = filePath;
  }

  async load() {
    try {
      const calculations = JSON.parse(await fs.readFile(this.filePath, 'utf-8'));
      return Array.isArray(calculations) ? calculations : [];
    } catch {
      return [];
    }
  }

  async save(calculations) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(calculations, null, 2), 'utf-8');
  }
}
