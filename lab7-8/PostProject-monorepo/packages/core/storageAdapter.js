export class CalculationStorageAdapter {
  load() {
    throw new Error('Метод load() не реалізовано.');
  }

  save() {
    throw new Error('Метод save() не реалізовано.');
  }
}

const copy = (value) => JSON.parse(JSON.stringify(value));

export class MemoryStorageAdapter extends CalculationStorageAdapter {
  constructor(initial = []) {
    super();
    this.calculations = copy(initial);
  }

  load() {
    return copy(this.calculations);
  }

  save(calculations) {
    this.calculations = copy(calculations);
  }
}
