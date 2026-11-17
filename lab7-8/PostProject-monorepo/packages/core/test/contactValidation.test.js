import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ERROR_EMAIL_FORMAT,
  ERROR_LOGIN_EMPTY,
  ERROR_NAME_REQUIRED,
  ERROR_PASSWORD_LENGTH,
  ERROR_PASSWORD_MISMATCH,
  ERROR_PHONE_FORMAT,
  ERROR_REGISTRATION_EMPTY,
  MIN_PASSWORD_LENGTH,
  loginLookup,
  normalizePhone,
  validateLoginInput,
  validateProfileInput,
  validateRegistrationInput,
} from '@postproject/core';

test('normalizePhone приводить номер до формату +380XXXXXXXXX', () => {
  assert.equal(normalizePhone('050 123-45-67'), '+380501234567');
  assert.equal(normalizePhone('380501234567'), '+380501234567');
  assert.equal(normalizePhone('+38 (050) 123 45 67'), '+380501234567');
});

test('validateProfileInput перевіряє ім’я, email і необов’язковий телефон', () => {
  assert.deepEqual(validateProfileInput({ name: 'Валентин', email: 'demo@postproject.ua', phone: '' }), []);
  assert.deepEqual(validateProfileInput({ name: ' ', email: 'demo', phone: '123' }), [
    ERROR_NAME_REQUIRED,
    ERROR_EMAIL_FORMAT,
    ERROR_PHONE_FORMAT,
  ]);
});

test('validateRegistrationInput: порожні поля, різні паролі та короткий пароль', () => {
  const base = { name: 'Валентин', email: 'demo@postproject.ua', phone: '', password: 'secret1', passwordRepeat: 'secret1' };
  assert.deepEqual(validateRegistrationInput(base), []);
  assert.deepEqual(validateRegistrationInput({ ...base, email: '' }), [ERROR_REGISTRATION_EMPTY]);
  assert.deepEqual(validateRegistrationInput({ ...base, passwordRepeat: 'other' }), [ERROR_PASSWORD_MISMATCH]);
  const short = 'x'.repeat(MIN_PASSWORD_LENGTH - 1);
  assert.deepEqual(validateRegistrationInput({ ...base, password: short, passwordRepeat: short }), [ERROR_PASSWORD_LENGTH]);
});

test('validateLoginInput і loginLookup: вхід за email або телефоном', () => {
  assert.equal(validateLoginInput({ login: ' ', password: 'x' }), ERROR_LOGIN_EMPTY);
  assert.equal(validateLoginInput({ login: 'demo@postproject.ua', password: 'x' }), null);
  assert.deepEqual(loginLookup(' Demo@PostProject.ua '), { email: 'demo@postproject.ua' });
  assert.deepEqual(loginLookup('0501234567'), { phone: '+380501234567' });
});
