import mongoose from 'mongoose';

export const DELIVERY_TYPES = ['standard', 'express'];

// Колекція tariffs з ER-діаграми PostProject.
// Крім ціни за кілограм зберігає решту параметрів формули калькулятора,
// щоб вартість і дні доставки рахувалися за тарифом із бази даних.
const tariffSchema = new mongoose.Schema({
  deliveryType: {
    type: String,
    enum: DELIVERY_TYPES,
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  basePrice: { type: Number, required: true, min: 0 },
  pricePerKg: { type: Number, required: true, min: 0 },
  pricePerKm: { type: Number, required: true, min: 0 },
  kmPerDay: { type: Number, required: true, min: 1 },
  // На скільки днів швидше за стандартну доставку (експрес - на 1 день)
  daysDiscount: { type: Number, default: 0, min: 0 },
});

const Tariff = mongoose.model('Tariff', tariffSchema);

export default Tariff;
