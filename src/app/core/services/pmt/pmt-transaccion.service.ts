import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Transaccion, SoportePmt } from '../../models/pmt/transaccion.model';
import { PmtUser } from '../../models/pmt/pmt-user.model';
import { MOCK_PMT_TRANSACCIONES, MOCK_PMT_SOPORTE_PMT } from '../../mock/pmt/mock-transacciones';
import { MOCK_PMT_USERS } from '../../mock/pmt/mock-pmt-users';

let soporteSeq = MOCK_PMT_SOPORTE_PMT.length + 1;
let userSeq = MOCK_PMT_USERS.length + 1;

@Injectable({ providedIn: 'root' })
export class PmtTransaccionService {
  private txSubject = new BehaviorSubject<Transaccion[]>([...MOCK_PMT_TRANSACCIONES]);
  private soporteSubject = new BehaviorSubject<SoportePmt[]>([...MOCK_PMT_SOPORTE_PMT]);
  private usersSubject = new BehaviorSubject<PmtUser[]>([...MOCK_PMT_USERS]);

  readonly transacciones$: Observable<Transaccion[]> = this.txSubject.asObservable();
  readonly soportePmt$: Observable<SoportePmt[]> = this.soporteSubject.asObservable();
  readonly users$: Observable<PmtUser[]> = this.usersSubject.asObservable();

  get transacciones(): Transaccion[] { return this.txSubject.value; }
  get soportePmt(): SoportePmt[] { return this.soporteSubject.value; }
  get users(): PmtUser[] { return this.usersSubject.value; }

  // ── Transacciones (read only en prototipo) ───────────────────────────────

  getTransaccionStats() {
    const all = this.transacciones;
    const byApn = new Map<string, number>();
    const byApp = new Map<string, number>();
    for (const t of all) {
      if (t.apn) byApn.set(t.apn, (byApn.get(t.apn) ?? 0) + 1);
      if (t.aplicacion) byApp.set(t.aplicacion, (byApp.get(t.aplicacion) ?? 0) + 1);
    }
    return {
      total: all.length,
      byApn: [...byApn.entries()].map(([name, count]) => ({ name, count })),
      byApp: [...byApp.entries()].map(([name, count]) => ({ name, count })),
    };
  }

  // ── Soporte PMT ──────────────────────────────────────────────────────────

  createSoportePmt(data: Omit<SoportePmt, 'id' | 'createdAt' | 'updatedAt'>): SoportePmt {
    const now = new Date().toISOString();
    const s: SoportePmt = { ...data, id: soporteSeq++, createdAt: now, updatedAt: now };
    this.soporteSubject.next([s, ...this.soportePmt]);
    return s;
  }

  updateSoportePmt(id: number, changes: Partial<SoportePmt>): void {
    const now = new Date().toISOString();
    this.soporteSubject.next(this.soportePmt.map(s => s.id === id ? { ...s, ...changes, updatedAt: now } : s));
  }

  // ── Users ────────────────────────────────────────────────────────────────

  createUser(data: Omit<PmtUser, 'id' | 'createdAt' | 'updatedAt'>): PmtUser {
    const now = new Date().toISOString();
    const u: PmtUser = { ...data, id: userSeq++, createdAt: now, updatedAt: now };
    this.usersSubject.next([...this.users, u]);
    return u;
  }

  updateUser(id: number, changes: Partial<PmtUser>): void {
    const now = new Date().toISOString();
    this.usersSubject.next(this.users.map(u => u.id === id ? { ...u, ...changes, updatedAt: now } : u));
  }

  deleteUser(id: number): void {
    this.usersSubject.next(this.users.filter(u => u.id !== id));
  }
}
