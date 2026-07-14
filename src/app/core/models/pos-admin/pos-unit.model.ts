/** EPIC 3 y 4 — Recepción e inventario de terminales POS físicas */

export type PosUnitStatus =
  | 'in_stock'
  | 'in_transit'
  | 'with_technician'
  | 'with_executive'
  | 'installed'
  | 'in_workshop'
  | 'decommissioned'
  | 'destroyed';

export const POS_UNIT_STATUS_LABELS: Record<PosUnitStatus, string> = {
  in_stock: 'En almacén',
  in_transit: 'En tránsito',
  with_technician: 'Con técnico',
  with_executive: 'Con ejecutivo',
  installed: 'Instalado/Activo',
  in_workshop: 'En taller',
  decommissioned: 'De baja',
  destroyed: 'Destruido',
};

/** Ubicaciones sugeridas en HU-009 */
export type PosLocationType =
  | 'central_warehouse'
  | 'regional_warehouse'
  | 'executive'
  | 'technician'
  | 'merchant'
  | 'workshop'
  | 'in_transit'
  | 'decommissioned'
  | 'destroyed';

export const POS_LOCATION_LABELS: Record<PosLocationType, string> = {
  central_warehouse: 'Almacén central',
  regional_warehouse: 'Almacén regional',
  executive: 'Ejecutivo',
  technician: 'Técnico',
  merchant: 'Comercio',
  workshop: 'Taller',
  in_transit: 'En tránsito',
  decommissioned: 'Baja',
  destroyed: 'Destruido',
};

export type PosUnitEventType =
  | 'received'
  | 'assigned_custody'
  | 'returned_custody'
  | 'installed'
  | 'sent_to_workshop'
  | 'returned_from_workshop'
  | 'decommissioned'
  | 'destroyed'
  | 'status_change';

export interface PosUnitHistoryEvent {
  id: string;
  timestamp: string;
  eventType: PosUnitEventType;
  description: string;
  userName: string;
}

export interface PosUnit {
  id: string;
  serialNumber: string;
  brand: string;
  model: string;
  posType: string;
  status: PosUnitStatus;
  locationType: PosLocationType;
  locationLabel: string;

  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  receivedAt: string;
  receivedBy: string;
  initialCondition: string;
  observations?: string;

  custodianUserId?: string;
  custodianName?: string;
  custodianRole?: 'technician' | 'executive' | 'operator';

  merchantId?: string;
  merchantName?: string;
  installedAt?: string;

  history: PosUnitHistoryEvent[];
}
