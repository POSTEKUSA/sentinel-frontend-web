export type PmtUserRole =
  | 'admin'
  | 'inventario'
  | 'supervisor'
  | 'tecnico'
  | 'consulta'
  | 'ejecutivo'
  | 'inyector'
  | 'programacion';

export const PMT_USER_ROLE_LABELS: Record<PmtUserRole, string> = {
  admin: 'Administrador',
  inventario: 'Inventario',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
  consulta: 'Consulta',
  ejecutivo: 'Ejecutivo',
  inyector: 'Inyector',
  programacion: 'Programación',
};

export interface PmtUser {
  id: number;
  username: string;
  nombre?: string;
  email?: string;
  role: PmtUserRole;
  active: boolean;
  firstLogin: boolean;
  createdAt: string;
  updatedAt: string;
}
