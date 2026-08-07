import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { SimCard, SimCardEstado, SIM_CARD_ESTADO_BADGE, SIM_CARD_ESTADO_LABELS } from '../../../core/models/pmt/sim-card.model';
import { PmtSimCardService } from '../../../core/services/pmt/pmt-sim-card.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { CopyableCodeComponent } from '../../../shared/copyable-code/copyable-code.component';
import { UserNamePipe } from '../../../shared/pipes/user-name.pipe';

@Component({
  selector: 'app-sim-inventory-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EmptyStateComponent, CopyableCodeComponent, UserNamePipe],
  templateUrl: './sim-inventory-tab.component.html',
  styleUrl: './sim-inventory-tab.component.css',
})
export class SimInventoryTabComponent implements OnInit {
  estadoLabels = SIM_CARD_ESTADO_LABELS;
  estadoBadge = SIM_CARD_ESTADO_BADGE;
  estadoKeys = Object.keys(SIM_CARD_ESTADO_LABELS) as SimCardEstado[];

  all: SimCard[] = [];
  filtered: SimCard[] = [];
  companias: string[] = [];

  private fb = inject(FormBuilder);

  filterForm = this.fb.group({
    q: [''],
    estado: [''],
    compania: [''],
  });

  constructor(private simSvc: PmtSimCardService) {}

  ngOnInit(): void {
    this.simSvc.simCards$.subscribe(list => {
      this.all = list;
      this.companias = [...new Set(list.map(s => s.compania))].sort();
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    const q = (f.q ?? '').toLowerCase().trim();
    this.filtered = this.all.filter(s => {
      if (f.estado && s.estado !== f.estado) return false;
      if (f.compania && s.compania !== f.compania) return false;
      if (!q) return true;
      return (
        s.iccid.toLowerCase().includes(q) ||
        s.inventoryCode.toLowerCase().includes(q) ||
        (s.numero ?? '').toLowerCase().includes(q) ||
        (s.terminalSerie ?? '').toLowerCase().includes(q) ||
        (s.posInventoryCode ?? '').toLowerCase().includes(q)
      );
    });
  }

  clearFilters(): void {
    this.filterForm.reset({ q: '', estado: '', compania: '' });
  }

  get hasActiveFilters(): boolean {
    const f = this.filterForm.getRawValue();
    return !!(f.q || f.estado || f.compania);
  }
}
