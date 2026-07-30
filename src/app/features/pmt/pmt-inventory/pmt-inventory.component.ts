import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import {
  Terminal, TerminalEstado, TrackingEvent, HistoricalRecord,
  TERMINAL_ESTADO_LABELS, TERMINAL_ESTADO_BADGE
} from '../../../core/models/pmt/terminal.model';

@Component({
  selector: 'app-pmt-inventory',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pmt-inventory.component.html',
  styleUrl: './pmt-inventory.component.css',
})
export class PmtInventoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PmtTerminalService);

  all: Terminal[] = [];
  filtered: Terminal[] = [];

  readonly estadoLabels: Record<TerminalEstado, string> = TERMINAL_ESTADO_LABELS;
  readonly estadoBadge: Record<TerminalEstado, string> = TERMINAL_ESTADO_BADGE;
  readonly estadoKeys = Object.keys(TERMINAL_ESTADO_LABELS) as TerminalEstado[];

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
  historyTab: 'status' | 'events' = 'status';
  terminalTracking: TrackingEvent[] = [];
  terminalLifecycle: HistoricalRecord[] = [];

  ngOnInit(): void {
    this.svc.terminals$.subscribe(ts => {
      this.all = ts;
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
      if (f.zona && !((t.zona ?? '').toLowerCase().includes((f.zona ?? '').toLowerCase()))) return false;
      if (f.modelo && !((t.modelo ?? '').toLowerCase().includes((f.modelo ?? '').toLowerCase()))) return false;
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

  // ── History ───────────────────────────────────────────────────────────────

  hasHistory(t: Terminal): boolean {
    return this.svc.tracking.some(e => e.terminalId === t.id) ||
           this.svc.historical.some(h => h.serie === t.serie);
  }

  openHistory(t: Terminal): void {
    this.historyTerminal = t;
    this.historyTab = 'status';
    this.terminalTracking = this.svc.tracking.filter(e => e.terminalId === t.id);
    this.terminalLifecycle = this.svc.historical.filter(h => h.serie === t.serie).reverse();
  }

  setHistoryTab(tab: 'status' | 'events'): void {
    this.historyTab = tab;
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  prevPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }
}
