import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ERROR_DELIVERY_TYPE,
  ERROR_DISTANCE_MIN,
  ERROR_EMPTY,
  ERROR_NOT_NUMBER,
  ERROR_WEIGHT_MIN,
  MIN_DISTANCE_KM,
  MIN_WEIGHT_KG,
  validateCalculationInput,
  validateDeliveryParams,
} from '@postproject/core';

test('коректні дані проходять перевірку, кома у вазі перетворюється на крапку', () => {
  const result = validateCalculationInput({ weight: ' 2,5 ', distance: '540', deliveryType: 'express' });
  assert.equal(result.isValid, true);
  assert.deepEqual(result.value, { weightKg: 2.5, distanceKm: 540, deliveryType: 'express' });
});

test('порожні поля та самі пробіли не проходять перевірку', () => {
  assert.deepEqual(validateCalculationInput({ weight: '', distance: '540' }), { isValid: false, error: ERROR_EMPTY });
  assert.deepEqual(validateCalculationInput({ weight: '2', distance: '   ' }), { isValid: false, error: ERROR_EMPTY });
  assert.deepEqual(validateCalculationInput(undefined), { isValid: false, error: ERROR_EMPTY });
});

test('не число не проходить перевірку', () => {
  assert.equal(validateCalculationInput({ weight: 'abc', distance: '540' }).error, ERROR_NOT_NUMBER);
  assert.equal(validateCalculationInput({ weight: '2', distance: '-5' }).error, ERROR_NOT_NUMBER);
});

test('вага: MIN_WEIGHT_KG допустима, менше – ні, верхньої межі немає', () => {
  const check = (weight) => validateCalculationInput({ weight, distance: 100 });
  assert.equal(check(MIN_WEIGHT_KG).isValid, true);
  assert.equal(check(1000).isValid, true);
  assert.equal(check(MIN_WEIGHT_KG / 2).error, ERROR_WEIGHT_MIN);
});

test('відстань: MIN_DISTANCE_KM допустима, менше – ні, верхньої межі немає', () => {
  const check = (distance) => validateCalculationInput({ weight: 1, distance });
  assert.equal(check(MIN_DISTANCE_KM).isValid, true);
  assert.equal(check(10000).isValid, true);
  assert.equal(check(MIN_DISTANCE_KM - 0.5).error, ERROR_DISTANCE_MIN);
});

test('невідомий тип доставки не проходить перевірку', () => {
  assert.deepEqual(validateCalculationInput({ weight: '1', distance: '100', deliveryType: 'air' }), {
    isValid: false,
    error: ERROR_DELIVERY_TYPE,
  });
});

test('validateDeliveryParams повертає список помилок для сервера', () => {
  assert.deepEqual(validateDeliveryParams(1, 100), []);
  assert.deepEqual(validateDeliveryParams(MIN_WEIGHT_KG / 2, 0), [ERROR_WEIGHT_MIN, ERROR_DISTANCE_MIN]);
});
