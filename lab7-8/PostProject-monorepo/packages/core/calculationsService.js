import { validateCalculationInput } from './calculationValidation.js';
import { errorMessages } from './format.js';
import {
  createCalculation,
  filterCalculationsByQuery,
  sanitizeCalculations,
  sortCalculationsByDate,
  summarizeCalculations,
} from './calculations.js';

export const ERROR_NOT_FOUND = 'Розрахунок не знайдено.';

export class CalculationsService {
  constructor(adapter, { estimate } = {}) {
    if (!adapter || typeof adapter.load !== 'function' || typeof adapter.save !== 'function') {
      throw new TypeError('CalculationsService потребує адаптер із методами load() і save().');
    }
    this.adapter = adapter;
    this.estimate = estimate;
  }

  async read() {
    return sanitizeCalculations(await this.adapter.load());
  }

  nextId(calculations) {
    const maxId = calculations.reduce((max, item) => Math.max(max, item.id), 0);
    return Math.max(Date.now(), maxId + 1);
  }

  async list(query = '') {
    return sortCalculationsByDate(filterCalculationsByQuery(await this.read(), query));
  }

  async summary() {
    return summarizeCalculations(await this.read());
  }

  async add(input) {
    const { isValid, error, value } = validateCalculationInput(input);
    if (!isValid) return { ok: false, error };

    let estimate = null;
    if (this.estimate) {
      try {
        estimate = await this.estimate(value);
      } catch (estimateError) {
        return { ok: false, error: errorMessages(estimateError).join('. ') };
      }
    }

    const calculations = await this.read();
    const calculation = createCalculation(value, estimate, this.nextId(calculations));
    await this.adapter.save([...calculations, calculation]);
    return { ok: true, calculation, source: estimate ? 'server' : 'local' };
  }

  async toggleIssued(id) {
    const calculations = await this.read();
    const target = calculations.find((item) => item.id === id);
    if (!target) return { ok: false, error: ERROR_NOT_FOUND };

    const calculation = { ...target, issued: !target.issued };
    await this.adapter.save(calculations.map((item) => (item.id === id ? calculation : item)));
    return { ok: true, calculation };
  }

  async remove(id) {
    const calculations = await this.read();
    if (!calculations.some((item) => item.id === id)) return { ok: false, error: ERROR_NOT_FOUND };

    await this.adapter.save(calculations.filter((item) => item.id !== id));
    return { ok: true };
  }
}
