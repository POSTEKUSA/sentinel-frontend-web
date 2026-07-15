/** EPIC 5 — Afiliados / comercios */

export type MerchantStatus = 'active' | 'inactive';

export const MERCHANT_STATUS_LABELS: Record<MerchantStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
};

/** HU-012 — Comercio / afiliado */
export interface Merchant {
  id: string;
  affiliateCode: string;
  tradeName: string;
  mcc: string;
  mccDescription: string;
  department: string;
  municipality: string;
  address: string;
  status: MerchantStatus;
  createdAt: string;
  responsibleName?: string;
}

/** HU-013 — Registro de instalación de POS en comercio */
export interface Installation {
  id: string;
  posUnitId: string;
  serialNumber: string;
  brand: string;
  model: string;
  merchantId: string;
  merchantName: string;
  installedAt: string;
  responsibleUserId: string;
  responsibleName: string;
  responsibleRole: 'technician' | 'executive';
  latitude?: number;
  longitude?: number;
  initialStatus: string;
  observations?: string;
}
