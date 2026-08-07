/** Catálogo de límites de transacción / perfil de comercio. */

export type LimitStatus = 'active' | 'inactive';

export const LIMIT_STATUS_LABELS: Record<LimitStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
};

export interface TransactionLimit {
  id: string;
  code: string;
  name: string;
  /** Monto máximo por transacción (opcional, display). */
  maxAmount?: number;
  description?: string;
  status: LimitStatus;
}
