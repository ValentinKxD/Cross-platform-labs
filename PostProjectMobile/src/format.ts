import { CombinedGraphQLErrors } from '@apollo/client';

const pad = (value: number) => String(value).padStart(2, '0');

export function formatDate(iso: string) {
  const date = new Date(iso);
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  return `${formatDate(iso)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function daysLabel(days: number) {
  const last = days % 10;
  const lastTwo = days % 100;
  if (last === 1 && lastTwo !== 11) return `${days} день`;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return `${days} дні`;
  return `${days} днів`;
}

export function errorMessages(error: unknown): string[] {
  if (CombinedGraphQLErrors.is(error)) {
    const [first] = error.errors;
    const details = first?.extensions?.errors;
    if (Array.isArray(details) && details.length > 0) return details.map(String);
    return error.errors.map((item) => item.message);
  }
  return ['Сервер недоступний. Перевірте, чи запущено GraphQL API.'];
}
