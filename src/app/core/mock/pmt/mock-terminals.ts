import { Terminal, TrackingEvent, HistoricalRecord, AssignedPosHistory, Initialization, QueryRecord } from '../../models/pmt/terminal.model';

export const MOCK_PMT_TERMINALS: Terminal[] = [
  { id: 1, serie: 'VX001234', inventario: 'INV-001', modelo: 'Verifone VX520', estado: 'en_bodega', zona: 'Norte', caja: 'CAJA-01', inyectado: 'Si', fecha: '2025-01-10', createdAt: '2025-01-10T08:00:00Z', updatedAt: '2025-01-10T08:00:00Z' },
  { id: 2, serie: 'VX001235', inventario: 'INV-002', modelo: 'Verifone VX520', estado: 'en_bodega', zona: 'Sur', caja: 'CAJA-01', inyectado: 'No', fecha: '2025-01-10', createdAt: '2025-01-10T08:00:00Z', updatedAt: '2025-01-10T08:00:00Z' },
  { id: 3, serie: 'VX001236', inventario: 'INV-003', modelo: 'Ingenico Move5000', estado: 'en_inyeccion', zona: 'Centro', caja: 'CAJA-02', inyectado: 'No', fecha: '2025-01-12', createdAt: '2025-01-12T08:00:00Z', updatedAt: '2025-01-15T08:00:00Z' },
  { id: 4, serie: 'VX001237', inventario: 'INV-004', modelo: 'Ingenico Move5000', estado: 'en_inyeccion', zona: 'Este', caja: 'CAJA-02', inyectado: 'No', fecha: '2025-01-12', createdAt: '2025-01-12T08:00:00Z', updatedAt: '2025-01-15T08:00:00Z' },
  { id: 5, serie: 'VX001238', inventario: 'INV-005', modelo: 'Verifone VX520', estado: 'asignado_supervisor', zona: 'Norte', assignedTo: 'jlopez', assignedAt: '2025-02-01T09:00:00Z', createdAt: '2025-01-15T08:00:00Z', updatedAt: '2025-02-01T09:00:00Z' },
  { id: 6, serie: 'VX001239', inventario: 'INV-006', modelo: 'Verifone VX520', estado: 'asignado_supervisor', zona: 'Sur', assignedTo: 'jlopez', assignedAt: '2025-02-01T09:00:00Z', createdAt: '2025-01-15T08:00:00Z', updatedAt: '2025-02-01T09:00:00Z' },
  { id: 7, serie: 'VX001240', inventario: 'INV-007', modelo: 'Ingenico Lane3000', estado: 'asignado_tecnico', zona: 'Centro', assignedTo: 'mgarcia', assignedAt: '2025-02-05T10:00:00Z', createdAt: '2025-01-20T08:00:00Z', updatedAt: '2025-02-05T10:00:00Z' },
  { id: 8, serie: 'VX001241', inventario: 'INV-008', modelo: 'Ingenico Lane3000', estado: 'asignado_tecnico', zona: 'Este', assignedTo: 'rmartinez', assignedAt: '2025-02-10T10:00:00Z', createdAt: '2025-01-20T08:00:00Z', updatedAt: '2025-02-10T10:00:00Z' },
  { id: 9, serie: 'VX001242', inventario: 'INV-009', modelo: 'Verifone VX820', estado: 'instalado', zona: 'Norte', nombre: 'Supermercado La Colonia', codigo: 'COL001', terminal: 'T00001', direccion: 'Av Principal 123', ciudad: 'Tegucigalpa', comunicacion: 'GPRS', chip: '8950-001', createdAt: '2025-01-25T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z' },
  { id: 10, serie: 'VX001243', inventario: 'INV-010', modelo: 'Verifone VX820', estado: 'instalado', zona: 'Sur', nombre: 'Farmacia Kielsa', codigo: 'KIE001', terminal: 'T00002', direccion: 'Col. Altos 45', ciudad: 'San Pedro Sula', comunicacion: 'IP', chip: '8950-002', createdAt: '2025-01-25T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z' },
  { id: 11, serie: 'VX001244', inventario: 'INV-011', modelo: 'Verifone VX520', estado: 'instalado', zona: 'Centro', nombre: 'Pizza Hut Centro', codigo: 'PIZ001', terminal: 'T00003', direccion: 'Centro Comercial Mall 1', ciudad: 'Tegucigalpa', comunicacion: 'IP', createdAt: '2025-02-01T08:00:00Z', updatedAt: '2025-03-05T08:00:00Z' },
  { id: 12, serie: 'VX001245', inventario: 'INV-012', modelo: 'Ingenico Move5000', estado: 'instalado', zona: 'Norte', nombre: 'Banco Atlántida Sucursal Norte', codigo: 'ATL001', terminal: 'T00004', direccion: 'Bo La Granja 8', ciudad: 'Choloma', comunicacion: 'GPRS', createdAt: '2025-02-01T08:00:00Z', updatedAt: '2025-03-05T08:00:00Z' },
  { id: 13, serie: 'VX001246', inventario: 'INV-013', modelo: 'Verifone VX520', estado: 'en_reparacion', zona: 'Sur', nombre: 'Ex: Tienda Don Juan', createdAt: '2025-02-10T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 14, serie: 'VX001247', inventario: 'INV-014', modelo: 'Ingenico Lane3000', estado: 'garantia', zona: 'Este', createdAt: '2025-02-15T08:00:00Z', updatedAt: '2025-04-05T08:00:00Z' },
  { id: 15, serie: 'VX001248', inventario: 'INV-015', modelo: 'Verifone VX520', estado: 'irreparable', zona: 'Norte', createdAt: '2025-01-01T08:00:00Z', updatedAt: '2025-03-15T08:00:00Z' },
  { id: 16, serie: 'VX001249', inventario: 'INV-016', modelo: 'Ingenico Move5000', estado: 'obsoleto', zona: 'Centro', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2025-02-01T08:00:00Z' },
  { id: 17, serie: 'VX001250', inventario: 'INV-017', modelo: 'Verifone VX820', estado: 'retirado', zona: 'Sur', nombre: 'Comercio Retirado S.A.', createdAt: '2024-06-01T08:00:00Z', updatedAt: '2025-01-15T08:00:00Z' },
  { id: 18, serie: 'VX001251', inventario: 'INV-018', modelo: 'Verifone VX520', estado: 'serie_sustituida', zona: 'Norte', createdAt: '2024-03-01T08:00:00Z', updatedAt: '2025-02-20T08:00:00Z' },
  { id: 19, serie: 'VX001252', inventario: 'INV-019', modelo: 'Ingenico Lane3000', estado: 'en_bodega', zona: 'Este', caja: 'CAJA-03', inyectado: 'Si', fecha: '2025-03-01', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z' },
  { id: 20, serie: 'VX001253', inventario: 'INV-020', modelo: 'Verifone VX820', estado: 'instalado', zona: 'Sur', nombre: 'Tigo Money Agente 5', codigo: 'TIG005', terminal: 'T00005', direccion: 'Col Satélite 22', ciudad: 'San Pedro Sula', comunicacion: 'GPRS', chip: '8950-003', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 21, serie: 'VX001254', inventario: 'INV-021', modelo: 'Verifone VX820', estado: 'instalado', zona: 'Norte', nombre: 'Claro Pay Norte', codigo: 'CLA001', terminal: 'T00006', direccion: 'Anillo Periférico km 3', ciudad: 'Tegucigalpa', comunicacion: 'IP', createdAt: '2025-03-05T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 22, serie: 'VX001255', inventario: 'INV-022', modelo: 'Ingenico Move5000', estado: 'asignado_tecnico', zona: 'Centro', assignedTo: 'mgarcia', assignedAt: '2025-04-01T09:00:00Z', createdAt: '2025-03-10T08:00:00Z', updatedAt: '2025-04-01T09:00:00Z' },
  { id: 23, serie: 'VX001256', inventario: 'INV-023', modelo: 'Verifone VX520', estado: 'en_bodega', zona: 'Oeste', caja: 'CAJA-04', inyectado: 'No', fecha: '2025-04-01', createdAt: '2025-04-01T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 24, serie: 'VX001257', inventario: 'INV-024', modelo: 'Ingenico Lane3000', estado: 'en_bodega', zona: 'Oeste', caja: 'CAJA-04', inyectado: 'No', fecha: '2025-04-01', createdAt: '2025-04-01T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 25, serie: 'VX001258', inventario: 'INV-025', modelo: 'Verifone VX820', estado: 'en_reparacion', zona: 'Norte', createdAt: '2025-04-05T08:00:00Z', updatedAt: '2025-04-10T08:00:00Z' },
];

export const MOCK_PMT_TRACKING: TrackingEvent[] = [
  { id: 1, terminalId: 13, serie: 'VX001246', previousStatus: 'instalado', newStatus: 'en_reparacion', comment: 'Pantalla dañada', createdBy: 'admin', createdAt: '2025-04-01T08:00:00Z' },
  { id: 2, terminalId: 14, serie: 'VX001247', previousStatus: 'instalado', newStatus: 'garantia', comment: 'Defecto de fábrica', createdBy: 'admin', createdAt: '2025-04-05T08:00:00Z' },
  { id: 3, terminalId: 5, serie: 'VX001238', previousStatus: 'en_bodega', newStatus: 'asignado_supervisor', comment: 'Asignado para distribución zona norte', createdBy: 'jlopez', createdAt: '2025-02-01T09:00:00Z' },
  { id: 4, terminalId: 9, serie: 'VX001242', previousStatus: 'asignado_tecnico', newStatus: 'instalado', comment: 'Instalación completada en comercio', createdBy: 'mgarcia', createdAt: '2025-03-01T08:00:00Z' },
  { id: 5, terminalId: 10, serie: 'VX001243', previousStatus: 'asignado_tecnico', newStatus: 'instalado', comment: 'Instalado correctamente', createdBy: 'rmartinez', createdAt: '2025-03-01T08:00:00Z' },
];

export const MOCK_PMT_INITIALIZATIONS: Initialization[] = [
  { id: 1, serie: 'VX001242', terminal: 'T00001', version: '4.12.3', apn: 'internet.claro.hn', resultado: 'OK', createdBy: 'inyector1', createdAt: '2025-01-28T10:00:00Z' },
  { id: 2, serie: 'VX001243', terminal: 'T00002', version: '4.12.3', apn: 'internet.tigo.hn', resultado: 'OK', createdBy: 'inyector1', createdAt: '2025-01-28T10:30:00Z' },
  { id: 3, serie: 'VX001244', terminal: 'T00003', version: '4.12.3', apn: 'internet.postek.hn', resultado: 'OK', createdBy: 'inyector1', createdAt: '2025-02-01T09:00:00Z' },
  { id: 4, serie: 'VX001245', terminal: 'T00004', version: '4.12.5', apn: 'internet.claro.hn', resultado: 'OK', createdBy: 'inyector2', createdAt: '2025-02-01T09:30:00Z' },
  { id: 5, serie: 'VX001253', terminal: 'T00005', version: '4.12.5', apn: 'internet.tigo.hn', resultado: 'OK', createdBy: 'inyector2', createdAt: '2025-03-05T11:00:00Z' },
  { id: 6, serie: 'VX001254', terminal: 'T00006', version: '4.12.5', apn: 'internet.postek.hn', resultado: 'OK', createdBy: 'inyector1', createdAt: '2025-03-08T11:00:00Z' },
  { id: 7, serie: 'VX001236', terminal: '', version: '4.11.0', apn: 'internet.claro.hn', resultado: 'FALLO - timeout', createdBy: 'inyector2', createdAt: '2025-01-15T14:00:00Z' },
];

export const MOCK_PMT_HISTORICAL: HistoricalRecord[] = [
  { id: 1, serie: 'VX001242', modelo: 'Verifone VX820', comercio: 'Supermercado La Colonia', direccion: 'Av Principal 123', ciudad: 'Tegucigalpa', zona: 'Norte', accion: 'instalacion', descripcion: 'Instalación inicial en comercio', createdBy: 'mgarcia', createdAt: '2025-03-01T08:00:00Z' },
  { id: 2, serie: 'VX001243', modelo: 'Verifone VX820', comercio: 'Farmacia Kielsa', direccion: 'Col. Altos 45', ciudad: 'San Pedro Sula', zona: 'Sur', accion: 'instalacion', createdBy: 'rmartinez', createdAt: '2025-03-01T09:00:00Z' },
  { id: 3, serie: 'VX001250', modelo: 'Verifone VX820', comercio: 'Comercio Retirado S.A.', zona: 'Sur', accion: 'retiro', descripcion: 'Retiro por cierre de comercio', createdBy: 'admin', createdAt: '2025-01-15T08:00:00Z' },
  { id: 4, serie: 'VX001246', modelo: 'Verifone VX520', accion: 'reparacion', descripcion: 'Enviado a taller por pantalla dañada', createdBy: 'admin', createdAt: '2025-04-01T08:00:00Z' },
];

export const MOCK_PMT_ASSIGNED_HISTORY: AssignedPosHistory[] = [
  { id: 1, serie: 'VX001238', modelo: 'Verifone VX520', assignedTo: 'jlopez', role: 'supervisor', assignedAt: '2025-02-01T09:00:00Z' },
  { id: 2, serie: 'VX001239', modelo: 'Verifone VX520', assignedTo: 'jlopez', role: 'supervisor', assignedAt: '2025-02-01T09:00:00Z' },
  { id: 3, serie: 'VX001240', modelo: 'Ingenico Lane3000', assignedTo: 'mgarcia', role: 'tecnico', assignedAt: '2025-02-05T10:00:00Z' },
  { id: 4, serie: 'VX001241', modelo: 'Ingenico Lane3000', assignedTo: 'rmartinez', role: 'tecnico', assignedAt: '2025-02-10T10:00:00Z' },
  { id: 5, serie: 'VX001245', modelo: 'Verifone VX520', assignedTo: 'mgarcia', role: 'tecnico', assignedAt: '2025-01-20T10:00:00Z', returnedAt: '2025-03-01T08:00:00Z', comment: 'Devuelto tras instalación exitosa' },
  { id: 6, serie: 'VX001252', modelo: 'Ingenico Lane3000', assignedTo: 'mgarcia', role: 'tecnico', assignedAt: '2025-04-01T09:00:00Z' },
];

export const MOCK_PMT_QUERY_RECORDS: QueryRecord[] = [
  { id: 1, terminal: 'T00001', codigo: 'COL001', comercio: 'Supermercado La Colonia', direccion: 'Av Principal 123', ciudad: 'Tegucigalpa', mcc: 'M001', limite: 'L1', zona: 'Norte', fechaRegistro: '2025-03-01' },
  { id: 2, terminal: 'T00002', codigo: 'KIE001', comercio: 'Farmacia Kielsa', direccion: 'Col. Altos 45', ciudad: 'San Pedro Sula', mcc: 'M002', limite: 'L2', zona: 'Sur', fechaRegistro: '2025-03-01' },
  { id: 3, terminal: 'T00003', codigo: 'PIZ001', comercio: 'Pizza Hut Centro', direccion: 'Mall 1', ciudad: 'Tegucigalpa', mcc: 'M003', limite: 'L1', zona: 'Centro', fechaRegistro: '2025-03-05' },
  { id: 4, terminal: 'T00004', codigo: 'ATL001', comercio: 'Banco Atlántida', direccion: 'Bo La Granja 8', ciudad: 'Choloma', mcc: 'M004', limite: 'L3', zona: 'Norte', fechaRegistro: '2025-03-05' },
  { id: 5, terminal: 'T00005', codigo: 'TIG005', comercio: 'Tigo Money', direccion: 'Col Satélite 22', ciudad: 'San Pedro Sula', mcc: 'M005', limite: 'L2', zona: 'Sur', fechaRegistro: '2025-04-01' },
  { id: 6, terminal: 'T00006', codigo: 'CLA001', comercio: 'Claro Pay Norte', direccion: 'Anillo Periférico km 3', ciudad: 'Tegucigalpa', mcc: 'M006', limite: 'L1', zona: 'Norte', fechaRegistro: '2025-04-01' },
];
