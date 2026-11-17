import { describeCalculation, describeEstimate, formatDateTime, formatDays } from '@postproject/core';

export const ERROR_BAD_ID = 'Некоректний ідентифікатор розрахунку.';

const toView = (calculation) => ({
  ...calculation,
  dateLabel: formatDateTime(calculation.createdAt),
  daysLabel: formatDays(calculation.days),
  estimateLabel: describeEstimate(calculation),
  detailsLabel: describeCalculation(calculation),
});

const toId = (value) => {
  if (typeof value === 'number') return Number.isInteger(value) ? value : null;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return null;
};

const toInput = (value) => {
  const source = value && typeof value === 'object' ? value : {};
  const text = (field) => (typeof source[field] === 'string' ? source[field] : '');
  return { weight: text('weight'), distance: text('distance'), deliveryType: text('deliveryType') || 'standard' };
};

export function createHandlers(service) {
  return {
    async list(query) {
      const calculations = await service.list(typeof query === 'string' ? query : '');
      return { calculations: calculations.map(toView), summary: await service.summary() };
    },

    async add(input) {
      const result = await service.add(toInput(input));
      return result.ok ? { ...result, calculation: toView(result.calculation) } : result;
    },

    async toggle(id) {
      const numericId = toId(id);
      if (numericId === null) return { ok: false, error: ERROR_BAD_ID };
      const result = await service.toggleIssued(numericId);
      return result.ok ? { ok: true, calculation: toView(result.calculation) } : result;
    },

    async remove(id) {
      const numericId = toId(id);
      if (numericId === null) return { ok: false, error: ERROR_BAD_ID };
      return service.remove(numericId);
    },
  };
}
