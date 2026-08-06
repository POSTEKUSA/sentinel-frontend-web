import { Installation, Merchant, MerchantSite } from '../../models/pos-admin';

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const MOCK_MERCHANTS: Merchant[] = [
  {
    id: 'mer-1', affiliateCode: 'COM-00101', tradeName: 'Farmacia San Judas', mcc: '5912', mccDescription: 'Farmacias',
    department: 'Francisco Morazán', municipality: 'Tegucigalpa', address: 'Frente al Mercado Los Dolores, Tegucigalpa',
    pais: 'Honduras', ciudad: 'Tegucigalpa', zona: 'Centro', warehouseId: 1,
    status: 'active', createdAt: daysAgoIso(65), responsibleName: 'Roberto Mendoza',
  },
  {
    id: 'mer-2', affiliateCode: 'COM-00102', tradeName: 'Supermercado La Colonia', mcc: '5411', mccDescription: 'Supermercados',
    department: 'Cortés', municipality: 'San Pedro Sula', address: 'Blvd. del Norte Km 2, San Pedro Sula',
    pais: 'Honduras', ciudad: 'San Pedro Sula', zona: 'Norte', warehouseId: 2,
    status: 'active', createdAt: daysAgoIso(30), responsibleName: 'Patricia Morales',
  },
  {
    id: 'mer-3', affiliateCode: 'COM-00103', tradeName: 'Restaurante La Finca', mcc: '5812', mccDescription: 'Restaurantes',
    department: 'Francisco Morazán', municipality: 'Tegucigalpa', address: 'Blvd. Suyapa, Tegucigalpa',
    pais: 'Honduras', ciudad: 'Tegucigalpa', zona: 'Centro', warehouseId: 1,
    status: 'active', createdAt: daysAgoIso(35), responsibleName: 'Roberto Mendoza',
  },
  {
    id: 'mer-4', affiliateCode: 'COM-00104', tradeName: 'Ferretería Central', mcc: '5251', mccDescription: 'Ferreterías',
    department: 'Cortés', municipality: 'Choloma', address: 'Col. Satélite, Choloma',
    pais: 'Honduras', ciudad: 'Choloma', zona: 'Norte', warehouseId: 2,
    status: 'active', createdAt: daysAgoIso(95), responsibleName: 'Patricia Morales',
  },
  {
    id: 'mer-5', affiliateCode: 'COM-00105', tradeName: 'Panadería Doña Elsa', mcc: '5462', mccDescription: 'Panaderías',
    department: 'Atlántida', municipality: 'La Ceiba', address: 'Barrio El Centro, La Ceiba',
    pais: 'Honduras', ciudad: 'La Ceiba', zona: 'Este', warehouseId: 4,
    status: 'inactive', createdAt: daysAgoIso(400),
  },
  {
    id: 'mer-6', affiliateCode: 'COM-00106', tradeName: 'Clínica Vida Sana', mcc: '8011', mccDescription: 'Servicios médicos',
    department: 'Choluteca', municipality: 'Choluteca', address: 'Barrio El Centro, Choluteca',
    pais: 'Honduras', ciudad: 'Choluteca', zona: 'Sur', warehouseId: 3,
    status: 'inactive', createdAt: daysAgoIso(200),
  },
];

export const MOCK_MERCHANT_SITES: MerchantSite[] = [
  { id: 'site-1a', merchantId: 'mer-1', name: 'Los Dolores', ciudad: 'Tegucigalpa', zona: 'Centro', address: 'Frente al Mercado Los Dolores', status: 'active' },
  { id: 'site-1b', merchantId: 'mer-1', name: 'Mall Multiplaza', ciudad: 'Tegucigalpa', zona: 'Centro', address: 'Multiplaza Tegucigalpa', status: 'active' },
  { id: 'site-2a', merchantId: 'mer-2', name: 'Blvd. del Norte', ciudad: 'San Pedro Sula', zona: 'Norte', address: 'Blvd. del Norte Km 2', status: 'active' },
  { id: 'site-2b', merchantId: 'mer-2', name: 'Plaza Premier', ciudad: 'San Pedro Sula', zona: 'Norte', address: 'Plaza Premier SPS', status: 'active' },
  { id: 'site-2c', merchantId: 'mer-2', name: 'City Mall', ciudad: 'Tegucigalpa', zona: 'Centro', address: 'City Mall TGU', status: 'active' },
  { id: 'site-3a', merchantId: 'mer-3', name: 'Blvd. Suyapa', ciudad: 'Tegucigalpa', zona: 'Centro', address: 'Blvd. Suyapa', status: 'active' },
  { id: 'site-4a', merchantId: 'mer-4', name: 'Col. Satélite', ciudad: 'Choloma', zona: 'Norte', address: 'Col. Satélite, Choloma', status: 'active' },
  { id: 'site-4b', merchantId: 'mer-4', name: 'Centro Choloma', ciudad: 'Choloma', zona: 'Norte', address: 'Barrio El Centro', status: 'active' },
  { id: 'site-5a', merchantId: 'mer-5', name: 'El Centro', ciudad: 'La Ceiba', zona: 'Este', address: 'Barrio El Centro, La Ceiba', status: 'inactive' },
  { id: 'site-6a', merchantId: 'mer-6', name: 'Principal', ciudad: 'Choluteca', zona: 'Sur', address: 'Barrio El Centro, Choluteca', status: 'inactive' },
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
