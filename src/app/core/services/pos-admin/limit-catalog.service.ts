import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TransactionLimit } from '../../models/pos-admin/limit.model';
import { MOCK_TRANSACTION_LIMITS } from '../../mock/pos-admin/mock-limits';

let limitSeq = MOCK_TRANSACTION_LIMITS.length + 1;

@Injectable({ providedIn: 'root' })
export class LimitCatalogService {
  private readonly subject = new BehaviorSubject<TransactionLimit[]>([...MOCK_TRANSACTION_LIMITS]);
  readonly limits$: Observable<TransactionLimit[]> = this.subject.asObservable();

  getAll(): TransactionLimit[] {
    return this.subject.value;
  }

  getActive(): TransactionLimit[] {
    return this.subject.value.filter(l => l.status === 'active');
  }

  getByCode(code: string): TransactionLimit | undefined {
    const c = code.trim();
    return this.subject.value.find(l => l.code === c);
  }

  existsCode(code: string, excludeId?: string): boolean {
    const c = code.trim().toUpperCase();
    return this.subject.value.some(l => l.id !== excludeId && l.code.toUpperCase() === c);
  }

  create(item: Omit<TransactionLimit, 'id'>): TransactionLimit {
    const created: TransactionLimit = { ...item, id: `lim-${limitSeq++}` };
    this.subject.next([created, ...this.subject.value]);
    return created;
  }

  update(id: string, changes: Partial<TransactionLimit>): void {
    this.subject.next(this.subject.value.map(l => (l.id === id ? { ...l, ...changes } : l)));
  }

  delete(id: string): void {
    this.subject.next(this.subject.value.filter(l => l.id !== id));
  }
}
