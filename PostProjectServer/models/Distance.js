import mongoose from 'mongoose';

// Довідник відстаней між містами, у яких є відділення.
// Пара міст зберігається один раз в алфавітному порядку (cityA < cityB).
const distanceSchema = new mongoose.Schema({
  cityA: { type: String, required: true, trim: true },
  cityB: { type: String, required: true, trim: true },
  km: { type: Number, required: true, min: 1 },
});

distanceSchema.index({ cityA: 1, cityB: 1 }, { unique: true });

export function orderCities(cityFrom, cityTo) {
  return [cityFrom, cityTo].sort((a, b) => a.localeCompare(b, 'uk'));
}

const Distance = mongoose.model('Distance', distanceSchema);

export default Distance;
