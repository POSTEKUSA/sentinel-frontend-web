import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import {
  Terminal, TerminalEstado,
  TERMINAL_ESTADO_LABELS, TERMINAL_ESTADO_BADGE
} from '../../../core/models/pmt/terminal.model';
import {
  MOTIVOS_REPARACION, MOTIVOS_GARANTIA, buildMotivoComment
} from '../../../core/models/pmt/terminal-motivos';

type BodegaAction = 'inyeccion' | 'asignar' | 'reparacion' | 'garantia';

@Component({
  selector: 'app-pmt-bodega',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pmt-bodega.component.html',
  styleUrl: './pmt-bodega.component.css',
})
export class PmtBodegaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PmtTerminalService);

  all: Terminal[] = [];
  filtered: Terminal[] = [];

  readonly estadoLabels = TERMINAL_ESTADO_LABELS;
  readonly estadoBadge  = TERMINAL_ESTADO_BADGE;
  readonly motivosReparacion = MOTIVOS_REPARACION;
  readonly motivosGarantia = MOTIVOS_GARANTIA;

  selectedIds = new Set<number>();
  actionComment = '';
  actionMotivo = '';
  actionError = '';
  openMenuId: string | null = null;

  filterForm = this.fb.group({ serie: [''], inventario: [''], modelo: [''], caja: [''], inyectado: [''] });

  // Action dialog
  actionType: BodegaAction | null = null;
  actionIds: number[] = [];
  assignRole: 'supervisor' | 'tecnico' | 'ejecutivo' = 'supervisor';
  assignTo = '';

  ngOnInit(): void {
    this.svc.terminals$.subscribe(ts => {
      this.all = ts.filter(t => t.estado === 'en_bodega');
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  @HostListener('document:click')
  closeMenus(): void { this.openMenuId = null; }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  canSendToInyeccion(t: Terminal): boolean { return this.svc.canSendToInyeccion(t); }
  canSendToReparacion(t: Terminal): boolean { return this.svc.canSendToReparacion(t); }
  canSendToGarantia(t: Terminal): boolean { return this.svc.canSendToGarantia(t); }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(t =>
      (!f.serie      || (t.serie ?? '').toLowerCase().includes(f.serie!.toLowerCase())) &&
      (!f.inventario || (t.inventario ?? '').toLowerCase().includes(f.inventario!.toLowerCase())) &&
      (!f.modelo     || (t.modelo ?? '').toLowerCase().includes(f.modelo!.toLowerCase())) &&
      (!f.caja       || (t.caja ?? '').toLowerCase().includes(f.caja!.toLowerCase())) &&
      (!f.inyectado  || (t.inyectado ?? '').toLowerCase() === f.inyectado!.toLowerCase())
    );
  }

  clearFilters(): void { this.filterForm.reset(); }
  get hasFilters(): boolean { return Object.values(this.filterForm.getRawValue()).some(v => !!v); }

  toggleSelect(id: number): void {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.selectedIds = new Set(this.selectedIds);
  }
  toggleAll(): void {
    if (this.selectedIds.size === this.filtered.length)
      this.selectedIds = new Set();
    else
      this.selectedIds = new Set(this.filtered.map(t => t.id));
  }
  get allSelected(): boolean { return this.filtered.length > 0 && this.selectedIds.size === this.filtered.length; }

  startBulkAction(type: BodegaAction): void {
    const ids = [...this.selectedIds];
    if (!ids.length) return;
    this.startAction(type, ids);
  }

  startRowAction(type: BodegaAction, t: Terminal, event?: Event): void {
    event?.stopPropagation();
    this.startAction(type, [t.id]);
  }

  private startAction(type: BodegaAction, ids: number[]): void {
    if (type === 'inyeccion') {
      ids = ids.filter(id => {
        const t = this.all.find(x => x.id === id) ?? this.svc.terminals.find(x => x.id === id);
        return t ? this.canSendToInyeccion(t) : false;
      });
      if (!ids.length) {
        alert('Ningún terminal seleccionado puede enviarse a inyección (ya pasó por ese estado o no está en bodega).');
        return;
      }
    }
    this.actionType = type;
    this.actionIds = ids;
    this.actionComment = '';
    this.actionMotivo = '';
    this.actionError = '';
    this.openMenuId = null;
  }

  cancelAction(): void {
    this.actionType = null;
    this.actionIds = [];
    this.actionComment = '';
    this.actionMotivo = '';
    this.actionError = '';
    this.assignTo = '';
  }

  get motivosList(): string[] {
    if (this.actionType === 'reparacion') return this.motivosReparacion;
    if (this.actionType === 'garantia') return this.motivosGarantia;
    return [];
  }

  get needsMotivo(): boolean {
    return this.actionType === 'reparacion' || this.actionType === 'garantia';
  }

  actionTitle(): string {
    switch (this.actionType) {
      case 'inyeccion': return 'Enviar a Inyección';
      case 'reparacion': return 'Enviar a Reparación';
      case 'garantia': return 'Enviar a Garantía';
      case 'asignar': return 'Asignar POS';
      default: return '';
    }
  }

  applyAction(): void {
    const ids = this.actionIds;
    if (!ids.length || !this.actionType) return;

    if (this.needsMotivo) {
      if (!this.actionMotivo) {
        this.actionError = 'Seleccione un motivo.';
        return;
      }
      if (this.actionMotivo === 'Otro' && !this.actionComment.trim()) {
        this.actionError = 'Indique el detalle del motivo (Otro).';
        return;
      }
    }
    this.actionError = '';

    const comment = this.needsMotivo
      ? buildMotivoComment(this.actionMotivo, this.actionComment)
      : this.actionComment;

    switch (this.actionType) {
      case 'inyeccion':
        ids.forEach(id => this.svc.changeEstado(id, 'en_inyeccion', comment || 'Enviado a inyección'));
        break;
      case 'asignar': {
        const roleEstado: Record<typeof this.assignRole, TerminalEstado> = {
          supervisor: 'asignado_supervisor',
          tecnico: 'asignado_tecnico',
          ejecutivo: 'asignado_ejecutivo',
        };
        const newEstado = roleEstado[this.assignRole];
        ids.forEach(id => this.svc.changeEstado(id, newEstado, comment, 'admin', { assignedTo: this.assignTo, assignedAt: new Date().toISOString() }));
        break;
      }
      case 'reparacion':
        ids.forEach(id => this.svc.changeEstado(id, 'en_reparacion', comment || 'Enviado a reparación'));
        break;
      case 'garantia':
        ids.forEach(id => this.svc.changeEstado(id, 'garantia', comment || 'Enviado a garantía'));
        break;
    }
    this.selectedIds = new Set();
    this.cancelAction();
  }
}
