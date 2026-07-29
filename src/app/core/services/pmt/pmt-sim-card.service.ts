import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SimCard, SimCardEstado, SimCardTracking } from '../../models/pmt/sim-card.model';
import { MOCK_PMT_SIM_CARDS, MOCK_PMT_SIM_TRACKING } from '../../mock/pmt/mock-sim-cards';

let simSeq = MOCK_PMT_SIM_CARDS.length + 1;
let trackSeq = MOCK_PMT_SIM_TRACKING.length + 1;

@Injectable({ providedIn: 'root' })
export class PmtSimCardService {
  private simSubject = new BehaviorSubject<SimCard[]>([...MOCK_PMT_SIM_CARDS]);
  private trackingSubject = new BehaviorSubject<SimCardTracking[]>([...MOCK_PMT_SIM_TRACKING]);

  readonly simCards$: Observable<SimCard[]> = this.simSubject.asObservable();
  readonly tracking$: Observable<SimCardTracking[]> = this.trackingSubject.asObservable();

  get simCards(): SimCard[] { return this.simSubject.value; }
  get tracking(): SimCardTracking[] { return this.trackingSubject.value; }

  create(data: Omit<SimCard, 'id' | 'createdAt' | 'updatedAt'>): SimCard {
    const now = new Date().toISOString();
    const s: SimCard = { ...data, id: simSeq++, createdAt: now, updatedAt: now };
    this.simSubject.next([...this.simCards, s]);
    return s;
  }

  update(id: number, changes: Partial<SimCard>): void {
    const now = new Date().toISOString();
    this.simSubject.next(this.simCards.map(s => s.id === id ? { ...s, ...changes, updatedAt: now } : s));
  }

  changeEstado(id: number, newEstado: SimCardEstado, comment?: string, createdBy = 'admin'): void {
    const card = this.simCards.find(s => s.id === id);
    if (!card) return;
    const now = new Date().toISOString();
    const ev: SimCardTracking = {
      id: trackSeq++, simCardId: id, iccid: card.iccid,
      previousStatus: card.estado, newStatus: newEstado, comment, createdBy, createdAt: now
    };
    this.trackingSubject.next([ev, ...this.tracking]);
    this.update(id, { estado: newEstado });
  }

  getStats() {
    const all = this.simCards;
    const byCompany = new Map<string, number>();
    const byEstado = new Map<string, number>();
    for (const s of all) {
      byCompany.set(s.compania, (byCompany.get(s.compania) ?? 0) + 1);
      byEstado.set(s.estado, (byEstado.get(s.estado) ?? 0) + 1);
    }
    return {
      total: all.length,
      byCompany: [...byCompany.entries()].map(([name, count]) => ({ name, count })),
      byEstado: [...byEstado.entries()].map(([name, count]) => ({ name, count })),
    };
  }

  bulkImport(rows: Partial<SimCard>[]): { created: number; errors: { row: number; iccid: string; message: string }[] } {
    const errors: { row: number; iccid: string; message: string }[] = [];
    let created = 0;
    rows.forEach((row, i) => {
      if (!row.iccid) { errors.push({ row: i + 1, iccid: '', message: 'ICCID requerido' }); return; }
      if (!row.compania) { errors.push({ row: i + 1, iccid: row.iccid, message: 'Compañía requerida' }); return; }
      if (this.simCards.find(s => s.iccid === row.iccid)) {
        errors.push({ row: i + 1, iccid: row.iccid, message: `ICCID "${row.iccid}" ya existe` }); return;
      }
      this.create({ iccid: row.iccid, compania: row.compania, estado: (row.estado as SimCardEstado) ?? 'disponible', ...row });
      created++;
    });
    return { created, errors };
  }
}
