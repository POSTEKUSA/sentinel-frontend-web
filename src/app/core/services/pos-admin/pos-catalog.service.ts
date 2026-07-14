import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  AccessoryCatalogItem,
  PosCatalogItem,
  Supplier,
} from '../../models/pos-admin';
import { MOCK_ACCESSORIES, MOCK_POS_CATALOG, MOCK_SUPPLIERS } from '../../mock/pos-admin/mock-catalog';
import { CurrentUserService } from './current-user.service';

let catalogSeq = MOCK_POS_CATALOG.length + 1;
let supplierSeq = MOCK_SUPPLIERS.length + 1;
let accessorySeq = MOCK_ACCESSORIES.length + 1;

/**
 * EPIC 1 — Catálogo maestro: marcas/modelos (HU-001), proveedores (HU-002)
 * y accesorios/consumibles (HU-003).
 */
@Injectable({ providedIn: 'root' })
export class PosCatalogService {
  private readonly catalogSubject = new BehaviorSubject<PosCatalogItem[]>([...MOCK_POS_CATALOG]);
  private readonly suppliersSubject = new BehaviorSubject<Supplier[]>([...MOCK_SUPPLIERS]);
  private readonly accessoriesSubject = new BehaviorSubject<AccessoryCatalogItem[]>([...MOCK_ACCESSORIES]);

  readonly catalog$: Observable<PosCatalogItem[]> = this.catalogSubject.asObservable();
  readonly suppliers$: Observable<Supplier[]> = this.suppliersSubject.asObservable();
  readonly accessories$: Observable<AccessoryCatalogItem[]> = this.accessoriesSubject.asObservable();

  constructor(private currentUser: CurrentUserService) {}

  // ── Marcas / Modelos (HU-001) ──────────────────────────────

  existsBrandModel(brand: string, model: string, excludeId?: string): boolean {
    const b = brand.trim().toLowerCase();
    const m = model.trim().toLowerCase();
    return this.catalogSubject.value.some(
      item => item.id !== excludeId && item.brand.trim().toLowerCase() === b && item.model.trim().toLowerCase() === m,
    );
  }

  createCatalogItem(item: Omit<PosCatalogItem, 'id' | 'createdAt' | 'createdBy'>): PosCatalogItem {
    const created: PosCatalogItem = {
      ...item,
      id: `cat-${catalogSeq++}`,
      createdAt: new Date().toISOString(),
      createdBy: this.currentUser.username,
    };
    this.catalogSubject.next([created, ...this.catalogSubject.value]);
    return created;
  }

  updateCatalogItem(id: string, changes: Partial<PosCatalogItem>): void {
    this.catalogSubject.next(
      this.catalogSubject.value.map(item => (item.id === id ? { ...item, ...changes } : item)),
    );
  }

  deleteCatalogItem(id: string): void {
    this.catalogSubject.next(this.catalogSubject.value.filter(item => item.id !== id));
  }

  get brandModelOptions(): { brand: string; model: string; posType: string }[] {
    return this.catalogSubject.value.map(({ brand, model, posType }) => ({ brand, model, posType }));
  }

  // ── Proveedores (HU-002) ───────────────────────────────────

  createSupplier(supplier: Omit<Supplier, 'id'>): Supplier {
    const created: Supplier = { ...supplier, id: `sup-${supplierSeq++}` };
    this.suppliersSubject.next([created, ...this.suppliersSubject.value]);
    return created;
  }

  updateSupplier(id: string, changes: Partial<Supplier>): void {
    this.suppliersSubject.next(
      this.suppliersSubject.value.map(s => (s.id === id ? { ...s, ...changes } : s)),
    );
  }

  deleteSupplier(id: string): void {
    this.suppliersSubject.next(this.suppliersSubject.value.filter(s => s.id !== id));
  }

  // ── Accesorios / Consumibles (HU-003) ──────────────────────

  createAccessory(accessory: Omit<AccessoryCatalogItem, 'id'>): AccessoryCatalogItem {
    const created: AccessoryCatalogItem = { ...accessory, id: `acc-${accessorySeq++}` };
    this.accessoriesSubject.next([created, ...this.accessoriesSubject.value]);
    return created;
  }

  updateAccessory(id: string, changes: Partial<AccessoryCatalogItem>): void {
    this.accessoriesSubject.next(
      this.accessoriesSubject.value.map(a => (a.id === id ? { ...a, ...changes } : a)),
    );
  }

  deleteAccessory(id: string): void {
    this.accessoriesSubject.next(this.accessoriesSubject.value.filter(a => a.id !== id));
  }
}
