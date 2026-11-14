import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DeliveryType } from './graphql';

export interface Calculation {
  id: string;
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

export async function loadCalculations(): Promise<Calculation[]> {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export async function saveCalculations(calculations: Calculation[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(calculations));
  } catch {
    return;
  }
}
