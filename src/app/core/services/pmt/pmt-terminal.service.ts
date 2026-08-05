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
let initSeq = MOCK_PMT_INITIALIZATIONS.length + 1;

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
    const extraUpdate: Partial<Terminal> = { ...extra };
    if (newEstado === 'en_inyeccion') {
      extraUpdate.inyectado = extraUpdate.inyectado ?? 'No';
    }
    this.update(id, { estado: newEstado, ...extraUpdate });
  }

  /** True if terminal already went through inyección (flag or tracking history). */
  hasPassedInyeccion(t: Terminal): boolean {
    if ((t.inyectado ?? '').toLowerCase() === 'si') return true;
    return this.tracking.some(e =>
      e.terminalId === t.id &&
      (e.newStatus === 'en_inyeccion' || e.previousStatus === 'en_inyeccion')
    );
  }

  canSendToInyeccion(t: Terminal): boolean {
    return t.estado === 'en_bodega' && !this.hasPassedInyeccion(t);
  }

  canSendToReparacion(t: Terminal): boolean {
    return !['en_reparacion', 'irreparable', 'obsoleto', 'retirado', 'serie_sustituida'].includes(t.estado);
  }

  canSendToGarantia(t: Terminal): boolean {
    return !['garantia', 'irreparable', 'obsoleto', 'retirado', 'serie_sustituida'].includes(t.estado);
  }

  /** Builds injection payload from a Merchant Config (query) record + terminal serie. */
  buildInjectionPayload(serie: string, merchant: QueryRecord, extras?: { version?: string; apn?: string }): Record<string, string> {
    return {
      serie,
      terminal: merchant.terminal ?? '',
      codigo: merchant.codigo ?? '',
      comercio: merchant.comercio ?? '',
      direccion: merchant.direccion ?? '',
      ciudad: merchant.ciudad ?? '',
      mcc: merchant.mcc ?? '',
      limite: merchant.limite ?? '',
      zona: merchant.zona ?? '',
      version: extras?.version ?? '4.12.5',
      apn: extras?.apn ?? 'internet.claro.hn',
    };
  }

  /**
   * Applies merchant injection config to a terminal in `en_inyeccion`.
   * Marks `inyectado = Si`, copies merchant fields, and logs an Initialization.
   */
  applyInjectionFile(
    terminalId: number,
    payload: Record<string, string>,
    opts?: { fileName?: string; createdBy?: string },
  ): { ok: true } | { ok: false; message: string } {
    const t = this.terminals.find(x => x.id === terminalId);
    if (!t) return { ok: false, message: 'Terminal no encontrado' };
    if (t.estado !== 'en_inyeccion') return { ok: false, message: 'El terminal no está en inyección' };
    if (!payload['serie']) return { ok: false, message: 'El archivo debe incluir "serie"' };
    if (payload['serie'].toLowerCase() !== t.serie.toLowerCase()) {
      return { ok: false, message: `La serie del archivo (${payload['serie']}) no coincide con ${t.serie}` };
    }

    const fileName = opts?.fileName ?? 'inyeccion.json';
    const createdBy = opts?.createdBy ?? 'inyector';
    this.update(terminalId, {
      inyectado: 'Si',
      nombre: payload['comercio'] || t.nombre,
      codigo: payload['codigo'] || t.codigo,
      terminal: payload['terminal'] || t.terminal,
      direccion: payload['direccion'] || t.direccion,
      ciudad: payload['ciudad'] || t.ciudad,
      mcc: payload['mcc'] || t.mcc,
      zona: payload['zona'] || t.zona,
      version: payload['version'] || t.version,
    });

    const now = new Date().toISOString();
    const init: Initialization = {
      id: initSeq++,
      serie: t.serie,
      terminal: payload['terminal'] || t.terminal,
      version: payload['version'] || '4.12.5',
      apn: payload['apn'] || 'internet.claro.hn',
      resultado: 'OK',
      createdBy,
      createdAt: now,
    };
    this.initSubject.next([init, ...this.initializations]);

    const event: TrackingEvent = {
      id: trackingSeq++,
      terminalId,
      serie: t.serie,
      previousStatus: t.estado,
      newStatus: t.estado,
      comment: `Archivo de inyección cargado: ${fileName} → ${payload['comercio'] || 'sin comercio'}`,
      createdBy,
      createdAt: now,
    };
    this.trackingSubject.next([event, ...this.tracking]);
    return { ok: true };
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
      asignadoTecnico: byEstado('asignado_tecnico') + byEstado('asignado_ejecutivo'),
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
