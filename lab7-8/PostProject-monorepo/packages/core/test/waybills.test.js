import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ERROR_PHONE_FORMAT,
  ERROR_SAME_CITY,
  ERROR_TRACKING_NUMBER,
  ERROR_WAYBILL_PEOPLE,
  ERROR_WAYBILL_WEIGHT,
  ERROR_WEIGHT_MIN,
  MIN_WEIGHT_KG,
  branchTitle,
  canAdvanceStatus,
  expectedDeliveryDate,
  filterWaybills,
  generateTrackingNumber,
  isDelivered,
  statusTitle,
  validateTrackingNumber,
  validateWaybillForm,
  validateWaybillInput,
} from '@postproject/core';

const waybills = [
  { trackingNumber: '59001234567890', status: 'in_transit' },
  { trackingNumber: '59001234560012', status: 'received' },
  { trackingNumber: '59001234560099', status: 'created' },
];

const branches = [
  { id: 'kyiv1', city: 'Київ', number: 1, title: 'Київ, відділення № 1' },
  { id: 'kyiv12', city: 'Київ', number: 12, title: 'Київ, відділення № 12' },
  { id: 'lviv3', city: 'Львів', number: 3, title: 'Львів, відділення № 3' },
];

const form = {
  lastName: 'Качинський',
  firstName: 'Валентин',
  phone: '050 123 45 67',
  fromBranchId: 'kyiv1',
  toBranchId: 'lviv3',
  weight: '2,5',
  deliveryType: 'standard',
};

test('статуси: назви, доставлені та рух лише вперед', () => {
  assert.equal(statusTitle('in_transit'), 'У дорозі');
  assert.equal(isDelivered('arrived'), true);
  assert.equal(isDelivered('accepted'), false);
  assert.equal(canAdvanceStatus('accepted', 'arrived'), true);
  assert.equal(canAdvanceStatus('arrived', 'accepted'), false);
});

test('filterWaybills: фільтр за статусом, «лише активні» та пошук за номером', () => {
  assert.equal(filterWaybills(waybills).length, 3);
  assert.deepEqual(filterWaybills(waybills, { filter: 'transit' }).map((w) => w.status), ['in_transit']);
  assert.deepEqual(filterWaybills(waybills, { filter: 'received' }).map((w) => w.status), ['received']);
  assert.equal(filterWaybills(waybills, { onlyActive: true }).length, 2);
  assert.deepEqual(filterWaybills(waybills, { search: '5600 12' }).map((w) => w.status), ['received']);
});

test('validateTrackingNumber вимагає 14 цифр і прибирає пробіли', () => {
  assert.deepEqual(validateTrackingNumber('5900 1234 5678 90'), { isValid: true, error: null, value: '59001234567890' });
  assert.equal(validateTrackingNumber('123').error, ERROR_TRACKING_NUMBER);
  assert.match(generateTrackingNumber(() => 0.5), /^\d{14}$/);
});

test('branchTitle та expectedDeliveryDate', () => {
  assert.equal(branchTitle({ city: 'Львів', number: 3 }), 'Львів, відділення № 3');
  assert.equal(expectedDeliveryDate('2026-11-01T00:00:00.000Z', 2), '2026-11-03T00:00:00.000Z');
});

test('validateWaybillForm: вкладка «Відправник та отримувач»', () => {
  assert.deepEqual(validateWaybillForm({ ...form, lastName: '' }, branches), { ok: false, tab: 'people', errors: [ERROR_WAYBILL_PEOPLE] });
  assert.deepEqual(validateWaybillForm({ ...form, phone: '123' }, branches).errors, [ERROR_PHONE_FORMAT]);
  assert.deepEqual(validateWaybillForm({ ...form, toBranchId: 'kyiv12' }, branches).errors, [ERROR_SAME_CITY]);
});

test('validateWaybillForm: вкладка «Посилка» та коректні дані', () => {
  assert.deepEqual(validateWaybillForm({ ...form, weight: '' }, branches), { ok: false, tab: 'parcel', errors: [ERROR_WAYBILL_WEIGHT] });
  assert.deepEqual(validateWaybillForm({ ...form, weight: String(MIN_WEIGHT_KG / 2) }, branches).errors, [ERROR_WEIGHT_MIN]);
  const result = validateWaybillForm(form, branches);
  assert.equal(result.ok, true);
  assert.equal(result.value.weightKg, 2.5);
});

test('validateWaybillInput для сервера повертає всі помилки накладної', () => {
  const errors = validateWaybillInput({ lastName: '', firstName: 'В', phone: '1', weightKg: 0 }, null, { city: 'Київ' });
  assert.equal(errors.length, 4);
  assert.ok(errors.includes(ERROR_PHONE_FORMAT));
  assert.ok(errors.includes(ERROR_WEIGHT_MIN));
  assert.deepEqual(validateWaybillInput({ ...form, weightKg: 2.5 }, { city: 'Київ' }, { city: 'Львів' }), []);
});
