/** HU-010 — Equipos en resguardo de técnicos/ejecutivos/operadores */

export type CustodyRole = 'technician' | 'executive' | 'operator';

export const CUSTODY_ROLE_LABELS: Record<CustodyRole, string> = {
  technician: 'Técnico',
  executive: 'Ejecutivo',
  operator: 'Operador',
};

export type CustodyStatus = 'active' | 'returned';

export interface CustodyAssignment {
  id: string;
  posUnitId: string;
  serialNumber: string;
  brand: string;
  model: string;
  userId: string;
  userName: string;
  role: CustodyRole;
  assignedAt: string;
  returnedAt?: string;
  status: CustodyStatus;
  observations?: string;
}
