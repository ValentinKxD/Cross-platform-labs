import mongoose from 'mongoose';

// Колекція branches (відділення) з ER-діаграми PostProject
const branchSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true,
  },
  number: {
    type: Number,
    required: true,
    min: 1,
  },
});

branchSchema.index({ city: 1, number: 1 }, { unique: true });

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;
