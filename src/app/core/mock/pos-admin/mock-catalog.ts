import { AccessoryCatalogItem, PosCatalogItem, Supplier } from '../../models/pos-admin';

export const MOCK_POS_CATALOG: PosCatalogItem[] = [
  { id: 'cat-1', brand: 'PAX', model: 'A920', posType: 'POS Android', description: 'Terminal Android con impresora integrada', status: 'active', createdAt: '2024-01-10T09:00:00.000Z', createdBy: 'admin' },
  { id: 'cat-2', brand: 'PAX', model: 'A80', posType: 'POS Legacy', description: 'Terminal tradicional con pantalla monocromática', status: 'active', createdAt: '2024-01-10T09:05:00.000Z', createdBy: 'admin' },
  { id: 'cat-3', brand: 'Sunmi', model: 'V2 Pro', posType: 'POS Android', description: 'Terminal Android portátil', status: 'active', createdAt: '2024-01-12T10:00:00.000Z', createdBy: 'admin' },
  { id: 'cat-4', brand: 'Sunmi', model: 'T2s', posType: 'POS Android', description: 'Terminal Android de mostrador', status: 'active', createdAt: '2024-01-12T10:10:00.000Z', createdBy: 'admin' },
  { id: 'cat-5', brand: 'Urovo', model: 'DT40', posType: 'MPOS Android', description: 'Terminal móvil de mano', status: 'obsolete', createdAt: '2023-06-01T08:00:00.000Z', createdBy: 'admin' },
  { id: 'cat-6', brand: 'Ingenico', model: 'Move 5000', posType: 'MPOS Android', description: 'Terminal móvil GPRS/WiFi', status: 'active', createdAt: '2024-02-01T08:00:00.000Z', createdBy: 'admin' },
  { id: 'cat-7', brand: 'Verifone', model: 'VX520', posType: 'POS Legacy', description: 'Terminal de línea fija', status: 'discontinued', createdAt: '2022-05-01T08:00:00.000Z', createdBy: 'admin' },
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1', name: 'PAX Technology', country: 'China',
    contactName: 'María Gómez', phone: '+507 6000-1111', email: 'ventas@pax.com',
    suppliedBrands: ['PAX'], suppliedModels: ['PAX A920', 'PAX A80'], status: 'active',
  },
  {
    id: 'sup-2', name: 'Sunmi', country: 'China',
    contactName: 'Carlos Ruiz', phone: '+502 5555-2222', email: 'contacto@sunmi-ca.com',
    suppliedBrands: ['Sunmi'], suppliedModels: ['Sunmi V2 Pro', 'Sunmi T2s'], status: 'active',
  },
  {
    id: 'sup-3', name: 'Ingenico S.A.', country: 'Francia',
    contactName: 'Laura Jiménez', phone: '+506 8888-3333', email: 'laura.jimenez@ingenico-cr.com',
    suppliedBrands: ['Ingenico', 'Verifone'], suppliedModels: ['Ingenico Move 5000', 'Verifone VX520'], status: 'active',
  },
  {
    id: 'sup-4', name: 'Urovo', country: 'China',
    contactName: 'Wei Zhang', phone: '+86 138-0000-4444', email: 'wei.zhang@urovo-export.com',
    suppliedBrands: ['Urovo'], suppliedModels: ['Urovo DT40'], status: 'inactive',
  },
];

export const MOCK_ACCESSORIES: AccessoryCatalogItem[] = [
  { id: 'acc-1', type: 'Rollo de papel térmico 57mm', category: 'consumable', compatibleBrandModel: 'Universal', unitOfMeasure: 'Rollo', minStock: 500, status: 'active' },
  { id: 'acc-2', type: 'Cargador de pared', category: 'accessory', compatibleBrandModel: 'PAX A920', unitOfMeasure: 'Unidad', minStock: 30, status: 'active' },
  { id: 'acc-3', type: 'Base cargadora (cradle)', category: 'accessory', compatibleBrandModel: 'Sunmi V2 Pro', unitOfMeasure: 'Unidad', minStock: 20, status: 'active' },
  { id: 'acc-4', type: 'Batería de repuesto', category: 'accessory', compatibleBrandModel: 'Sunmi T2s', unitOfMeasure: 'Unidad', minStock: 25, status: 'active' },
  { id: 'acc-5', type: 'SIM Card datos', category: 'consumable', compatibleBrandModel: 'Universal', unitOfMeasure: 'Unidad', minStock: 100, status: 'active' },
  { id: 'acc-6', type: 'Funda protectora', category: 'accessory', compatibleBrandModel: 'Urovo DT40', unitOfMeasure: 'Unidad', minStock: 10, status: 'obsolete' },
];
