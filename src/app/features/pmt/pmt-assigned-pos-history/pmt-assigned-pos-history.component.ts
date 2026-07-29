import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { AssignedPosHistory } from '../../../core/models/pmt/terminal.model';

@Component({
  selector: 'app-pmt-assigned-pos-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pmt-assigned-pos-history.component.html',
  styleUrl: './pmt-assigned-pos-history.component.css',
})
export class PmtAssignedPosHistoryComponent implements OnInit {
  private svc = inject(PmtTerminalService);
  private fb  = inject(FormBuilder);
  all: AssignedPosHistory[] = [];
  filtered: AssignedPosHistory[] = [];

  filterForm = this.fb.group({ q: [''], role: [''] });

  ngOnInit(): void {
    this.svc.assignedHistory$.subscribe(list => {
      this.all = [...list].reverse();
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(h => {
      const q = (f.q ?? '').toLowerCase().trim();
      if (q && ![h.serie, h.modelo, h.assignedTo].some(v => (v ?? '').toLowerCase().includes(q))) return false;
      if (f.role && h.role !== f.role) return false;
      return true;
    });
  }
}
