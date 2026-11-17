import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';
import {
  BRANCHES_QUERY,
  CREATE_WAYBILL_MUTATION,
  LOGIN_MUTATION,
  ME_QUERY,
  MY_WAYBILLS_QUERY,
  REGISTER_MUTATION,
  TRACK_WAYBILL_QUERY,
  UPDATE_PROFILE_MUTATION,
  type Branch,
  type User,
  type Waybill,
  type WaybillInput,
} from '@postproject/core';

export type { Branch, DeliveryType, TrackingEvent, User, Waybill, WaybillInput, WaybillStatus } from '@postproject/core';

export const ME: TypedDocumentNode<{ me: User | null }> = gql(ME_QUERY);

export const LOGIN: TypedDocumentNode<
  { login: { token: string; user: User } },
  { login: string; password: string; remember: boolean }
> = gql(LOGIN_MUTATION);

export const REGISTER: TypedDocumentNode<
  { register: { token: string; user: User } },
  { name: string; email: string; phone: string | null; password: string }
> = gql(REGISTER_MUTATION);

export const UPDATE_PROFILE: TypedDocumentNode<
  { updateProfile: User },
  { name: string; email: string; phone: string | null }
> = gql(UPDATE_PROFILE_MUTATION);

export const BRANCHES: TypedDocumentNode<{ branches: Branch[] }> = gql(BRANCHES_QUERY);

export const TRACK_WAYBILL: TypedDocumentNode<{ trackWaybill: Waybill | null }, { trackingNumber: string }> =
  gql(TRACK_WAYBILL_QUERY);

export const MY_WAYBILLS: TypedDocumentNode<{ myWaybills: Waybill[] }> = gql(MY_WAYBILLS_QUERY);

export const CREATE_WAYBILL: TypedDocumentNode<{ createWaybill: Waybill }, { input: WaybillInput }> =
  gql(CREATE_WAYBILL_MUTATION);
