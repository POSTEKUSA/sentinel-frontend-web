import { Component, HostListener, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PmtSolicitudService } from '../../../core/services/pmt/pmt-solicitud.service';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { CopyableCodeComponent } from '../../../shared/copyable-code/copyable-code.component';
import { UserNamePipe } from '../../../shared/pipes/user-name.pipe';
import {
  MOTIVOS_REPARACION, MOTIVOS_GARANTIA, buildMotivoComment
} from '../../../core/models/pmt/terminal-motivos';
import { Terminal } from '../../../core/models/pmt/terminal.model';

import {
  SolicitudSoporte, SolicitudSoporteEstado, SolicitudSoporteDisposicion,
  SOLICITUD_SOPORTE_ESTADO_LABELS, SOLICITUD_SOPORTE_ESTADO_BADGE,
  SOLICITUD_SOPORTE_DISPOSICION_LABELS, SOLICITUD_SOPORTE_DISPOSICION_BADGE,
} from '../../../core/models/pmt/solicitud.model';

@Component({
  selector: 'app-pmt-solicitudes-soporte',
  standalone: true,
  imports: [CopyableCodeComponent, CommonModule, ReactiveFormsModule, FormsModule, UserNamePipe],
  templateUrl: './pmt-solicitudes-soporte.component.html',
  styleUrl: './pmt-solicitudes-soporte.component.css',
})
export class PmtSolicitudesSoporteComponent implements OnInit, OnDestroy {
  private svc = inject(PmtSolicitudService);
  private terminalSvc = inject(PmtTerminalService);
  private fb  = inject(FormBuilder);
  private formSub?: Subscription;
  all: SolicitudSoporte[] = [];
  filtered: SolicitudSoporte[] = [];

  readonly estadoLabels = SOLICITUD_SOPORTE_ESTADO_LABELS;
  readonly estadoBadge  = SOLICITUD_SOPORTE_ESTADO_BADGE;
  readonly estadoKeys   = Object.keys(SOLICITUD_SOPORTE_ESTADO_LABELS) as SolicitudSoporteEstado[];
  readonly disposicionLabels = SOLICITUD_SOPORTE_DISPOSICION_LABELS;
  readonly disposicionBadge  = SOLICITUD_SOPORTE_DISPOSICION_BADGE;
  readonly motivosReparacion = MOTIVOS_REPARACION;
  readonly motivosGarantia = MOTIVOS_GARANTIA;

  estadoColor(e: SolicitudSoporteEstado): string {
    if (e === 'pendiente') return '#ca8a04';
    if (e === 'en_proceso') return '#0a5fa5';
    if (e === 'resuelto') return '#2a7c34';
    if (e === 'cerrado') return '#8a929c';
    return '#8a929c';
  }

  filterForm = this.fb.group({ q: [''], estado: [''] });

  // Detail dialog
  detail: SolicitudSoporte | null = null;
  newComment = '';

  // Create / edit form
  showCreate = false;
  editTarget: SolicitudSoporte | null = null;
  createForm = this.fb.group({ inventario: [''], descripcion: [''] });
  createError = '';
  formTerminal: Terminal | null = null;

  // Row actions menu
  openMenuId: string | null = null;
  menuTarget: SolicitudSoporte | null = null;
  menuPos: { top: number; left: number } | null = null;

  // Delete
  deleteTarget: SolicitudSoporte | null = null;

  // Workflow → reparación / garantía
  workflowAction: 'reparacion' | 'garantia' | null = null;
  workflowSolicitud: SolicitudSoporte | null = null;
  workflowTerminal: Terminal | null = null;
  workflowMotivo = '';
  workflowComment = '';
  workflowError = '';

  ngOnInit(): void {
    this.svc.solicitudesSoporte$.subscribe(list => {
      this.all = list;
      this.applyFilters();
      if (this.detail) {
        this.detail = this.all.find(s => s.id === this.detail!.id) ?? null;
      }
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
    this.formSub = this.createForm.get('inventario')!.valueChanges.subscribe(v => {
      this.resolveFormTerminal(v ?? '');
    });
  }

  ngOnDestroy(): void {
    this.formSub?.unsubscribe();
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(s => {
      const q = (f.q ?? '').toLowerCase();
      if (q) {
        const t = this.terminalFor(s);
        const hay = [
          s.serie, s.inventario, s.descripcion, s.createdBy,
          t?.inventario, t?.marca, t?.modelo, t?.serie,
        ].some(v => (v ?? '').toLowerCase().includes(q));
        if (!hay) return false;
      }
      if (f.estado && s.estado !== f.estado) return false;
      return true;
    });
  }

  openDetail(s: SolicitudSoporte): void {
    this.detail = s;
    this.newComment = '';
    this.closeMenus();
  }

  addComment(): void {
    if (!this.detail || !this.newComment.trim()) return;
    this.svc.addComment(this.detail.id, this.newComment.trim(), 'admin');
    this.newComment = '';
  }

  changeEstado(id: number, estado: SolicitudSoporteEstado): void {
    this.svc.changeEstadoSoporte(id, estado);
  }

  openCreate(): void {
    this.editTarget = null;
    this.createError = '';
    this.formTerminal = null;
    this.createForm.reset({ inventario: '', descripcion: '' });
    this.showCreate = true;
  }

  openEdit(s: SolicitudSoporte): void {
    this.editTarget = s;
    this.createError = '';
    const inv = s.inventario ?? this.terminalFor(s)?.inventario ?? '';
    this.createForm.reset({ inventario: inv, descripcion: s.descripcion });
    this.resolveFormTerminal(inv);
    this.showCreate = true;
    this.closeMenus();
  }

  cancelForm(): void {
    this.showCreate = false;
    this.editTarget = null;
    this.createError = '';
    this.formTerminal = null;
  }

  private resolveFormTerminal(inventario: string): void {
    const inv = inventario.trim();
    this.formTerminal = inv ? (this.terminalSvc.findByInventario(inv) ?? null) : null;
  }

  saveForm(): void {
    const v = this.createForm.getRawValue();
    const inv = (v.inventario ?? '').trim();
    if (!inv) { this.createError = 'Código de inventario requerido.'; return; }
    if (!v.descripcion?.trim()) { this.createError = 'Descripción requerida.'; return; }

    const t = this.terminalSvc.findByInventario(inv);
    if (!t) {
      this.createError = `No se encontró terminal con COD inventario "${inv}".`;
      return;
    }
    this.createError = '';

    const payload = {
      inventario: t.inventario ?? inv,
      serie: t.serie,
      descripcion: v.descripcion!,
    };

    if (this.editTarget) {
      this.svc.updateSoporte(this.editTarget.id, payload);
      if (this.detail?.id === this.editTarget.id) {
        this.detail = this.all.find(x => x.id === this.editTarget!.id) ?? null;
      }
    } else {
      this.svc.createSoporte({
        ...payload,
        tipo: 'tecnico',
        estado: 'pendiente',
        createdBy: 'admin',
      });
    }
    this.cancelForm();
  }

  // ── Terminal helpers ─────────────────────────────────────────────────────

  terminalFor(s: SolicitudSoporte): Terminal | undefined {
    if (s.inventario) {
      const byInv = this.terminalSvc.findByInventario(s.inventario);
      if (byInv) return byInv;
    }
    return s.serie ? this.terminalSvc.findBySerie(s.serie) : undefined;
  }

  canSendToReparacion(s: SolicitudSoporte): boolean {
    const t = this.terminalFor(s);
    return !!t && this.terminalSvc.canSendToReparacion(t);
  }

  canSendToGarantia(s: SolicitudSoporte): boolean {
    const t = this.terminalFor(s);
    return !!t && this.terminalSvc.canSendToGarantia(t);
  }

  // ── Row actions menu ─────────────────────────────────────────────────────

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuId = null;
    this.menuTarget = null;
    this.menuPos = null;
  }

  @HostListener('window:resize')
  onViewportChange(): void {
    if (this.menuTarget) this.closeMenus();
  }

  toggleMenu(s: SolicitudSoporte, event: Event): void {
    event.stopPropagation();
    const id = `sop-${s.id}`;
    if (this.openMenuId === id) {
      this.closeMenus();
      return;
    }
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const panelWidth = 220;
    const panelHeight = 220;
    const left = Math.min(Math.max(8, rect.right - panelWidth), window.innerWidth - panelWidth - 8);
    const openUp = window.innerHeight - rect.bottom < panelHeight && rect.top > panelHeight;
    const top = openUp
      ? Math.max(8, rect.top - panelHeight - 4)
      : Math.min(rect.bottom + 4, window.innerHeight - panelHeight - 8);
    this.menuPos = { top, left };
    this.menuTarget = s;
    this.openMenuId = id;
  }

  // ── Delete ───────────────────────────────────────────────────────────────

  askDelete(s: SolicitudSoporte): void {
    this.deleteTarget = s;
    this.closeMenus();
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.svc.deleteSoporte(id);
    if (this.detail?.id === id) this.detail = null;
    this.cancelDelete();
  }

  // ── Workflow reparación / garantía ───────────────────────────────────────

  startWorkflow(type: 'reparacion' | 'garantia', s: SolicitudSoporte, event?: Event): void {
    event?.stopPropagation();
    const t = this.terminalFor(s);
    if (!t) return;
    this.workflowAction = type;
    this.workflowSolicitud = s;
    this.workflowTerminal = t;
    this.workflowMotivo = '';
    this.workflowComment = '';
    this.workflowError = '';
    this.closeMenus();
  }

  cancelWorkflow(): void {
    this.workflowAction = null;
    this.workflowSolicitud = null;
    this.workflowTerminal = null;
    this.workflowMotivo = '';
    this.workflowComment = '';
    this.workflowError = '';
  }

  get workflowMotivosList(): string[] {
    if (this.workflowAction === 'reparacion') return this.motivosReparacion;
    if (this.workflowAction === 'garantia') return this.motivosGarantia;
    return [];
  }

  workflowTitle(): string {
    if (this.workflowAction === 'reparacion') return 'Enviar a Reparación';
    if (this.workflowAction === 'garantia') return 'Enviar a Garantía';
    return '';
  }

  applyWorkflow(): void {
    if (!this.workflowAction || !this.workflowSolicitud || !this.workflowTerminal) return;

    if (!this.workflowMotivo) {
      this.workflowError = 'Seleccione un motivo.';
      return;
    }
    if (this.workflowMotivo === 'Otro' && !this.workflowComment.trim()) {
      this.workflowError = 'Indique el detalle del motivo (Otro).';
      return;
    }
    this.workflowError = '';

    const observacion = this.workflowComment.trim();
    const comment = buildMotivoComment(this.workflowMotivo, observacion);
    const disposicion: SolicitudSoporteDisposicion =
      this.workflowAction === 'reparacion' ? 'reparacion' : 'garantia';
    const newEstado = this.workflowAction === 'reparacion' ? 'en_reparacion' : 'garantia';
    const label = this.workflowAction === 'reparacion' ? 'reparación' : 'garantía';

    this.terminalSvc.changeEstado(
      this.workflowTerminal.id,
      newEstado,
      comment || `Enviado a ${label}`,
    );

    this.svc.updateSoporte(this.workflowSolicitud.id, {
      estado: 'en_proceso',
      disposicion,
      tallerMotivo: this.workflowMotivo === 'Otro' ? observacion : this.workflowMotivo,
      tallerObservacion: this.workflowMotivo === 'Otro' ? undefined : (observacion || undefined),
      inventario: this.workflowTerminal.inventario ?? this.workflowSolicitud.inventario,
      serie: this.workflowTerminal.serie,
    });
    this.svc.addComment(
      this.workflowSolicitud.id,
      `Enviado a ${label}: ${comment || label}`,
      'admin',
    );

    this.cancelWorkflow();
  }
}
