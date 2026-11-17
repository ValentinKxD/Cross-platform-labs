import { isBlank } from './calculationValidation.js';

export const PHONE_PATTERN = /^\+380\d{9}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

export const ERROR_PHONE_FORMAT = 'Телефон має бути у форматі +380XXXXXXXXX';
export const ERROR_NAME_REQUIRED = "Ім'я є обов'язковим";
export const ERROR_EMAIL_FORMAT = 'Вкажіть коректний email';
export const ERROR_PASSWORD_LENGTH = `Пароль має містити щонайменше ${MIN_PASSWORD_LENGTH} символів`;
export const ERROR_PASSWORD_MISMATCH = 'Паролі не збігаються';
export const ERROR_REGISTRATION_EMPTY = "Заповніть ім'я, email і пароль";
export const ERROR_LOGIN_EMPTY = 'Вкажіть email або телефон і пароль';

export function normalizePhone(value) {
  if (typeof value !== 'string') return value;
  const digits = value.replace(/[\s()-]/g, '');
  if (/^0\d{9}$/.test(digits)) return `+38${digits}`;
  if (/^380\d{9}$/.test(digits)) return `+${digits}`;
  return digits;
}

export const isValidPhone = (value) => PHONE_PATTERN.test(normalizePhone(value));

export const isValidEmail = (value) => typeof value === 'string' && EMAIL_PATTERN.test(value.trim());

export function normalizeEmail(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

export function validateProfileInput({ name, email, phone } = {}) {
  const errors = [];
  if (isBlank(name)) errors.push(ERROR_NAME_REQUIRED);
  if (!isValidEmail(email)) errors.push(ERROR_EMAIL_FORMAT);
  if (!isBlank(phone) && !isValidPhone(phone)) errors.push(ERROR_PHONE_FORMAT);
  return errors;
}

export function validateRegistrationInput({ name, email, phone, password, passwordRepeat } = {}) {
  if (isBlank(name) || isBlank(email) || !password) return [ERROR_REGISTRATION_EMPTY];
  if (passwordRepeat !== undefined && password !== passwordRepeat) return [ERROR_PASSWORD_MISMATCH];

  const errors = validateProfileInput({ name, email, phone });
  if (password.length < MIN_PASSWORD_LENGTH) errors.push(ERROR_PASSWORD_LENGTH);
  return errors;
}

export function validateLoginInput({ login, password } = {}) {
  return isBlank(login) || !password ? ERROR_LOGIN_EMPTY : null;
}

export function loginLookup(login) {
  const value = String(login ?? '').trim();
  return value.includes('@') ? { email: value.toLowerCase() } : { phone: normalizePhone(value) };
}
