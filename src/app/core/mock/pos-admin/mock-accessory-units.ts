import { AccessoryInventoryUnit } from '../../models/pos-admin';

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

/** Inventario ficticio de accesorios (prefijo por tipo: CAR, BAS, BAT, FUN). */
export const MOCK_ACCESSORY_UNITS: AccessoryInventoryUnit[] = [
  {
    id: 'au-1', inventoryCode: 'CAR-001', catalogItemId: 'acc-2', type: 'Cargador de pared', category: 'accessory',
    quantity: 1, unitOfMeasure: 'Unidad', status: 'in_stock', locationType: 'central_warehouse',
    locationLabel: 'Almacén Central Tegucigalpa', serialNumber: 'CHG-PAX-1001',
    purchaseOrderId: 'po-1', purchaseOrderNumber: 'OC-2026-0001',
    receivedAt: daysAgoIso(60), receivedBy: 'operador.carlos',
  },
  {
    id: 'au-2', inventoryCode: 'CAR-002', catalogItemId: 'acc-2', type: 'Cargador de pared', category: 'accessory',
    quantity: 1, unitOfMeasure: 'Unidad', status: 'with_technician', locationType: 'technician',
    locationLabel: 'Técnico: Roberto Mendoza', serialNumber: 'CHG-PAX-1002',
    purchaseOrderId: 'po-1', purchaseOrderNumber: 'OC-2026-0001',
    receivedAt: daysAgoIso(60), receivedBy: 'operador.carlos',
  },
  {
    id: 'au-3', inventoryCode: 'BAS-001', catalogItemId: 'acc-3', type: 'Base cargadora (cradle)', category: 'accessory',
    quantity: 1, unitOfMeasure: 'Unidad', status: 'in_stock', locationType: 'central_warehouse',
    locationLabel: 'Almacén Central Tegucigalpa', serialNumber: 'CRD-SUN-2001',
    purchaseOrderId: 'po-2', purchaseOrderNumber: 'OC-2026-0002',
    receivedAt: daysAgoIso(25), receivedBy: 'operador.andrea',
  },
  {
    id: 'au-4', inventoryCode: 'BAS-002', catalogItemId: 'acc-3', type: 'Base cargadora (cradle)', category: 'accessory',
    quantity: 1, unitOfMeasure: 'Unidad', status: 'installed', locationType: 'merchant',
    locationLabel: 'Comercio: Supermercado La Colonia', serialNumber: 'CRD-SUN-2002',
    purchaseOrderId: 'po-2', purchaseOrderNumber: 'OC-2026-0002',
    receivedAt: daysAgoIso(25), receivedBy: 'operador.andrea',
  },
  {
    id: 'au-5', inventoryCode: 'BAT-001', catalogItemId: 'acc-4', type: 'Batería de repuesto', category: 'accessory',
    quantity: 1, unitOfMeasure: 'Unidad', status: 'in_stock', locationType: 'regional_warehouse',
    locationLabel: 'Almacén Regional San Pedro Sula', serialNumber: 'BAT-SUN-3001',
    receivedAt: daysAgoIso(40), receivedBy: 'operador.andrea',
  },
  {
    id: 'au-6', inventoryCode: 'BAT-002', catalogItemId: 'acc-4', type: 'Batería de repuesto', category: 'accessory',
    quantity: 1, unitOfMeasure: 'Unidad', status: 'with_executive', locationType: 'executive',
    locationLabel: 'Ejecutivo: Patricia Morales', serialNumber: 'BAT-SUN-3002',
    receivedAt: daysAgoIso(40), receivedBy: 'operador.andrea',
  },
  {
    id: 'au-7', inventoryCode: 'FUN-001', catalogItemId: 'acc-5', type: 'Funda protectora', category: 'accessory',
    quantity: 1, unitOfMeasure: 'Unidad', status: 'in_stock', locationType: 'central_warehouse',
    locationLabel: 'Almacén Central Tegucigalpa',
    receivedAt: daysAgoIso(90), receivedBy: 'operador.jose',
  },
  {
    id: 'au-8', inventoryCode: 'FUN-002', catalogItemId: 'acc-5', type: 'Funda protectora', category: 'accessory',
    quantity: 1, unitOfMeasure: 'Unidad', status: 'decommissioned', locationType: 'decommissioned',
    locationLabel: 'Baja definitiva', observations: 'Rota / no reparable',
    receivedAt: daysAgoIso(200), receivedBy: 'operador.jose',
  },
];

/** Inventario ficticio de consumibles (prefijo ROL, etc.). */
export const MOCK_CONSUMABLE_UNITS: AccessoryInventoryUnit[] = [
  {
    id: 'cu-1', inventoryCode: 'ROL-001', catalogItemId: 'acc-1', type: 'Rollo de papel térmico 57mm', category: 'consumable',
    quantity: 500, unitOfMeasure: 'Rollo', status: 'in_stock', locationType: 'central_warehouse',
    locationLabel: 'Almacén Central Tegucigalpa',
    purchaseOrderId: 'po-4', purchaseOrderNumber: 'OC-2026-0004',
    receivedAt: daysAgoIso(45), receivedBy: 'operador.carlos',
  },
  {
    id: 'cu-2', inventoryCode: 'ROL-002', catalogItemId: 'acc-1', type: 'Rollo de papel térmico 57mm', category: 'consumable',
    quantity: 200, unitOfMeasure: 'Rollo', status: 'in_stock', locationType: 'regional_warehouse',
    locationLabel: 'Almacén Regional San Pedro Sula',
    purchaseOrderId: 'po-4', purchaseOrderNumber: 'OC-2026-0004',
    receivedAt: daysAgoIso(30), receivedBy: 'operador.andrea',
  },
  {
    id: 'cu-3', inventoryCode: 'ROL-003', catalogItemId: 'acc-1', type: 'Rollo de papel térmico 57mm', category: 'consumable',
    quantity: 50, unitOfMeasure: 'Rollo', status: 'with_technician', locationType: 'technician',
    locationLabel: 'Técnico: Roberto Mendoza',
    receivedAt: daysAgoIso(20), receivedBy: 'operador.carlos',
  },
  {
    id: 'cu-4', inventoryCode: 'ROL-004', catalogItemId: 'acc-1', type: 'Rollo de papel térmico 57mm', category: 'consumable',
    quantity: 80, unitOfMeasure: 'Rollo', status: 'with_executive', locationType: 'executive',
    locationLabel: 'Ejecutivo: Patricia Morales',
    receivedAt: daysAgoIso(15), receivedBy: 'operador.andrea',
  },
  {
    id: 'cu-5', inventoryCode: 'ROL-005', catalogItemId: 'acc-1', type: 'Rollo de papel térmico 57mm', category: 'consumable',
    quantity: 30, unitOfMeasure: 'Rollo', status: 'in_transit', locationType: 'in_transit',
    locationLabel: 'En tránsito a Almacén Regional San Pedro Sula',
    receivedAt: daysAgoIso(2), receivedBy: 'operador.jose',
  },
];
