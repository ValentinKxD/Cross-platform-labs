import mongoose from 'mongoose';
import Waybill from '../models/Waybill.js';
import { calculateDelivery, generateTrackingNumber } from '../services/pricing.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);


function pickWaybillData(body) {
  const weightKg = Number(body.weightKg);
  const distanceKm = Number(body.distanceKm);
  const deliveryType = body.deliveryType ?? 'standard';
  const { cost, days } = calculateDelivery(weightKg, distanceKm, deliveryType);

  const data = {
    lastName: body.lastName,
    firstName: body.firstName,
    phone: body.phone,
    cityFrom: body.cityFrom,
    cityTo: body.cityTo,
    weightKg,
    distanceKm,
    deliveryType,
    cost,
    days,
  };
  if (body.status !== undefined) data.status = body.status;
  return data;
}


export async function getWaybills(req, res) {
  try {
    const waybills = await Waybill.find().sort({ createdAt: -1 });
    res.status(200).json(waybills);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера під час отримання накладних', error: error.message });
  }
}


export async function getWaybillById(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Некоректний формат id накладної' });
    }

    const waybill = await Waybill.findById(id);
    if (!waybill) {
      return res.status(404).json({ message: 'Накладну не знайдено' });
    }
    res.status(200).json(waybill);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера під час отримання накладної', error: error.message });
  }
}


export async function getWaybillByTrackingNumber(req, res) {
  try {
    const waybill = await Waybill.findOne({ trackingNumber: req.params.trackingNumber });
    if (!waybill) {
      return res.status(404).json({ message: 'Накладну з таким номером не знайдено' });
    }
    res.status(200).json(waybill);
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера під час відстеження', error: error.message });
  }
}


export async function createWaybill(req, res) {
  try {
    const waybill = await Waybill.create({
      ...pickWaybillData(req.body),
      trackingNumber: generateTrackingNumber(),
    });
    res.status(201).json(waybill);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Помилка валідації', error: error.message });
    }
    res.status(500).json({ message: 'Помилка сервера під час створення накладної', error: error.message });
  }
}


export async function updateWaybill(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Некоректний формат id накладної' });
    }

    const waybill = await Waybill.findByIdAndUpdate(id, pickWaybillData(req.body), {
      new: true,
      runValidators: true,
    });
    if (!waybill) {
      return res.status(404).json({ message: 'Накладну не знайдено' });
    }
    res.status(200).json(waybill);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Помилка валідації', error: error.message });
    }
    res.status(500).json({ message: 'Помилка сервера під час оновлення накладної', error: error.message });
  }
}


export async function deleteWaybill(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Некоректний формат id накладної' });
    }

    const waybill = await Waybill.findByIdAndDelete(id);
    if (!waybill) {
      return res.status(404).json({ message: 'Накладну не знайдено' });
    }
    res.status(200).json({
      message: `Накладну ${waybill.trackingNumber} успішно видалено`,
      id: waybill._id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Помилка сервера під час видалення накладної', error: error.message });
  }
}
