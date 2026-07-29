import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  SolicitudSoporte, SolicitudSoporteEstado, SolicitudComment,
  SolicitudEquipo, SolicitudEquipoEstado, SolicitudEquipoHistoryEntry
} from '../../models/pmt/solicitud.model';
import { MOCK_PMT_SOLICITUDES_SOPORTE, MOCK_PMT_SOLICITUDES_EQUIPO } from '../../mock/pmt/mock-solicitudes';

let soporteSeq = MOCK_PMT_SOLICITUDES_SOPORTE.length + 1;
let equipoSeq = MOCK_PMT_SOLICITUDES_EQUIPO.length + 1;
let commentSeq = 100;
let historySeq = 100;

@Injectable({ providedIn: 'root' })
export class PmtSolicitudService {
  private soporteSubject = new BehaviorSubject<SolicitudSoporte[]>([...MOCK_PMT_SOLICITUDES_SOPORTE]);
  private equipoSubject = new BehaviorSubject<SolicitudEquipo[]>([...MOCK_PMT_SOLICITUDES_EQUIPO]);

  readonly solicitudesSoporte$: Observable<SolicitudSoporte[]> = this.soporteSubject.asObservable();
  readonly solicitudesEquipo$: Observable<SolicitudEquipo[]> = this.equipoSubject.asObservable();

  // ── Soporte ──────────────────────────────────────────────────────────────

  createSoporte(data: Omit<SolicitudSoporte, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): SolicitudSoporte {
    const now = new Date().toISOString();
    const s: SolicitudSoporte = { ...data, id: soporteSeq++, createdAt: now, updatedAt: now, comments: [] };
    this.soporteSubject.next([s, ...this.soporteSubject.value]);
    return s;
  }

  updateSoporte(id: number, changes: Partial<SolicitudSoporte>): void {
    const now = new Date().toISOString();
    this.soporteSubject.next(
      this.soporteSubject.value.map(s => s.id === id ? { ...s, ...changes, updatedAt: now } : s)
    );
  }

  addComment(solicitudId: number, comment: string, createdBy: string): void {
    const now = new Date().toISOString();
    const c: SolicitudComment = { id: commentSeq++, solicitudId, comment, createdBy, createdAt: now };
    this.soporteSubject.next(
      this.soporteSubject.value.map(s =>
        s.id === solicitudId ? { ...s, comments: [...s.comments, c], updatedAt: now } : s
      )
    );
  }

  changeEstadoSoporte(id: number, estado: SolicitudSoporteEstado): void {
    this.updateSoporte(id, { estado });
  }

  // ── Equipo ───────────────────────────────────────────────────────────────

  createEquipo(data: Omit<SolicitudEquipo, 'id' | 'createdAt' | 'updatedAt' | 'history'>): SolicitudEquipo {
    const now = new Date().toISOString();
    const s: SolicitudEquipo = { ...data, id: equipoSeq++, createdAt: now, updatedAt: now, history: [] };
    this.equipoSubject.next([s, ...this.equipoSubject.value]);
    return s;
  }

  updateEquipo(id: number, changes: Partial<SolicitudEquipo>): void {
    const now = new Date().toISOString();
    this.equipoSubject.next(
      this.equipoSubject.value.map(s => s.id === id ? { ...s, ...changes, updatedAt: now } : s)
    );
  }

  changeEstadoEquipo(id: number, estado: SolicitudEquipoEstado, comment?: string, createdBy = 'admin'): void {
    const now = new Date().toISOString();
    const entry: SolicitudEquipoHistoryEntry = { id: historySeq++, solicitudId: id, estado, comment, createdBy, createdAt: now };
    this.equipoSubject.next(
      this.equipoSubject.value.map(s =>
        s.id === id
          ? { ...s, estado, updatedAt: now, history: [...s.history, entry] }
          : s
      )
    );
  }
}
