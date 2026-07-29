import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PmtTransaccionService } from '../../../core/services/pmt/pmt-transaccion.service';
import { SoportePmt } from '../../../core/models/pmt/transaccion.model';

@Component({
  selector: 'app-pmt-soporte-pmt',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pmt-soporte-pmt.component.html',
  styleUrl: './pmt-soporte-pmt.component.css',
})
export class PmtSoportePmtComponent implements OnInit {
  private svc = inject(PmtTransaccionService);
  private fb  = inject(FormBuilder);
  all: SoportePmt[] = [];
  filtered: SoportePmt[] = [];

  filterForm = this.fb.group({ q: [''], estado: [''] });
  detail: SoportePmt | null = null;

  showCreate = false;
  createData = this.fb.group({ serie: [''], terminal: [''], tipo: [''], descripcion: [''] });
  createError = '';

  ngOnInit(): void {
    this.svc.soportePmt$.subscribe(list => { this.all = list; this.applyFilters(); });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(s => {
      const q = (f.q ?? '').toLowerCase();
      if (q && ![s.serie, s.terminal, s.tipo, s.descripcion].some(v => (v ?? '').toLowerCase().includes(q))) return false;
      if (f.estado && s.estado !== f.estado) return false;
      return true;
    });
  }

  changeEstado(id: number, estado: 'pendiente' | 'en_proceso' | 'resuelto'): void {
    this.svc.updateSoportePmt(id, { estado });
    if (this.detail?.id === id) this.detail = this.all.find(s => s.id === id) ?? null;
  }

  create(): void {
    const v = this.createData.getRawValue();
    if (!v.descripcion?.trim()) { this.createError = 'Descripción requerida.'; return; }
    this.svc.createSoportePmt({ serie: v.serie ?? undefined, terminal: v.terminal ?? undefined, tipo: v.tipo ?? undefined, descripcion: v.descripcion!, estado: 'pendiente', createdBy: 'admin' });
    this.showCreate = false;
    this.createData.reset();
  }

  estadoBadge(e: string): string {
    return e === 'resuelto' ? 'cf-badge-ok' : e === 'en_proceso' ? 'cf-badge-info' : 'cf-badge-warn';
  }
  estadoLabel(e: string): string {
    return e === 'resuelto' ? 'Resuelto' : e === 'en_proceso' ? 'En Proceso' : 'Pendiente';
  }
}
