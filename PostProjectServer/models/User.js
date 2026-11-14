import mongoose from 'mongoose';

// Колекція users з ER-діаграми PostProject
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
    // Номер телефону потрібен для входу «Email або номер телефону»
    phone: {
      type: String,
      trim: true,
      match: [/^\+380\d{9}$/, 'Телефон має бути у форматі +380XXXXXXXXX'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Унікальний лише серед користувачів, у яких телефон указано
userSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: 'string' } } });

const User = mongoose.model('User', userSchema);

export default User;
