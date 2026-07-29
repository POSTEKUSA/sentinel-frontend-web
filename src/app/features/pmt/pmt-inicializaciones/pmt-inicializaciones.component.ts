import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { Initialization } from '../../../core/models/pmt/terminal.model';

@Component({
  selector: 'app-pmt-inicializaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pmt-inicializaciones.component.html',
  styleUrl: './pmt-inicializaciones.component.css',
})
export class PmtInicializacionesComponent implements OnInit {
  private svc = inject(PmtTerminalService);
  private fb  = inject(FormBuilder);
  all: Initialization[] = [];
  filtered: Initialization[] = [];

  showForm = false;
  formData = this.fb.group({ serie: [''], terminal: [''], version: [''], apn: [''], resultado: ['OK'], createdBy: [''] });
  formError = '';

  filterForm = this.fb.group({ q: [''], resultado: [''] });

  ngOnInit(): void {
    this.svc.initializations$.subscribe(list => {
      this.all = list;
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(i => {
      const q = (f.q ?? '').toLowerCase().trim();
      if (q && ![i.serie, i.terminal, i.version].some(v => (v ?? '').toLowerCase().includes(q))) return false;
      if (f.resultado && !(i.resultado ?? '').toUpperCase().startsWith(f.resultado.toUpperCase())) return false;
      return true;
    });
  }

  save(): void {
    const v = this.formData.getRawValue();
    if (!v.serie?.trim()) { this.formError = 'Serie requerida.'; return; }
    const now = new Date().toISOString();
    const current = this.svc.initializations;
    const newItem: Initialization = { id: current.length + 1, serie: v.serie!, terminal: v.terminal ?? undefined, version: v.version ?? undefined, apn: v.apn ?? undefined, resultado: v.resultado ?? 'OK', createdBy: v.createdBy ?? 'admin', createdAt: now };
    (this.svc as any).initSubject.next([newItem, ...current]);
    this.showForm = false;
    this.formData.reset({ resultado: 'OK' });
  }
}
