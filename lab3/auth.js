import jwt from 'jsonwebtoken';
import { users } from './data.js';

// Секрет береться зі змінної середовища (docker run -e JWT_SECRET=...),
// значення за замовчуванням - лише для локального запуску без Docker
export const JWT_SECRET = process.env.JWT_SECRET || 'postproject-lab3-secret';

export function createToken(user) {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
}

export function getUserFromToken(token) {
  if (!token) return null;

  try {
    const { userId } = jwt.verify(token, JWT_SECRET);
    return users.find((user) => user.id === userId) ?? null;
  } catch {
    return null;
  }
}

export function getUserFromAuthHeader(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  return getUserFromToken(token);
}
