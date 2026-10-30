import jwt from 'jsonwebtoken';
import { users } from './data.js';

// У навчальному проєкті секрет зберігається в коді, у реальному - лише у змінних середовища
export const JWT_SECRET = 'postproject-lab3-secret';

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
