import { CALCULATE_DELIVERY_QUERY } from './graphqlQueries.js';

export const ESTIMATE_TIMEOUT_MS = 3000;

export class GraphQLRequestError extends Error {
  constructor(errors) {
    super(errors[0]?.message ?? 'Помилка GraphQL-запиту');
    this.name = 'GraphQLRequestError';
    this.errors = errors;
  }
}

export function createServerEstimator({ url, fetch: fetchImpl = globalThis.fetch, timeoutMs = ESTIMATE_TIMEOUT_MS } = {}) {
  return async ({ weightKg, distanceKm, deliveryType }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    let body;

    try {
      const response = await fetchImpl(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: CALCULATE_DELIVERY_QUERY, variables: { weightKg, distanceKm, deliveryType } }),
        signal: controller.signal,
      });
      body = await response.json();
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }

    if (Array.isArray(body?.errors) && body.errors.length > 0) throw new GraphQLRequestError(body.errors);
    return body?.data?.calculateDelivery ?? null;
  };
}
