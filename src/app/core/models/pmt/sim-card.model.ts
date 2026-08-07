export type SimCardEstado = 'disponible' | 'asignada' | 'instalada' | 'suspendida' | 'baja';

export const SIM_CARD_ESTADO_LABELS: Record<SimCardEstado, string> = {
  disponible: 'Disponible',
  asignada: 'Asignada',
  instalada: 'Instalada',
  suspendida: 'Suspendida',
  baja: 'Baja',
};

export const SIM_CARD_ESTADO_BADGE: Record<SimCardEstado, string> = {
  disponible: 'cf-badge-ok',
  asignada: 'cf-badge-info',
  instalada: 'cf-badge-ok',
  suspendida: 'cf-badge-warn',
  baja: 'cf-badge-off',
};

export interface SimCard {
  id: number;
  iccid: string;
  /** Código de inventario, p. ej. SIM-001 */
  inventoryCode: string;
  numero?: string;
  compania: string;
  estado: SimCardEstado;
  assignedTo?: string;
  /** N° de serie del POS asignado */
  terminalSerie?: string;
  /** Código de inventario del POS, p. ej. POS-001 */
  posInventoryCode?: string;
  apn?: string;
  ip?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SimCardTracking {
  id: number;
  simCardId: number;
  iccid: string;
  previousStatus?: SimCardEstado;
  newStatus: SimCardEstado;
  comment?: string;
  createdBy?: string;
  createdAt: string;
}
