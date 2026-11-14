import type { DeliveryType } from './graphql';

export interface DeliveryEstimate {
  cost: number;
  days: number;
}

const TARIFFS: Record<DeliveryType, { basePrice: number; pricePerKg: number; pricePerKm: number; kmPerDay: number; daysDiscount: number }> = {
  standard: { basePrice: 50, pricePerKg: 15, pricePerKm: 2, kmPerDay: 300, daysDiscount: 0 },
  express: { basePrice: 200, pricePerKg: 15, pricePerKm: 2, kmPerDay: 300, daysDiscount: 1 },
};

export function validateDelivery(weightKg: number, distanceKm: number): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(weightKg) || weightKg < 0.1) errors.push('Вага має бути не менше 0,1 кг.');
  if (!Number.isFinite(distanceKm) || distanceKm < 1) errors.push('Відстань має бути не менше 1 км.');
  return errors;
}

export function calculateDeliveryLocally(weightKg: number, distanceKm: number, deliveryType: DeliveryType): DeliveryEstimate {
  const tariff = TARIFFS[deliveryType];
  const cost = tariff.basePrice + weightKg * tariff.pricePerKg + distanceKm * tariff.pricePerKm;
  const days = Math.max(1, Math.ceil(distanceKm / tariff.kmPerDay) - tariff.daysDiscount);
  return { cost: Math.round(cost), days };
}
