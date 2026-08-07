import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { MccCode } from '../../models/pos-admin/mcc.model';
import { MOCK_MCC_CODES } from '../../mock/pos-admin/mock-mcc';

let mccSeq = MOCK_MCC_CODES.length + 1;

@Injectable({ providedIn: 'root' })
export class MccCatalogService {
  private readonly subject = new BehaviorSubject<MccCode[]>([...MOCK_MCC_CODES]);
  readonly mcc$: Observable<MccCode[]> = this.subject.asObservable();

  getAll(): MccCode[] {
    return this.subject.value;
  }

  getActive(): MccCode[] {
    return this.subject.value.filter(m => m.status === 'active');
  }

  getByCode(code: string): MccCode | undefined {
    const c = code.trim();
    return this.subject.value.find(m => m.code === c);
  }

  existsCode(code: string, excludeId?: string): boolean {
    const c = code.trim();
    return this.subject.value.some(m => m.id !== excludeId && m.code === c);
  }

  create(item: Omit<MccCode, 'id'>): MccCode {
    const created: MccCode = { ...item, id: `mcc-${mccSeq++}` };
    this.subject.next([created, ...this.subject.value]);
    return created;
  }

  update(id: string, changes: Partial<MccCode>): void {
    this.subject.next(this.subject.value.map(m => (m.id === id ? { ...m, ...changes } : m)));
  }

  delete(id: string): void {
    this.subject.next(this.subject.value.filter(m => m.id !== id));
  }
}
