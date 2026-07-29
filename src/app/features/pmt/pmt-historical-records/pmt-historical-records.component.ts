import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { HistoricalRecord } from '../../../core/models/pmt/terminal.model';

@Component({
  selector: 'app-pmt-historical-records',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pmt-historical-records.component.html',
  styleUrl: './pmt-historical-records.component.css',
})
export class PmtHistoricalRecordsComponent implements OnInit {
  private svc = inject(PmtTerminalService);
  private fb  = inject(FormBuilder);
  all: HistoricalRecord[] = [];
  filtered: HistoricalRecord[] = [];

  page = 1;
  readonly pageSize = 50;
  get paged(): HistoricalRecord[] { return this.filtered.slice((this.page-1)*this.pageSize, this.page*this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }

  filterForm = this.fb.group({ q: [''], accion: [''] });
  acciones = ['instalacion', 'retiro', 'reparacion', 'garantia', 'sustitución'];

  ngOnInit(): void {
    this.svc.historical$.subscribe(list => {
      this.all = [...list].reverse();
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => { this.page = 1; this.applyFilters(); });
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(r => {
      const q = (f.q ?? '').toLowerCase().trim();
      if (q && ![r.serie, r.comercio, r.ciudad, r.zona].some(v => (v ?? '').toLowerCase().includes(q))) return false;
      if (f.accion && r.accion !== f.accion) return false;
      return true;
    });
  }
}
