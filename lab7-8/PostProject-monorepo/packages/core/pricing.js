export const DELIVERY_TYPES = ['standard', 'express'];

export const TARIFFS = {
  standard: { deliveryType: 'standard', name: 'Стандартна', basePrice: 50, pricePerKg: 15, pricePerKm: 2, kmPerDay: 300, daysDiscount: 0 },
  express: { deliveryType: 'express', name: 'Експрес', basePrice: 200, pricePerKg: 15, pricePerKm: 2, kmPerDay: 300, daysDiscount: 1 },
};

export const DELIVERY_TYPE_OPTIONS = DELIVERY_TYPES.map((value) => ({ value, label: TARIFFS[value].name }));

export function isDeliveryType(value) {
  return DELIVERY_TYPES.includes(value);
}

export function deliveryTypeTitle(deliveryType) {
  return isDeliveryType(deliveryType) ? TARIFFS[deliveryType].name : '';
}

export function calculateDelivery(weightKg, distanceKm, tariff) {
  const rates = typeof tariff === 'string' ? TARIFFS[tariff] : tariff;
  if (!rates) throw new Error(`Невідомий тип доставки: ${tariff}`);

  const cost = rates.basePrice + weightKg * rates.pricePerKg + distanceKm * rates.pricePerKm;
  const days = Math.max(1, Math.ceil(distanceKm / rates.kmPerDay) - rates.daysDiscount);

  return { cost: Math.round(cost), days };
}
