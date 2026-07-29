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
  numero?: string;
  compania: string;
  estado: SimCardEstado;
  assignedTo?: string;
  terminalSerie?: string;
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
