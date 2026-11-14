import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { GraphQLError } from 'graphql';
import User from './models/User.js';
import Branch from './models/Branch.js';
import Tariff from './models/Tariff.js';
import Waybill, { WAYBILL_STATUSES } from './models/Waybill.js';
import TrackingEvent from './models/TrackingEvent.js';
import { createToken } from './auth.js';
import { calculateDelivery, findTariff, findDistanceKm, generateTrackingNumber } from './pricing.js';
import { validateWaybillInput, validateProfileInput, normalizePhone } from './validation.js';

const STATUS_TITLES = {
  created: 'Створено',
  accepted: 'Прийнято',
  in_transit: 'У дорозі',
  arrived: 'Прибуло',
  received: 'Отримано',
};

const EVENT_TITLES = {
  created: 'Створено накладну',
  accepted: 'Прийнято у відділенні',
  in_transit: 'Відправлено до міста отримувача',
  arrived: 'Прибуло у відділення',
  received: 'Отримано',
};

const DAY_MS = 24 * 60 * 60 * 1000;

function requireAuth(context) {
  if (!context.user) {
    throw new GraphQLError('Потрібна авторизація.', {
      extensions: { code: 'UNAUTHENTICATED' },
    });
  }
  return context.user;
}

function badInput(message, errors) {
  return new GraphQLError(message, {
    extensions: { code: 'BAD_USER_INPUT', errors },
  });
}

function checkId(id, label = 'накладної') {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw badInput(`Некоректний формат id ${label}`);
  }
}

// Перевіряє, що накладна існує і належить поточному користувачу
async function findOwnWaybill(id, user) {
  checkId(id);
  const waybill = await Waybill.findById(id).exec();
  if (!waybill) return null;

  if (!waybill.owner || !waybill.owner.equals(user._id)) {
    throw new GraphQLError('Змінювати чи видаляти можна лише власні накладні.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return waybill;
}

async function findBranch(id) {
  return mongoose.Types.ObjectId.isValid(id) ? Branch.findById(id).exec() : null;
}

// Помилки валідації Mongoose (зокрема унікальних полів) перетворюються на BAD_USER_INPUT
async function save(doc) {
  try {
    return await doc.save();
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw badInput('Помилка валідації', Object.values(error.errors).map((e) => e.message));
    }
    if (error.code === 11000) {
      throw badInput('Користувач з таким email або телефоном вже існує.');
    }
    throw error;
  }
}

// Подія трекінгу: до відправлення посилка у відділенні відправлення, після - у відділенні отримання
function eventBranch(waybill, status) {
  return ['arrived', 'received'].includes(status) ? waybill.toBranch : waybill.fromBranch;
}

export const resolvers = {
  Query: {
    users: () => User.find().sort({ createdAt: 1 }).exec(),

    me: (parent, args, context) => context.user,

    branches: () => Branch.find().sort({ city: 1, number: 1 }).exec(),

    tariffs: () => Tariff.find().sort({ basePrice: 1 }).exec(),

    calculateDelivery: async (parent, { weightKg, distanceKm, deliveryType }) => {
      const errors = [];
      if (!Number.isFinite(weightKg) || weightKg < 0.1) errors.push('Вага має бути не менше 0.1 кг');
      if (!Number.isFinite(distanceKm) || distanceKm < 1) errors.push('Відстань має бути не менше 1 км');
      if (errors.length > 0) throw badInput('Помилка валідації даних розрахунку', errors);

      return calculateDelivery(weightKg, distanceKm, await findTariff(deliveryType));
    },

    waybills: () => Waybill.find().sort({ createdAt: -1 }).exec(),

    waybill: (parent, { id }) => {
      checkId(id);
      return Waybill.findById(id).exec();
    },

    trackWaybill: (parent, { trackingNumber }) =>
      Waybill.findOne({ trackingNumber: trackingNumber.replace(/\s/g, '') }).exec(),

    myWaybills: (parent, args, context) => {
      const user = requireAuth(context);
      return Waybill.find({ owner: user._id }).sort({ createdAt: -1 }).exec();
    },
  },

  Mutation: {
    register: async (parent, { name, email, phone, password }) => {
      const profile = { name, email, phone };
      const errors = validateProfileInput(profile);
      if (password.length < 6) errors.push('Пароль має містити щонайменше 6 символів');
      if (errors.length > 0) throw badInput('Помилка валідації даних користувача', errors);

      const normalizedEmail = email.trim().toLowerCase();
      if (await User.exists({ email: normalizedEmail })) {
        throw badInput('Користувач з таким email вже існує.');
      }

      const user = new User({
        name: name.trim(),
        email: normalizedEmail,
        phone: phone ? normalizePhone(phone) : undefined,
        passwordHash: await bcrypt.hash(password, 10),
      });
      await save(user);

      return { token: createToken(user), user };
    },

    login: async (parent, { login, password, remember }) => {
      const value = login.trim();
      const query = value.includes('@') ? { email: value.toLowerCase() } : { phone: normalizePhone(value) };
      const user = await User.findOne(query).exec();
      const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

      if (!isValid) {
        throw new GraphQLError('Невірний логін або пароль. Спробуйте ще раз.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return { token: createToken(user, remember), user };
    },

    updateProfile: async (parent, { name, email, phone }, context) => {
      const user = requireAuth(context);
      const errors = validateProfileInput({ name, email, phone });
      if (errors.length > 0) throw badInput('Помилка валідації даних профілю', errors);

      user.name = name.trim();
      user.email = email.trim().toLowerCase();
      user.phone = phone && phone.trim() !== '' ? normalizePhone(phone) : undefined;
      return save(user);
    },

    createWaybill: async (parent, { input }, context) => {
      const user = requireAuth(context);

      const fromBranch = await findBranch(input.fromBranchId);
      const toBranch = await findBranch(input.toBranchId);
      const errors = validateWaybillInput(input, fromBranch, toBranch);
      if (errors.length > 0) {
        throw badInput('Помилка валідації даних накладної', errors);
      }

      const tariff = await findTariff(input.deliveryType ?? 'standard');
      const distanceKm = await findDistanceKm(fromBranch.city, toBranch.city);
      const { cost, days } = calculateDelivery(input.weightKg, distanceKm, tariff);

      const waybill = new Waybill({
        trackingNumber: await generateTrackingNumber(),
        lastName: input.lastName.trim(),
        firstName: input.firstName.trim(),
        phone: normalizePhone(input.phone),
        cityFrom: fromBranch.city,
        cityTo: toBranch.city,
        fromBranch: fromBranch._id,
        toBranch: toBranch._id,
        weightKg: input.weightKg,
        distanceKm,
        deliveryType: tariff.deliveryType,
        tariff: tariff._id,
        cost,
        days,
        owner: user._id,
      });
      await save(waybill);

      await TrackingEvent.create({
        waybill: waybill._id,
        branch: fromBranch._id,
        status: 'created',
        eventTime: waybill.createdAt,
      });

      return waybill;
    },

    updateWaybillStatus: async (parent, { id, status }, context) => {
      const user = requireAuth(context);
      const waybill = await findOwnWaybill(id, user);

      if (!waybill) {
        throw new GraphQLError('Накладну не знайдено.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      if (WAYBILL_STATUSES.indexOf(status) <= WAYBILL_STATUSES.indexOf(waybill.status)) {
        throw badInput(`Статус можна змінити лише вперед: поточний статус «${STATUS_TITLES[waybill.status]}».`);
      }

      waybill.status = status;
      await save(waybill);
      await TrackingEvent.create({ waybill: waybill._id, branch: eventBranch(waybill, status), status });

      return waybill;
    },

    deleteWaybill: async (parent, { id }, context) => {
      const user = requireAuth(context);
      const waybill = await findOwnWaybill(id, user);
      if (!waybill) return false;

      await TrackingEvent.deleteMany({ waybill: waybill._id }).exec();
      await waybill.deleteOne();
      return true;
    },
  },

  // У документах лежать лише ObjectId пов'язаних записів.
  // .exec() повертає справжній Promise: Mongoose Query не можна виконати двічі
  Waybill: {
    owner: (waybill) => (waybill.owner ? User.findById(waybill.owner).exec() : null),
    fromBranch: (waybill) => (waybill.fromBranch ? Branch.findById(waybill.fromBranch).exec() : null),
    toBranch: (waybill) => (waybill.toBranch ? Branch.findById(waybill.toBranch).exec() : null),
    tariff: (waybill) => (waybill.tariff ? Tariff.findById(waybill.tariff).exec() : null),
    statusTitle: (waybill) => STATUS_TITLES[waybill.status] ?? waybill.status,
    createdAt: (waybill) => waybill.createdAt.toISOString(),
    expectedAt: (waybill) => new Date(waybill.createdAt.getTime() + waybill.days * DAY_MS).toISOString(),
    events: (waybill) => TrackingEvent.find({ waybill: waybill._id }).sort({ eventTime: 1 }).exec(),
  },

  Branch: {
    title: (branch) => `${branch.city}, відділення № ${branch.number}`,
  },

  TrackingEvent: {
    title: (event) => EVENT_TITLES[event.status] ?? event.status,
    branch: (event) => (event.branch ? Branch.findById(event.branch).exec() : null),
    eventTime: (event) => event.eventTime.toISOString(),
  },
};
