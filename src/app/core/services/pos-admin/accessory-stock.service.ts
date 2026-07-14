import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AccessoryMovement, AccessoryMovementType } from '../../models/pos-admin';
import { MOCK_ACCESSORY_MOVEMENTS } from '../../mock/pos-admin/mock-accessory-movements';

let movementSeq = MOCK_ACCESSORY_MOVEMENTS.length + 1;

export interface AccessoryConsumptionFilter {
  accessoryId?: string;
  merchantId?: string;
  executiveId?: string;
  zone?: string;
  from?: string;
  to?: string;
}

/** HU-011 — Control de inventario de accesorios y consumibles (rollos, etc.) */
@Injectable({ providedIn: 'root' })
export class AccessoryStockService {
  private readonly movementsSubject = new BehaviorSubject<AccessoryMovement[]>([...MOCK_ACCESSORY_MOVEMENTS]);
  readonly movements$: Observable<AccessoryMovement[]> = this.movementsSubject.asObservable();

  get movements(): AccessoryMovement[] {
    return this.movementsSubject.value;
  }

  registerMovement(movement: Omit<AccessoryMovement, 'id'>): AccessoryMovement {
    const created: AccessoryMovement = { ...movement, id: `mov-${movementSeq++}` };
    this.movementsSubject.next([created, ...this.movementsSubject.value]);
    return created;
  }

  /** Stock actual = suma de entradas - suma de salidas, por accesorio */
  currentStock(accessoryId: string): number {
    return this.movementsSubject.value
      .filter(m => m.accessoryId === accessoryId)
      .reduce((sum, m) => sum + (m.movementType === 'in' ? m.quantity : -m.quantity), 0);
  }

  stockByAccessory(): Map<string, number> {
    const map = new Map<string, number>();
    this.movementsSubject.value.forEach(m => {
      const delta = m.movementType === 'in' ? m.quantity : -m.quantity;
      map.set(m.accessoryId, (map.get(m.accessoryId) ?? 0) + delta);
    });
    return map;
  }

  consumption(filter: AccessoryConsumptionFilter, type: AccessoryMovementType = 'out'): AccessoryMovement[] {
    return this.movementsSubject.value.filter(m => {
      if (m.movementType !== type) return false;
      if (filter.accessoryId && m.accessoryId !== filter.accessoryId) return false;
      if (filter.merchantId && m.merchantId !== filter.merchantId) return false;
      if (filter.executiveId && m.executiveId !== filter.executiveId) return false;
      if (filter.zone && m.zone !== filter.zone) return false;
      if (filter.from && m.date < filter.from) return false;
      if (filter.to && m.date > filter.to) return false;
      return true;
    });
  }

  totalConsumption(filter: AccessoryConsumptionFilter): number {
    return this.consumption(filter, 'out').reduce((sum, m) => sum + m.quantity, 0);
  }
}
