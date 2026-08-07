export type SolicitudSoporteEstado = 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';
export type SolicitudSoporteTipo = 'tecnico' | 'software' | 'hardware' | 'otro';
/** Disposición interna del equipo (taller). Independiente del estado cara al cliente. */
export type SolicitudSoporteDisposicion = 'reparacion' | 'garantia';

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

export const SOLICITUD_SOPORTE_DISPOSICION_LABELS: Record<SolicitudSoporteDisposicion, string> = {
  reparacion: 'Reparación',
  garantia: 'Garantía',
};
export const SOLICITUD_SOPORTE_DISPOSICION_BADGE: Record<SolicitudSoporteDisposicion, string> = {
  reparacion: 'cf-badge-warn',
  garantia: 'cf-badge-warn',
};

export interface SolicitudSoporte {
  id: number;
  /** Código de inventario del terminal (llave principal al crear/editar). */
  inventario?: string;
  serie?: string;
  tipo: SolicitudSoporteTipo;
  descripcion: string;
  estado: SolicitudSoporteEstado;
  /** Proceso interno del terminal (reparación/garantía). No reemplaza `estado`. */
  disposicion?: SolicitudSoporteDisposicion;
  /** Motivo del envío a reparación/garantía. */
  tallerMotivo?: string;
  /** Observaciones del envío a reparación/garantía. */
  tallerObservacion?: string;
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

/** Accesorios / consumibles (tipos intermedios del select). */
export const EQUIPO_ACCESORIOS = [
  'CHIP CLARO', 'CHIP TIGO', 'CHIP POSTEK',
  'BATERIAS D60', 'BATERIAS X990/TRINITY',
  'CARGADORES ANDROID', 'CARGADORES ENGAGE', 'CARGADORES VX',
] as const;

/** Tipos especiales: POS y P primero en flujo; PRS depende de POS; Operaciones al final. */
export const EQUIPO_TIPOS_ESPECIALES = ['POS', 'P', 'PRS', 'Operaciones'] as const;

export type EquipoItemTipoEspecial = (typeof EQUIPO_TIPOS_ESPECIALES)[number];
export type EquipoItemTipo = EquipoItemTipoEspecial | (typeof EQUIPO_ACCESORIOS)[number];

/** Orden del select: POS, P, accesorios…, PRS, Operaciones (último). */
export const EQUIPO_ITEMS: EquipoItemTipo[] = [
  'POS',
  'P',
  ...EQUIPO_ACCESORIOS,
  'PRS',
  'Operaciones',
];

/** @deprecated usar EQUIPO_ITEMS / EQUIPO_ACCESORIOS */
export const EQUIPO_ITEMS_LEGACY = [
  'POS IP', 'POS GPRS', 'CHIP CLARO', 'CHIP TIGO', 'CHIP POSTEK',
  'BATERIAS D60', 'BATERIAS X990/TRINITY',
  'CARGADORES ANDROID', 'CARGADORES ENGAGE', 'CARGADORES VX',
];

export interface SolicitudEquipoItem {
  /** Tipo / nombre del artículo (POS, P, PRS, Operaciones, accesorio…). */
  nombre: EquipoItemTipo | string;
  cantidad: number;
  marca?: string;
  modelo?: string;
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
