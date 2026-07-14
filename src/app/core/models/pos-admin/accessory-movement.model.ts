/** HU-011 — Entradas y salidas de accesorios y consumibles (rollos, etc.) */

export type AccessoryMovementType = 'in' | 'out';

export const ACCESSORY_MOVEMENT_TYPE_LABELS: Record<AccessoryMovementType, string> = {
  in: 'Entrada',
  out: 'Salida',
};

export interface AccessoryMovement {
  id: string;
  accessoryId: string;
  accessoryType: string;
  movementType: AccessoryMovementType;
  quantity: number;
  date: string;
  merchantId?: string;
  merchantName?: string;
  executiveId?: string;
  executiveName?: string;
  zone?: string;
  observations?: string;
}
