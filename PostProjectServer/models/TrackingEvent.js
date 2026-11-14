import mongoose from 'mongoose';
import { WAYBILL_STATUSES } from './Waybill.js';

// Колекція tracking_events (події трекінгу) з ER-діаграми PostProject
const trackingEventSchema = new mongoose.Schema({
  waybill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waybill',
    required: true,
    index: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
  },
  status: {
    type: String,
    enum: WAYBILL_STATUSES,
    required: true,
  },
  eventTime: {
    type: Date,
    default: Date.now,
  },
});

const TrackingEvent = mongoose.model('TrackingEvent', trackingEventSchema, 'tracking_events');

export default TrackingEvent;
