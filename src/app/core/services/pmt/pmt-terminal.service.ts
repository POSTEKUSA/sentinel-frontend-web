import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Terminal, TerminalEstado, TrackingEvent,
  Initialization, HistoricalRecord, AssignedPosHistory, QueryRecord
} from '../../models/pmt/terminal.model';
import {
  MOCK_PMT_TERMINALS, MOCK_PMT_TRACKING,
  MOCK_PMT_INITIALIZATIONS, MOCK_PMT_HISTORICAL,
  MOCK_PMT_ASSIGNED_HISTORY, MOCK_PMT_QUERY_RECORDS
} from '../../mock/pmt/mock-terminals';

let terminalSeq = MOCK_PMT_TERMINALS.length + 1;
let trackingSeq = MOCK_PMT_TRACKING.length + 1;

@Injectable({ providedIn: 'root' })
export class PmtTerminalService {
  private terminalsSubject = new BehaviorSubject<Terminal[]>([...MOCK_PMT_TERMINALS]);
  private trackingSubject = new BehaviorSubject<TrackingEvent[]>([...MOCK_PMT_TRACKING]);
  private initSubject = new BehaviorSubject<Initialization[]>([...MOCK_PMT_INITIALIZATIONS]);
  private historicalSubject = new BehaviorSubject<HistoricalRecord[]>([...MOCK_PMT_HISTORICAL]);
  private assignedHistorySubject = new BehaviorSubject<AssignedPosHistory[]>([...MOCK_PMT_ASSIGNED_HISTORY]);
  private queryRecordsSubject = new BehaviorSubject<QueryRecord[]>([...MOCK_PMT_QUERY_RECORDS]);

  readonly terminals$: Observable<Terminal[]> = this.terminalsSubject.asObservable();
  readonly tracking$: Observable<TrackingEvent[]> = this.trackingSubject.asObservable();
  readonly initializations$: Observable<Initialization[]> = this.initSubject.asObservable();
  readonly historical$: Observable<HistoricalRecord[]> = this.historicalSubject.asObservable();
  readonly assignedHistory$: Observable<AssignedPosHistory[]> = this.assignedHistorySubject.asObservable();
  readonly queryRecords$: Observable<QueryRecord[]> = this.queryRecordsSubject.asObservable();

  get terminals(): Terminal[] { return this.terminalsSubject.value; }
  get tracking(): TrackingEvent[] { return this.trackingSubject.value; }
  get initializations(): Initialization[] { return this.initSubject.value; }
  get historical(): HistoricalRecord[] { return this.historicalSubject.value; }
  get assignedHistory(): AssignedPosHistory[] { return this.assignedHistorySubject.value; }
  get queryRecords(): QueryRecord[] { return this.queryRecordsSubject.value; }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  create(data: Omit<Terminal, 'id' | 'createdAt' | 'updatedAt'>): Terminal {
    const now = new Date().toISOString();
    const t: Terminal = { ...data, id: terminalSeq++, createdAt: now, updatedAt: now };
    this.terminalsSubject.next([...this.terminals, t]);
    return t;
  }

  update(id: number, changes: Partial<Terminal>): void {
    const now = new Date().toISOString();
    this.terminalsSubject.next(
      this.terminals.map(t => t.id === id ? { ...t, ...changes, updatedAt: now } : t)
    );
  }

  delete(id: number): void {
    this.terminalsSubject.next(this.terminals.filter(t => t.id !== id));
  }

  changeEstado(id: number, newEstado: TerminalEstado, comment?: string, createdBy = 'admin', extra?: Partial<Terminal>): void {
    const terminal = this.terminals.find(t => t.id === id);
    if (!terminal) return;
    const now = new Date().toISOString();
    const event: TrackingEvent = {
      id: trackingSeq++,
      terminalId: id,
      serie: terminal.serie,
      previousStatus: terminal.estado,
      newStatus: newEstado,
      comment,
      createdBy,
      createdAt: now,
    };
    this.trackingSubject.next([event, ...this.tracking]);
    this.update(id, { estado: newEstado, ...extra });
  }

  // ── Dashboard summary ────────────────────────────────────────────────────

  getSummary() {
    const ts = this.terminals;
    const byEstado = (e: TerminalEstado) => ts.filter(t => t.estado === e).length;
    const total = ts.length;
    return {
      total,
      enBodega: byEstado('en_bodega'),
      enInyeccion: byEstado('en_inyeccion'),
      asignadoSupervisor: byEstado('asignado_supervisor'),
      asignadoTecnico: byEstado('asignado_tecnico'),
      instalado: byEstado('instalado'),
      enReparacion: byEstado('en_reparacion'),
      garantia: byEstado('garantia'),
      irreparable: byEstado('irreparable'),
      obsoleto: byEstado('obsoleto'),
      retirado: byEstado('retirado'),
      serieSustituida: byEstado('serie_sustituida'),
    };
  }

  getByZone(): { name: string; count: number }[] {
    const map = new Map<string, number>();
    for (const t of this.terminals) {
      const z = t.zona ?? 'Sin zona';
      map.set(z, (map.get(z) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }

  getByModel(): { name: string; count: number }[] {
    const map = new Map<string, number>();
    for (const t of this.terminals) {
      const m = t.modelo ?? 'Sin modelo';
      map.set(m, (map.get(m) ?? 0) + 1);
    }
    return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }

  // ── Bulk import (Excel/CSV → in-memory JSON) ─────────────────────────────

  bulkImport(rows: Partial<Terminal>[]): { created: number; errors: { row: number; serie: string; message: string }[] } {
    const errors: { row: number; serie: string; message: string }[] = [];
    let created = 0;
    rows.forEach((row, i) => {
      if (!row.serie) {
        errors.push({ row: i + 1, serie: '', message: 'Campo "serie" requerido' });
        return;
      }
      const exists = this.terminals.find(t => t.serie.toLowerCase() === row.serie!.toLowerCase());
      if (exists) {
        errors.push({ row: i + 1, serie: row.serie, message: `Serie "${row.serie}" ya existe` });
        return;
      }
      this.create({ serie: row.serie, estado: (row.estado as TerminalEstado) ?? 'en_bodega', ...row });
      created++;
    });
    return { created, errors };
  }

  bulkImportQueryRecords(rows: Partial<QueryRecord>[]): { created: number; errors: { row: number; message: string }[] } {
    const errors: { row: number; message: string }[] = [];
    let created = 0;
    const current = this.queryRecords;
    let seq = current.length + 1;
    const newRecords: QueryRecord[] = [];
    rows.forEach((row, i) => {
      if (!row.terminal && !row.comercio) {
        errors.push({ row: i + 1, message: 'Se requiere al menos "terminal" o "comercio"' });
        return;
      }
      newRecords.push({ id: seq++, ...row } as QueryRecord);
      created++;
    });
    this.queryRecordsSubject.next([...current, ...newRecords]);
    return { created, errors };
  }

  deleteQueryRecord(id: number): void {
    this.queryRecordsSubject.next(this.queryRecords.filter(r => r.id !== id));
  }
}
