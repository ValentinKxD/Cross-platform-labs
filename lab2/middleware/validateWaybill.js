import { DELIVERY_TYPES } from '../services/pricing.js';
import { WAYBILL_STATUSES } from '../models/Waybill.js';

const REQUIRED_TEXT_FIELDS = {
  lastName: 'прізвище',
  firstName: 'ім\'я',
  phone: 'номер телефону',
  cityFrom: 'місто відправлення',
  cityTo: 'місто отримання',
};

const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

export function validateWaybill(req, res, next) {
  const body = req.body ?? {};
  const errors = [];

  for (const [field, label] of Object.entries(REQUIRED_TEXT_FIELDS)) {
    if (isBlank(body[field])) {
      errors.push(`Поле "${field}" (${label}) є обов'язковим і не може бути порожнім`);
    }
  }

  if (!isBlank(body.phone) && !/^\+380\d{9}$/.test(body.phone.trim())) {
    errors.push('Телефон має бути у форматі +380XXXXXXXXX');
  }

  if (
    !isBlank(body.cityFrom) &&
    !isBlank(body.cityTo) &&
    body.cityFrom.trim().toLowerCase() === body.cityTo.trim().toLowerCase()
  ) {
    errors.push('Місто відправлення та місто отримання мають відрізнятися');
  }

  const weight = Number(body.weightKg);
  if (body.weightKg === undefined || body.weightKg === '' || !Number.isFinite(weight) || weight < 0.1) {
    errors.push('Поле "weightKg" (вага, кг) має бути числом не менше 0.1');
  }

  const distance = Number(body.distanceKm);
  if (body.distanceKm === undefined || body.distanceKm === '' || !Number.isFinite(distance) || distance < 1) {
    errors.push('Поле "distanceKm" (відстань, км) має бути числом не менше 1');
  }

  if (body.deliveryType !== undefined && !DELIVERY_TYPES.includes(body.deliveryType)) {
    errors.push(`Поле "deliveryType" може мати значення: ${DELIVERY_TYPES.join(', ')}`);
  }

  if (body.status !== undefined && !WAYBILL_STATUSES.includes(body.status)) {
    errors.push(`Поле "status" може мати значення: ${WAYBILL_STATUSES.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Помилка валідації даних накладної', errors });
  }

  next();
}
