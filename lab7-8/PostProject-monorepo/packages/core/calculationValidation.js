import { isDeliveryType } from './pricing.js';

export const MIN_WEIGHT_KG = 0.1;
export const MIN_DISTANCE_KM = 1;

const uaNumber = (value) => String(value).replace('.', ',');

export const ERROR_EMPTY = 'Заповніть вагу та відстань.';
export const ERROR_NOT_NUMBER = 'Вага та відстань мають бути числами.';
export const ERROR_WEIGHT_MIN = `Вага посилки має бути не менше ${uaNumber(MIN_WEIGHT_KG)} кг.`;
export const ERROR_DISTANCE_MIN = `Відстань доставки має бути не менше ${MIN_DISTANCE_KM} км.`;
export const ERROR_DELIVERY_TYPE = 'Оберіть тип доставки: стандартна або експрес.';

export const isBlank = (value) => value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

export function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return NaN;
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) return NaN;
  return Number(normalized);
}

export function isValidWeight(weightKg) {
  return Number.isFinite(weightKg) && weightKg >= MIN_WEIGHT_KG;
}

export function isValidDistance(distanceKm) {
  return Number.isFinite(distanceKm) && distanceKm >= MIN_DISTANCE_KM;
}

export function validateDeliveryParams(weightKg, distanceKm) {
  const errors = [];
  if (!isValidWeight(weightKg)) errors.push(ERROR_WEIGHT_MIN);
  if (!isValidDistance(distanceKm)) errors.push(ERROR_DISTANCE_MIN);
  return errors;
}

export function validateCalculationInput(input) {
  const { weight, distance, deliveryType = 'standard' } = input ?? {};

  if (isBlank(weight) || isBlank(distance)) {
    return { isValid: false, error: ERROR_EMPTY };
  }

  const weightKg = parseNumber(weight);
  const distanceKm = parseNumber(distance);

  if (!Number.isFinite(weightKg) || !Number.isFinite(distanceKm)) {
    return { isValid: false, error: ERROR_NOT_NUMBER };
  }
  if (!isValidWeight(weightKg)) {
    return { isValid: false, error: ERROR_WEIGHT_MIN };
  }
  if (!isValidDistance(distanceKm)) {
    return { isValid: false, error: ERROR_DISTANCE_MIN };
  }
  if (!isDeliveryType(deliveryType)) {
    return { isValid: false, error: ERROR_DELIVERY_TYPE };
  }

  return { isValid: true, error: null, value: { weightKg, distanceKm, deliveryType } };
}
