import { AccessoryMovement } from '../../models/pos-admin';

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const MOCK_ACCESSORY_MOVEMENTS: AccessoryMovement[] = [
  { id: 'mov-1', accessoryId: 'acc-1', accessoryType: 'Rollo de papel térmico 57mm', movementType: 'in', quantity: 2000, date: daysAgoIso(45), observations: 'Recepción de OC-2026-0004' },
  { id: 'mov-2', accessoryId: 'acc-1', accessoryType: 'Rollo de papel térmico 57mm', movementType: 'out', quantity: 50, date: daysAgoIso(30), merchantId: 'mer-1', merchantName: 'Farmacia San Judas', executiveId: 'exe-1', executiveName: 'Patricia Morales', zone: 'Managua' },
  { id: 'mov-3', accessoryId: 'acc-1', accessoryType: 'Rollo de papel térmico 57mm', movementType: 'out', quantity: 30, date: daysAgoIso(20), merchantId: 'mer-2', merchantName: 'Supermercado La Colonia', executiveId: 'exe-1', executiveName: 'Patricia Morales', zone: 'León' },
  { id: 'mov-4', accessoryId: 'acc-1', accessoryType: 'Rollo de papel térmico 57mm', movementType: 'out', quantity: 25, date: daysAgoIso(5), merchantId: 'mer-3', merchantName: 'Restaurante La Finca', executiveId: 'tec-1', executiveName: 'Roberto Mendoza', zone: 'Managua' },
  { id: 'mov-5', accessoryId: 'acc-5', accessoryType: 'SIM Card datos', movementType: 'in', quantity: 100, date: daysAgoIso(60) },
  { id: 'mov-6', accessoryId: 'acc-5', accessoryType: 'SIM Card datos', movementType: 'out', quantity: 12, date: daysAgoIso(10), merchantId: 'mer-4', merchantName: 'Ferretería Central', executiveId: 'exe-1', executiveName: 'Patricia Morales', zone: 'Managua' },
  { id: 'mov-7', accessoryId: 'acc-2', accessoryType: 'Cargador de pared', movementType: 'in', quantity: 50, date: daysAgoIso(60) },
  { id: 'mov-8', accessoryId: 'acc-2', accessoryType: 'Cargador de pared', movementType: 'out', quantity: 45, date: daysAgoIso(15), merchantId: 'mer-1', merchantName: 'Farmacia San Judas', executiveId: 'tec-1', executiveName: 'Roberto Mendoza', zone: 'Managua' },
];
