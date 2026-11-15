import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';

export type DeliveryType = 'standard' | 'express';
export type WaybillStatus = 'created' | 'accepted' | 'in_transit' | 'arrived' | 'received';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
}

export interface Branch {
  id: string;
  city: string;
  number: number;
  title: string;
}

export interface TrackingEvent {
  id: string;
  status: WaybillStatus;
  title: string;
  eventTime: string;
  branch: Branch | null;
}

export interface Waybill {
  id: string;
  trackingNumber: string;
  lastName: string;
  firstName: string;
  phone: string;
  cityFrom: string;
  cityTo: string;
  cost: number;
  days: number;
  status: WaybillStatus;
  statusTitle: string;
  createdAt: string;
  expectedAt: string;
  toBranch: Branch | null;
  events: TrackingEvent[];
}

const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    name
    email
    phone
  }
`;

const WAYBILL_FIELDS = gql`
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

export const ME: TypedDocumentNode<{ me: User | null }> = gql`
  query Me {
    me { ...UserFields }
  }
  ${USER_FIELDS}
`;

export const LOGIN: TypedDocumentNode<
  { login: { token: string; user: User } },
  { login: string; password: string; remember: boolean }
> = gql`
  mutation Login($login: String!, $password: String!, $remember: Boolean) {
    login(login: $login, password: $password, remember: $remember) {
      token
      user { ...UserFields }
    }
  }
  ${USER_FIELDS}
`;

export const REGISTER: TypedDocumentNode<
  { register: { token: string; user: User } },
  { name: string; email: string; phone: string | null; password: string }
> = gql`
  mutation Register($name: String!, $email: String!, $phone: String, $password: String!) {
    register(name: $name, email: $email, phone: $phone, password: $password) {
      token
      user { ...UserFields }
    }
  }
  ${USER_FIELDS}
`;

export const UPDATE_PROFILE: TypedDocumentNode<
  { updateProfile: User },
  { name: string; email: string; phone: string | null }
> = gql`
  mutation UpdateProfile($name: String!, $email: String!, $phone: String) {
    updateProfile(name: $name, email: $email, phone: $phone) { ...UserFields }
  }
  ${USER_FIELDS}
`;

export const BRANCHES: TypedDocumentNode<{ branches: Branch[] }> = gql`
  query Branches {
    branches { id city number title }
  }
`;

export const CALCULATE_DELIVERY: TypedDocumentNode<
  { calculateDelivery: { cost: number; days: number } },
  { weightKg: number; distanceKm: number; deliveryType: DeliveryType }
> = gql`
  query CalculateDelivery($weightKg: Float!, $distanceKm: Float!, $deliveryType: DeliveryType) {
    calculateDelivery(weightKg: $weightKg, distanceKm: $distanceKm, deliveryType: $deliveryType) {
      cost
      days
    }
  }
`;

export const TRACK_WAYBILL: TypedDocumentNode<{ trackWaybill: Waybill | null }, { trackingNumber: string }> = gql`
  query TrackWaybill($trackingNumber: String!) {
    trackWaybill(trackingNumber: $trackingNumber) { ...WaybillFields }
  }
  ${WAYBILL_FIELDS}
`;

export const MY_WAYBILLS: TypedDocumentNode<{ myWaybills: Waybill[] }> = gql`
  query MyWaybills {
    myWaybills { ...WaybillFields }
  }
  ${WAYBILL_FIELDS}
`;

export interface WaybillInput {
  lastName: string;
  firstName: string;
  phone: string;
  fromBranchId: string;
  toBranchId: string;
  weightKg: number;
  deliveryType: DeliveryType;
}

export const CREATE_WAYBILL: TypedDocumentNode<{ createWaybill: Waybill }, { input: WaybillInput }> = gql`
  mutation CreateWaybill($input: WaybillInput!) {
    createWaybill(input: $input) { ...WaybillFields }
  }
  ${WAYBILL_FIELDS}
`;
