import { SolicitudSoporte, SolicitudEquipo } from '../../models/pmt/solicitud.model';

export const MOCK_PMT_SOLICITUDES_SOPORTE: SolicitudSoporte[] = [
  { id: 1, serie: 'VX001242', tipo: 'hardware', descripcion: 'El lector de tarjetas no funciona correctamente, el chip no lee.', estado: 'pendiente', createdBy: 'mgarcia', createdAt: '2025-04-15T08:00:00Z', updatedAt: '2025-04-15T08:00:00Z', comments: [] },
  { id: 2, serie: 'VX001243', tipo: 'software', descripcion: 'La aplicación cierra inesperadamente durante el proceso de cobro.', estado: 'en_proceso', assignedTo: 'tecnico_soporte', createdBy: 'rmartinez', createdAt: '2025-04-10T09:00:00Z', updatedAt: '2025-04-12T10:00:00Z', comments: [
    { id: 1, solicitudId: 2, comment: 'Revisando logs del sistema. Parece ser un problema con la versión de firmware.', createdBy: 'tecnico_soporte', createdAt: '2025-04-12T10:00:00Z' }
  ]},
  { id: 3, serie: 'VX001244', tipo: 'tecnico', descripcion: 'Terminal no se conecta al servidor. Error de comunicación.', estado: 'resuelto', assignedTo: 'tecnico_soporte', createdBy: 'admin', createdAt: '2025-03-20T08:00:00Z', updatedAt: '2025-03-22T14:00:00Z', comments: [
    { id: 2, solicitudId: 3, comment: 'Se actualizó la configuración APN. Terminal operativa.', createdBy: 'tecnico_soporte', createdAt: '2025-03-22T14:00:00Z' }
  ]},
  { id: 4, tipo: 'otro', descripcion: 'Solicitud de capacitación para uso del sistema en nuevos técnicos.', estado: 'pendiente', createdBy: 'jlopez', createdAt: '2025-04-16T11:00:00Z', updatedAt: '2025-04-16T11:00:00Z', comments: [] },
  { id: 5, serie: 'VX001253', tipo: 'hardware', descripcion: 'Pantalla con líneas horizontales, posible daño físico.', estado: 'cerrado', assignedTo: 'tecnico_soporte', createdBy: 'rmartinez', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-05T16:00:00Z', comments: [
    { id: 3, solicitudId: 5, comment: 'Terminal enviada a garantía.', createdBy: 'tecnico_soporte', createdAt: '2025-03-05T16:00:00Z' }
  ]},
];

export const MOCK_PMT_SOLICITUDES_EQUIPO: SolicitudEquipo[] = [
  { id: 1, estado: 'pendiente', solicitadoPor: 'mgarcia', notas: 'Necesario para nueva zona de instalaciones', items: [{ nombre: 'POS IP', cantidad: 3 }, { nombre: 'CHIP CLARO', cantidad: 3 }], createdAt: '2025-04-15T08:00:00Z', updatedAt: '2025-04-15T08:00:00Z', history: [] },
  { id: 2, estado: 'aprobada', solicitadoPor: 'rmartinez', notas: 'Reposición de equipos dañados', items: [{ nombre: 'POS GPRS', cantidad: 2 }, { nombre: 'CARGADORES ANDROID', cantidad: 2 }, { nombre: 'BATERIAS D60', cantidad: 4 }], createdAt: '2025-04-08T09:00:00Z', updatedAt: '2025-04-10T11:00:00Z', history: [
    { id: 1, solicitudId: 2, estado: 'aprobada', comment: 'Aprobado por inventario. En proceso de preparación.', createdBy: 'admin', createdAt: '2025-04-10T11:00:00Z' }
  ]},
  { id: 3, estado: 'completada', solicitadoPor: 'jlopez', items: [{ nombre: 'CHIP TIGO', cantidad: 5 }, { nombre: 'CHIP POSTEK', cantidad: 2 }], createdAt: '2025-03-20T08:00:00Z', updatedAt: '2025-03-25T14:00:00Z', history: [
    { id: 2, solicitudId: 3, estado: 'aprobada', comment: 'Aprobado', createdBy: 'admin', createdAt: '2025-03-21T09:00:00Z' },
    { id: 3, solicitudId: 3, estado: 'enviada', comment: 'SIMs enviadas con técnico Pedro', createdBy: 'admin', createdAt: '2025-03-24T10:00:00Z' },
    { id: 4, solicitudId: 3, estado: 'completada', comment: 'Entregadas y confirmadas', createdBy: 'jlopez', createdAt: '2025-03-25T14:00:00Z' },
  ]},
  { id: 4, estado: 'rechazada', solicitadoPor: 'mgarcia', notas: 'Urgente', items: [{ nombre: 'POS IP', cantidad: 10 }], createdAt: '2025-04-01T08:00:00Z', updatedAt: '2025-04-02T09:00:00Z', history: [
    { id: 5, solicitudId: 4, estado: 'rechazada', comment: 'Sin stock disponible actualmente. Reintente en 2 semanas.', createdBy: 'admin', createdAt: '2025-04-02T09:00:00Z' }
  ]},
];
