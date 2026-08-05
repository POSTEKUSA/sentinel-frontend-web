/** Business Insights — análisis de comportamiento comercial de la red POS */

export type MccCategory =
  | 'grocery'
  | 'restaurant'
  | 'pharmacy'
  | 'fuel'
  | 'hotel'
  | 'retail'
  | 'electronics'
  | 'convenience';

export const MCC_CATEGORY_LABELS: Record<MccCategory, string> = {
  grocery: 'Supermercado',
  restaurant: 'Restaurante',
  pharmacy: 'Farmacia',
  fuel: 'Combustible',
  hotel: 'Hotel',
  retail: 'Retail',
  electronics: 'Electrónica',
  convenience: 'Conveniencia',
};

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'diners' | 'unionpay';

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'American Express',
  diners: 'Diners Club',
  unionpay: 'UnionPay',
};

export type CardType = 'credito' | 'debito' | 'prepago' | 'empresarial';

export const CARD_TYPE_LABELS: Record<CardType, string> = {
  credito: 'Crédito',
  debito: 'Débito',
  prepago: 'Prepago',
  empresarial: 'Empresarial',
};

export type BizCurrency = 'HNL' | 'USD';

export type BizTerminalStatus = 'online' | 'offline';

export const BIZ_TERMINAL_STATUS_LABELS: Record<BizTerminalStatus, string> = {
  online: 'En línea',
  offline: 'Fuera de línea',
};

/** Comercio / cadena comercial afiliada */
export interface BizMerchant {
  id: string;
  name: string;
  mccCategory: MccCategory;
  mcc: string;
  acquirerBank: string;
  department: string;
  municipality: string;
  city: string;
  branchCount: number;
  terminalCount: number;
  createdAt: string;
}

/** Sucursal física de un comercio */
export interface BizBranch {
  id: string;
  merchantId: string;
  merchantName: string;
  mccCategory: MccCategory;
  name: string;
  department: string;
  municipality: string;
  city: string;
  address: string;
  latitude: number;
  longitude: number;
  terminalCount: number;
}

/** Terminal POS instalada en una sucursal */
export interface BizTerminal {
  id: string;
  serial: string;
  model: string;
  branchId: string;
  branchName: string;
  merchantId: string;
  merchantName: string;
  mccCategory: MccCategory;
  city: string;
  department: string;
  status: BizTerminalStatus;
  installedAt: string;
  lastConnectionAt: string;
}

/** Transacción de venta procesada por una terminal POS */
export interface BizTransaction {
  id: string;
  terminalId: string;
  branchId: string;
  branchName: string;
  merchantId: string;
  merchantName: string;
  mccCategory: MccCategory;
  acquirerBank: string;
  cardBrand: CardBrand;
  cardType: CardType;
  currency: BizCurrency;
  amount: number;
  amountHnl: number;
  city: string;
  department: string;
  createdAt: string;
}

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last30'
  | 'thisMonth'
  | 'thisYear'
  | 'custom';

export const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset, string> = {
  today: 'Hoy',
  yesterday: 'Ayer',
  last7: 'Últimos 7 días',
  last30: 'Últimos 30 días',
  thisMonth: 'Este mes',
  thisYear: 'Año actual',
  custom: 'Rango personalizado',
};

export interface BusinessInsightsFilters {
  datePreset: DateRangePreset;
  dateFrom: string | null;
  dateTo: string | null;
  merchantId: string | null;
  branchId: string | null;
  terminalId: string | null;
  acquirerBank: string | null;
  cardBrand: CardBrand | null;
  cardType: CardType | null;
  mccCategory: MccCategory | null;
  city: string | null;
  department: string | null;
  currency: BizCurrency | null;
}

export function emptyBusinessFilters(): BusinessInsightsFilters {
  return {
    datePreset: 'last30',
    dateFrom: null,
    dateTo: null,
    merchantId: null,
    branchId: null,
    terminalId: null,
    acquirerBank: null,
    cardBrand: null,
    cardType: null,
    mccCategory: null,
    city: null,
    department: null,
    currency: null,
  };
}

export interface BusinessFilterOptions {
  merchants: { id: string; name: string }[];
  branches: { id: string; name: string; merchantId: string }[];
  terminals: { id: string; label: string; branchId: string }[];
  acquirerBanks: string[];
  cardBrands: CardBrand[];
  cardTypes: CardType[];
  mccCategories: MccCategory[];
  cities: string[];
  departments: string[];
  currencies: BizCurrency[];
}

export interface BusinessKpis {
  volumeToday: number;
  volumeMonth: number;
  volumeYear: number;
  transactionCount: number;
  avgTicket: number;
  activeMerchants: number;
  posSoldToday: number;
  posNoSales: number;
  growthVsYesterday: number | null;
  growthVsLastMonth: number | null;
  growthVsLastYear: number | null;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface RankedPoint extends ChartPoint {
  id: string;
  secondaryValue?: number;
}

export interface DistributionSlice extends ChartPoint {
  key: string;
  percent: number;
  colorIndex: number;
}

export interface HeatmapCell {
  dayIndex: number;
  hour: number;
  value: number;
}

export interface HeatmapData {
  dayLabels: string[];
  hourLabels: string[];
  cells: HeatmapCell[];
  maxValue: number;
}

export interface TerminalTrendPoint {
  date: string;
  value: number;
}
