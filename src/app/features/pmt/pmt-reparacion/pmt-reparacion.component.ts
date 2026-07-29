import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { Terminal, TERMINAL_ESTADO_LABELS, TERMINAL_ESTADO_BADGE } from '../../../core/models/pmt/terminal.model';

@Component({
  selector: 'app-pmt-reparacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pmt-reparacion.component.html',
  styleUrl: './pmt-reparacion.component.css',
})
export class PmtReparacionComponent implements OnInit {
  private svc = inject(PmtTerminalService);
  private fb  = inject(FormBuilder);
  all: Terminal[] = [];
  filtered: Terminal[] = [];
  readonly estadoLabels = TERMINAL_ESTADO_LABELS;
  readonly estadoBadge  = TERMINAL_ESTADO_BADGE;

  selected: Terminal | null = null;
  resolution: 'instalado' | 'garantia' | 'irreparable' | 'obsoleto' = 'instalado';
  comment = '';
  showResolve = false;

  filterForm = this.fb.group({ q: [''] });

  ngOnInit(): void {
    this.svc.terminals$.subscribe(ts => {
      this.all = ts.filter(t => t.estado === 'en_reparacion');
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const q = (this.filterForm.value.q ?? '').toLowerCase().trim();
    this.filtered = q ? this.all.filter(t => [t.serie, t.modelo].some(v => (v ?? '').toLowerCase().includes(q))) : [...this.all];
  }

  openResolve(t: Terminal): void {
    this.selected = t;
    this.resolution = 'instalado';
    this.comment = '';
    this.showResolve = true;
  }

  resolve(): void {
    if (!this.selected) return;
    this.svc.changeEstado(this.selected.id, this.resolution, this.comment || 'Resolución de reparación');
    this.selected = null;
    this.showResolve = false;
  }
}
