import mongoose from 'mongoose';

/**
 * Підключення до MongoDB (MongoDB Atlas) через Mongoose.
 * @param {string} uri рядок підключення з .env (MONGO_URI)
 */
export async function connectDB(uri) {
  if (!uri) {
    throw new Error('Не задано рядок підключення MONGO_URI у файлі .env');
  }

  await mongoose.connect(uri);
  console.log(`Підключено до MongoDB (база: ${mongoose.connection.name})`);
}
