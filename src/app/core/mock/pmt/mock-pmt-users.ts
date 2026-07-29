import { PmtUser } from '../../models/pmt/pmt-user.model';

export const MOCK_PMT_USERS: PmtUser[] = [
  { id: 1, username: 'admin', nombre: 'Administrador Principal', email: 'admin@postek.com', role: 'admin', active: true, firstLogin: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2025-04-01T00:00:00Z' },
  { id: 2, username: 'jlopez', nombre: 'Juan López', email: 'jlopez@postek.com', role: 'supervisor', active: true, firstLogin: false, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2025-03-01T00:00:00Z' },
  { id: 3, username: 'mgarcia', nombre: 'María García', email: 'mgarcia@postek.com', role: 'tecnico', active: true, firstLogin: false, createdAt: '2024-02-01T00:00:00Z', updatedAt: '2025-04-01T00:00:00Z' },
  { id: 4, username: 'rmartinez', nombre: 'Roberto Martínez', email: 'rmartinez@postek.com', role: 'tecnico', active: true, firstLogin: false, createdAt: '2024-02-15T00:00:00Z', updatedAt: '2025-04-01T00:00:00Z' },
  { id: 5, username: 'inventario1', nombre: 'Ana Torres', email: 'atorres@postek.com', role: 'inventario', active: true, firstLogin: false, createdAt: '2024-03-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 6, username: 'supervisor2', nombre: 'Carlos Reyes', email: 'creyes@postek.com', role: 'supervisor', active: true, firstLogin: false, createdAt: '2024-04-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 7, username: 'consulta1', nombre: 'Lucía Mendoza', email: 'lmendoza@postek.com', role: 'consulta', active: true, firstLogin: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 8, username: 'ejecutivo1', nombre: 'Pedro Sánchez', email: 'psanchez@postek.com', role: 'ejecutivo', active: true, firstLogin: false, createdAt: '2024-06-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z' },
  { id: 9, username: 'inyector1', nombre: 'Diana Castro', email: 'dcastro@postek.com', role: 'inyector', active: true, firstLogin: false, createdAt: '2024-06-15T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z' },
  { id: 10, username: 'inyector2', nombre: 'Felipe Mora', email: 'fmora@postek.com', role: 'inyector', active: false, firstLogin: false, createdAt: '2024-07-01T00:00:00Z', updatedAt: '2025-03-15T00:00:00Z' },
  { id: 11, username: 'programacion1', nombre: 'Sofía Vargas', email: 'svargas@postek.com', role: 'programacion', active: true, firstLogin: false, createdAt: '2024-08-01T00:00:00Z', updatedAt: '2025-02-01T00:00:00Z' },
  { id: 12, username: 'tecnico_soporte', nombre: 'Marco Herrera', email: 'mherrera@postek.com', role: 'tecnico', active: true, firstLogin: false, createdAt: '2024-09-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
];
