import bcrypt from 'bcryptjs';
import { GraphQLError } from 'graphql';
import { users, waybills, getNextUserId, getNextWaybillId } from './data.js';
import { createToken } from './auth.js';
import { calculateDelivery, generateTrackingNumber } from './pricing.js';
import { validateWaybillInput } from './validation.js';

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

// Перевіряє, що накладна існує і належить поточному користувачу
function findOwnWaybill(id, user) {
  const waybill = waybills.find((item) => item.id === id);
  if (!waybill) return null;

  if (waybill.ownerId !== user.id) {
    throw new GraphQLError('Змінювати чи видаляти можна лише власні накладні.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }
  return waybill;
}

function pickWaybillData(input) {
  const errors = validateWaybillInput(input);
  if (errors.length > 0) {
    throw badInput('Помилка валідації даних накладної', errors);
  }

  const deliveryType = input.deliveryType ?? 'standard';
  const { cost, days } = calculateDelivery(input.weightKg, input.distanceKm, deliveryType);

  const data = {
    lastName: input.lastName.trim(),
    firstName: input.firstName.trim(),
    phone: input.phone.trim(),
    cityFrom: input.cityFrom.trim(),
    cityTo: input.cityTo.trim(),
    weightKg: input.weightKg,
    distanceKm: input.distanceKm,
    deliveryType,
    cost,
    days,
  };
  if (input.status) data.status = input.status;
  return data;
}

const newestFirst = (a, b) => b.createdAt.localeCompare(a.createdAt);

export const resolvers = {
  Query: {
    users: () => users,

    me: (parent, args, context) => context.user,

    waybills: () => [...waybills].sort(newestFirst),

    waybill: (parent, { id }) => waybills.find((item) => item.id === id) ?? null,

    trackWaybill: (parent, { trackingNumber }) =>
      waybills.find((item) => item.trackingNumber === trackingNumber.trim()) ?? null,

    myWaybills: (parent, args, context) => {
      const user = requireAuth(context);
      return waybills.filter((item) => item.ownerId === user.id).sort(newestFirst);
    },
  },

  Mutation: {
    register: async (parent, { name, email, password }) => {
      const normalizedEmail = email.trim().toLowerCase();

      if (name.trim() === '' || normalizedEmail === '' || password === '') {
        throw badInput('Ім\'я, email і пароль є обов\'язковими.');
      }
      if (users.some((user) => user.email === normalizedEmail)) {
        throw badInput('Користувач з таким email вже існує.');
      }

      const user = {
        id: getNextUserId(),
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(password, 10),
      };
      users.push(user);

      return { token: createToken(user), user };
    },

    login: async (parent, { email, password }) => {
      const user = users.find((item) => item.email === email.trim().toLowerCase());
      const isValid = user ? await bcrypt.compare(password, user.passwordHash) : false;

      if (!isValid) {
        throw new GraphQLError('Неправильний email або пароль.', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return { token: createToken(user), user };
    },

    createWaybill: (parent, { input }, context) => {
      const user = requireAuth(context);

      const waybill = {
        id: getNextWaybillId(),
        trackingNumber: generateTrackingNumber(),
        status: 'created',
        ...pickWaybillData(input),
        createdAt: new Date().toISOString(),
        ownerId: user.id,
      };
      waybills.push(waybill);

      return waybill;
    },

    updateWaybill: (parent, { id, input }, context) => {
      const user = requireAuth(context);
      const waybill = findOwnWaybill(id, user);

      if (!waybill) {
        throw new GraphQLError('Накладну не знайдено.', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      Object.assign(waybill, pickWaybillData(input));
      return waybill;
    },

    deleteWaybill: (parent, { id }, context) => {
      const user = requireAuth(context);
      const waybill = findOwnWaybill(id, user);
      if (!waybill) return false;

      waybills.splice(waybills.indexOf(waybill), 1);
      return true;
    },
  },

  // Зв'язок накладної з користувачем: у сховищі лежить лише ownerId
  Waybill: {
    owner: (waybill) => users.find((user) => user.id === waybill.ownerId),
  },
};
