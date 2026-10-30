import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './services/db.js';
import waybillRoutes from './routes/waybillRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Логування кожного вхідного запиту: метод і адреса
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Тестовий маршрут
app.get('/', (req, res) => {
  res.send('PostProject API працює. Накладні: /api/waybills');
});

// Маршрути електронних накладних
app.use('/api/waybills', waybillRoutes);

// Невідомий маршрут
app.use((req, res) => {
  res.status(404).json({ message: `Маршрут ${req.method} ${req.originalUrl} не знайдено` });
});

// Некоректний JSON у тілі запиту та інші непередбачені помилки
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Некоректний JSON у тілі запиту' });
  }
  console.error(err);
  res.status(500).json({ message: 'Внутрішня помилка сервера' });
});

try {
  await connectDB(process.env.MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Сервер запущено на порті ${PORT}`);
  });
} catch (error) {
  console.error('Не вдалося підключитися до MongoDB:', error.message);
  process.exit(1);
}
