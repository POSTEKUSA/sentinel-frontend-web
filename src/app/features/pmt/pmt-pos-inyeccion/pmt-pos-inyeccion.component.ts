import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { Terminal, TERMINAL_ESTADO_LABELS, TERMINAL_ESTADO_BADGE } from '../../../core/models/pmt/terminal.model';

@Component({
  selector: 'app-pmt-pos-inyeccion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pmt-pos-inyeccion.component.html',
  styleUrl: './pmt-pos-inyeccion.component.css',
})
export class PmtPosInyeccionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PmtTerminalService);
  all: Terminal[] = [];
  filtered: Terminal[] = [];
  selectedIds = new Set<number>();
  comment = '';
  showConfirm = false;
  readonly estadoLabels = TERMINAL_ESTADO_LABELS;
  readonly estadoBadge  = TERMINAL_ESTADO_BADGE;

  filterForm = this.fb.group({ q: [''] });

  ngOnInit(): void {
    this.svc.terminals$.subscribe(ts => {
      this.all = ts.filter(t => t.estado === 'en_inyeccion');
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const q = (this.filterForm.value.q ?? '').toLowerCase().trim();
    this.filtered = q
      ? this.all.filter(t => [t.serie, t.modelo, t.zona].some(v => (v ?? '').toLowerCase().includes(q)))
      : [...this.all];
  }

  toggleSelect(id: number): void {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.selectedIds = new Set(this.selectedIds);
  }
  toggleAll(): void {
    this.selectedIds = this.selectedIds.size === this.filtered.length
      ? new Set() : new Set(this.filtered.map(t => t.id));
  }
  get allSelected(): boolean { return this.filtered.length > 0 && this.selectedIds.size === this.filtered.length; }

  marcarSalida(): void {
    [...this.selectedIds].forEach(id => this.svc.changeEstado(id, 'asignado_supervisor', this.comment || 'Salida de inyección'));
    this.selectedIds = new Set();
    this.comment = '';
    this.showConfirm = false;
  }
}
