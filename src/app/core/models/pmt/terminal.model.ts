export type TerminalEstado =
  | 'en_bodega'
  | 'en_inyeccion'
  | 'asignado_supervisor'
  | 'asignado_tecnico'
  | 'asignado_ejecutivo'
  | 'instalado'
  | 'en_reparacion'
  | 'garantia'
  | 'irreparable'
  | 'obsoleto'
  | 'retirado'
  | 'serie_sustituida';

export const TERMINAL_ESTADO_LABELS: Record<TerminalEstado, string> = {
  en_bodega: 'En Bodega',
  en_inyeccion: 'En Inyección',
  asignado_supervisor: 'Asignado Supervisor',
  asignado_tecnico: 'Asignado Técnico',
  asignado_ejecutivo: 'Asignado Ejecutivo',
  instalado: 'Instalado',
  en_reparacion: 'En Reparación',
  garantia: 'Garantía',
  irreparable: 'Irreparable',
  obsoleto: 'Obsoleto',
  retirado: 'Retirado',
  serie_sustituida: 'Serie Sustituida',
};

export const TERMINAL_ESTADO_BADGE: Record<TerminalEstado, string> = {
  en_bodega: 'cf-badge-info',
  en_inyeccion: 'cf-badge-warn',
  asignado_supervisor: 'cf-badge-info',
  asignado_tecnico: 'cf-badge-info',
  asignado_ejecutivo: 'cf-badge-info',
  instalado: 'cf-badge-ok',
  en_reparacion: 'cf-badge-warn',
  garantia: 'cf-badge-warn',
  irreparable: 'cf-badge-off',
  obsoleto: 'cf-badge-off',
  retirado: 'cf-badge-off',
  serie_sustituida: 'cf-badge-muted',
};

export interface Terminal {
  id: number;
  serie: string;
  inventario?: string;
  modelo?: string;
  estado: TerminalEstado;
  zona?: string;
  caja?: string;
  inyectado?: string;
  fecha?: string;
  nombre?: string;       // comercio
  codigo?: string;       // código comercio
  terminal?: string;     // terminal ID
  terminal2?: string;
  direccion?: string;
  ciudad?: string;
  comunicacion?: string;
  ip?: string;
  mcc?: string;
  moneda?: string;
  version?: string;
  chip?: string;
  assignedTo?: string;   // username
  assignedAt?: string;
  pendingApproval?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrackingEvent {
  id: number;
  terminalId: number;
  serie: string;
  previousStatus?: TerminalEstado;
  newStatus: TerminalEstado;
  comment?: string;
  createdBy?: string;
  createdAt: string;
}

export interface Initialization {
  id: number;
  serie: string;
  terminal?: string;
  version?: string;
  apn?: string;
  resultado?: string;
  createdBy?: string;
  createdAt: string;
}

export interface HistoricalRecord {
  id: number;
  serie: string;
  modelo?: string;
  comercio?: string;
  direccion?: string;
  ciudad?: string;
  zona?: string;
  accion: string;
  descripcion?: string;
  createdBy?: string;
  createdAt: string;
}

export interface AssignedPosHistory {
  id: number;
  serie: string;
  modelo?: string;
  assignedTo: string;
  role: 'supervisor' | 'tecnico' | 'ejecutivo';
  assignedAt: string;
  returnedAt?: string;
  comment?: string;
}

export interface QueryRecord {
  id: number;
  terminal?: string;
  codigo?: string;
  comercio?: string;
  direccion?: string;
  ciudad?: string;
  mcc?: string;
  limite?: string;
  zona?: string;
  fechaRegistro?: string;
}
