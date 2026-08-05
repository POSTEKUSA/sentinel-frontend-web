import { Transaccion, SoportePmt } from '../../models/pmt/transaccion.model';

export const MOCK_PMT_TRANSACCIONES: Transaccion[] = [
  { id: 1, serie: 'VX001242', terminal: 'T00001', mti: '0200', processingCode: '980000', apn: 'internet.claro.hn', aplicacion: '4.12.3', emv: '2.6.1', so: 'VOS 3.2', comercio: 'Supermercado La Colonia', mcc: 'M001', respuesta: '00', ip: '10.0.0.1', createdAt: '2025-04-16T08:00:00Z' },
  { id: 2, serie: 'VX001243', terminal: 'T00002', mti: '0200', processingCode: '980000', apn: 'internet.tigo.hn', aplicacion: '4.12.3', emv: '2.6.1', so: 'VOS 3.2', comercio: 'Farmacia Kielsa', mcc: 'M002', respuesta: '00', ip: '10.0.0.2', createdAt: '2025-04-16T08:05:00Z' },
  { id: 3, serie: 'VX001244', terminal: 'T00003', mti: '0800', processingCode: '900000', apn: 'internet.postek.hn', aplicacion: '4.12.3', emv: '2.6.1', so: 'VOS 3.2', comercio: 'Pizza Hut Centro', mcc: 'M003', respuesta: '00', ip: '10.0.0.3', createdAt: '2025-04-16T08:10:00Z' },
  { id: 4, serie: 'VX001242', terminal: 'T00001', mti: '0200', processingCode: '980000', apn: 'internet.claro.hn', aplicacion: '4.12.3', emv: '2.6.1', so: 'VOS 3.2', comercio: 'Supermercado La Colonia', mcc: 'M001', respuesta: '00', ip: '10.0.0.1', createdAt: '2025-04-16T09:00:00Z' },
  { id: 5, serie: 'VX001245', terminal: 'T00004', mti: '0200', processingCode: '980000', apn: 'internet.claro.hn', aplicacion: '4.12.5', emv: '2.7.0', so: 'VOS 3.3', comercio: 'Diunsa Plaza Premier', mcc: 'M004', respuesta: '05', ip: '10.0.0.4', createdAt: '2025-04-16T09:15:00Z' },
  { id: 6, serie: 'VX001253', terminal: 'T00005', mti: '0200', processingCode: '980000', apn: 'internet.tigo.hn', aplicacion: '4.12.5', emv: '2.7.0', so: 'VOS 3.3', comercio: 'Tigo Money', mcc: 'M005', respuesta: '00', ip: '10.0.0.5', createdAt: '2025-04-16T10:00:00Z' },
  { id: 7, serie: 'VX001254', terminal: 'T00006', mti: '0800', processingCode: '900000', apn: 'internet.postek.hn', aplicacion: '4.12.5', emv: '2.7.0', so: 'VOS 3.3', comercio: 'Claro Pay Norte', mcc: 'M006', respuesta: '00', ip: '10.0.0.6', createdAt: '2025-04-16T10:30:00Z' },
  { id: 8, serie: 'VX001243', terminal: 'T00002', mti: '0200', processingCode: '980000', apn: 'internet.tigo.hn', aplicacion: '4.12.3', emv: '2.6.1', so: 'VOS 3.2', comercio: 'Farmacia Kielsa', mcc: 'M002', respuesta: '00', ip: '10.0.0.2', createdAt: '2025-04-16T11:00:00Z' },
];

export const MOCK_PMT_SOPORTE_PMT: SoportePmt[] = [
  { id: 1, serie: 'VX001242', terminal: 'T00001', tipo: 'Fallo de comunicación', descripcion: 'El POS no puede conectarse al servidor de autorización. Error 998.', estado: 'pendiente', createdBy: 'inyector1', createdAt: '2025-04-15T08:00:00Z', updatedAt: '2025-04-15T08:00:00Z' },
  { id: 2, serie: 'VX001243', terminal: 'T00002', tipo: 'Error de aplicación', descripcion: 'La app cierra al intentar procesar transacción. Código de error: APP_ERR_001', estado: 'en_proceso', createdBy: 'inyector2', createdAt: '2025-04-12T09:00:00Z', updatedAt: '2025-04-13T14:00:00Z' },
  { id: 3, serie: 'VX001244', terminal: 'T00003', tipo: 'Configuración APN', descripcion: 'APN no configurado correctamente. Solicitud de reconfiguración remota.', estado: 'resuelto', createdBy: 'inyector1', createdAt: '2025-04-01T08:00:00Z', updatedAt: '2025-04-02T10:00:00Z' },
  { id: 4, tipo: 'Consulta', descripcion: '¿Cuál es el procedimiento para actualizar la versión de firmware a 4.12.5?', estado: 'resuelto', createdBy: 'inyector2', createdAt: '2025-03-25T11:00:00Z', updatedAt: '2025-03-26T09:00:00Z' },
  { id: 5, serie: 'VX001253', terminal: 'T00005', tipo: 'Error de inicialización', descripcion: 'Terminal no completa el proceso de inicialización. Se detiene en paso 3/7.', estado: 'pendiente', createdBy: 'inyector1', createdAt: '2025-04-16T07:00:00Z', updatedAt: '2025-04-16T07:00:00Z' },
];
