const pad = (value) => String(value).padStart(2, '0');

const toDate = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return '';
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return '';
  return `${formatDate(value)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDays(days) {
  const last = days % 10;
  const lastTwo = days % 100;
  if (last === 1 && lastTwo !== 11) return `${days} день`;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${days} дні`;
  return `${days} днів`;
}

export function formatWeight(weightKg) {
  return String(weightKg).replace('.', ',');
}

export function formatCost(cost) {
  return `${cost} ₴`;
}

export function formatRoute(cityFrom, cityTo) {
  return `${cityFrom} ➔ ${cityTo}`;
}

export const ERROR_SERVER_UNAVAILABLE = 'Сервер недоступний. Перевірте, чи запущено GraphQL API.';

export function graphQLErrorMessages(errors) {
  const [first] = errors;
  const details = first?.extensions?.errors;
  if (Array.isArray(details) && details.length > 0) return details.map(String);
  return errors.map((item) => item.message);
}

export function errorMessages(error) {
  if (error && Array.isArray(error.errors) && error.errors.length > 0) {
    return graphQLErrorMessages(error.errors);
  }
  return [ERROR_SERVER_UNAVAILABLE];
}
