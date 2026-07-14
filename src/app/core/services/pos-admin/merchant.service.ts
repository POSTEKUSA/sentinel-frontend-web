import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Installation, Merchant } from '../../models/pos-admin';
import { MOCK_INSTALLATIONS, MOCK_MERCHANTS } from '../../mock/pos-admin/mock-merchants';
import { PosInventoryService } from './pos-inventory.service';
import { CurrentUserService } from './current-user.service';

let merchantSeq = MOCK_MERCHANTS.length + 1;
let installationSeq = MOCK_INSTALLATIONS.length + 1;

/** EPIC 5 — Afiliados / comercios (HU-012, HU-013, HU-014) */
@Injectable({ providedIn: 'root' })
export class MerchantService {
  private readonly merchantsSubject = new BehaviorSubject<Merchant[]>([...MOCK_MERCHANTS]);
  private readonly installationsSubject = new BehaviorSubject<Installation[]>([...MOCK_INSTALLATIONS]);

  readonly merchants$: Observable<Merchant[]> = this.merchantsSubject.asObservable();
  readonly installations$: Observable<Installation[]> = this.installationsSubject.asObservable();

  constructor(
    private posInventorySvc: PosInventoryService,
    private currentUser: CurrentUserService,
  ) {}

  get merchants(): Merchant[] {
    return this.merchantsSubject.value;
  }

  getById(id: string): Merchant | undefined {
    return this.merchantsSubject.value.find(m => m.id === id);
  }

  createMerchant(merchant: Omit<Merchant, 'id' | 'createdAt'>): Merchant {
    const created: Merchant = { ...merchant, id: `mer-${merchantSeq++}`, createdAt: new Date().toISOString() };
    this.merchantsSubject.next([created, ...this.merchantsSubject.value]);
    return created;
  }

  updateMerchant(id: string, changes: Partial<Merchant>): void {
    this.merchantsSubject.next(this.merchantsSubject.value.map(m => (m.id === id ? { ...m, ...changes } : m)));
  }

  activePosCount(merchantId: string): number {
    return this.posInventorySvc.units.filter(u => u.merchantId === merchantId && u.status === 'installed').length;
  }

  historicalPosCount(merchantId: string): number {
    return this.posInventorySvc.units.filter(u => u.merchantId === merchantId || this.installationsSubject.value.some(i => i.merchantId === merchantId && i.posUnitId === u.id)).length;
  }

  installationsForMerchant(merchantId: string): Installation[] {
    return this.installationsSubject.value.filter(i => i.merchantId === merchantId);
  }

  /** HU-013 — Registrar instalación de POS en comercio */
  registerInstallation(input: {
    posUnitId: string;
    serialNumber: string;
    brand: string;
    model: string;
    merchantId: string;
    responsibleUserId: string;
    responsibleName: string;
    responsibleRole: 'technician' | 'executive';
    latitude?: number;
    longitude?: number;
    initialStatus: string;
    observations?: string;
  }): Installation {
    const merchant = this.getById(input.merchantId);
    if (!merchant) {
      throw new Error('Comercio/afiliado no encontrado.');
    }

    const installation: Installation = {
      id: `ins-${installationSeq++}`,
      posUnitId: input.posUnitId,
      serialNumber: input.serialNumber,
      brand: input.brand,
      model: input.model,
      merchantId: input.merchantId,
      merchantName: merchant.tradeName,
      installedAt: new Date().toISOString(),
      responsibleUserId: input.responsibleUserId,
      responsibleName: input.responsibleName,
      responsibleRole: input.responsibleRole,
      latitude: input.latitude,
      longitude: input.longitude,
      initialStatus: input.initialStatus,
      observations: input.observations,
    };
    this.installationsSubject.next([installation, ...this.installationsSubject.value]);

    this.posInventorySvc.installUnit(input.posUnitId, merchant.id, merchant.tradeName, input.responsibleName);

    return installation;
  }

  /** HU-014 — Comercios agrupados por MCC */
  countByMcc(): { mcc: string; description: string; count: number }[] {
    const map = new Map<string, { description: string; count: number }>();
    this.merchantsSubject.value.forEach(m => {
      const entry = map.get(m.mcc) ?? { description: m.mccDescription, count: 0 };
      entry.count += 1;
      map.set(m.mcc, entry);
    });
    return Array.from(map.entries())
      .map(([mcc, v]) => ({ mcc, description: v.description, count: v.count }))
      .sort((a, b) => b.count - a.count);
  }
}
