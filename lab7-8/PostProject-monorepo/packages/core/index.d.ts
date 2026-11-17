export type DeliveryType = 'standard' | 'express';
export type WaybillStatus = 'created' | 'accepted' | 'in_transit' | 'arrived' | 'received';
export type WaybillFilter = 'all' | 'transit' | 'received';
export type WaybillTab = 'people' | 'parcel';

export interface Tariff {
  deliveryType: DeliveryType;
  name: string;
  basePrice: number;
  pricePerKg: number;
  pricePerKm: number;
  kmPerDay: number;
  daysDiscount: number;
}

export interface DeliveryEstimate {
  cost: number;
  days: number;
}

export interface Option<T extends string> {
  value: T;
  label: string;
}

export const DELIVERY_TYPES: DeliveryType[];
export const TARIFFS: Record<DeliveryType, Tariff>;
export const DELIVERY_TYPE_OPTIONS: Option<DeliveryType>[];
export function isDeliveryType(value: unknown): value is DeliveryType;
export function deliveryTypeTitle(deliveryType: string): string;
export function calculateDelivery(
  weightKg: number,
  distanceKm: number,
  tariff: DeliveryType | Omit<Tariff, 'deliveryType' | 'name'>,
): DeliveryEstimate;

export const MIN_WEIGHT_KG: number;
export const MIN_DISTANCE_KM: number;
export const ERROR_EMPTY: string;
export const ERROR_NOT_NUMBER: string;
export const ERROR_WEIGHT_MIN: string;
export const ERROR_DISTANCE_MIN: string;
export const ERROR_DELIVERY_TYPE: string;
export function isBlank(value: unknown): boolean;
export function parseNumber(value: unknown): number;
export function isValidWeight(weightKg: number): boolean;
export function isValidDistance(distanceKm: number): boolean;
export function validateDeliveryParams(weightKg: number, distanceKm: number): string[];

export interface CalculationInput {
  weight: string | number;
  distance: string | number;
  deliveryType?: string;
}

export interface CalculationParams {
  weightKg: number;
  distanceKm: number;
  deliveryType: DeliveryType;
}

export type CalculationValidation =
  | { isValid: true; error: null; value: CalculationParams }
  | { isValid: false; error: string; value?: undefined };

export function validateCalculationInput(input: Partial<CalculationInput> | null | undefined): CalculationValidation;

export const PHONE_PATTERN: RegExp;
export const EMAIL_PATTERN: RegExp;
export const MIN_PASSWORD_LENGTH: number;
export const ERROR_PHONE_FORMAT: string;
export const ERROR_NAME_REQUIRED: string;
export const ERROR_EMAIL_FORMAT: string;
export const ERROR_PASSWORD_LENGTH: string;
export const ERROR_PASSWORD_MISMATCH: string;
export const ERROR_REGISTRATION_EMPTY: string;
export const ERROR_LOGIN_EMPTY: string;
export function normalizePhone(value: string): string;
export function isValidPhone(value: string): boolean;
export function isValidEmail(value: unknown): boolean;
export function normalizeEmail(value: string): string;
export function validateProfileInput(input: { name?: string; email?: string; phone?: string | null }): string[];
export function validateRegistrationInput(input: {
  name?: string;
  email?: string;
  phone?: string | null;
  password?: string;
  passwordRepeat?: string;
}): string[];
export function validateLoginInput(input: { login?: string; password?: string }): string | null;
export function loginLookup(login: string): { email: string } | { phone: string };

export const ERROR_SERVER_UNAVAILABLE: string;
export function formatDate(value: string | number | Date | null | undefined): string;
export function formatDateTime(value: string | number | Date | null | undefined): string;
export function formatDays(days: number): string;
export function formatWeight(weightKg: number): string;
export function formatCost(cost: number): string;
export function formatRoute(cityFrom: string, cityTo: string): string;
export function graphQLErrorMessages(errors: { message: string; extensions?: Record<string, unknown> }[]): string[];
export function errorMessages(error: unknown): string[];

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

export interface WaybillInput {
  lastName: string;
  firstName: string;
  phone: string;
  fromBranchId: string;
  toBranchId: string;
  weightKg: number;
  deliveryType: DeliveryType;
}

export interface WaybillForm {
  lastName: string;
  firstName: string;
  phone: string;
  fromBranchId: string;
  toBranchId: string;
  weight: string;
  deliveryType?: DeliveryType;
}

export type WaybillFormValidation =
  | { ok: true; value: WaybillInput }
  | { ok: false; tab: WaybillTab; errors: string[] };

export const WAYBILL_STATUSES: WaybillStatus[];
export const STATUS_TITLES: Record<WaybillStatus, string>;
export const EVENT_TITLES: Record<WaybillStatus, string>;
export const IN_TRANSIT_STATUSES: WaybillStatus[];
export const DELIVERED_STATUSES: WaybillStatus[];
export const WAYBILL_FILTERS: Option<WaybillFilter>[];
export const TRACKING_NUMBER_PATTERN: RegExp;
export const ERROR_TRACKING_NUMBER: string;
export const ERROR_WAYBILL_PEOPLE: string;
export const ERROR_WAYBILL_WEIGHT: string;
export const ERROR_SAME_CITY: string;
export const ERROR_FROM_BRANCH: string;
export const ERROR_TO_BRANCH: string;
export const ERROR_UNKNOWN_DELIVERY_TYPE: string;
export function statusTitle(status: string): string;
export function eventTitle(status: string): string;
export function isDelivered(status: string): boolean;
export function canAdvanceStatus(current: string, next: string): boolean;
export function branchTitle(branch: { city: string; number: number }): string;
export function orderCities(cityFrom: string, cityTo: string): [string, string];
export function expectedDeliveryDate(createdAt: string | number | Date, days: number): string;
export function normalizeTrackingNumber(value: unknown): string;
export function validateTrackingNumber(
  value: unknown,
): { isValid: true; error: null; value: string } | { isValid: false; error: string; value?: undefined };
export function generateTrackingNumber(random?: () => number): string;
export function matchesWaybillFilter(waybill: { status: string }, filter: WaybillFilter): boolean;
export function filterWaybills<T extends { status: string; trackingNumber: string }>(
  waybills: T[],
  options?: { filter?: WaybillFilter; onlyActive?: boolean; search?: string },
): T[];
export function validateWaybillInput(
  input: Partial<WaybillInput>,
  fromBranch: { city: string } | null | undefined,
  toBranch: { city: string } | null | undefined,
): string[];
export function validateWaybillForm(form: WaybillForm, branches?: Branch[]): WaybillFormValidation;

export interface Calculation {
  id: number;
  weightKg: number;
  distanceKm: number;
  deliveryType: DeliveryType;
  cost: number;
  days: number;
  createdAt: string;
  issued: boolean;
}

export interface CalculationSummary {
  total: number;
  issued: number;
}

export function createCalculation(
  params: CalculationParams,
  estimate?: DeliveryEstimate | null,
  id?: number,
  now?: Date,
): Calculation;
export function describeCalculation(calculation: Calculation): string;
export function describeEstimate(calculation: Pick<Calculation, 'cost' | 'days'>): string;
export function sortCalculationsByDate(calculations: Calculation[]): Calculation[];
export function filterCalculationsByQuery(calculations: Calculation[], query: unknown): Calculation[];
export function sanitizeCalculations(value: unknown): Calculation[];
export function summarizeCalculations(calculations: Calculation[]): CalculationSummary;

export class CalculationStorageAdapter {
  load(): Calculation[] | Promise<Calculation[]> | unknown;
  save(calculations: Calculation[]): void | Promise<void>;
}

export class MemoryStorageAdapter extends CalculationStorageAdapter {
  constructor(initial?: unknown[]);
  calculations: unknown[];
  load(): Calculation[];
  save(calculations: Calculation[]): void;
}

export const ME_QUERY: string;
export const LOGIN_MUTATION: string;
export const REGISTER_MUTATION: string;
export const UPDATE_PROFILE_MUTATION: string;
export const BRANCHES_QUERY: string;
export const CALCULATE_DELIVERY_QUERY: string;
export const TRACK_WAYBILL_QUERY: string;
export const MY_WAYBILLS_QUERY: string;
export const CREATE_WAYBILL_MUTATION: string;

export const ESTIMATE_TIMEOUT_MS: number;
export class GraphQLRequestError extends Error {
  constructor(errors: { message: string; extensions?: Record<string, unknown> }[]);
  errors: { message: string; extensions?: Record<string, unknown> }[];
}
export type DeliveryEstimator = (params: CalculationParams) => Promise<DeliveryEstimate | null>;
export function createServerEstimator(options: {
  url: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
}): DeliveryEstimator;

export const ERROR_NOT_FOUND: string;

export type AddCalculationResult =
  | { ok: true; calculation: Calculation; source: 'server' | 'local' }
  | { ok: false; error: string };

export type ToggleCalculationResult = { ok: true; calculation: Calculation } | { ok: false; error: string };

export type RemoveCalculationResult = { ok: true } | { ok: false; error: string };

export class CalculationsService {
  constructor(adapter: CalculationStorageAdapter, options?: { estimate?: DeliveryEstimator });
  adapter: CalculationStorageAdapter;
  estimate?: DeliveryEstimator;
  list(query?: string): Promise<Calculation[]>;
  summary(): Promise<CalculationSummary>;
  add(input: CalculationInput): Promise<AddCalculationResult>;
  toggleIssued(id: number): Promise<ToggleCalculationResult>;
  remove(id: number): Promise<RemoveCalculationResult>;
}
