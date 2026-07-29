import { SimCard, SimCardTracking } from '../../models/pmt/sim-card.model';

export const MOCK_PMT_SIM_CARDS: SimCard[] = [
  { id: 1, iccid: '8950410112340001', numero: '+50430000001', compania: 'Claro', estado: 'instalada', assignedTo: 'mgarcia', terminalSerie: 'VX001242', apn: 'internet.claro.hn', ip: '10.0.0.1', createdAt: '2025-01-10T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z' },
  { id: 2, iccid: '8950410112340002', numero: '+50430000002', compania: 'Tigo', estado: 'instalada', assignedTo: 'rmartinez', terminalSerie: 'VX001243', apn: 'internet.tigo.hn', ip: '10.0.0.2', createdAt: '2025-01-10T08:00:00Z', updatedAt: '2025-03-01T08:00:00Z' },
  { id: 3, iccid: '8950410112340003', numero: '+50430000003', compania: 'Postek', estado: 'instalada', assignedTo: 'mgarcia', terminalSerie: 'VX001244', apn: 'internet.postek.hn', createdAt: '2025-01-15T08:00:00Z', updatedAt: '2025-02-01T08:00:00Z' },
  { id: 4, iccid: '8950410112340004', numero: '+50430000004', compania: 'Claro', estado: 'disponible', createdAt: '2025-02-01T08:00:00Z', updatedAt: '2025-02-01T08:00:00Z' },
  { id: 5, iccid: '8950410112340005', numero: '+50430000005', compania: 'Tigo', estado: 'disponible', createdAt: '2025-02-01T08:00:00Z', updatedAt: '2025-02-01T08:00:00Z' },
  { id: 6, iccid: '8950410112340006', numero: '+50430000006', compania: 'Postek', estado: 'disponible', createdAt: '2025-02-01T08:00:00Z', updatedAt: '2025-02-01T08:00:00Z' },
  { id: 7, iccid: '8950410112340007', numero: '+50430000007', compania: 'Claro', estado: 'asignada', assignedTo: 'mgarcia', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 8, iccid: '8950410112340008', numero: '+50430000008', compania: 'Tigo', estado: 'asignada', assignedTo: 'rmartinez', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 9, iccid: '8950410112340009', numero: '+50430000009', compania: 'Claro', estado: 'suspendida', notes: 'Suspendida por falta de pago', createdAt: '2024-06-01T08:00:00Z', updatedAt: '2025-01-01T08:00:00Z' },
  { id: 10, iccid: '8950410112340010', numero: '+50430000010', compania: 'Postek', estado: 'baja', notes: 'Dada de baja por chip dañado', createdAt: '2024-01-01T08:00:00Z', updatedAt: '2024-12-01T08:00:00Z' },
  { id: 11, iccid: '8950410112340011', numero: '+50430000011', compania: 'Claro', estado: 'instalada', terminalSerie: 'VX001253', apn: 'internet.claro.hn', ip: '10.0.0.3', createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
  { id: 12, iccid: '8950410112340012', numero: '+50430000012', compania: 'Tigo', estado: 'disponible', createdAt: '2025-04-01T08:00:00Z', updatedAt: '2025-04-01T08:00:00Z' },
];

export const MOCK_PMT_SIM_TRACKING: SimCardTracking[] = [
  { id: 1, simCardId: 1, iccid: '8950410112340001', previousStatus: 'disponible', newStatus: 'asignada', comment: 'Asignada a técnico mgarcia', createdBy: 'admin', createdAt: '2025-02-01T08:00:00Z' },
  { id: 2, simCardId: 1, iccid: '8950410112340001', previousStatus: 'asignada', newStatus: 'instalada', comment: 'Instalada en terminal VX001242', createdBy: 'mgarcia', createdAt: '2025-03-01T08:00:00Z' },
  { id: 3, simCardId: 9, iccid: '8950410112340009', previousStatus: 'instalada', newStatus: 'suspendida', comment: 'Suspendida por morosidad', createdBy: 'admin', createdAt: '2025-01-01T08:00:00Z' },
];
