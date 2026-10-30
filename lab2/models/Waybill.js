import mongoose from 'mongoose';
import { DELIVERY_TYPES } from '../services/pricing.js';

export const WAYBILL_STATUSES = ['created', 'in_transit', 'arrived', 'received'];


const waybillSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{14}$/, 'Номер накладної має складатися з 14 цифр'],
    },
    lastName: {
      type: String,
      required: [true, 'Прізвище є обов\'язковим'],
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'Ім\'я є обов\'язковим'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Номер телефону є обов\'язковим'],
      trim: true,
      match: [/^\+380\d{9}$/, 'Телефон має бути у форматі +380XXXXXXXXX'],
    },
    cityFrom: {
      type: String,
      required: [true, 'Місто відправлення є обов\'язковим'],
      trim: true,
    },
    cityTo: {
      type: String,
      required: [true, 'Місто отримання є обов\'язковим'],
      trim: true,
    },
    weightKg: {
      type: Number,
      required: true,
      min: [0.1, 'Вага має бути не менше 0.1 кг'],
    },
    distanceKm: {
      type: Number,
      required: true,
      min: [1, 'Відстань має бути не менше 1 км'],
    },
    deliveryType: {
      type: String,
      enum: DELIVERY_TYPES,
      default: 'standard',
    },
    cost: { type: Number, required: true },  
    days: { type: Number, required: true },  
    status: {
      type: String,
      enum: WAYBILL_STATUSES,
      default: 'created',
    },
  },
  { timestamps: true } 
);

const Waybill = mongoose.model('Waybill', waybillSchema);

export default Waybill;
