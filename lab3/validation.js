// Перевірка даних накладної - перенесено з middleware validateWaybill.js ЛР №2.
// Типи полів перевіряє сама GraphQL-схема, тут лишаються правила предметної області.

const REQUIRED_TEXT_FIELDS = {
  lastName: 'прізвище',
  firstName: 'ім\'я',
  phone: 'номер телефону',
  cityFrom: 'місто відправлення',
  cityTo: 'місто отримання',
};

const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

export function validateWaybillInput(input) {
  const errors = [];

  for (const [field, label] of Object.entries(REQUIRED_TEXT_FIELDS)) {
    if (isBlank(input[field])) {
      errors.push(`Поле "${field}" (${label}) є обов'язковим і не може бути порожнім`);
    }
  }

  if (!isBlank(input.phone) && !/^\+380\d{9}$/.test(input.phone.trim())) {
    errors.push('Телефон має бути у форматі +380XXXXXXXXX');
  }

  if (
    !isBlank(input.cityFrom) &&
    !isBlank(input.cityTo) &&
    input.cityFrom.trim().toLowerCase() === input.cityTo.trim().toLowerCase()
  ) {
    errors.push('Місто відправлення та місто отримання мають відрізнятися');
  }

  if (!Number.isFinite(input.weightKg) || input.weightKg < 0.1) {
    errors.push('Поле "weightKg" (вага, кг) має бути числом не менше 0.1');
  }

  if (!Number.isFinite(input.distanceKm) || input.distanceKm < 1) {
    errors.push('Поле "distanceKm" (відстань, км) має бути числом не менше 1');
  }

  return errors;
}
