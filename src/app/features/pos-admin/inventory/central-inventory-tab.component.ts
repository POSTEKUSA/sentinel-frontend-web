import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PosUnit, POS_LOCATION_LABELS, POS_UNIT_STATUS_LABELS } from '../../../core/models/pos-admin';
import { PosInventoryService } from '../../../core/services/pos-admin/pos-inventory.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-central-inventory-tab',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule,
    MatTooltipModule, EmptyStateComponent,
  ],
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

  columns = ['serialNumber', 'brand', 'model', 'posType', 'status', 'locationLabel', 'receivedAt', 'purchaseOrderNumber'];

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
    this.filtered = this.all.filter(u => {
      return (
        (!f.brand || u.brand.toLowerCase().includes(f.brand.toLowerCase())) &&
        (!f.model || u.model.toLowerCase().includes(f.model.toLowerCase())) &&
        (!f.posType || u.posType.toLowerCase().includes(f.posType.toLowerCase())) &&
        (!f.status || u.status === f.status) &&
        (!f.locationType || u.locationType === f.locationType) &&
        (!f.purchaseOrderNumber || (u.purchaseOrderNumber ?? '').toLowerCase().includes(f.purchaseOrderNumber.toLowerCase())) &&
        (!f.serialNumber || u.serialNumber.toLowerCase().includes(f.serialNumber.toLowerCase()))
      );
    });
  }

  clearFilters(): void {
    this.filterForm.reset({ brand: '', model: '', posType: '', status: '', locationType: '', purchaseOrderNumber: '', serialNumber: '' });
  }

  statusChipClass(status: string): string {
    switch (status) {
      case 'in_stock': return 'chip-blue';
      case 'installed': return 'chip-green';
      case 'with_technician': case 'with_executive': return 'chip-purple';
      case 'in_transit': return 'chip-teal';
      case 'in_workshop': return 'chip-orange';
      case 'decommissioned': case 'destroyed': return 'chip-red';
      default: return 'chip-grey';
    }
  }
}
