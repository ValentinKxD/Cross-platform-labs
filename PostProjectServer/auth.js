import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './models/User.js';

// Секрет підпису береться з .env, значення в коді - лише запасне для навчального запуску
export const JWT_SECRET = process.env.JWT_SECRET || 'postproject-lab3-secret';

// «Запам'ятати мене» - токен діє 7 днів замість 1 години
export function createToken(user, remember = false) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: remember ? '7d' : '1h' });
}

export async function getUserFromToken(token) {
  if (!token) return null;

  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    if (!mongoose.Types.ObjectId.isValid(userId)) return null;
    return await User.findById(userId);
  } catch {
    return null;
  }
}

export async function getUserFromAuthHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  return getUserFromToken(token);
}
