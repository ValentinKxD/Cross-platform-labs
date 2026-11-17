import mongoose from 'mongoose';
import { DELIVERY_TYPES } from '@postproject/core';

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
  daysDiscount: { type: Number, default: 0, min: 0 },
});

const Tariff = mongoose.model('Tariff', tariffSchema);

export default Tariff;
