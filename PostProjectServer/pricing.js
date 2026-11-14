// Розрахунок вартості та днів доставки за тарифом з колекції tariffs.
// Значення тарифів у scripts/seed.js відтворюють формулу калькулятора PostProject:
// 50 грн + 15 грн/кг + 2 грн/км, експрес +150 грн і на 1 день швидше.
import { GraphQLError } from 'graphql';
import Tariff from './models/Tariff.js';
import Distance, { orderCities } from './models/Distance.js';
import Waybill from './models/Waybill.js';

export function calculateDelivery(weightKg, distanceKm, tariff) {
  const cost = tariff.basePrice + weightKg * tariff.pricePerKg + distanceKm * tariff.pricePerKm;
  const days = Math.max(1, Math.ceil(distanceKm / tariff.kmPerDay) - tariff.daysDiscount);

  return { cost: Math.round(cost), days };
}

export async function findTariff(deliveryType) {
  const tariff = await Tariff.findOne({ deliveryType }).exec();
  if (!tariff) {
    throw new GraphQLError(`Тариф "${deliveryType}" не знайдено. Виконайте npm run seed.`, {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  return tariff;
}

export async function findDistanceKm(cityFrom, cityTo) {
  const [cityA, cityB] = orderCities(cityFrom, cityTo);
  const distance = await Distance.findOne({ cityA, cityB }).exec();
  if (!distance) {
    throw new GraphQLError(`Відстань між містами ${cityFrom} і ${cityTo} невідома.`, {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  return distance.km;
}

function randomTrackingNumber() {
  return Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
}

// Номер накладної має бути унікальним у колекції waybills
export async function generateTrackingNumber() {
  let trackingNumber = randomTrackingNumber();
  while (await Waybill.exists({ trackingNumber })) {
    trackingNumber = randomTrackingNumber();
  }
  return trackingNumber;
}
