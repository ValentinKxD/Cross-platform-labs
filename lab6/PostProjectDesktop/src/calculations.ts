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

export async function loadCalculations(): Promise<Calculation[]> {
  try {
    return await window.calculationsAPI.loadCalculations();
  } catch {
    return [];
  }
}

export async function saveCalculations(calculations: Calculation[]): Promise<boolean> {
  try {
    return await window.calculationsAPI.saveCalculations(calculations);
  } catch {
    return false;
  }
}
