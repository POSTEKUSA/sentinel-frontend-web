import { Installation, Merchant } from '../../models/pos-admin';

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const MOCK_MERCHANTS: Merchant[] = [
  {
    id: 'mer-1', affiliateCode: 'AF-00101', tradeName: 'Farmacia San Judas', mcc: '5912', mccDescription: 'Farmacias',
    department: 'Managua', municipality: 'Managua', address: 'Frente al Mercado Oriental, Managua',
    status: 'active', createdAt: daysAgoIso(65), responsibleName: 'Roberto Mendoza',
  },
  {
    id: 'mer-2', affiliateCode: 'AF-00102', tradeName: 'Supermercado La Colonia', mcc: '5411', mccDescription: 'Supermercados',
    department: 'León', municipality: 'León', address: 'Km 2 carretera a Poneloya, León',
    status: 'active', createdAt: daysAgoIso(30), responsibleName: 'Patricia Morales',
  },
  {
    id: 'mer-3', affiliateCode: 'AF-00103', tradeName: 'Restaurante El Portón', mcc: '5812', mccDescription: 'Restaurantes',
    department: 'Managua', municipality: 'Managua', address: 'Carretera Masaya Km 8.5, Managua',
    status: 'active', createdAt: daysAgoIso(35), responsibleName: 'Roberto Mendoza',
  },
  {
    id: 'mer-4', affiliateCode: 'AF-00104', tradeName: 'Ferretería Central', mcc: '5251', mccDescription: 'Ferreterías',
    department: 'Managua', municipality: 'Ciudad Sandino', address: 'Barrio Camilo Chamorro, Ciudad Sandino',
    status: 'active', createdAt: daysAgoIso(95), responsibleName: 'Patricia Morales',
  },
  {
    id: 'mer-5', affiliateCode: 'AF-00105', tradeName: 'Panadería Doña Elsa', mcc: '5462', mccDescription: 'Panaderías',
    department: 'Masaya', municipality: 'Masaya', address: 'Barrio Monimbó, Masaya',
    status: 'inactive', createdAt: daysAgoIso(400),
  },
  {
    id: 'mer-6', affiliateCode: 'AF-00106', tradeName: 'Clínica Vida Sana', mcc: '8011', mccDescription: 'Servicios médicos',
    department: 'Chinandega', municipality: 'Chinandega', address: 'Reparto San Antonio, Chinandega',
    status: 'suspended', createdAt: daysAgoIso(200),
  },
];

export const MOCK_INSTALLATIONS: Installation[] = [
  {
    id: 'ins-1', posUnitId: 'unit-1', serialNumber: 'PAX-A920-000101', brand: 'PAX', model: 'A920',
    merchantId: 'mer-1', merchantName: 'Farmacia San Judas', installedAt: daysAgoIso(50),
    responsibleUserId: 'tec-1', responsibleName: 'Roberto Mendoza', responsibleRole: 'technician',
    latitude: 12.1364, longitude: -86.2514, initialStatus: 'Operativo', observations: 'Instalación sin novedades',
  },
  {
    id: 'ins-2', posUnitId: 'unit-4', serialNumber: 'SUNMI-V2P-000201', brand: 'Sunmi', model: 'V2 Pro',
    merchantId: 'mer-2', merchantName: 'Supermercado La Colonia', installedAt: daysAgoIso(18),
    responsibleUserId: 'exe-1', responsibleName: 'Patricia Morales', responsibleRole: 'executive',
    latitude: 12.4340, longitude: -86.8780, initialStatus: 'Operativo',
  },
  {
    id: 'ins-3', posUnitId: 'unit-11', serialNumber: 'INGE-MOVE5000-000601', brand: 'Ingenico', model: 'Move 5000',
    merchantId: 'mer-3', merchantName: 'Restaurante El Portón', installedAt: daysAgoIso(22),
    responsibleUserId: 'tec-1', responsibleName: 'Roberto Mendoza', responsibleRole: 'technician',
    latitude: 12.0850, longitude: -86.1650, initialStatus: 'Operativo',
  },
  {
    id: 'ins-4', posUnitId: 'unit-12', serialNumber: 'SUNMI-T2S-000701', brand: 'Sunmi', model: 'T2s',
    merchantId: 'mer-4', merchantName: 'Ferretería Central', installedAt: daysAgoIso(85),
    responsibleUserId: 'exe-1', responsibleName: 'Patricia Morales', responsibleRole: 'executive',
    initialStatus: 'Operativo',
  },
];
