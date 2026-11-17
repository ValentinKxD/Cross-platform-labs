import { ERROR_WEIGHT_MIN, isBlank, isValidWeight, parseNumber } from './calculationValidation.js';
import { ERROR_PHONE_FORMAT, isValidPhone } from './contactValidation.js';
import { isDeliveryType } from './pricing.js';

export const WAYBILL_STATUSES = ['created', 'accepted', 'in_transit', 'arrived', 'received'];

export const STATUS_TITLES = {
  created: 'Створено',
  accepted: 'Прийнято',
  in_transit: 'У дорозі',
  arrived: 'Прибуло',
  received: 'Отримано',
};

export const EVENT_TITLES = {
  created: 'Створено накладну',
  accepted: 'Прийнято у відділенні',
  in_transit: 'Відправлено до міста отримувача',
  arrived: 'Прибуло у відділення',
  received: 'Отримано',
};

export const IN_TRANSIT_STATUSES = ['accepted', 'in_transit', 'arrived'];
export const DELIVERED_STATUSES = ['arrived', 'received'];

export const WAYBILL_FILTERS = [
  { value: 'all', label: 'Усі' },
  { value: 'transit', label: 'В дорозі' },
  { value: 'received', label: 'Отримані' },
];

export const TRACKING_NUMBER_PATTERN = /^\d{14}$/;
export const ERROR_TRACKING_NUMBER = 'Номер накладної має складатися з 14 цифр';
export const ERROR_WAYBILL_PEOPLE = 'Заповніть усі поля вкладки «Відправник та отримувач»';
export const ERROR_WAYBILL_WEIGHT = 'Вкажіть вагу посилки на вкладці «Посилка»';
export const ERROR_SAME_CITY = 'Місто відправлення та місто отримання мають відрізнятися';
export const ERROR_FROM_BRANCH = 'Оберіть відділення відправлення';
export const ERROR_TO_BRANCH = 'Оберіть відділення отримання';
export const ERROR_UNKNOWN_DELIVERY_TYPE = 'Невідомий тип доставки';

const DAY_MS = 24 * 60 * 60 * 1000;

const REQUIRED_TEXT_FIELDS = {
  lastName: 'прізвище',
  firstName: "ім'я",
  phone: 'номер телефону',
};

export function statusTitle(status) {
  return STATUS_TITLES[status] ?? status;
}

export function eventTitle(status) {
  return EVENT_TITLES[status] ?? status;
}

export function isDelivered(status) {
  return DELIVERED_STATUSES.includes(status);
}

export function canAdvanceStatus(current, next) {
  return WAYBILL_STATUSES.indexOf(next) > WAYBILL_STATUSES.indexOf(current);
}

export function branchTitle(branch) {
  return `${branch.city}, відділення № ${branch.number}`;
}

export function orderCities(cityFrom, cityTo) {
  return [cityFrom, cityTo].sort((a, b) => a.localeCompare(b, 'uk'));
}

export function expectedDeliveryDate(createdAt, days) {
  return new Date(new Date(createdAt).getTime() + days * DAY_MS).toISOString();
}

export function normalizeTrackingNumber(value) {
  return String(value ?? '').replace(/\s/g, '');
}

export function validateTrackingNumber(value) {
  const trackingNumber = normalizeTrackingNumber(value);
  return TRACKING_NUMBER_PATTERN.test(trackingNumber)
    ? { isValid: true, error: null, value: trackingNumber }
    : { isValid: false, error: ERROR_TRACKING_NUMBER };
}

export function generateTrackingNumber(random = Math.random) {
  return Math.floor(10000000000000 + random() * 90000000000000).toString();
}

export function matchesWaybillFilter(waybill, filter) {
  if (filter === 'transit') return IN_TRANSIT_STATUSES.includes(waybill.status);
  if (filter === 'received') return waybill.status === 'received';
  return true;
}

export function filterWaybills(waybills, { filter = 'all', onlyActive = false, search = '' } = {}) {
  const query = normalizeTrackingNumber(search);
  return waybills.filter(
    (waybill) =>
      matchesWaybillFilter(waybill, filter) &&
      (!onlyActive || waybill.status !== 'received') &&
      waybill.trackingNumber.includes(query),
  );
}

export function validateWaybillInput(input, fromBranch, toBranch) {
  const errors = [];

  for (const [field, label] of Object.entries(REQUIRED_TEXT_FIELDS)) {
    if (isBlank(input[field])) {
      errors.push(`Поле "${field}" (${label}) є обов'язковим і не може бути порожнім`);
    }
  }

  if (!isBlank(input.phone) && !isValidPhone(input.phone)) errors.push(ERROR_PHONE_FORMAT);
  if (!fromBranch) errors.push(ERROR_FROM_BRANCH);
  if (!toBranch) errors.push(ERROR_TO_BRANCH);
  if (fromBranch && toBranch && fromBranch.city === toBranch.city) errors.push(ERROR_SAME_CITY);
  if (!isValidWeight(input.weightKg)) errors.push(ERROR_WEIGHT_MIN);
  if (input.deliveryType != null && !isDeliveryType(input.deliveryType)) errors.push(ERROR_UNKNOWN_DELIVERY_TYPE);

  return errors;
}

export function validateWaybillForm(form, branches = []) {
  const { lastName, firstName, phone, fromBranchId, toBranchId, weight, deliveryType = 'standard' } = form;

  if (isBlank(lastName) || isBlank(firstName) || isBlank(phone) || !fromBranchId || !toBranchId) {
    return { ok: false, tab: 'people', errors: [ERROR_WAYBILL_PEOPLE] };
  }

  const peopleErrors = [];
  if (!isValidPhone(phone)) peopleErrors.push(ERROR_PHONE_FORMAT);
  const fromBranch = branches.find((branch) => branch.id === fromBranchId);
  const toBranch = branches.find((branch) => branch.id === toBranchId);
  if (fromBranch && toBranch && fromBranch.city === toBranch.city) peopleErrors.push(ERROR_SAME_CITY);
  if (peopleErrors.length > 0) return { ok: false, tab: 'people', errors: peopleErrors };

  if (isBlank(weight)) return { ok: false, tab: 'parcel', errors: [ERROR_WAYBILL_WEIGHT] };
  const weightKg = parseNumber(weight);
  if (!isValidWeight(weightKg)) return { ok: false, tab: 'parcel', errors: [ERROR_WEIGHT_MIN] };

  return {
    ok: true,
    value: {
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      phone: phone.trim(),
      fromBranchId,
      toBranchId,
      weightKg,
      deliveryType,
    },
  };
}
