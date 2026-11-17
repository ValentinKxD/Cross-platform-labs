const USER_FIELDS = `
  fragment UserFields on User {
    id
    name
    email
    phone
  }
`;

const WAYBILL_FIELDS = `
  fragment WaybillFields on Waybill {
    id
    trackingNumber
    lastName
    firstName
    phone
    cityFrom
    cityTo
    cost
    days
    status
    statusTitle
    createdAt
    expectedAt
    toBranch { id city number title }
    events {
      id
      status
      title
      eventTime
      branch { id city number title }
    }
  }
`;

export const ME_QUERY = `
  query Me {
    me { ...UserFields }
  }
  ${USER_FIELDS}
`;

export const LOGIN_MUTATION = `
  mutation Login($login: String!, $password: String!, $remember: Boolean) {
    login(login: $login, password: $password, remember: $remember) {
      token
      user { ...UserFields }
    }
  }
  ${USER_FIELDS}
`;

export const REGISTER_MUTATION = `
  mutation Register($name: String!, $email: String!, $phone: String, $password: String!) {
    register(name: $name, email: $email, phone: $phone, password: $password) {
      token
      user { ...UserFields }
    }
  }
  ${USER_FIELDS}
`;

export const UPDATE_PROFILE_MUTATION = `
  mutation UpdateProfile($name: String!, $email: String!, $phone: String) {
    updateProfile(name: $name, email: $email, phone: $phone) { ...UserFields }
  }
  ${USER_FIELDS}
`;

export const BRANCHES_QUERY = `
  query Branches {
    branches { id city number title }
  }
`;

export const CALCULATE_DELIVERY_QUERY = `
  query CalculateDelivery($weightKg: Float!, $distanceKm: Float!, $deliveryType: DeliveryType) {
    calculateDelivery(weightKg: $weightKg, distanceKm: $distanceKm, deliveryType: $deliveryType) {
      cost
      days
    }
  }
`;

export const TRACK_WAYBILL_QUERY = `
  query TrackWaybill($trackingNumber: String!) {
    trackWaybill(trackingNumber: $trackingNumber) { ...WaybillFields }
  }
  ${WAYBILL_FIELDS}
`;

export const MY_WAYBILLS_QUERY = `
  query MyWaybills {
    myWaybills { ...WaybillFields }
  }
  ${WAYBILL_FIELDS}
`;

export const CREATE_WAYBILL_MUTATION = `
  mutation CreateWaybill($input: WaybillInput!) {
    createWaybill(input: $input) { ...WaybillFields }
  }
  ${WAYBILL_FIELDS}
`;
