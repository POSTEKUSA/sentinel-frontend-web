import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { Terminal, TerminalEstado, TERMINAL_ESTADO_LABELS } from '../../../core/models/pmt/terminal.model';

@Component({
  selector: 'app-pmt-asignados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pmt-asignados.component.html',
  styleUrl: './pmt-asignados.component.css',
})
export class PmtAsignadosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PmtTerminalService);

  all: Terminal[] = [];
  filtered: Terminal[] = [];
  readonly estadoLabels = TERMINAL_ESTADO_LABELS;
  activeTab: 'supervisor' | 'tecnico' = 'supervisor';

  filterForm = this.fb.group({ q: [''], assignedTo: [''] });

  get tabEstado(): TerminalEstado {
    return this.activeTab === 'supervisor' ? 'asignado_supervisor' : 'asignado_tecnico';
  }

  ngOnInit(): void {
    this.svc.terminals$.subscribe(ts => {
      this.all = ts.filter(t => t.estado === 'asignado_supervisor' || t.estado === 'asignado_tecnico');
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  setTab(tab: 'supervisor' | 'tecnico'): void {
    this.activeTab = tab;
    this.applyFilters();
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(t => {
      if (t.estado !== this.tabEstado) return false;
      const q = (f.q ?? '').toLowerCase().trim();
      if (q && ![t.serie, t.modelo, t.nombre, t.assignedTo].some(v => (v ?? '').toLowerCase().includes(q))) return false;
      if (f.assignedTo && !(t.assignedTo ?? '').toLowerCase().includes(f.assignedTo.toLowerCase())) return false;
      return true;
    });
  }

  get supervisorCount(): number { return this.all.filter(t => t.estado === 'asignado_supervisor').length; }
  get tecnicoCount(): number    { return this.all.filter(t => t.estado === 'asignado_tecnico').length; }

  reasignar(t: Terminal, newUser: string): void {
    if (!newUser.trim()) return;
    this.svc.changeEstado(t.id, t.estado, `Reasignado de ${t.assignedTo} a ${newUser}`, 'admin', { assignedTo: newUser, assignedAt: new Date().toISOString() });
  }
}
