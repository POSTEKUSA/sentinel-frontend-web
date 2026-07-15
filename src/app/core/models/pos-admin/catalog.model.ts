/** EPIC 1 — Catálogo maestro: marcas/modelos, proveedores, accesorios y consumibles */

export type CatalogStatus = 'active' | 'obsolete' | 'discontinued';

export const CATALOG_STATUS_LABELS: Record<CatalogStatus, string> = {
  active: 'Activo',
  obsolete: 'Obsoleto',
  discontinued: 'Descontinuado',
};

export const POS_TYPES = [
  'POS (Legacy)',
  'POS (Android)',
  'mPOS (Android)',
  'PIN Pad',
  'Kiosko',
] as const;

/** HU-001 — Marca / modelo / tipo de POS */
export interface PosCatalogItem {
  id: string;
  brand: string;
  model: string;
  posType: string;
  description: string;
  status: CatalogStatus;
  createdAt: string;
  createdBy: string;
}

export type SupplierStatus = 'active' | 'inactive';

/** HU-002 — Proveedores */
export interface Supplier {
  id: string;
  name: string;
  country: string;
  contactName: string;
  phone: string;
  email: string;
  suppliedBrands: string[];
  suppliedModels: string[];
  status: SupplierStatus;
}

export type AccessoryCategory = 'accessory' | 'consumable';

export const ACCESSORY_CATEGORY_LABELS: Record<AccessoryCategory, string> = {
  accessory: 'Accesorio',
  consumable: 'Consumible',
};

/** HU-003 — Accesorios y consumibles */
export interface AccessoryCatalogItem {
  id: string;
  type: string;
  category: AccessoryCategory;
  compatibleBrandModel: string;
  unitOfMeasure: string;
  minStock: number;
  status: CatalogStatus;
}
