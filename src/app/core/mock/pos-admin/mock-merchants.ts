import { Installation, Merchant } from '../../models/pos-admin';

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const MOCK_MERCHANTS: Merchant[] = [
  {
    id: 'mer-1', affiliateCode: 'AF-00101', tradeName: 'Farmacia San Judas', mcc: '5912', mccDescription: 'Farmacias',
    department: 'Francisco Morazán', municipality: 'Tegucigalpa', address: 'Frente al Mercado Los Dolores, Tegucigalpa',
    status: 'active', createdAt: daysAgoIso(65), responsibleName: 'Roberto Mendoza',
  },
  {
    id: 'mer-2', affiliateCode: 'AF-00102', tradeName: 'Supermercado La Colonia', mcc: '5411', mccDescription: 'Supermercados',
    department: 'Cortés', municipality: 'San Pedro Sula', address: 'Blvd. del Norte Km 2, San Pedro Sula',
    status: 'active', createdAt: daysAgoIso(30), responsibleName: 'Patricia Morales',
  },
  {
    id: 'mer-3', affiliateCode: 'AF-00103', tradeName: 'Restaurante La Finca', mcc: '5812', mccDescription: 'Restaurantes',
    department: 'Francisco Morazán', municipality: 'Tegucigalpa', address: 'Blvd. Suyapa, Tegucigalpa',
    status: 'active', createdAt: daysAgoIso(35), responsibleName: 'Roberto Mendoza',
  },
  {
    id: 'mer-4', affiliateCode: 'AF-00104', tradeName: 'Ferretería Central', mcc: '5251', mccDescription: 'Ferreterías',
    department: 'Cortés', municipality: 'Choloma', address: 'Col. Satélite, Choloma',
    status: 'active', createdAt: daysAgoIso(95), responsibleName: 'Patricia Morales',
  },
  {
    id: 'mer-5', affiliateCode: 'AF-00105', tradeName: 'Panadería Doña Elsa', mcc: '5462', mccDescription: 'Panaderías',
    department: 'Atlántida', municipality: 'La Ceiba', address: 'Barrio El Centro, La Ceiba',
    status: 'inactive', createdAt: daysAgoIso(400),
  },
  {
    id: 'mer-6', affiliateCode: 'AF-00106', tradeName: 'Clínica Vida Sana', mcc: '8011', mccDescription: 'Servicios médicos',
    department: 'Choluteca', municipality: 'Choluteca', address: 'Barrio El Centro, Choluteca',
    status: 'inactive', createdAt: daysAgoIso(200),
  },
];

export const MOCK_INSTALLATIONS: Installation[] = [
  {
    id: 'ins-1', posUnitId: 'unit-1', serialNumber: 'PAX-A920-000101', brand: 'PAX', model: 'A920',
    merchantId: 'mer-1', merchantName: 'Farmacia San Judas', installedAt: daysAgoIso(50),
    responsibleUserId: 'tec-1', responsibleName: 'Roberto Mendoza', responsibleRole: 'technician',
    latitude: 14.0723, longitude: -87.1921, initialStatus: 'Operativo', observations: 'Instalación sin novedades',
  },
  {
    id: 'ins-2', posUnitId: 'unit-4', serialNumber: 'SUNMI-V2P-000201', brand: 'Sunmi', model: 'V2 Pro',
    merchantId: 'mer-2', merchantName: 'Supermercado La Colonia', installedAt: daysAgoIso(18),
    responsibleUserId: 'exe-1', responsibleName: 'Patricia Morales', responsibleRole: 'executive',
    latitude: 15.5040, longitude: -88.0250, initialStatus: 'Operativo',
  },
  {
    id: 'ins-3', posUnitId: 'unit-11', serialNumber: 'INGE-MOVE5000-000601', brand: 'Ingenico', model: 'Move 5000',
    merchantId: 'mer-3', merchantName: 'Restaurante La Finca', installedAt: daysAgoIso(22),
    responsibleUserId: 'tec-1', responsibleName: 'Roberto Mendoza', responsibleRole: 'technician',
    latitude: 14.0833, longitude: -87.1833, initialStatus: 'Operativo',
  },
  {
    id: 'ins-4', posUnitId: 'unit-12', serialNumber: 'SUNMI-T2S-000701', brand: 'Sunmi', model: 'T2s',
    merchantId: 'mer-4', merchantName: 'Ferretería Central', installedAt: daysAgoIso(85),
    responsibleUserId: 'exe-1', responsibleName: 'Patricia Morales', responsibleRole: 'executive',
    initialStatus: 'Operativo',
  },
];
