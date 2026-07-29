import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { PmtTransaccionService } from '../../../core/services/pmt/pmt-transaccion.service';
import { Transaccion } from '../../../core/models/pmt/transaccion.model';

@Component({
  selector: 'app-pmt-control-pos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pmt-control-pos.component.html',
  styleUrl: './pmt-control-pos.component.css',
})
export class PmtControlPosComponent implements OnInit {
  private svc = inject(PmtTransaccionService);
  private fb  = inject(FormBuilder);
  all: Transaccion[] = [];
  filtered: Transaccion[] = [];
  stats: ReturnType<PmtTransaccionService['getTransaccionStats']> | null = null;

  filterForm = this.fb.group({ serie: [''], terminal: [''], mti: [''], respuesta: [''], comercio: [''] });

  ngOnInit(): void {
    this.svc.transacciones$.subscribe(list => {
      this.all = list;
      this.stats = this.svc.getTransaccionStats();
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(t =>
      (!f.serie     || (t.serie     ?? '').toLowerCase().includes(f.serie!.toLowerCase())) &&
      (!f.terminal  || (t.terminal  ?? '').toLowerCase().includes(f.terminal!.toLowerCase())) &&
      (!f.mti       || (t.mti       ?? '').includes(f.mti!)) &&
      (!f.respuesta || (t.respuesta ?? '').includes(f.respuesta!)) &&
      (!f.comercio  || (t.comercio  ?? '').toLowerCase().includes(f.comercio!.toLowerCase()))
    );
  }

  hasFilters(): boolean { return Object.values(this.filterForm.getRawValue()).some(v => !!v); }
  clearFilters(): void { this.filterForm.reset(); }

  respuestaBadge(r?: string): string {
    if (!r) return 'cf-badge-muted';
    return r === '00' ? 'cf-badge-ok' : 'cf-badge-off';
  }
  respuestaLabel(r?: string): string {
    if (!r) return '—';
    return r === '00' ? `${r} · OK` : `${r} · Error`;
  }
}
