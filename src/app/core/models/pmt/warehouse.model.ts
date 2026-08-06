export type WarehouseStatus = 'active' | 'inactive';

export const WAREHOUSE_STATUS_LABELS: Record<WarehouseStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
};

export const WAREHOUSE_STATUS_BADGE: Record<WarehouseStatus, string> = {
  active: 'cf-badge-ok',
  inactive: 'cf-badge-off',
};

/** Bodega física — código de negocio BOD-### + id interno. */
export interface Warehouse {
  id: number;
  codigo: string;
  nombre: string;
  pais: string;
  ciudad: string;
  zona: string;
  direccion?: string;
  status: WarehouseStatus;
  createdAt: string;
  updatedAt: string;
}
