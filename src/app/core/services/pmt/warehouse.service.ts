import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Warehouse, WarehouseStatus } from '../../models/pmt/warehouse.model';
import { MOCK_WAREHOUSES } from '../../mock/pmt/mock-warehouses';

let warehouseSeq = Math.max(0, ...MOCK_WAREHOUSES.map(w => w.id)) + 1;
let codigoSeq = Math.max(
  0,
  ...MOCK_WAREHOUSES.map(w => {
    const m = w.codigo.match(/^BOD-(\d+)$/i);
    return m ? Number(m[1]) : 0;
  }),
) + 1;

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly subject = new BehaviorSubject<Warehouse[]>([...MOCK_WAREHOUSES]);

  readonly warehouses$: Observable<Warehouse[]> = this.subject.asObservable();

  get warehouses(): Warehouse[] {
    return this.subject.value;
  }

  getById(id: number): Warehouse | undefined {
    return this.warehouses.find(w => w.id === id);
  }

  getActive(): Warehouse[] {
    return this.warehouses.filter(w => w.status === 'active');
  }

  nextCodigo(): string {
    return `BOD-${String(codigoSeq).padStart(3, '0')}`;
  }

  create(data: Omit<Warehouse, 'id' | 'codigo' | 'createdAt' | 'updatedAt'> & { codigo?: string }): Warehouse {
    const now = new Date().toISOString();
    const codigo = (data.codigo?.trim() || this.nextCodigo()).toUpperCase();
    if (!data.codigo?.trim()) codigoSeq++;
    const created: Warehouse = {
      ...data,
      id: warehouseSeq++,
      codigo,
      createdAt: now,
      updatedAt: now,
    };
    this.subject.next([created, ...this.warehouses]);
    return created;
  }

  update(id: number, changes: Partial<Omit<Warehouse, 'id' | 'createdAt'>>): void {
    const now = new Date().toISOString();
    this.subject.next(
      this.warehouses.map(w => (w.id === id ? { ...w, ...changes, updatedAt: now } : w)),
    );
  }

  setStatus(id: number, status: WarehouseStatus): void {
    this.update(id, { status });
  }

  delete(id: number): void {
    this.subject.next(this.warehouses.filter(w => w.id !== id));
  }

  isCodigoDuplicate(codigo: string, excludeId?: number): boolean {
    const c = codigo.trim().toUpperCase();
    return this.warehouses.some(w => w.codigo.toUpperCase() === c && w.id !== excludeId);
  }
}
