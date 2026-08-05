import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import {
  Terminal, TerminalEstado,
  TERMINAL_ESTADO_LABELS, TERMINAL_ESTADO_BADGE
} from '../../../core/models/pmt/terminal.model';
import {
  MOTIVOS_REPARACION, MOTIVOS_GARANTIA, buildMotivoComment
} from '../../../core/models/pmt/terminal-motivos';

export type TimelineKind = 'status' | 'field';

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  title: string;
  icon: string;
  createdAt: string;
  createdBy?: string;
  comment?: string;
  // status
  previousStatus?: TerminalEstado;
  newStatus?: TerminalEstado;
  // field / logistics
  accion?: string;
  comercio?: string;
  ciudad?: string;
  zona?: string;
  direccion?: string;
}

const FIELD_ACCION_LABELS: Record<string, string> = {
  instalacion: 'Instalación',
  retiro: 'Retiro',
  reparacion: 'Reparación',
};

const FIELD_ACCION_ICONS: Record<string, string> = {
  instalacion: 'storefront',
  retiro: 'logout',
  reparacion: 'build',
};

const WORKFLOW_STEPS: { statuses: TerminalEstado[]; label: string }[] = [
  { statuses: ['en_bodega'], label: 'Bodega' },
  { statuses: ['en_inyeccion'], label: 'Inyección' },
  { statuses: ['asignado_supervisor'], label: 'Asig. Supervisor' },
  { statuses: ['asignado_tecnico', 'asignado_ejecutivo'], label: 'Asig. Técnico / Ejecutivo' },
  { statuses: ['instalado'], label: 'Instalado' },
];

@Component({
  selector: 'app-pmt-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './pmt-inventory.component.html',
  styleUrl: './pmt-inventory.component.css',
})
export class PmtInventoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PmtTerminalService);

  all: Terminal[] = [];
  filtered: Terminal[] = [];
  zonas: string[] = [];
  modelos: string[] = [];

  readonly estadoLabels: Record<TerminalEstado, string> = TERMINAL_ESTADO_LABELS;
  readonly estadoBadge: Record<TerminalEstado, string> = TERMINAL_ESTADO_BADGE;
  readonly estadoKeys = Object.keys(TERMINAL_ESTADO_LABELS) as TerminalEstado[];

  openMenuId: string | null = null;

  // Row workflow action dialog
  workflowAction: 'inyeccion' | 'reparacion' | 'garantia' | null = null;
  workflowTarget: Terminal | null = null;
  workflowComment = '';
  workflowMotivo = '';
  workflowError = '';

  readonly motivosReparacion = MOTIVOS_REPARACION;
  readonly motivosGarantia = MOTIVOS_GARANTIA;

  // Pagination
  page = 1;
  readonly pageSize = 50;
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }
  get paged(): Terminal[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  filterForm = this.fb.group({
    q: [''],
    estado: [''],
    zona: [''],
    modelo: [''],
  });

  // Dialog
  showForm = false;
  editId: number | null = null;
  formData = this.fb.group({
    serie: [''],
    inventario: [''],
    modelo: [''],
    estado: ['en_bodega'],
    zona: [''],
    caja: [''],
    inyectado: [''],
    fecha: [''],
    nombre: [''],
    direccion: [''],
    ciudad: [''],
  });
  formError = '';

  // History dialog
  historyTerminal: Terminal | null = null;
  timeline: TimelineEntry[] = [];
  workflowSteps: { key: string; label: string; state: 'done' | 'active' | 'todo' }[] = [];

  ngOnInit(): void {
    this.svc.terminals$.subscribe(ts => {
      this.all = ts;
      this.zonas = [...new Set(ts.map(t => t.zona).filter((z): z is string => !!z))].sort();
      this.modelos = [...new Set(ts.map(t => t.modelo).filter((m): m is string => !!m))].sort();
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => {
      this.page = 1;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(t => {
      const q = (f.q ?? '').toLowerCase().trim();
      if (q && ![t.serie, t.modelo, t.nombre, t.inventario, t.zona, t.ciudad]
        .some(v => (v ?? '').toLowerCase().includes(q))) return false;
      if (f.estado && t.estado !== f.estado) return false;
      if (f.zona && t.zona !== f.zona) return false;
      if (f.modelo && t.modelo !== f.modelo) return false;
      return true;
    });
  }

  clearFilters(): void {
    this.filterForm.reset({ q: '', estado: '', zona: '', modelo: '' });
  }

  get hasFilters(): boolean {
    const f = this.filterForm.getRawValue();
    return !!(f.q || f.estado || f.zona || f.modelo);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  openCreate(): void {
    this.editId = null;
    this.formData.reset({ estado: 'en_bodega' });
    this.formError = '';
    this.showForm = true;
  }

  openEdit(t: Terminal): void {
    this.editId = t.id;
    this.formData.patchValue(t);
    this.formError = '';
    this.showForm = true;
  }

  saveForm(): void {
    const v = this.formData.getRawValue();
    if (!v.serie?.trim()) { this.formError = 'El número de serie es requerido.'; return; }
    if (this.editId === null) {
      const exists = this.all.find(t => t.serie.toLowerCase() === v.serie!.toLowerCase());
      if (exists) { this.formError = `La serie "${v.serie}" ya existe.`; return; }
      this.svc.create({ ...(v as any), serie: v.serie!, estado: (v.estado as TerminalEstado) ?? 'en_bodega' });
    } else {
      this.svc.update(this.editId, v as Partial<Terminal>);
    }
    this.showForm = false;
  }

  delete(id: number): void {
    if (confirm('¿Eliminar este terminal?')) this.svc.delete(id);
  }

  // ── Row workflow actions ──────────────────────────────────────────────────

  @HostListener('document:click')
  closeMenus(): void { this.openMenuId = null; }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  canSendToInyeccion(t: Terminal): boolean { return this.svc.canSendToInyeccion(t); }
  canSendToReparacion(t: Terminal): boolean { return this.svc.canSendToReparacion(t); }
  canSendToGarantia(t: Terminal): boolean { return this.svc.canSendToGarantia(t); }

  startWorkflow(type: 'inyeccion' | 'reparacion' | 'garantia', t: Terminal, event?: Event): void {
    event?.stopPropagation();
    this.workflowAction = type;
    this.workflowTarget = t;
    this.workflowComment = '';
    this.workflowMotivo = '';
    this.workflowError = '';
    this.openMenuId = null;
  }

  cancelWorkflow(): void {
    this.workflowAction = null;
    this.workflowTarget = null;
    this.workflowComment = '';
    this.workflowMotivo = '';
    this.workflowError = '';
  }

  get workflowNeedsMotivo(): boolean {
    return this.workflowAction === 'reparacion' || this.workflowAction === 'garantia';
  }

  get workflowMotivosList(): string[] {
    if (this.workflowAction === 'reparacion') return this.motivosReparacion;
    if (this.workflowAction === 'garantia') return this.motivosGarantia;
    return [];
  }

  workflowTitle(): string {
    switch (this.workflowAction) {
      case 'inyeccion': return 'Enviar a Inyección';
      case 'reparacion': return 'Enviar a Reparación';
      case 'garantia': return 'Enviar a Garantía';
      default: return '';
    }
  }

  applyWorkflow(): void {
    if (!this.workflowAction || !this.workflowTarget) return;

    if (this.workflowNeedsMotivo) {
      if (!this.workflowMotivo) {
        this.workflowError = 'Seleccione un motivo.';
        return;
      }
      if (this.workflowMotivo === 'Otro' && !this.workflowComment.trim()) {
        this.workflowError = 'Indique el detalle del motivo (Otro).';
        return;
      }
    }
    this.workflowError = '';

    const id = this.workflowTarget.id;
    const comment = this.workflowNeedsMotivo
      ? buildMotivoComment(this.workflowMotivo, this.workflowComment)
      : this.workflowComment;

    switch (this.workflowAction) {
      case 'inyeccion':
        this.svc.changeEstado(id, 'en_inyeccion', comment || 'Enviado a inyección');
        break;
      case 'reparacion':
        this.svc.changeEstado(id, 'en_reparacion', comment || 'Enviado a reparación');
        break;
      case 'garantia':
        this.svc.changeEstado(id, 'garantia', comment || 'Enviado a garantía');
        break;
    }
    this.cancelWorkflow();
  }

  // ── History ───────────────────────────────────────────────────────────────

  hasHistory(t: Terminal): boolean {
    return this.svc.tracking.some(e => e.terminalId === t.id) ||
           this.svc.historical.some(h => h.serie === t.serie);
  }

  openHistory(t: Terminal): void {
    this.historyTerminal = t;
    this.timeline = this.buildTimeline(t);
    this.workflowSteps = this.buildWorkflowSteps(t.estado);
  }

  private buildTimeline(t: Terminal): TimelineEntry[] {
    const statusEntries: TimelineEntry[] = this.svc.tracking
      .filter(e => e.terminalId === t.id)
      .map(e => ({
        id: `status-${e.id}`,
        kind: 'status' as const,
        title: 'Cambio de Estado',
        icon: 'sell',
        createdAt: e.createdAt,
        createdBy: e.createdBy,
        comment: e.comment,
        previousStatus: e.previousStatus,
        newStatus: e.newStatus,
      }));

    const fieldEntries: TimelineEntry[] = this.svc.historical
      .filter(h => h.serie === t.serie)
      .map(h => ({
        id: `field-${h.id}`,
        kind: 'field' as const,
        title: FIELD_ACCION_LABELS[h.accion] ?? h.accion,
        icon: FIELD_ACCION_ICONS[h.accion] ?? 'place',
        createdAt: h.createdAt,
        createdBy: h.createdBy,
        comment: h.descripcion,
        accion: h.accion,
        comercio: h.comercio,
        ciudad: h.ciudad,
        zona: h.zona,
        direccion: h.direccion,
      }));

    return [...statusEntries, ...fieldEntries]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private buildWorkflowSteps(estado: TerminalEstado) {
    const repairFlow: TerminalEstado[] = ['en_reparacion', 'garantia', 'irreparable', 'obsoleto'];
    let steps = WORKFLOW_STEPS.map(s => ({ ...s }));

    if (repairFlow.includes(estado)) {
      steps = [
        { statuses: ['instalado'], label: 'Instalado' },
        { statuses: ['en_reparacion'], label: 'Reparación' },
      ];
      if (estado === 'garantia') steps.push({ statuses: ['garantia'], label: 'Garantía' });
      if (estado === 'irreparable') steps.push({ statuses: ['irreparable'], label: 'Irreparable' });
      if (estado === 'obsoleto') steps.push({ statuses: ['obsoleto'], label: 'Obsoleto' });
    }

    const idx = steps.findIndex(s => s.statuses.includes(estado));
    return steps.map((s, i) => ({
      key: s.statuses.join('|'),
      label: s.label,
      state: (idx < 0 ? 'todo' : i < idx ? 'done' : i === idx ? 'active' : 'todo') as 'done' | 'active' | 'todo',
    }));
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  prevPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }
}
