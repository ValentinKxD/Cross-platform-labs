export const typeDefs = `#graphql
  "Користувач застосунку (колекція users)"
  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
  }

  "Відділення пошти (колекція branches)"
  type Branch {
    id: ID!
    city: String!
    number: Int!
    "Назва для списків: «Київ, відділення № 12»"
    title: String!
  }

  "Тип доставки: стандартна або експрес"
  enum DeliveryType {
    standard
    express
  }

  "Тариф доставки (колекція tariffs)"
  type Tariff {
    id: ID!
    deliveryType: DeliveryType!
    name: String!
    basePrice: Float!
    pricePerKg: Float!
    pricePerKm: Float!
    kmPerDay: Int!
    daysDiscount: Int!
  }

  "Статус відправлення у порядку руху посилки"
  enum WaybillStatus {
    created
    accepted
    in_transit
    arrived
    received
  }

  "Подія трекінгу (колекція tracking_events)"
  type TrackingEvent {
    id: ID!
    status: WaybillStatus!
    "Опис події: «Створено накладну», «Прийнято у відділенні»..."
    title: String!
    branch: Branch
    eventTime: String!
  }

  "Результат розрахунку вартості та днів доставки"
  type DeliveryEstimate {
    cost: Int!
    days: Int!
  }

  """
  Електронна накладна (колекція waybills).
  owner, fromBranch, toBranch і tariff дорівнюють null для накладних, створених через REST API ЛР №2.
  """
  type Waybill {
    id: ID!
    trackingNumber: String!
    lastName: String!
    firstName: String!
    phone: String!
    cityFrom: String!
    cityTo: String!
    fromBranch: Branch
    toBranch: Branch
    weightKg: Float!
    distanceKm: Float!
    deliveryType: DeliveryType!
    tariff: Tariff
    cost: Int!
    days: Int!
    status: WaybillStatus!
    "Назва поточного статусу: «Створено», «У дорозі», «Отримано»..."
    statusTitle: String!
    createdAt: String!
    "Орієнтовна дата прибуття: дата створення + дні доставки"
    expectedAt: String!
    owner: User
    events: [TrackingEvent!]!
  }

  "Результат реєстрації та входу"
  type AuthPayload {
    token: String!
    user: User!
  }

  "Дані для створення накладної: отримувач, відділення та посилка"
  input WaybillInput {
    lastName: String!
    firstName: String!
    phone: String!
    fromBranchId: ID!
    toBranchId: ID!
    weightKg: Float!
    deliveryType: DeliveryType = standard
  }

  type Query {
    users: [User!]!
    me: User
    branches: [Branch!]!
    tariffs: [Tariff!]!
    calculateDelivery(weightKg: Float!, distanceKm: Float!, deliveryType: DeliveryType = standard): DeliveryEstimate!
    waybills: [Waybill!]!
    waybill(id: ID!): Waybill
    trackWaybill(trackingNumber: String!): Waybill
    myWaybills: [Waybill!]!
  }

  type Mutation {
    register(name: String!, email: String!, phone: String, password: String!): AuthPayload!
    "login - email або номер телефону; remember продовжує дію токена до 7 днів"
    login(login: String!, password: String!, remember: Boolean = false): AuthPayload!
    updateProfile(name: String!, email: String!, phone: String): User!
    createWaybill(input: WaybillInput!): Waybill!
    "Наступний статус посилки (додає подію трекінгу); лише для власника накладної"
    updateWaybillStatus(id: ID!, status: WaybillStatus!): Waybill!
    deleteWaybill(id: ID!): Boolean!
  }
`;
