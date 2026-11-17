import mongoose from 'mongoose';

const distanceSchema = new mongoose.Schema({
  cityA: { type: String, required: true, trim: true },
  cityB: { type: String, required: true, trim: true },
  km: { type: Number, required: true, min: 1 },
});

distanceSchema.index({ cityA: 1, cityB: 1 }, { unique: true });

const Distance = mongoose.model('Distance', distanceSchema);

export default Distance;
