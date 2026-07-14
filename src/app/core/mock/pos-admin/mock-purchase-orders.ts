import { PurchaseOrder } from '../../models/pos-admin';

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1', orderNumber: 'OC-2026-0001', supplierId: 'sup-1', supplierName: 'PAX Technology LATAM',
    orderDate: '2026-05-01T08:00:00.000Z', estimatedReceiptDate: '2026-05-20T08:00:00.000Z',
    deliveryLocation: 'Almacén Central Managua', status: 'received', createdBy: 'operador.andrea', createdAt: '2026-05-01T08:00:00.000Z',
    receivedBy: 'operador.carlos',
    lines: [
      { id: 'po-1-l1', itemType: 'pos', brand: 'PAX', model: 'A920', requestedQty: 50, receivedQty: 50, unitPrice: 185 },
      { id: 'po-1-l2', itemType: 'accessory', brand: 'PAX', model: 'Cargador de pared', requestedQty: 50, receivedQty: 50, unitPrice: 8 },
    ],
  },
  {
    id: 'po-2', orderNumber: 'OC-2026-0002', supplierId: 'sup-2', supplierName: 'Sunmi Distribuidora Centroamérica',
    orderDate: '2026-06-10T08:00:00.000Z', estimatedReceiptDate: '2026-06-30T08:00:00.000Z',
    deliveryLocation: 'Almacén Central Managua', status: 'partially_received', createdBy: 'operador.andrea', createdAt: '2026-06-10T08:00:00.000Z',
    lines: [
      { id: 'po-2-l1', itemType: 'pos', brand: 'Sunmi', model: 'V2 Pro', requestedQty: 80, receivedQty: 30, unitPrice: 210 },
      { id: 'po-2-l2', itemType: 'pos', brand: 'Sunmi', model: 'T2s', requestedQty: 20, receivedQty: 0, unitPrice: 240 },
    ],
  },
  {
    id: 'po-3', orderNumber: 'OC-2026-0003', supplierId: 'sup-3', supplierName: 'Ingenico Comercial S.A.',
    orderDate: '2026-06-25T08:00:00.000Z', estimatedReceiptDate: '2026-07-15T08:00:00.000Z',
    deliveryLocation: 'Almacén Regional León', status: 'in_transit', createdBy: 'operador.jose', createdAt: '2026-06-25T08:00:00.000Z',
    lines: [
      { id: 'po-3-l1', itemType: 'pos', brand: 'Ingenico', model: 'Move 5000', requestedQty: 25, receivedQty: 0, unitPrice: 260 },
    ],
  },
  {
    id: 'po-4', orderNumber: 'OC-2026-0004', supplierId: 'sup-1', supplierName: 'PAX Technology LATAM',
    orderDate: '2026-07-01T08:00:00.000Z', estimatedReceiptDate: '2026-07-18T08:00:00.000Z',
    deliveryLocation: 'Almacén Central Managua', status: 'created', createdBy: 'operador.andrea', createdAt: '2026-07-01T08:00:00.000Z',
    lines: [
      { id: 'po-4-l1', itemType: 'pos', brand: 'PAX', model: 'A80', requestedQty: 15, receivedQty: 0, unitPrice: 150 },
      { id: 'po-4-l2', itemType: 'accessory', brand: 'Universal', model: 'Rollo de papel térmico 57mm', requestedQty: 2000, receivedQty: 0, unitPrice: 0.3 },
    ],
  },
  {
    id: 'po-5', orderNumber: 'OC-2026-0005', supplierId: 'sup-4', supplierName: 'Urovo Import & Export',
    orderDate: '2026-03-01T08:00:00.000Z', estimatedReceiptDate: '2026-03-25T08:00:00.000Z',
    deliveryLocation: 'Almacén Central Managua', status: 'cancelled', createdBy: 'operador.jose', createdAt: '2026-03-01T08:00:00.000Z',
    lines: [
      { id: 'po-5-l1', itemType: 'pos', brand: 'Urovo', model: 'DT40', requestedQty: 10, receivedQty: 0, unitPrice: 175 },
    ],
  },
];
