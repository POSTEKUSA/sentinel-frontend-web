export type PmtUserRole =
  | 'consulta'
  | 'inventario'
  | 'supervisor'
  | 'tecnico'
  | 'ejecutivo'
  | 'inyector'
  | 'programacion'
  | 'admin';

/** Display order for selects / filters (insertion order of keys). */
export const PMT_USER_ROLE_LABELS: Record<PmtUserRole, string> = {
  consulta: 'Consulta (solo lectura)',
  inventario: 'Inventario',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
  ejecutivo: 'Ejecutivo',
  inyector: 'Inyector',
  programacion: 'Programación',
  admin: 'Administrador',
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
