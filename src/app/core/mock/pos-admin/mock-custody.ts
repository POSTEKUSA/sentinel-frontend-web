import { CustodyAssignment } from '../../models/pos-admin';

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const MOCK_CUSTODY: CustodyAssignment[] = [
  {
    id: 'cus-1', posUnitId: 'unit-3', serialNumber: 'PAX-A920-000103', brand: 'PAX', model: 'A920',
    userId: 'tec-1', userName: 'Roberto Mendoza', role: 'technician',
    assignedAt: daysAgoIso(40), status: 'active', observations: 'Para instalación en zona norte',
  },
  {
    id: 'cus-2', posUnitId: 'unit-5', serialNumber: 'SUNMI-V2P-000202', brand: 'Sunmi', model: 'V2 Pro',
    userId: 'exe-1', userName: 'Patricia Morales', role: 'executive',
    assignedAt: daysAgoIso(20), status: 'active', observations: 'Ejecutiva de cuentas nuevas',
  },
  {
    id: 'cus-3', posUnitId: 'unit-2', serialNumber: 'PAX-A920-000102', brand: 'PAX', model: 'A920',
    userId: 'tec-2', userName: 'Ana Gutiérrez', role: 'technician',
    assignedAt: daysAgoIso(55), returnedAt: daysAgoIso(45), status: 'returned', observations: 'Equipo devuelto a almacén, sin instalar',
  },
];
