// Перевірка даних накладної та профілю - правила з middleware validateWaybill.js ЛР №2.
// Типи полів перевіряє сама GraphQL-схема, тут лишаються правила предметної області.

const REQUIRED_TEXT_FIELDS = {
  lastName: 'прізвище',
  firstName: 'ім\'я',
  phone: 'номер телефону',
};

const PHONE_PATTERN = /^\+380\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBlank = (value) => typeof value !== 'string' || value.trim() === '';

// Приводить номер до формату +380XXXXXXXXX: прибирає пробіли, дужки, дефіси,
// дописує +38 до номера, введеного як 0XXXXXXXXX
export function normalizePhone(value) {
  if (typeof value !== 'string') return value;
  const digits = value.replace(/[\s()-]/g, '');
  if (/^0\d{9}$/.test(digits)) return `+38${digits}`;
  if (/^380\d{9}$/.test(digits)) return `+${digits}`;
  return digits;
}

export const isValidPhone = (value) => PHONE_PATTERN.test(value);

export function validateWaybillInput(input, fromBranch, toBranch) {
  const errors = [];

  for (const [field, label] of Object.entries(REQUIRED_TEXT_FIELDS)) {
    if (isBlank(input[field])) {
      errors.push(`Поле "${field}" (${label}) є обов'язковим і не може бути порожнім`);
    }
  }

  if (!isBlank(input.phone) && !isValidPhone(normalizePhone(input.phone))) {
    errors.push('Телефон має бути у форматі +380XXXXXXXXX');
  }

  if (!fromBranch) errors.push('Оберіть відділення відправлення');
  if (!toBranch) errors.push('Оберіть відділення отримання');

  if (fromBranch && toBranch && fromBranch.city === toBranch.city) {
    errors.push('Місто відправлення та місто отримання мають відрізнятися');
  }

  if (!Number.isFinite(input.weightKg) || input.weightKg < 0.1) {
    errors.push('Поле "weightKg" (вага, кг) має бути числом не менше 0.1');
  }

  return errors;
}

export function validateProfileInput({ name, email, phone }) {
  const errors = [];

  if (isBlank(name)) errors.push('Ім\'я є обов\'язковим');
  if (isBlank(email) || !EMAIL_PATTERN.test(email.trim())) errors.push('Вкажіть коректний email');
  if (!isBlank(phone) && !isValidPhone(normalizePhone(phone))) {
    errors.push('Телефон має бути у форматі +380XXXXXXXXX');
  }

  return errors;
}
