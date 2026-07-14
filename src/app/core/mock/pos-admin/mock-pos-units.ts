import { PosUnit } from '../../models/pos-admin';

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const MOCK_POS_UNITS: PosUnit[] = [
  {
    id: 'unit-1', serialNumber: 'PAX-A920-000101', brand: 'PAX', model: 'A920', posType: 'Android POS',
    status: 'installed', locationType: 'merchant', locationLabel: 'Comercio: Farmacia San Judas',
    purchaseOrderId: 'po-1', purchaseOrderNumber: 'OC-2026-0001', receivedAt: daysAgoIso(60), receivedBy: 'operador.carlos',
    initialCondition: 'Nuevo, sellado de fábrica', merchantId: 'mer-1', merchantName: 'Farmacia San Judas', installedAt: daysAgoIso(50),
    history: [
      { id: 'h1', timestamp: daysAgoIso(60), eventType: 'received', description: 'Recepción desde OC-2026-0001', userName: 'operador.carlos' },
      { id: 'h2', timestamp: daysAgoIso(50), eventType: 'installed', description: 'Instalado en Farmacia San Judas', userName: 'tecnico.mendoza' },
    ],
  },
  {
    id: 'unit-2', serialNumber: 'PAX-A920-000102', brand: 'PAX', model: 'A920', posType: 'Android POS',
    status: 'in_stock', locationType: 'central_warehouse', locationLabel: 'Almacén Central Managua',
    purchaseOrderId: 'po-1', purchaseOrderNumber: 'OC-2026-0001', receivedAt: daysAgoIso(60), receivedBy: 'operador.carlos',
    initialCondition: 'Nuevo, sellado de fábrica',
    history: [
      { id: 'h1', timestamp: daysAgoIso(60), eventType: 'received', description: 'Recepción desde OC-2026-0001', userName: 'operador.carlos' },
    ],
  },
  {
    id: 'unit-3', serialNumber: 'PAX-A920-000103', brand: 'PAX', model: 'A920', posType: 'Android POS',
    status: 'with_technician', locationType: 'technician', locationLabel: 'Técnico: Roberto Mendoza',
    purchaseOrderId: 'po-1', purchaseOrderNumber: 'OC-2026-0001', receivedAt: daysAgoIso(60), receivedBy: 'operador.carlos',
    initialCondition: 'Nuevo, sellado de fábrica', custodianUserId: 'tec-1', custodianName: 'Roberto Mendoza', custodianRole: 'technician',
    history: [
      { id: 'h1', timestamp: daysAgoIso(60), eventType: 'received', description: 'Recepción desde OC-2026-0001', userName: 'operador.carlos' },
      { id: 'h2', timestamp: daysAgoIso(40), eventType: 'assigned_custody', description: 'Asignado en resguardo a Roberto Mendoza (Técnico)', userName: 'admin' },
    ],
  },
  {
    id: 'unit-4', serialNumber: 'SUNMI-V2P-000201', brand: 'Sunmi', model: 'V2 Pro', posType: 'Android POS',
    status: 'installed', locationType: 'merchant', locationLabel: 'Comercio: Supermercado La Colonia',
    purchaseOrderId: 'po-2', purchaseOrderNumber: 'OC-2026-0002', receivedAt: daysAgoIso(25), receivedBy: 'operador.andrea',
    initialCondition: 'Nuevo', merchantId: 'mer-2', merchantName: 'Supermercado La Colonia', installedAt: daysAgoIso(18),
    history: [
      { id: 'h1', timestamp: daysAgoIso(25), eventType: 'received', description: 'Recepción desde OC-2026-0002', userName: 'operador.andrea' },
      { id: 'h2', timestamp: daysAgoIso(18), eventType: 'installed', description: 'Instalado en Supermercado La Colonia', userName: 'ejecutivo.morales' },
    ],
  },
  {
    id: 'unit-5', serialNumber: 'SUNMI-V2P-000202', brand: 'Sunmi', model: 'V2 Pro', posType: 'Android POS',
    status: 'with_executive', locationType: 'executive', locationLabel: 'Ejecutivo: Patricia Morales',
    purchaseOrderId: 'po-2', purchaseOrderNumber: 'OC-2026-0002', receivedAt: daysAgoIso(25), receivedBy: 'operador.andrea',
    initialCondition: 'Nuevo', custodianUserId: 'exe-1', custodianName: 'Patricia Morales', custodianRole: 'executive',
    history: [
      { id: 'h1', timestamp: daysAgoIso(25), eventType: 'received', description: 'Recepción desde OC-2026-0002', userName: 'operador.andrea' },
      { id: 'h2', timestamp: daysAgoIso(20), eventType: 'assigned_custody', description: 'Asignado en resguardo a Patricia Morales (Ejecutivo)', userName: 'admin' },
    ],
  },
  {
    id: 'unit-6', serialNumber: 'SUNMI-V2P-000203', brand: 'Sunmi', model: 'V2 Pro', posType: 'Android POS',
    status: 'in_stock', locationType: 'regional_warehouse', locationLabel: 'Almacén Regional León',
    purchaseOrderId: 'po-2', purchaseOrderNumber: 'OC-2026-0002', receivedAt: daysAgoIso(20), receivedBy: 'operador.andrea',
    initialCondition: 'Nuevo',
    history: [
      { id: 'h1', timestamp: daysAgoIso(20), eventType: 'received', description: 'Recepción desde OC-2026-0002', userName: 'operador.andrea' },
    ],
  },
  {
    id: 'unit-7', serialNumber: 'VFONE-VX520-000301', brand: 'Verifone', model: 'VX520', posType: 'POS Tradicional',
    status: 'in_workshop', locationType: 'workshop', locationLabel: 'Taller Central',
    receivedAt: daysAgoIso(400), receivedBy: 'operador.jose',
    initialCondition: 'Usado', observations: 'Falla en lector de banda magnética',
    history: [
      { id: 'h1', timestamp: daysAgoIso(400), eventType: 'received', description: 'Recepción inicial', userName: 'operador.jose' },
      { id: 'h2', timestamp: daysAgoIso(10), eventType: 'sent_to_workshop', description: 'Enviado a taller por falla en lector de banda magnética', userName: 'tecnico.mendoza' },
    ],
  },
  {
    id: 'unit-8', serialNumber: 'UROVO-DT40-000401', brand: 'Urovo', model: 'DT40', posType: 'mPOS (Móvil)',
    status: 'decommissioned', locationType: 'decommissioned', locationLabel: 'Baja definitiva',
    receivedAt: daysAgoIso(700), receivedBy: 'operador.jose',
    initialCondition: 'Usado', observations: 'Modelo obsoleto, batería no reparable',
    history: [
      { id: 'h1', timestamp: daysAgoIso(700), eventType: 'received', description: 'Recepción inicial', userName: 'operador.jose' },
      { id: 'h2', timestamp: daysAgoIso(15), eventType: 'decommissioned', description: 'Dado de baja por obsolescencia', userName: 'admin' },
    ],
  },
  {
    id: 'unit-9', serialNumber: 'UROVO-DT40-000402', brand: 'Urovo', model: 'DT40', posType: 'mPOS (Móvil)',
    status: 'destroyed', locationType: 'destroyed', locationLabel: 'Destruido',
    receivedAt: daysAgoIso(700), receivedBy: 'operador.jose',
    initialCondition: 'Usado', observations: 'Destrucción certificada por vencimiento PCI',
    history: [
      { id: 'h1', timestamp: daysAgoIso(700), eventType: 'received', description: 'Recepción inicial', userName: 'operador.jose' },
      { id: 'h2', timestamp: daysAgoIso(20), eventType: 'decommissioned', description: 'Dado de baja por vencimiento PCI', userName: 'admin' },
      { id: 'h3', timestamp: daysAgoIso(5), eventType: 'destroyed', description: 'Destrucción física certificada', userName: 'admin' },
    ],
  },
  {
    id: 'unit-10', serialNumber: 'PAX-A80-000501', brand: 'PAX', model: 'A80', posType: 'POS Tradicional',
    status: 'in_transit', locationType: 'in_transit', locationLabel: 'En tránsito a Almacén Regional León',
    purchaseOrderId: 'po-3', purchaseOrderNumber: 'OC-2026-0003', receivedAt: daysAgoIso(2), receivedBy: 'operador.jose',
    initialCondition: 'Nuevo',
    history: [
      { id: 'h1', timestamp: daysAgoIso(2), eventType: 'received', description: 'Recepción desde OC-2026-0003, en tránsito a almacén regional', userName: 'operador.jose' },
    ],
  },
  {
    id: 'unit-11', serialNumber: 'INGE-MOVE5000-000601', brand: 'Ingenico', model: 'Move 5000', posType: 'mPOS (Móvil)',
    status: 'installed', locationType: 'merchant', locationLabel: 'Comercio: Restaurante El Portón',
    purchaseOrderId: 'po-3', purchaseOrderNumber: 'OC-2026-0003', receivedAt: daysAgoIso(30), receivedBy: 'operador.jose',
    initialCondition: 'Nuevo', merchantId: 'mer-3', merchantName: 'Restaurante El Portón', installedAt: daysAgoIso(22),
    history: [
      { id: 'h1', timestamp: daysAgoIso(30), eventType: 'received', description: 'Recepción desde OC-2026-0003', userName: 'operador.jose' },
      { id: 'h2', timestamp: daysAgoIso(22), eventType: 'installed', description: 'Instalado en Restaurante El Portón', userName: 'tecnico.mendoza' },
    ],
  },
  {
    id: 'unit-12', serialNumber: 'SUNMI-T2S-000701', brand: 'Sunmi', model: 'T2s', posType: 'Android POS',
    status: 'installed', locationType: 'merchant', locationLabel: 'Comercio: Ferretería Central',
    receivedAt: daysAgoIso(90), receivedBy: 'operador.andrea',
    initialCondition: 'Nuevo', merchantId: 'mer-4', merchantName: 'Ferretería Central', installedAt: daysAgoIso(85),
    history: [
      { id: 'h1', timestamp: daysAgoIso(90), eventType: 'received', description: 'Recepción inicial', userName: 'operador.andrea' },
      { id: 'h2', timestamp: daysAgoIso(85), eventType: 'installed', description: 'Instalado en Ferretería Central', userName: 'ejecutivo.morales' },
    ],
  },
];
