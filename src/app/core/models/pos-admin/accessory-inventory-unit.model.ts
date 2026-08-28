import { AccessoryCategory } from './catalog.model';
import { PosLocationType, PosUnitStatus } from './pos-unit.model';

/**
 * Unidad física / lote en inventario de accesorios o consumibles.
 * Misma lógica de estado/ubicación que PosUnit (prototipo).
 */
export interface AccessoryInventoryUnit {
  id: string;
  /** Código de inventario: ACC-001, ROL-001, etc. */
  inventoryCode: string;
  catalogItemId: string;
  type: string;
  category: AccessoryCategory;
  quantity: number;
  unitOfMeasure: string;
  status: PosUnitStatus;
  locationType: PosLocationType;
  locationLabel: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  receivedAt: string;
  receivedBy: string;
  /** Serie opcional (p. ej. batería / cargador) */
  serialNumber?: string;
  observations?: string;
}
