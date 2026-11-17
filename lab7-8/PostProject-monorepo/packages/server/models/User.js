import mongoose from 'mongoose';
import { ERROR_PHONE_FORMAT, PHONE_PATTERN } from '@postproject/core';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Ім\'я є обов\'язковим'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email є обов\'язковим'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [PHONE_PATTERN, ERROR_PHONE_FORMAT],
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });

const User = mongoose.model('User', userSchema);

export default User;
