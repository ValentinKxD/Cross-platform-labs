export const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
    phone: String
  }

  type Branch {
    id: ID!
    city: String!
    number: Int!
    title: String!
  }

  enum DeliveryType {
    standard
    express
  }

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

  enum WaybillStatus {
    created
    accepted
    in_transit
    arrived
    received
  }

  type TrackingEvent {
    id: ID!
    status: WaybillStatus!
    title: String!
    branch: Branch
    eventTime: String!
  }

  type DeliveryEstimate {
    cost: Int!
    days: Int!
  }

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
    statusTitle: String!
    createdAt: String!
    expectedAt: String!
    owner: User
    events: [TrackingEvent!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

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
    login(login: String!, password: String!, remember: Boolean = false): AuthPayload!
    updateProfile(name: String!, email: String!, phone: String): User!
    createWaybill(input: WaybillInput!): Waybill!
    updateWaybillStatus(id: ID!, status: WaybillStatus!): Waybill!
    deleteWaybill(id: ID!): Boolean!
  }
`;
