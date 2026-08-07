import { Terminal, TrackingEvent, HistoricalRecord, AssignedPosHistory, Initialization, QueryRecord } from '../../models/pmt/terminal.model';

export const MOCK_PMT_TERMINALS: Terminal[] = [
  { id: 1, serie: 'VX001234', inventario: 'POS-001', marca: 'Verifone', modelo: 'VX520', estado: 'en_bodega', warehouseId: 2, zona: 'Norte', caja: 'CAJA-10-001', inyectado: 'Si', fecha: '2025-01-10', createdAt: '2025-01-10T08:00:00Z', updatedAt: '2025-01-10T08:00:00Z' },
  { id: 2, serie: 'VX001235', inventario: 'POS-002', marca: 'Verifone', modelo: 'VX520', estado: 'en_bodega', warehouseId: 3, zona: 'Sur', caja: 'CAJA-10-001', inyectado: 'No', fecha: '2025-01-10', createdAt: '2025-01-10T08:00:00Z', updatedAt: '2025-01-10T08:00:00Z' },
  { id: 3, serie: 'VX001236', inventario: 'POS-003', marca: 'Ingenico', modelo: 'Move5000', estado: 'en_inyeccion', warehouseId: 1, zona: 'Centro', caja: 'CAJA-12-001', inyectado: 'No', fecha: '2025-01-12', createdAt: '2025-01-12T08:00:00Z', updatedAt: '2025-01-15T08:00:00Z' },
  { id: 4, serie: 'VX001237', inventario: 'POS-004', marca: 'Ingenico', modelo: 'Move5000', estado: 'en_inyeccion', warehouseId: 4, zona: 'Este', caja: 'CAJA-12-001', inyectado: 'No', fecha: '2025-01-12', createdAt: '2025-01-12T08:00:00Z', updatedAt: '2025-01-15T08:00:00Z' },
  { id: 5, serie: 'VX001238', inventario: 'POS-005', marca: 'Verifone', modelo: 'VX520', estado: 'asignado_supervisor', warehouseId: 2, zona: 'Norte', assignedTo: 'jlopez', assignedAt: '2025-02-01T09:00:00Z', createdAt: '2025-01-15T08:00:00Z', updatedAt: '2025-02-01T09:00:00Z' },
  { id: 6, serie: 'VX001239', inventario: 'POS-006', marca: 'Verifone', modelo: 'VX520', estado: 'asignado_supervisor', warehouseId: 3, zona: 'Sur', assignedTo: 'jlopez', assignedAt: '2025-02-01T09:00:00Z', createdAt: '2025-01-15T08:00:00Z', updatedAt: '2025-02-01T09:00:00Z' },
  { id: 7, serie: 'VX001240', inventario: 'POS-007', marca: 'Ingenico', modelo: 'Lane3000', estado: 'asignado_tecnico', warehouseId: 1, zona: 'Centro', assignedTo: 'mgarcia', assignedAt: '2025-02-05T10:00:00Z', createdAt: '2025-01-20T08:00:00Z', updatedAt: '2025-02-05T10:00:00Z' },
  { id: 8, serie: 'VX001241', inventario: 'POS-008', marca: 'Ingenico', modelo: 'Lane3000', estado: 'asignado_tecnico', warehouseId: 4, zona: 'Este', assignedTo: 'rmartinez', assignedAt: '2025-02-10T10:00:00Z', createdAt: '2025-01-20T08:00:00Z', updatedAt: '2025-02-10T10:00:00Z' },
  { id: 9, serie: 'VX001242', inventario: 'POS-009', marca: 'Verifone', modelo: 'VX820', estado: 'instalado', merchantId: 'mer-2', merchantSiteId: 'site-2a', zona: 'Norte', nombre: 'Supermercado La Colonia', codigo: 'COM-00102', terminal: 'T00001', direccion: 'Blvd. del Norte Km 2', ciudad: 'San Pedro Sula', comunicacion: 'GPRS', chip: '8950-001', createdAt: '2025-01-25T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z' },
  { id: 10, serie: 'VX001243', inventario: 'POS-010', marca: 'Verifone', modelo: 'VX820', estado: 'instalado', merchantId: 'mer-1', merchantSiteId: 'site-1a', zona: 'Centro', nombre: 'Farmacia San Judas', codigo: 'COM-00101', terminal: 'T00002', direccion: 'Frente al Mercado Los Dolores', ciudad: 'Tegucigalpa', comunicacion: 'IP', chip: '8950-002', createdAt: '2025-01-25T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z' },
  { id: 11, serie: 'VX001244', inventario: 'POS-011', marca: 'Verifone', modelo: 'VX520', estado: 'instalado', merchantId: 'mer-3', merchantSiteId: 'site-3a', zona: 'Centro', nombre: 'Restaurante La Finca', codigo: 'COM-00103', terminal: 'T00003', direccion: 'Blvd. Suyapa', ciudad: 'Tegucigalpa', comunicacion: 'IP', createdAt: '2025-02-01T08:00:00Z', updatedAt: '2025-03-05T08:00:00Z' },
  { id: 12, serie: 'VX001245', inventario: 'POS-012', marca: 'Ingenico', modelo: 'Move5000', estado: 'instalado', merchantId: 'mer-2', merchantSiteId: 'site-2b', zona: 'Norte', nombre: 'Supermercado La Colonia', codigo: 'COM-00102', terminal: 'T00004', direccion: 'Plaza Premier SPS', ciudad: 'San Pedro Sula', comunicacion: 'GPRS', createdAt: '2025-02-01T08:00:00Z', updatedAt: '2025-03-05T08:00:00Z' },
  { id: 13, serie: 'VX001246', inventario: 'POS-013', marca: 'Verifone', modelo: 'VX520', estado: 'en_reparacion', warehouseId: 3, zona: 'Sur', nombre: 'Ex: Tienda Don Juan', createdAt: '2025-02-10T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 14, serie: 'VX001247', inventario: 'POS-014', marca: 'Ingenico', modelo: 'Lane3000', estado: 'garantia', warehouseId: 4, zona: 'Este', createdAt: '2025-02-15T08:00:00Z', updatedAt: '2025-04-05T08:00:00Z' },
  { id: 15, serie: 'VX001248', inventario: 'POS-015', marca: 'Verifone', modelo: 'VX520', estado: 'irreparable', warehouseId: 2, zona: 'Norte', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-03-15T08:00:00Z' },
  { id: 16, serie: 'VX001249', inventario: 'POS-016', marca: 'Ingenico', modelo: 'Move5000', estado: 'obsoleto', warehouseId: 1, zona: 'Centro', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2025-02-01T08:00:00Z' },
  { id: 17, serie: 'VX001250', inventario: 'POS-017', marca: 'Verifone', modelo: 'VX820', estado: 'retirado', warehouseId: 3, zona: 'Sur', nombre: 'Comercio Retirado S.A.', createdAt: '2024-06-01T08:00:00Z', updatedAt: '2025-01-15T08:00:00Z' },
  { id: 18, serie: 'VX001251', inventario: 'POS-018', marca: 'Verifone', modelo: 'VX520', estado: 'serie_sustituida', warehouseId: 2, zona: 'Norte', createdAt: '2024-03-01T08:00:00Z', updatedAt: '2025-02-20T08:00:00Z' },
  { id: 19, serie: 'VX001252', inventario: 'POS-019', marca: 'Ingenico', modelo: 'Lane3000', estado: 'inyectado', warehouseId: 4, zona: 'Este', caja: 'CAJA-10-002', inyectado: 'Si', fecha: '2025-03-01', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z' },
  { id: 20, serie: 'VX001253', inventario: 'POS-020', marca: 'Verifone', modelo: 'VX820', estado: 'instalado', merchantId: 'mer-4', merchantSiteId: 'site-4a', zona: 'Norte', nombre: 'Ferretería Central', codigo: 'COM-00104', terminal: 'T00005', direccion: 'Col. Satélite, Choloma', ciudad: 'Choloma', comunicacion: 'GPRS', chip: '8950-003', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 21, serie: 'VX001254', inventario: 'POS-021', marca: 'Verifone', modelo: 'VX820', estado: 'instalado', merchantId: 'mer-2', merchantSiteId: 'site-2c', zona: 'Centro', nombre: 'Supermercado La Colonia', codigo: 'COM-00102', terminal: 'T00006', direccion: 'City Mall TGU', ciudad: 'Tegucigalpa', comunicacion: 'IP', createdAt: '2025-03-05T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 22, serie: 'VX001255', inventario: 'POS-022', marca: 'Ingenico', modelo: 'Move5000', estado: 'asignado_ejecutivo', warehouseId: 1, zona: 'Centro', assignedTo: 'psanchez', assignedAt: '2025-04-01T09:00:00Z', createdAt: '2025-03-10T08:00:00Z', updatedAt: '2025-04-01T09:00:00Z' },
  { id: 23, serie: 'VX001256', inventario: 'POS-023', marca: 'Verifone', modelo: 'VX520', estado: 'reparado', warehouseId: 1, zona: 'Oeste', caja: 'CAJA-12-002', inyectado: 'Si', fecha: '2025-04-01', createdAt: '2025-04-01T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 24, serie: 'VX001257', inventario: 'POS-024', marca: 'Ingenico', modelo: 'Lane3000', estado: 'en_bodega', warehouseId: 1, zona: 'Oeste', caja: 'CAJA-12-002', inyectado: 'No', fecha: '2025-04-01', createdAt: '2025-04-01T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 25, serie: 'VX001258', inventario: 'POS-025', marca: 'Verifone', modelo: 'VX820', estado: 'destruido', warehouseId: 2, zona: 'Norte', createdAt: '2025-04-05T08:00:00Z', updatedAt: '2025-04-10T08:00:00Z' },
];

/**
 * Tracking histories vary by device lifecycle:
 * - Fresh warehouse only (id 2, 24)
 * - Mid pipeline: inyección / inyectado / asignado
 * - Full happy path to instalación
 * - Repair / garantía / end-of-life flows
 */
export const MOCK_PMT_TRACKING: TrackingEvent[] = [
  // ── POS-002 (id 2): recién ingresado en bodega ───────────────────────────
  { id: 100, terminalId: 2, serie: 'VX001235', newStatus: 'en_bodega', comment: 'Recepción OC-2025-014 · Bodega Sur', createdBy: 'atorres', createdAt: '2025-01-10T08:15:00Z' },

  // ── POS-024 (id 24): recién en bodega Oeste ──────────────────────────────
  { id: 101, terminalId: 24, serie: 'VX001257', newStatus: 'en_bodega', comment: 'Ingreso lote abril · CAJA-04', createdBy: 'atorres', createdAt: '2025-04-01T09:00:00Z' },

  // ── POS-003 (id 3): en inyección ─────────────────────────────────────────
  { id: 102, terminalId: 3, serie: 'VX001236', newStatus: 'en_bodega', comment: 'Recepción en Bodega Centro', createdBy: 'atorres', createdAt: '2025-01-12T08:30:00Z' },
  { id: 103, terminalId: 3, serie: 'VX001236', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-01-15T08:00:00Z' },

  // ── POS-004 (id 4): en inyección ─────────────────────────────────────────
  { id: 104, terminalId: 4, serie: 'VX001237', newStatus: 'en_bodega', comment: 'Recepción Bodega Este', createdBy: 'atorres', createdAt: '2025-01-12T09:00:00Z' },
  { id: 105, terminalId: 4, serie: 'VX001237', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Cola de inyección zona Este', createdBy: 'svargas', createdAt: '2025-01-15T10:00:00Z' },

  // ── POS-019 (id 19): inyectado, listo para asignar ───────────────────────
  { id: 106, terminalId: 19, serie: 'VX001252', newStatus: 'en_bodega', comment: 'Ingreso CAJA-03', createdBy: 'atorres', createdAt: '2025-03-01T08:00:00Z' },
  { id: 107, terminalId: 19, serie: 'VX001252', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-03-05T09:00:00Z' },
  { id: 108, terminalId: 19, serie: 'VX001252', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección aplicada (inyeccion.json)', createdBy: 'dcastro', createdAt: '2025-03-08T11:20:00Z' },

  // ── POS-005 (id 5): asignado supervisor (flujo completo hasta ahí) ───────
  { id: 109, terminalId: 5, serie: 'VX001238', newStatus: 'en_bodega', comment: 'Recepción Bodega Norte', createdBy: 'atorres', createdAt: '2025-01-15T08:00:00Z' },
  { id: 110, terminalId: 5, serie: 'VX001238', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-01-20T10:00:00Z' },
  { id: 111, terminalId: 5, serie: 'VX001238', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección OK', createdBy: 'dcastro', createdAt: '2025-01-22T14:00:00Z' },
  { id: 112, terminalId: 5, serie: 'VX001238', previousStatus: 'inyectado', newStatus: 'asignado_supervisor', comment: 'Asignado a jlopez (supervisor) · distribución zona norte', createdBy: 'admin', createdAt: '2025-02-01T09:00:00Z' },

  // ── POS-006 (id 6): asignado supervisor ──────────────────────────────────
  { id: 113, terminalId: 6, serie: 'VX001239', newStatus: 'en_bodega', comment: 'Recepción Bodega Sur', createdBy: 'atorres', createdAt: '2025-01-15T08:30:00Z' },
  { id: 114, terminalId: 6, serie: 'VX001239', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-01-21T09:00:00Z' },
  { id: 115, terminalId: 6, serie: 'VX001239', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección OK', createdBy: 'fmora', createdAt: '2025-01-23T11:00:00Z' },
  { id: 116, terminalId: 6, serie: 'VX001239', previousStatus: 'inyectado', newStatus: 'asignado_supervisor', comment: 'Asignado a jlopez (supervisor)', createdBy: 'admin', createdAt: '2025-02-01T09:00:00Z' },

  // ── POS-007 (id 7): asignado técnico ─────────────────────────────────────
  { id: 117, terminalId: 7, serie: 'VX001240', newStatus: 'en_bodega', comment: 'Recepción Bodega Centro', createdBy: 'atorres', createdAt: '2025-01-20T08:00:00Z' },
  { id: 118, terminalId: 7, serie: 'VX001240', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-01-25T09:00:00Z' },
  { id: 119, terminalId: 7, serie: 'VX001240', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección OK', createdBy: 'dcastro', createdAt: '2025-01-28T10:00:00Z' },
  { id: 120, terminalId: 7, serie: 'VX001240', previousStatus: 'inyectado', newStatus: 'asignado_supervisor', comment: 'Asignado a creyes (supervisor)', createdBy: 'admin', createdAt: '2025-02-02T09:00:00Z' },
  { id: 121, terminalId: 7, serie: 'VX001240', previousStatus: 'asignado_supervisor', newStatus: 'asignado_tecnico', comment: 'Asignado a mgarcia (técnico) · instalación pendiente zona Centro', createdBy: 'creyes', createdAt: '2025-02-05T10:00:00Z' },

  // ── POS-008 (id 8): asignado técnico ─────────────────────────────────────
  { id: 122, terminalId: 8, serie: 'VX001241', newStatus: 'en_bodega', comment: 'Recepción Bodega Este', createdBy: 'atorres', createdAt: '2025-01-20T08:30:00Z' },
  { id: 123, terminalId: 8, serie: 'VX001241', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-01-27T09:00:00Z' },
  { id: 124, terminalId: 8, serie: 'VX001241', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección OK', createdBy: 'fmora', createdAt: '2025-01-30T11:00:00Z' },
  { id: 125, terminalId: 8, serie: 'VX001241', previousStatus: 'inyectado', newStatus: 'asignado_tecnico', comment: 'Asignado a rmartinez (técnico)', createdBy: 'jlopez', createdAt: '2025-02-10T10:00:00Z' },

  // ── POS-009 (id 9): instalado — happy path completo ──────────────────────
  { id: 126, terminalId: 9, serie: 'VX001242', newStatus: 'en_bodega', comment: 'Recepción OC-2025-008', createdBy: 'atorres', createdAt: '2025-01-25T08:00:00Z' },
  { id: 127, terminalId: 9, serie: 'VX001242', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-01-26T09:00:00Z' },
  { id: 128, terminalId: 9, serie: 'VX001242', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección aplicada · T00001', createdBy: 'dcastro', createdAt: '2025-01-28T10:00:00Z' },
  { id: 129, terminalId: 9, serie: 'VX001242', previousStatus: 'inyectado', newStatus: 'asignado_supervisor', comment: 'Asignado a jlopez (supervisor)', createdBy: 'admin', createdAt: '2025-01-29T09:00:00Z' },
  { id: 130, terminalId: 9, serie: 'VX001242', previousStatus: 'asignado_supervisor', newStatus: 'asignado_tecnico', comment: 'Asignado a mgarcia (técnico)', createdBy: 'jlopez', createdAt: '2025-02-15T10:00:00Z' },
  { id: 131, terminalId: 9, serie: 'VX001242', previousStatus: 'asignado_tecnico', newStatus: 'instalado', comment: 'Instalación completada en Supermercado La Colonia', createdBy: 'mgarcia', createdAt: '2025-03-01T08:00:00Z' },

  // ── POS-010 (id 10): instalado ───────────────────────────────────────────
  { id: 132, terminalId: 10, serie: 'VX001243', newStatus: 'en_bodega', comment: 'Recepción Bodega Centro', createdBy: 'atorres', createdAt: '2025-01-25T08:30:00Z' },
  { id: 133, terminalId: 10, serie: 'VX001243', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-01-26T10:00:00Z' },
  { id: 134, terminalId: 10, serie: 'VX001243', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección OK · T00002', createdBy: 'dcastro', createdAt: '2025-01-28T10:30:00Z' },
  { id: 135, terminalId: 10, serie: 'VX001243', previousStatus: 'inyectado', newStatus: 'asignado_tecnico', comment: 'Asignado a rmartinez (técnico)', createdBy: 'jlopez', createdAt: '2025-02-20T09:00:00Z' },
  { id: 136, terminalId: 10, serie: 'VX001243', previousStatus: 'asignado_tecnico', newStatus: 'instalado', comment: 'Instalado en Farmacia San Judas', createdBy: 'rmartinez', createdAt: '2025-03-01T08:00:00Z' },

  // ── POS-013 (id 13): en reparación (ciclo con instalación previa) ────────
  { id: 137, terminalId: 13, serie: 'VX001246', newStatus: 'en_bodega', comment: 'Recepción inicial', createdBy: 'atorres', createdAt: '2025-02-10T08:00:00Z' },
  { id: 138, terminalId: 13, serie: 'VX001246', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-02-12T09:00:00Z' },
  { id: 139, terminalId: 13, serie: 'VX001246', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección OK', createdBy: 'fmora', createdAt: '2025-02-14T11:00:00Z' },
  { id: 140, terminalId: 13, serie: 'VX001246', previousStatus: 'inyectado', newStatus: 'asignado_tecnico', comment: 'Asignado a mherrera (técnico)', createdBy: 'creyes', createdAt: '2025-02-18T10:00:00Z' },
  { id: 141, terminalId: 13, serie: 'VX001246', previousStatus: 'asignado_tecnico', newStatus: 'instalado', comment: 'Instalado en Tienda Don Juan', createdBy: 'mherrera', createdAt: '2025-02-25T14:00:00Z' },
  { id: 142, terminalId: 13, serie: 'VX001246', previousStatus: 'instalado', newStatus: 'en_reparacion', comment: 'Pantalla dañada · retiro por falla', createdBy: 'mherrera', createdAt: '2025-04-01T08:00:00Z' },

  // ── POS-014 (id 14): garantía ────────────────────────────────────────────
  { id: 143, terminalId: 14, serie: 'VX001247', newStatus: 'en_bodega', comment: 'Recepción Bodega Este', createdBy: 'atorres', createdAt: '2025-02-15T08:00:00Z' },
  { id: 144, terminalId: 14, serie: 'VX001247', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-02-17T09:00:00Z' },
  { id: 145, terminalId: 14, serie: 'VX001247', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección OK', createdBy: 'dcastro', createdAt: '2025-02-19T10:00:00Z' },
  { id: 146, terminalId: 14, serie: 'VX001247', previousStatus: 'inyectado', newStatus: 'asignado_tecnico', comment: 'Asignado a rmartinez (técnico)', createdBy: 'jlopez', createdAt: '2025-03-01T09:00:00Z' },
  { id: 147, terminalId: 14, serie: 'VX001247', previousStatus: 'asignado_tecnico', newStatus: 'instalado', comment: 'Instalación en comercio zona Este', createdBy: 'rmartinez', createdAt: '2025-03-10T11:00:00Z' },
  { id: 148, terminalId: 14, serie: 'VX001247', previousStatus: 'instalado', newStatus: 'garantia', comment: 'Defecto de fábrica · enviado a garantía', createdBy: 'admin', createdAt: '2025-04-05T08:00:00Z' },

  // ── POS-015 (id 15): irreparable ─────────────────────────────────────────
  { id: 149, terminalId: 15, serie: 'VX001248', newStatus: 'en_bodega', comment: 'Recepción', createdBy: 'atorres', createdAt: '2025-01-01T08:00:00Z' },
  { id: 150, terminalId: 15, serie: 'VX001248', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-01-05T09:00:00Z' },
  { id: 151, terminalId: 15, serie: 'VX001248', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección OK', createdBy: 'fmora', createdAt: '2025-01-08T10:00:00Z' },
  { id: 152, terminalId: 15, serie: 'VX001248', previousStatus: 'inyectado', newStatus: 'asignado_tecnico', comment: 'Asignado a mgarcia (técnico)', createdBy: 'jlopez', createdAt: '2025-01-15T09:00:00Z' },
  { id: 153, terminalId: 15, serie: 'VX001248', previousStatus: 'asignado_tecnico', newStatus: 'instalado', comment: 'Instalado en comercio', createdBy: 'mgarcia', createdAt: '2025-01-20T14:00:00Z' },
  { id: 154, terminalId: 15, serie: 'VX001248', previousStatus: 'instalado', newStatus: 'en_reparacion', comment: 'Falla de motherboard', createdBy: 'mgarcia', createdAt: '2025-03-01T08:00:00Z' },
  { id: 155, terminalId: 15, serie: 'VX001248', previousStatus: 'en_reparacion', newStatus: 'irreparable', comment: 'Taller: no viable reparar · costo > valor residual', createdBy: 'mherrera', createdAt: '2025-03-15T16:00:00Z' },

  // ── POS-017 (id 17): retirado ────────────────────────────────────────────
  { id: 156, terminalId: 17, serie: 'VX001250', newStatus: 'en_bodega', comment: 'Recepción 2024', createdBy: 'atorres', createdAt: '2024-06-01T08:00:00Z' },
  { id: 157, terminalId: 17, serie: 'VX001250', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2024-06-05T09:00:00Z' },
  { id: 158, terminalId: 17, serie: 'VX001250', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección OK', createdBy: 'dcastro', createdAt: '2024-06-08T10:00:00Z' },
  { id: 159, terminalId: 17, serie: 'VX001250', previousStatus: 'inyectado', newStatus: 'asignado_tecnico', comment: 'Asignado a rmartinez (técnico)', createdBy: 'jlopez', createdAt: '2024-06-12T09:00:00Z' },
  { id: 160, terminalId: 17, serie: 'VX001250', previousStatus: 'asignado_tecnico', newStatus: 'instalado', comment: 'Instalado en Comercio Retirado S.A.', createdBy: 'rmartinez', createdAt: '2024-06-20T11:00:00Z' },
  { id: 161, terminalId: 17, serie: 'VX001250', previousStatus: 'instalado', newStatus: 'retirado', comment: 'Retiro por cierre de comercio', createdBy: 'admin', createdAt: '2025-01-15T08:00:00Z' },

  // ── POS-022 (id 22): asignado ejecutivo ──────────────────────────────────
  { id: 162, terminalId: 22, serie: 'VX001255', newStatus: 'en_bodega', comment: 'Recepción Bodega Centro', createdBy: 'atorres', createdAt: '2025-03-10T08:00:00Z' },
  { id: 163, terminalId: 22, serie: 'VX001255', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-03-15T09:00:00Z' },
  { id: 164, terminalId: 22, serie: 'VX001255', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección demo comercial', createdBy: 'dcastro', createdAt: '2025-03-20T11:00:00Z' },
  { id: 165, terminalId: 22, serie: 'VX001255', previousStatus: 'inyectado', newStatus: 'asignado_ejecutivo', comment: 'Asignado a psanchez (ejecutivo) · Demo / prueba comercial', createdBy: 'admin', createdAt: '2025-04-01T09:00:00Z' },

  // ── POS-023 (id 23): reparado (ciclo reparación → listo) ─────────────────
  { id: 166, terminalId: 23, serie: 'VX001256', newStatus: 'en_bodega', comment: 'Recepción', createdBy: 'atorres', createdAt: '2025-02-01T08:00:00Z' },
  { id: 167, terminalId: 23, serie: 'VX001256', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-02-03T09:00:00Z' },
  { id: 168, terminalId: 23, serie: 'VX001256', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección OK', createdBy: 'fmora', createdAt: '2025-02-05T10:00:00Z' },
  { id: 169, terminalId: 23, serie: 'VX001256', previousStatus: 'inyectado', newStatus: 'asignado_tecnico', comment: 'Asignado a mgarcia (técnico)', createdBy: 'creyes', createdAt: '2025-02-08T09:00:00Z' },
  { id: 170, terminalId: 23, serie: 'VX001256', previousStatus: 'asignado_tecnico', newStatus: 'instalado', comment: 'Instalado en comercio zona Oeste', createdBy: 'mgarcia', createdAt: '2025-02-15T14:00:00Z' },
  { id: 171, terminalId: 23, serie: 'VX001256', previousStatus: 'instalado', newStatus: 'en_reparacion', comment: 'Falla de comunicación GPRS', createdBy: 'mgarcia', createdAt: '2025-03-10T08:00:00Z' },
  { id: 172, terminalId: 23, serie: 'VX001256', previousStatus: 'en_reparacion', newStatus: 'reparado', comment: 'Módulo de red reemplazado · listo para reasignar', createdBy: 'mherrera', createdAt: '2025-04-01T08:00:00Z' },

  // ── POS-025 (id 25): destruido ───────────────────────────────────────────
  { id: 173, terminalId: 25, serie: 'VX001258', newStatus: 'en_bodega', comment: 'Recepción', createdBy: 'atorres', createdAt: '2025-04-05T08:00:00Z' },
  { id: 174, terminalId: 25, serie: 'VX001258', previousStatus: 'en_bodega', newStatus: 'en_reparacion', comment: 'Daño físico severo al recibir', createdBy: 'admin', createdAt: '2025-04-06T09:00:00Z' },
  { id: 175, terminalId: 25, serie: 'VX001258', previousStatus: 'en_reparacion', newStatus: 'destruido', comment: 'Baja por destrucción · actas firmadas', createdBy: 'admin', createdAt: '2025-04-10T10:00:00Z' },

  // ── POS-001 (id 1): en bodega pero ya pasó inyección (reingreso) ─────────
  { id: 176, terminalId: 1, serie: 'VX001234', newStatus: 'en_bodega', comment: 'Recepción inicial Bodega Norte', createdBy: 'atorres', createdAt: '2025-01-10T08:00:00Z' },
  { id: 177, terminalId: 1, serie: 'VX001234', previousStatus: 'en_bodega', newStatus: 'en_inyeccion', comment: 'Enviado a inyección', createdBy: 'svargas', createdAt: '2025-01-12T09:00:00Z' },
  { id: 178, terminalId: 1, serie: 'VX001234', previousStatus: 'en_inyeccion', newStatus: 'inyectado', comment: 'Inyección OK', createdBy: 'dcastro', createdAt: '2025-01-14T11:00:00Z' },
  { id: 179, terminalId: 1, serie: 'VX001234', previousStatus: 'inyectado', newStatus: 'asignado_tecnico', comment: 'Asignado a mgarcia (técnico)', createdBy: 'jlopez', createdAt: '2025-01-18T09:00:00Z' },
  { id: 180, terminalId: 1, serie: 'VX001234', previousStatus: 'asignado_tecnico', newStatus: 'en_bodega', comment: 'Devuelto a bodega sin instalar · cambio de plan', createdBy: 'mgarcia', createdAt: '2025-01-25T16:00:00Z' },
];

export const MOCK_PMT_INITIALIZATIONS: Initialization[] = [
  { id: 1, serie: 'VX001242', terminal: 'T00001', version: '4.12.3', apn: 'internet.claro.hn', resultado: 'OK', createdBy: 'dcastro', createdAt: '2025-01-28T10:00:00Z' },
  { id: 2, serie: 'VX001243', terminal: 'T00002', version: '4.12.3', apn: 'internet.tigo.hn', resultado: 'OK', createdBy: 'dcastro', createdAt: '2025-01-28T10:30:00Z' },
  { id: 3, serie: 'VX001244', terminal: 'T00003', version: '4.12.3', apn: 'internet.postek.hn', resultado: 'OK', createdBy: 'dcastro', createdAt: '2025-02-01T09:00:00Z' },
  { id: 4, serie: 'VX001245', terminal: 'T00004', version: '4.12.5', apn: 'internet.claro.hn', resultado: 'OK', createdBy: 'fmora', createdAt: '2025-02-01T09:30:00Z' },
  { id: 5, serie: 'VX001253', terminal: 'T00005', version: '4.12.5', apn: 'internet.tigo.hn', resultado: 'OK', createdBy: 'fmora', createdAt: '2025-03-05T11:00:00Z' },
  { id: 6, serie: 'VX001254', terminal: 'T00006', version: '4.12.5', apn: 'internet.postek.hn', resultado: 'OK', createdBy: 'dcastro', createdAt: '2025-03-08T11:00:00Z' },
  { id: 7, serie: 'VX001236', terminal: '', version: '4.11.0', apn: 'internet.claro.hn', resultado: 'FALLO - timeout', createdBy: 'fmora', createdAt: '2025-01-15T14:00:00Z' },
];

export const MOCK_PMT_HISTORICAL: HistoricalRecord[] = [
  { id: 1, serie: 'VX001242', modelo: 'VX820', comercio: 'Supermercado La Colonia', direccion: 'Blvd. del Norte Km 2', ciudad: 'San Pedro Sula', zona: 'Norte', accion: 'instalacion', descripcion: 'Instalación inicial en comercio', createdBy: 'mgarcia', createdAt: '2025-03-01T08:05:00Z' },
  { id: 2, serie: 'VX001243', modelo: 'VX820', comercio: 'Farmacia San Judas', direccion: 'Frente al Mercado Los Dolores', ciudad: 'Tegucigalpa', zona: 'Centro', accion: 'instalacion', createdBy: 'rmartinez', createdAt: '2025-03-01T08:10:00Z' },
  { id: 3, serie: 'VX001250', modelo: 'VX820', comercio: 'Comercio Retirado S.A.', zona: 'Sur', accion: 'retiro', descripcion: 'Retiro por cierre de comercio', createdBy: 'admin', createdAt: '2025-01-15T08:05:00Z' },
  { id: 4, serie: 'VX001246', modelo: 'VX520', comercio: 'Tienda Don Juan', ciudad: 'Choluteca', zona: 'Sur', accion: 'reparacion', descripcion: 'Retiro por pantalla dañada · envío a taller', createdBy: 'mherrera', createdAt: '2025-04-01T08:10:00Z' },
  { id: 5, serie: 'VX001247', modelo: 'Lane3000', zona: 'Este', accion: 'reparacion', descripcion: 'Envío a garantía por defecto de fábrica', createdBy: 'admin', createdAt: '2025-04-05T08:10:00Z' },
  { id: 6, serie: 'VX001256', modelo: 'VX520', zona: 'Oeste', accion: 'reparacion', descripcion: 'Ingreso a taller · falla GPRS', createdBy: 'mgarcia', createdAt: '2025-03-10T08:15:00Z' },
];

export const MOCK_PMT_ASSIGNED_HISTORY: AssignedPosHistory[] = [
  { id: 1, serie: 'VX001238', modelo: 'VX520', assignedTo: 'jlopez', role: 'supervisor', assignedAt: '2025-02-01T09:00:00Z' },
  { id: 2, serie: 'VX001239', modelo: 'VX520', assignedTo: 'jlopez', role: 'supervisor', assignedAt: '2025-02-01T09:00:00Z' },
  { id: 3, serie: 'VX001240', modelo: 'Lane3000', assignedTo: 'mgarcia', role: 'tecnico', assignedAt: '2025-02-05T10:00:00Z' },
  { id: 4, serie: 'VX001241', modelo: 'Lane3000', assignedTo: 'rmartinez', role: 'tecnico', assignedAt: '2025-02-10T10:00:00Z' },
  { id: 5, serie: 'VX001245', modelo: 'VX520', assignedTo: 'mgarcia', role: 'tecnico', assignedAt: '2025-01-20T10:00:00Z', returnedAt: '2025-03-01T08:00:00Z', comment: 'Devuelto tras instalación exitosa' },
  { id: 6, serie: 'VX001252', modelo: 'Lane3000', assignedTo: 'mgarcia', role: 'tecnico', assignedAt: '2025-04-01T09:00:00Z' },
  { id: 7, serie: 'VX001255', modelo: 'Move5000', assignedTo: 'psanchez', role: 'ejecutivo', assignedAt: '2025-04-01T09:00:00Z', comment: 'Demo / prueba comercial' },
  { id: 8, serie: 'VX001242', modelo: 'VX820', assignedTo: 'jlopez', role: 'supervisor', assignedAt: '2025-01-29T09:00:00Z', returnedAt: '2025-02-15T10:00:00Z' },
  { id: 9, serie: 'VX001242', modelo: 'VX820', assignedTo: 'mgarcia', role: 'tecnico', assignedAt: '2025-02-15T10:00:00Z', returnedAt: '2025-03-01T08:00:00Z', comment: 'Instalación en La Colonia' },
  { id: 10, serie: 'VX001243', modelo: 'VX820', assignedTo: 'rmartinez', role: 'tecnico', assignedAt: '2025-02-20T09:00:00Z', returnedAt: '2025-03-01T08:00:00Z' },
  { id: 11, serie: 'VX001246', modelo: 'VX520', assignedTo: 'mherrera', role: 'tecnico', assignedAt: '2025-02-18T10:00:00Z', returnedAt: '2025-04-01T08:00:00Z', comment: 'Retiro por falla' },
];

export const MOCK_PMT_QUERY_RECORDS: QueryRecord[] = [
  { id: 1, terminal: 'T00001', codigo: 'COM-00102', comercio: 'Supermercado La Colonia', direccion: 'Av Principal 123', ciudad: 'Tegucigalpa', mcc: 'M001', limite: 'L1', zona: 'Norte', fechaRegistro: '2025-03-01' },
  { id: 2, terminal: 'T00002', codigo: 'KIE001', comercio: 'Farmacia Kielsa', direccion: 'Col. Altos 45', ciudad: 'San Pedro Sula', mcc: 'M002', limite: 'L2', zona: 'Sur', fechaRegistro: '2025-03-01' },
  { id: 3, terminal: 'T00003', codigo: 'PIZ001', comercio: 'Pizza Hut Centro', direccion: 'Mall 1', ciudad: 'Tegucigalpa', mcc: 'M003', limite: 'L1', zona: 'Centro', fechaRegistro: '2025-03-05' },
  { id: 4, terminal: 'T00004', codigo: 'DIU001', comercio: 'Diunsa Plaza Premier', direccion: 'Bo La Granja 8', ciudad: 'Choloma', mcc: 'M004', limite: 'L3', zona: 'Norte', fechaRegistro: '2025-03-05' },
  { id: 5, terminal: 'T00005', codigo: 'TIG005', comercio: 'Tigo Money', direccion: 'Col Satélite 22', ciudad: 'San Pedro Sula', mcc: 'M005', limite: 'L2', zona: 'Sur', fechaRegistro: '2025-04-01' },
  { id: 6, terminal: 'T00006', codigo: 'CLA001', comercio: 'Claro Pay Norte', direccion: 'Anillo Periférico km 3', ciudad: 'Tegucigalpa', mcc: 'M006', limite: 'L1', zona: 'Norte', fechaRegistro: '2025-04-01' },
];
