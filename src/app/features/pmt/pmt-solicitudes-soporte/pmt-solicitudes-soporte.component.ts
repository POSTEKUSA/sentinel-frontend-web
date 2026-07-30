import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PmtSolicitudService } from '../../../core/services/pmt/pmt-solicitud.service';
import {
  SolicitudSoporte, SolicitudSoporteEstado,
  SOLICITUD_SOPORTE_ESTADO_LABELS, SOLICITUD_SOPORTE_ESTADO_BADGE
} from '../../../core/models/pmt/solicitud.model';

@Component({
  selector: 'app-pmt-solicitudes-soporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pmt-solicitudes-soporte.component.html',
  styleUrl: './pmt-solicitudes-soporte.component.css',
})
export class PmtSolicitudesSoporteComponent implements OnInit {
  private svc = inject(PmtSolicitudService);
  private fb  = inject(FormBuilder);
  all: SolicitudSoporte[] = [];
  filtered: SolicitudSoporte[] = [];

  readonly estadoLabels = SOLICITUD_SOPORTE_ESTADO_LABELS;
  readonly estadoBadge  = SOLICITUD_SOPORTE_ESTADO_BADGE;
  readonly estadoKeys   = Object.keys(SOLICITUD_SOPORTE_ESTADO_LABELS) as SolicitudSoporteEstado[];

  estadoColor(e: SolicitudSoporteEstado): string {
    if (e === 'pendiente') return '#ca8a04';
    if (e === 'en_proceso') return '#0a5fa5';
    if (e === 'resuelto') return '#2a7c34';
    if (e === 'cerrado') return '#8a929c';
    return '#8a929c';
  }

  filterForm = this.fb.group({ q: [''], estado: [''], tipo: [''] });

  // Detail dialog
  detail: SolicitudSoporte | null = null;
  newComment = '';

  // Create form
  showCreate = false;
  createForm = this.fb.group({ serie: [''], tipo: ['tecnico'], descripcion: [''] });
  createError = '';

  ngOnInit(): void {
    this.svc.solicitudesSoporte$.subscribe(list => {
      this.all = list;
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(s => {
      const q = (f.q ?? '').toLowerCase();
      if (q && ![s.serie, s.descripcion, s.createdBy].some(v => (v ?? '').toLowerCase().includes(q))) return false;
      if (f.estado && s.estado !== f.estado) return false;
      if (f.tipo && s.tipo !== f.tipo) return false;
      return true;
    });
  }

  openDetail(s: SolicitudSoporte): void { this.detail = s; this.newComment = ''; }

  addComment(): void {
    if (!this.detail || !this.newComment.trim()) return;
    this.svc.addComment(this.detail.id, this.newComment.trim(), 'admin');
    this.newComment = '';
    // refresh detail reference
    this.detail = this.all.find(s => s.id === this.detail!.id) ?? null;
  }

  changeEstado(id: number, estado: SolicitudSoporteEstado): void {
    this.svc.changeEstadoSoporte(id, estado);
    if (this.detail?.id === id) this.detail = this.all.find(s => s.id === id) ?? null;
  }

  create(): void {
    const v = this.createForm.getRawValue();
    if (!v.descripcion?.trim()) { this.createError = 'Descripción requerida.'; return; }
    this.svc.createSoporte({ serie: v.serie ?? undefined, tipo: v.tipo as any ?? 'tecnico', descripcion: v.descripcion!, estado: 'pendiente', createdBy: 'admin' });
    this.showCreate = false;
    this.createForm.reset({ tipo: 'tecnico' });
  }
}
