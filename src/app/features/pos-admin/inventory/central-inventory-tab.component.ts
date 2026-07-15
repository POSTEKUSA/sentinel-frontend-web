import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PosUnit, POS_LOCATION_LABELS, POS_UNIT_STATUS_LABELS } from '../../../core/models/pos-admin';
import { PosInventoryService } from '../../../core/services/pos-admin/pos-inventory.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-central-inventory-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EmptyStateComponent],
  templateUrl: './central-inventory-tab.component.html',
  styleUrl: './central-inventory-tab.component.css',
})
export class CentralInventoryTabComponent implements OnInit {
  statusLabels: Record<string, string> = POS_UNIT_STATUS_LABELS;
  locationLabels: Record<string, string> = POS_LOCATION_LABELS;
  statusKeys = Object.keys(POS_UNIT_STATUS_LABELS);
  locationKeys = Object.keys(POS_LOCATION_LABELS);

  all: PosUnit[] = [];
  filtered: PosUnit[] = [];

  private fb = inject(FormBuilder);

  filterForm = this.fb.group({
    brand: [''],
    model: [''],
    posType: [''],
    status: [''],
    locationType: [''],
    purchaseOrderNumber: [''],
    serialNumber: [''],
  });

  constructor(private inventorySvc: PosInventoryService) {}

  ngOnInit(): void {
    this.inventorySvc.units$.subscribe(units => {
      this.all = units;
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(
      u =>
        (!f.serialNumber || u.serialNumber.toLowerCase().includes(f.serialNumber.toLowerCase())) &&
        (!f.brand || u.brand.toLowerCase().includes(f.brand.toLowerCase())) &&
        (!f.model || u.model.toLowerCase().includes(f.model.toLowerCase())) &&
        (!f.posType || u.posType.toLowerCase().includes(f.posType.toLowerCase())) &&
        (!f.status || u.status === f.status) &&
        (!f.locationType || u.locationType === f.locationType) &&
        (!f.purchaseOrderNumber ||
          (u.purchaseOrderNumber ?? '').toLowerCase().includes(f.purchaseOrderNumber.toLowerCase())),
    );
  }

  clearFilters(): void {
    this.filterForm.reset({
      brand: '',
      model: '',
      posType: '',
      status: '',
      locationType: '',
      purchaseOrderNumber: '',
      serialNumber: '',
    });
  }

  get hasActiveFilters(): boolean {
    const f = this.filterForm.getRawValue();
    return !!(
      f.serialNumber ||
      f.brand ||
      f.model ||
      f.posType ||
      f.status ||
      f.locationType ||
      f.purchaseOrderNumber
    );
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'in_stock':
        return 'cf-badge-info';
      case 'installed':
        return 'cf-badge-ok';
      case 'with_technician':
      case 'with_executive':
        return 'cf-badge-info';
      case 'in_transit':
        return 'cf-badge-info';
      case 'in_workshop':
        return 'cf-badge-warn';
      case 'decommissioned':
      case 'destroyed':
        return 'cf-badge-off';
      default:
        return 'cf-badge-muted';
    }
  }
}
