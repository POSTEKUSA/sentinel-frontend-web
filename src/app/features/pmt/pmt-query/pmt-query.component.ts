import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { QueryRecord } from '../../../core/models/pmt/terminal.model';

@Component({
  selector: 'app-pmt-query',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pmt-query.component.html',
  styleUrl: './pmt-query.component.css',
})
export class PmtQueryComponent implements OnInit {
  private svc = inject(PmtTerminalService);
  private fb  = inject(FormBuilder);
  all: QueryRecord[] = [];
  filtered: QueryRecord[] = [];
  page = 1;
  readonly pageSize = 50;
  get paged(): QueryRecord[] { return this.filtered.slice((this.page-1)*this.pageSize, this.page*this.pageSize); }
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }

  filterForm = this.fb.group({ terminal: [''], codigo: [''], comercio: [''], ciudad: [''], zona: [''] });
  readonly cols = ['terminal','codigo','comercio','direccion','ciudad','mcc','limite','zona','fechaRegistro'] as const;

  ngOnInit(): void {
    this.svc.queryRecords$.subscribe(list => {
      this.all = list;
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => { this.page = 1; this.applyFilters(); });
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(r =>
      (!f.terminal || (r.terminal ?? '').toLowerCase().includes(f.terminal.toLowerCase())) &&
      (!f.codigo   || (r.codigo   ?? '').toLowerCase().includes(f.codigo.toLowerCase())) &&
      (!f.comercio || (r.comercio ?? '').toLowerCase().includes(f.comercio.toLowerCase())) &&
      (!f.ciudad   || (r.ciudad   ?? '').toLowerCase().includes(f.ciudad.toLowerCase())) &&
      (!f.zona     || (r.zona     ?? '').toLowerCase().includes(f.zona.toLowerCase()))
    );
  }

  hasFilters(): boolean { return Object.values(this.filterForm.getRawValue()).some(v => !!v); }
  clearFilters(): void { this.filterForm.reset(); }
  delete(id: number): void { if (confirm('¿Eliminar registro?')) this.svc.deleteQueryRecord(id); }
  colLabel(col: string): string { const m: Record<string,string> = { terminal:'Terminal', codigo:'Código', comercio:'Comercio', direccion:'Dirección', ciudad:'Ciudad', mcc:'MCC', limite:'Límite', zona:'Zona', fechaRegistro:'Fecha Registro' }; return m[col] ?? col; }
  colValue(r: QueryRecord, col: string): string { return (r as any)[col] ?? '—'; }
}
