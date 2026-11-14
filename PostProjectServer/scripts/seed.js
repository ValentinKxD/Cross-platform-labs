// Наповнення довідників і демо-даних: npm run seed
// Скрипт можна запускати повторно - записи оновлюються, а не дублюються.
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '../services/db.js';
import User from '../models/User.js';
import Branch from '../models/Branch.js';
import Tariff from '../models/Tariff.js';
import Distance, { orderCities } from '../models/Distance.js';
import Waybill from '../models/Waybill.js';
import TrackingEvent from '../models/TrackingEvent.js';
import { calculateDelivery } from '../pricing.js';

// Параметри відтворюють формулу калькулятора: 50 + 15/кг + 2/км, експрес +150 грн і на 1 день швидше
const TARIFFS = [
  { deliveryType: 'standard', name: 'Стандартна', basePrice: 50, pricePerKg: 15, pricePerKm: 2, kmPerDay: 300, daysDiscount: 0 },
  { deliveryType: 'express', name: 'Експрес', basePrice: 200, pricePerKg: 15, pricePerKm: 2, kmPerDay: 300, daysDiscount: 1 },
];

const BRANCHES = [
  { city: 'Київ', number: 1 },
  { city: 'Київ', number: 12 },
  { city: 'Львів', number: 3 },
  { city: 'Львів', number: 7 },
  { city: 'Одеса', number: 2 },
  { city: 'Харків', number: 5 },
  { city: 'Дніпро', number: 4 },
];

// Орієнтовні відстані автошляхами, км
const DISTANCES = [
  ['Київ', 'Львів', 540],
  ['Київ', 'Одеса', 475],
  ['Київ', 'Харків', 480],
  ['Київ', 'Дніпро', 480],
  ['Львів', 'Одеса', 790],
  ['Львів', 'Харків', 1020],
  ['Львів', 'Дніпро', 960],
  ['Одеса', 'Харків', 730],
  ['Одеса', 'Дніпро', 460],
  ['Харків', 'Дніпро', 215],
];

const DEMO_USER = {
  name: 'Валентин Качинський',
  email: 'demo@postproject.ua',
  phone: '+380501234567',
  password: 'postproject',
};

// Відправлення з каркаса особистого кабінету; перше - приклад з картки відстеження
const DEMO_WAYBILLS = [
  {
    trackingNumber: '59001234567890', to: ['Львів', 3], weightKg: 2.5, deliveryType: 'standard',
    events: [['created', '2026-10-12T09:14:00+03:00'], ['accepted', '2026-10-12T18:40:00+03:00'], ['in_transit', '2026-10-13T06:05:00+03:00']],
  },
  {
    trackingNumber: '59001234560012', to: ['Одеса', 2], weightKg: 1.5, deliveryType: 'standard',
    events: [['created', '2026-10-05T10:20:00+03:00'], ['accepted', '2026-10-05T17:05:00+03:00'], ['in_transit', '2026-10-06T07:30:00+03:00'],
      ['arrived', '2026-10-07T09:10:00+03:00'], ['received', '2026-10-07T15:45:00+03:00']],
  },
  {
    trackingNumber: '59001234551177', to: ['Харків', 5], weightKg: 1, deliveryType: 'standard',
    events: [['created', '2026-09-28T12:00:00+03:00'], ['accepted', '2026-09-28T16:30:00+03:00'], ['in_transit', '2026-09-29T06:15:00+03:00'],
      ['arrived', '2026-09-30T08:40:00+03:00'], ['received', '2026-09-30T18:20:00+03:00']],
  },
  {
    trackingNumber: '59001234548803', to: ['Дніпро', 4], weightKg: 3.5, deliveryType: 'standard',
    events: [['created', '2026-09-17T08:45:00+03:00'], ['accepted', '2026-09-17T14:10:00+03:00'], ['in_transit', '2026-09-18T06:00:00+03:00'],
      ['arrived', '2026-09-19T09:30:00+03:00'], ['received', '2026-09-19T13:05:00+03:00']],
  },
];

const AFTER_DEPARTURE = ['arrived', 'received'];

await connectDB(process.env.MONGO_URI);

const tariffs = {};
for (const data of TARIFFS) {
  tariffs[data.deliveryType] = await Tariff.findOneAndUpdate({ deliveryType: data.deliveryType }, data, { upsert: true, new: true });
}
console.log(`Тарифи: ${TARIFFS.length}`);

const branches = {};
for (const data of BRANCHES) {
  branches[`${data.city} ${data.number}`] = await Branch.findOneAndUpdate(data, data, { upsert: true, new: true });
}
console.log(`Відділення: ${BRANCHES.length}`);

for (const [from, to, km] of DISTANCES) {
  const [cityA, cityB] = orderCities(from, to);
  await Distance.findOneAndUpdate({ cityA, cityB }, { cityA, cityB, km }, { upsert: true });
}
console.log(`Відстані між містами: ${DISTANCES.length}`);

let user = await User.findOne({ email: DEMO_USER.email });
if (!user) {
  user = await User.create({
    name: DEMO_USER.name,
    email: DEMO_USER.email,
    phone: DEMO_USER.phone,
    passwordHash: await bcrypt.hash(DEMO_USER.password, 10),
  });
}
console.log(`Демо-користувач: ${DEMO_USER.email} / ${DEMO_USER.phone}, пароль ${DEMO_USER.password}`);

const fromBranch = branches['Київ 12'];
for (const demo of DEMO_WAYBILLS) {
  const toBranch = branches[`${demo.to[0]} ${demo.to[1]}`];
  const tariff = tariffs[demo.deliveryType];
  const [cityA, cityB] = orderCities(fromBranch.city, toBranch.city);
  const { km: distanceKm } = await Distance.findOne({ cityA, cityB });
  const { cost, days } = calculateDelivery(demo.weightKg, distanceKm, tariff);
  const createdAt = new Date(demo.events[0][1]);

  const waybill = await Waybill.findOneAndUpdate(
    { trackingNumber: demo.trackingNumber },
    {
      trackingNumber: demo.trackingNumber,
      lastName: 'Петренко',
      firstName: 'Іван',
      phone: '+380671234567',
      cityFrom: fromBranch.city,
      cityTo: toBranch.city,
      fromBranch: fromBranch._id,
      toBranch: toBranch._id,
      weightKg: demo.weightKg,
      distanceKm,
      deliveryType: demo.deliveryType,
      tariff: tariff._id,
      cost,
      days,
      status: demo.events.at(-1)[0],
      owner: user._id,
      createdAt,
    },
    { upsert: true, new: true, timestamps: false }
  );

  await TrackingEvent.deleteMany({ waybill: waybill._id });
  await TrackingEvent.insertMany(demo.events.map(([status, time]) => ({
    waybill: waybill._id,
    branch: AFTER_DEPARTURE.includes(status) ? toBranch._id : fromBranch._id,
    status,
    eventTime: new Date(time),
  })));
}
console.log(`Демо-накладні: ${DEMO_WAYBILLS.length} (${DEMO_WAYBILLS.map((w) => w.trackingNumber).join(', ')})`);

await mongoose.disconnect();
