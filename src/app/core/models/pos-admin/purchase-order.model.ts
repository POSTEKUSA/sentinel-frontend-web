/** EPIC 2 — Órdenes de compra */

export type PurchaseOrderStatus =
  | 'created'
  | 'in_transit'
  | 'partially_received'
  | 'received'
  | 'cancelled'
  | 'closed';

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  created: 'Creada',
  in_transit: 'En Tránsito',
  partially_received: 'Entrega Parcial',
  received: 'Recibida',
  cancelled: 'Cancelada',
  closed: 'Cerrada',
};

export type PurchaseOrderItemType = 'pos' | 'accessory';

export interface PurchaseOrderLine {
  id: string;
  itemType: PurchaseOrderItemType;
  brand: string;
  model: string;
  requestedQty: number;
  receivedQty: number;
  unitPrice?: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  estimatedReceiptDate: string;
  deliveryLocation: string;
  status: PurchaseOrderStatus;
  createdBy: string;
  createdAt: string;
  receivedBy?: string;
  lines: PurchaseOrderLine[];
}
