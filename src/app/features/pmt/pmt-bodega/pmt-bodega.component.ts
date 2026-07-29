import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import {
  Terminal, TerminalEstado,
  TERMINAL_ESTADO_LABELS, TERMINAL_ESTADO_BADGE
} from '../../../core/models/pmt/terminal.model';

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

  selectedIds = new Set<number>();
  actionComment = '';

  filterForm = this.fb.group({ serie: [''], inventario: [''], modelo: [''], caja: [''], inyectado: [''] });

  // Action dialog
  actionType: 'inyeccion' | 'asignar' | 'reparacion' | null = null;
  assignRole: 'supervisor' | 'tecnico' = 'supervisor';
  assignTo = '';

  ngOnInit(): void {
    this.svc.terminals$.subscribe(ts => {
      this.all = ts.filter(t => t.estado === 'en_bodega');
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

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

  applyAction(): void {
    const ids = [...this.selectedIds];
    if (!ids.length) return;
    switch (this.actionType) {
      case 'inyeccion':
        ids.forEach(id => this.svc.changeEstado(id, 'en_inyeccion', this.actionComment));
        break;
      case 'asignar':
        const newEstado: TerminalEstado = this.assignRole === 'supervisor' ? 'asignado_supervisor' : 'asignado_tecnico';
        ids.forEach(id => this.svc.changeEstado(id, newEstado, this.actionComment, 'admin', { assignedTo: this.assignTo, assignedAt: new Date().toISOString() }));
        break;
      case 'reparacion':
        ids.forEach(id => this.svc.changeEstado(id, 'en_reparacion', this.actionComment));
        break;
    }
    this.selectedIds = new Set();
    this.actionComment = '';
    this.assignTo = '';
    this.actionType = null;
  }
}
