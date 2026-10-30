export const typeDefs = `#graphql
  "Користувач застосунку (колекція users)"
  type User {
    id: ID!
    name: String!
    email: String!
  }

  "Тип доставки: стандартна або експрес"
  enum DeliveryType {
    standard
    express
  }

  "Статус відправлення"
  enum WaybillStatus {
    created
    in_transit
    arrived
    received
  }

  "Електронна накладна (колекція waybills), owner - користувач, який її створив"
  type Waybill {
    id: ID!
    trackingNumber: String!
    lastName: String!
    firstName: String!
    phone: String!
    cityFrom: String!
    cityTo: String!
    weightKg: Float!
    distanceKm: Float!
    deliveryType: DeliveryType!
    cost: Int!
    days: Int!
    status: WaybillStatus!
    createdAt: String!
    owner: User!
  }

  "Результат реєстрації та входу"
  type AuthPayload {
    token: String!
    user: User!
  }

  "Дані для створення та оновлення накладної"
  input WaybillInput {
    lastName: String!
    firstName: String!
    phone: String!
    cityFrom: String!
    cityTo: String!
    weightKg: Float!
    distanceKm: Float!
    deliveryType: DeliveryType = standard
    status: WaybillStatus
  }

  type Query {
    users: [User!]!
    me: User
    waybills: [Waybill!]!
    waybill(id: ID!): Waybill
    trackWaybill(trackingNumber: String!): Waybill
    myWaybills: [Waybill!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createWaybill(input: WaybillInput!): Waybill!
    updateWaybill(id: ID!, input: WaybillInput!): Waybill!
    deleteWaybill(id: ID!): Boolean!
  }
`;
