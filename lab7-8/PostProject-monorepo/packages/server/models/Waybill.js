import mongoose from 'mongoose';
import {
  DELIVERY_TYPES,
  ERROR_DISTANCE_MIN,
  ERROR_PHONE_FORMAT,
  ERROR_TRACKING_NUMBER,
  ERROR_WEIGHT_MIN,
  MIN_DISTANCE_KM,
  MIN_WEIGHT_KG,
  PHONE_PATTERN,
  TRACKING_NUMBER_PATTERN,
  WAYBILL_STATUSES,
} from '@postproject/core';

const waybillSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      match: [TRACKING_NUMBER_PATTERN, ERROR_TRACKING_NUMBER],
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
      match: [PHONE_PATTERN, ERROR_PHONE_FORMAT],
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
      min: [MIN_WEIGHT_KG, ERROR_WEIGHT_MIN],
    },
    distanceKm: {
      type: Number,
      required: true,
      min: [MIN_DISTANCE_KM, ERROR_DISTANCE_MIN],
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
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fromBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    toBranch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
    },
    tariff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tariff',
    },
  },
  { timestamps: true }
);

const Waybill = mongoose.model('Waybill', waybillSchema);

export default Waybill;
