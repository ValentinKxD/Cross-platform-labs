import { GraphQLError } from 'graphql';
import { generateTrackingNumber as randomTrackingNumber, orderCities } from '@postproject/core';
import Tariff from './models/Tariff.js';
import Distance from './models/Distance.js';
import Waybill from './models/Waybill.js';

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

export async function generateTrackingNumber() {
  let trackingNumber = randomTrackingNumber();
  while (await Waybill.exists({ trackingNumber })) {
    trackingNumber = randomTrackingNumber();
  }
  return trackingNumber;
}
