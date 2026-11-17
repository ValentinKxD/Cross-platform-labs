import { calculateDelivery, deliveryTypeTitle, isDeliveryType } from './pricing.js';
import { formatCost, formatDate, formatDays, formatWeight } from './format.js';

export function createCalculation({ weightKg, distanceKm, deliveryType }, estimate, id = Date.now(), now = new Date()) {
  const { cost, days } = estimate ?? calculateDelivery(weightKg, distanceKm, deliveryType);
  return {
    id,
    weightKg,
    distanceKm,
    deliveryType,
    cost,
    days,
    createdAt: now.toISOString(),
    issued: false,
  };
}

export function describeCalculation(calculation) {
  return `${formatWeight(calculation.weightKg)} кг · ${calculation.distanceKm} км · ${deliveryTypeTitle(calculation.deliveryType)}`;
}

export function describeEstimate(calculation) {
  return `${formatCost(calculation.cost)} · ${formatDays(calculation.days)}`;
}

const timeOf = (item) => {
  const time = new Date(item.createdAt).getTime();
  return Number.isNaN(time) ? item.id : time;
};

export function sortCalculationsByDate(calculations) {
  return [...calculations].sort((a, b) => timeOf(b) - timeOf(a) || b.id - a.id);
}

export function filterCalculationsByQuery(calculations, query) {
  const needle = typeof query === 'string' ? query.trim().toLowerCase() : '';
  if (!needle) return [...calculations];

  return calculations.filter((item) =>
    [describeCalculation(item), describeEstimate(item), formatDate(item.createdAt), item.issued ? 'оформлено' : '']
      .join(' ')
      .toLowerCase()
      .includes(needle),
  );
}

const isPositiveNumber = (value) => typeof value === 'number' && Number.isFinite(value) && value > 0;

const toId = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return null;
};

export function sanitizeCalculations(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item !== null && typeof item === 'object')
    .map((item) => ({ ...item, id: toId(item.id), issued: item.issued === true }))
    .filter(
      (item) =>
        item.id !== null &&
        isPositiveNumber(item.weightKg) &&
        isPositiveNumber(item.distanceKm) &&
        isDeliveryType(item.deliveryType) &&
        isPositiveNumber(item.cost) &&
        isPositiveNumber(item.days),
    );
}

export function summarizeCalculations(calculations) {
  return {
    total: calculations.length,
    issued: calculations.filter((item) => item.issued).length,
  };
}
