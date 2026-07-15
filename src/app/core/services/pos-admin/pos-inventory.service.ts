import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  CustodyAssignment,
  CustodyRole,
  PosLocationType,
  PosUnit,
  PosUnitHistoryEvent,
  PosUnitStatus,
  POS_LOCATION_LABELS,
} from '../../models/pos-admin';
import { MOCK_POS_UNITS } from '../../mock/pos-admin/mock-pos-units';
import { MOCK_CUSTODY } from '../../mock/pos-admin/mock-custody';
import { CurrentUserService } from './current-user.service';
import { PurchaseOrderService } from './purchase-order.service';

let unitSeq = MOCK_POS_UNITS.length + 1;
let historySeq = 1000;
let custodySeq = MOCK_CUSTODY.length + 1;

export interface ReceiveUnitInput {
  serialNumber: string;
  brand: string;
  model: string;
  posType: string;
  purchaseOrderId?: string;
  purchaseOrderLineId?: string;
  locationType: PosLocationType;
  locationLabel?: string;
  initialCondition: string;
  observations?: string;
}

export interface BulkReceiveResultRow {
  row: number;
  serialNumber: string;
  brand: string;
  model: string;
  posType: string;
  status: 'valid' | 'error';
  error?: string;
}

/** EPIC 3 y 4 — Recepción (HU-006/HU-007) e inventario (HU-008 a HU-011) de terminales físicas */
@Injectable({ providedIn: 'root' })
export class PosInventoryService {
  private readonly unitsSubject = new BehaviorSubject<PosUnit[]>([...MOCK_POS_UNITS]);
  private readonly custodySubject = new BehaviorSubject<CustodyAssignment[]>([...MOCK_CUSTODY]);

  readonly units$: Observable<PosUnit[]> = this.unitsSubject.asObservable();
  readonly custody$: Observable<CustodyAssignment[]> = this.custodySubject.asObservable();

  constructor(
    private currentUser: CurrentUserService,
    private purchaseOrderSvc: PurchaseOrderService,
  ) {}

  get units(): PosUnit[] {
    return this.unitsSubject.value;
  }

  private pushUnits(units: PosUnit[]): void {
    this.unitsSubject.next(units);
  }

  private addHistory(unit: PosUnit, eventType: PosUnitHistoryEvent['eventType'], description: string): PosUnitHistoryEvent {
    return {
      id: `h-${historySeq++}`,
      timestamp: new Date().toISOString(),
      eventType,
      description,
      userName: this.currentUser.username,
    };
  }

  isSerialDuplicate(serialNumber: string): boolean {
    const s = serialNumber.trim().toLowerCase();
    return this.unitsSubject.value.some(u => u.serialNumber.trim().toLowerCase() === s);
  }

  // ── HU-006 — Recepción individual ──────────────────────────

  receiveUnit(input: ReceiveUnitInput): PosUnit {
    if (this.isSerialDuplicate(input.serialNumber)) {
      throw new Error(`El número de serie "${input.serialNumber}" ya existe en el inventario.`);
    }

    const order = input.purchaseOrderId ? this.purchaseOrderSvc.getById(input.purchaseOrderId) : undefined;
    const status: PosUnitStatus = input.locationType === 'in_transit' ? 'in_transit' : 'in_stock';

    const unit: PosUnit = {
      id: `unit-${unitSeq++}`,
      serialNumber: input.serialNumber.trim(),
      brand: input.brand,
      model: input.model,
      posType: input.posType,
      status,
      locationType: input.locationType,
      locationLabel: input.locationLabel || POS_LOCATION_LABELS[input.locationType],
      purchaseOrderId: input.purchaseOrderId,
      purchaseOrderNumber: order?.orderNumber,
      receivedAt: new Date().toISOString(),
      receivedBy: this.currentUser.username,
      initialCondition: input.initialCondition,
      observations: input.observations,
      history: [],
    };
    unit.history = [this.addHistory(unit, 'received', `Recepción registrada${order ? ` desde ${order.orderNumber}` : ''}`)];

    this.pushUnits([unit, ...this.unitsSubject.value]);

    if (input.purchaseOrderId && input.purchaseOrderLineId) {
      this.purchaseOrderSvc.registerReceivedQty(input.purchaseOrderId, input.purchaseOrderLineId, 1, this.currentUser.username);
    }

    return unit;
  }

  // ── HU-007 — Carga masiva ──────────────────────────────────

  validateBulkRows(rows: Omit<ReceiveUnitInput, 'locationType' | 'initialCondition'>[]): BulkReceiveResultRow[] {
    const seenInFile = new Set<string>();
    return rows.map((row, index) => {
      const serial = row.serialNumber?.trim() ?? '';
      const rowNumber = index + 1;

      if (!serial) {
        return { row: rowNumber, serialNumber: serial, brand: row.brand, model: row.model, posType: row.posType, status: 'error', error: 'Número de serie vacío' };
      }
      if (!row.brand || !row.model) {
        return { row: rowNumber, serialNumber: serial, brand: row.brand, model: row.model, posType: row.posType, status: 'error', error: 'Marca/modelo requeridos' };
      }
      if (this.isSerialDuplicate(serial)) {
        return { row: rowNumber, serialNumber: serial, brand: row.brand, model: row.model, posType: row.posType, status: 'error', error: 'Serie ya existe en inventario' };
      }
      if (seenInFile.has(serial.toLowerCase())) {
        return { row: rowNumber, serialNumber: serial, brand: row.brand, model: row.model, posType: row.posType, status: 'error', error: 'Serie duplicada dentro del archivo' };
      }
      seenInFile.add(serial.toLowerCase());
      return { row: rowNumber, serialNumber: serial, brand: row.brand, model: row.model, posType: row.posType, status: 'valid' };
    });
  }

  bulkReceive(
    rows: Omit<ReceiveUnitInput, 'locationType' | 'initialCondition'>[],
    common: { locationType: PosLocationType; locationLabel?: string; initialCondition: string; purchaseOrderId?: string; purchaseOrderLineId?: string },
  ): { created: PosUnit[]; skipped: number } {
    const validation = this.validateBulkRows(rows);
    const created: PosUnit[] = [];

    validation.forEach((v, i) => {
      if (v.status !== 'valid') return;
      const row = rows[i];
      const unit = this.receiveUnit({
        ...row,
        ...common,
      });
      created.push(unit);
    });

    return { created, skipped: validation.length - created.length };
  }

  // ── HU-008/HU-009 — Consultas de inventario ────────────────

  countByLocation(): { locationType: PosLocationType; label: string; count: number }[] {
    const counts = new Map<PosLocationType, number>();
    this.unitsSubject.value.forEach(u => counts.set(u.locationType, (counts.get(u.locationType) ?? 0) + 1));
    return Object.keys(POS_LOCATION_LABELS).map(key => {
      const locationType = key as PosLocationType;
      return { locationType, label: POS_LOCATION_LABELS[locationType], count: counts.get(locationType) ?? 0 };
    });
  }

  // ── HU-010 — Resguardo de técnicos/ejecutivos ──────────────

  assignCustody(unitId: string, userId: string, userName: string, role: CustodyRole, observations?: string): void {
    const unit = this.unitsSubject.value.find(u => u.id === unitId);
    if (!unit) return;

    const assignment: CustodyAssignment = {
      id: `cus-${custodySeq++}`,
      posUnitId: unit.id,
      serialNumber: unit.serialNumber,
      brand: unit.brand,
      model: unit.model,
      userId,
      userName,
      role,
      assignedAt: new Date().toISOString(),
      status: 'active',
      observations,
    };
    this.custodySubject.next([assignment, ...this.custodySubject.value]);

    const locationType: PosLocationType = role === 'technician' ? 'technician' : 'executive';
    const status: PosUnitStatus = role === 'technician' ? 'with_technician' : 'with_executive';
    const updated: PosUnit = {
      ...unit,
      status,
      locationType,
      locationLabel: `${role === 'technician' ? 'Técnico' : role === 'executive' ? 'Ejecutivo' : 'Operador'}: ${userName}`,
      custodianUserId: userId,
      custodianName: userName,
      custodianRole: role,
    };
    updated.history = [...unit.history, this.addHistory(updated, 'assigned_custody', `Asignado en resguardo a ${userName} (${role})`)];
    this.pushUnits(this.unitsSubject.value.map(u => (u.id === unitId ? updated : u)));
  }

  returnCustody(assignmentId: string, toLocationType: PosLocationType = 'central_warehouse', toLocationLabel?: string): void {
    const assignment = this.custodySubject.value.find(a => a.id === assignmentId);
    if (!assignment) return;

    this.custodySubject.next(
      this.custodySubject.value.map(a =>
        a.id === assignmentId ? { ...a, status: 'returned', returnedAt: new Date().toISOString() } : a,
      ),
    );

    const unit = this.unitsSubject.value.find(u => u.id === assignment.posUnitId);
    if (!unit) return;
    const updated: PosUnit = {
      ...unit,
      status: 'in_stock',
      locationType: toLocationType,
      locationLabel: toLocationLabel || POS_LOCATION_LABELS[toLocationType],
      custodianUserId: undefined,
      custodianName: undefined,
      custodianRole: undefined,
    };
    updated.history = [...unit.history, this.addHistory(updated, 'returned_custody', `Devuelto por ${assignment.userName}`)];
    this.pushUnits(this.unitsSubject.value.map(u => (u.id === unit.id ? updated : u)));
  }

  // ── EPIC 5 — Instalación en comercio ───────────────────────

  installUnit(unitId: string, merchantId: string, merchantName: string, responsibleName: string): void {
    const unit = this.unitsSubject.value.find(u => u.id === unitId);
    if (!unit) return;
    const updated: PosUnit = {
      ...unit,
      status: 'installed',
      locationType: 'merchant',
      locationLabel: `Comercio: ${merchantName}`,
      merchantId,
      merchantName,
      installedAt: new Date().toISOString(),
      custodianUserId: undefined,
      custodianName: undefined,
      custodianRole: undefined,
    };
    updated.history = [...unit.history, this.addHistory(updated, 'installed', `Instalado en ${merchantName} por ${responsibleName}`)];
    this.pushUnits(this.unitsSubject.value.map(u => (u.id === unitId ? updated : u)));
  }

  // ── Obsolescencia / destrucción ────────────────────────────

  sendToWorkshop(unitId: string, reason: string): void {
    this.transition(unitId, 'in_workshop', 'workshop', 'Taller Central', 'sent_to_workshop', `Enviado a taller: ${reason}`);
  }

  decommission(unitId: string, reason: string): void {
    this.transition(unitId, 'decommissioned', 'decommissioned', 'Baja definitiva', 'decommissioned', `Dado de baja: ${reason}`);
  }

  destroy(unitId: string, reason: string): void {
    this.transition(unitId, 'destroyed', 'destroyed', 'Destruido', 'destroyed', `Destrucción certificada: ${reason}`);
  }

  private transition(
    unitId: string,
    status: PosUnitStatus,
    locationType: PosLocationType,
    locationLabel: string,
    eventType: PosUnitHistoryEvent['eventType'],
    description: string,
  ): void {
    const unit = this.unitsSubject.value.find(u => u.id === unitId);
    if (!unit) return;
    const updated: PosUnit = { ...unit, status, locationType, locationLabel };
    updated.history = [...unit.history, this.addHistory(updated, eventType, description)];
    this.pushUnits(this.unitsSubject.value.map(u => (u.id === unitId ? updated : u)));
  }
}
