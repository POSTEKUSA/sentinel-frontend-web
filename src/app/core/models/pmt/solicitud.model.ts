export type SolicitudSoporteEstado = 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';
export type SolicitudSoporteTipo = 'tecnico' | 'software' | 'hardware' | 'otro';

export const SOLICITUD_SOPORTE_ESTADO_LABELS: Record<SolicitudSoporteEstado, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
};
export const SOLICITUD_SOPORTE_ESTADO_BADGE: Record<SolicitudSoporteEstado, string> = {
  pendiente: 'cf-badge-warn',
  en_proceso: 'cf-badge-info',
  resuelto: 'cf-badge-ok',
  cerrado: 'cf-badge-muted',
};

export interface SolicitudSoporte {
  id: number;
  serie?: string;
  tipo: SolicitudSoporteTipo;
  descripcion: string;
  estado: SolicitudSoporteEstado;
  assignedTo?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  comments: SolicitudComment[];
}

export interface SolicitudComment {
  id: number;
  solicitudId: number;
  comment: string;
  createdBy: string;
  createdAt: string;
}

// ── Solicitudes de Equipo ──────────────────────────────────────────

export type SolicitudEquipoEstado = 'pendiente' | 'aprobada' | 'rechazada' | 'enviada' | 'completada' | 'cancelada';

export const SOLICITUD_EQUIPO_ESTADO_LABELS: Record<SolicitudEquipoEstado, string> = {
  pendiente: 'Pendiente',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  enviada: 'Enviada',
  completada: 'Completada',
  cancelada: 'Cancelada',
};
export const SOLICITUD_EQUIPO_ESTADO_BADGE: Record<SolicitudEquipoEstado, string> = {
  pendiente: 'cf-badge-warn',
  aprobada: 'cf-badge-ok',
  rechazada: 'cf-badge-off',
  enviada: 'cf-badge-info',
  completada: 'cf-badge-ok',
  cancelada: 'cf-badge-off',
};

export const EQUIPO_ITEMS = [
  'POS IP', 'POS GPRS', 'CHIP CLARO', 'CHIP TIGO', 'CHIP POSTEK',
  'BATERIAS D60', 'BATERIAS X990/TRINITY',
  'CARGADORES ANDROID', 'CARGADORES ENGAGE', 'CARGADORES VX',
];

export interface SolicitudEquipoItem {
  nombre: string;
  cantidad: number;
}

export interface SolicitudEquipo {
  id: number;
  estado: SolicitudEquipoEstado;
  solicitadoPor: string;
  items: SolicitudEquipoItem[];
  notas?: string;
  createdAt: string;
  updatedAt: string;
  history: SolicitudEquipoHistoryEntry[];
}

export interface SolicitudEquipoHistoryEntry {
  id: number;
  solicitudId: number;
  estado: SolicitudEquipoEstado;
  comment?: string;
  createdBy: string;
  createdAt: string;
}
