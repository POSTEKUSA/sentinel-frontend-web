/** Catálogo maestro de códigos MCC (Merchant Category Code). */

export type MccStatus = 'active' | 'inactive';

export const MCC_STATUS_LABELS: Record<MccStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
};

export interface MccCode {
  id: string;
  code: string;
  description: string;
  status: MccStatus;
}
