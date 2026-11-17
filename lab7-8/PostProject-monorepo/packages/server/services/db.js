import mongoose from 'mongoose';

export async function connectDB(uri) {
  if (!uri) {
    throw new Error('Не задано рядок підключення MONGO_URI у файлі .env');
  }

  await mongoose.connect(uri);
  console.log(`Підключено до MongoDB (база: ${mongoose.connection.name})`);
}
