import type { DeliveryType } from './graphql';

export interface Calculation {
  id: number;
  weightKg: number;
  distanceKm: number;
  deliveryType: DeliveryType;
  cost: number;
  days: number;
  createdAt: string;
  issued: boolean;
}

export const DELIVERY_TYPE_TITLES: Record<DeliveryType, string> = {
  standard: 'Стандартна',
  express: 'Експрес',
};

const STORAGE_KEY = 'postproject-calculations';

export function loadCalculations(): Calculation[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveCalculations(calculations: Calculation[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
  } catch {
    return;
  }
}
