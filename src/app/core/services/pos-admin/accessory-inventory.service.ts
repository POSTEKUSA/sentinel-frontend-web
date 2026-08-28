import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import {
  AccessoryCategory,
  AccessoryInventoryUnit,
  POS_LOCATION_LABELS,
  PosLocationType,
} from '../../models/pos-admin';
import { MOCK_ACCESSORY_UNITS, MOCK_CONSUMABLE_UNITS } from '../../mock/pos-admin/mock-accessory-units';
import { inventoryPrefixFromType, nextInventoryCode } from '../../utils/inventory-code.util';
import { CurrentUserService } from './current-user.service';

let unitSeq = MOCK_ACCESSORY_UNITS.length + MOCK_CONSUMABLE_UNITS.length + 1;

export type AccessoryUnitInput = Omit<
  AccessoryInventoryUnit,
  'id' | 'inventoryCode' | 'receivedAt' | 'receivedBy' | 'locationLabel'
> & {
  inventoryCode?: string;
  locationLabel?: string;
  receivedAt?: string;
  receivedBy?: string;
};

@Injectable({ providedIn: 'root' })
export class AccessoryInventoryService {
  private readonly unitsSubject = new BehaviorSubject<AccessoryInventoryUnit[]>([
    ...MOCK_ACCESSORY_UNITS,
    ...MOCK_CONSUMABLE_UNITS,
  ]);

  readonly units$: Observable<AccessoryInventoryUnit[]> = this.unitsSubject.asObservable();

  constructor(private currentUser: CurrentUserService) {}

  get units(): AccessoryInventoryUnit[] {
    return this.unitsSubject.value;
  }

  byCategory$(category: AccessoryCategory): Observable<AccessoryInventoryUnit[]> {
    return this.units$.pipe(map(list => list.filter(u => u.category === category)));
  }

  byCategory(category: AccessoryCategory): AccessoryInventoryUnit[] {
    return this.units.filter(u => u.category === category);
  }

  create(input: AccessoryUnitInput): AccessoryInventoryUnit {
    const prefix = inventoryPrefixFromType(input.type, input.category);
    const inventoryCode =
      input.inventoryCode ??
      nextInventoryCode(
        this.units.map(u => u.inventoryCode),
        prefix,
      );
    const locationType = input.locationType;
    const created: AccessoryInventoryUnit = {
      ...input,
      id: `au-${unitSeq++}`,
      inventoryCode,
      locationLabel: input.locationLabel?.trim() || POS_LOCATION_LABELS[locationType as PosLocationType] || locationType,
      receivedAt: input.receivedAt ?? new Date().toISOString(),
      receivedBy: input.receivedBy ?? this.currentUser.username,
    };
    this.unitsSubject.next([created, ...this.unitsSubject.value]);
    return created;
  }

  update(id: string, changes: Partial<AccessoryInventoryUnit>): void {
    this.unitsSubject.next(
      this.unitsSubject.value.map(u => {
        if (u.id !== id) return u;
        const next = { ...u, ...changes };
        if (changes.locationType && !changes.locationLabel) {
          next.locationLabel = POS_LOCATION_LABELS[changes.locationType] ?? next.locationLabel;
        }
        return next;
      }),
    );
  }

  delete(id: string): void {
    this.unitsSubject.next(this.unitsSubject.value.filter(u => u.id !== id));
  }
}
