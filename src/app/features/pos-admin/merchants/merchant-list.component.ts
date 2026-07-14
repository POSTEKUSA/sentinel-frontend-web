import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { Merchant, MERCHANT_STATUS_LABELS } from '../../../core/models/pos-admin';
import { MerchantService } from '../../../core/services/pos-admin/merchant.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { MerchantDialogComponent } from './dialogs/merchant-dialog.component';

@Component({
  selector: 'app-merchant-list',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatTabsModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatTableModule, MatTooltipModule, EmptyStateComponent,
  ],
  templateUrl: './merchant-list.component.html',
  styleUrl: './merchant-list.component.css',
})
export class MerchantListComponent implements OnInit {
  statusLabels: Record<string, string> = MERCHANT_STATUS_LABELS;

  all: Merchant[] = [];
  filtered: Merchant[] = [];
  columns = ['affiliateCode', 'tradeName', 'mcc', 'location', 'status', 'createdAt', 'actions'];

  mccReport: { mcc: string; description: string; count: number }[] = [];
  mccMax = 1;

  private fb = inject(FormBuilder);

  filterForm = this.fb.group({
    affiliateCode: [''],
    tradeName: [''],
    mcc: [''],
    department: [''],
    municipality: [''],
    status: [''],
  });

  constructor(
    private merchantSvc: MerchantService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.merchantSvc.merchants$.subscribe(merchants => {
      this.all = merchants;
      this.applyFilters();
      this.mccReport = this.merchantSvc.countByMcc();
      this.mccMax = Math.max(1, ...this.mccReport.map(r => r.count));
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(m =>
      (!f.affiliateCode || m.affiliateCode.toLowerCase().includes(f.affiliateCode.toLowerCase())) &&
      (!f.tradeName || m.tradeName.toLowerCase().includes(f.tradeName.toLowerCase())) &&
      (!f.mcc || m.mcc.includes(f.mcc)) &&
      (!f.department || m.department.toLowerCase().includes(f.department.toLowerCase())) &&
      (!f.municipality || m.municipality.toLowerCase().includes(f.municipality.toLowerCase())) &&
      (!f.status || m.status === f.status),
    );
  }

  clearFilters(): void {
    this.filterForm.reset({ affiliateCode: '', tradeName: '', mcc: '', department: '', municipality: '', status: '' });
  }

  openCreateDialog(): void {
    this.dialog.open(MerchantDialogComponent, { width: '560px', data: {} });
  }

  activePosCount(merchantId: string): number {
    return this.merchantSvc.activePosCount(merchantId);
  }

  statusChipClass(status: string): string {
    switch (status) {
      case 'active': return 'chip-green';
      case 'inactive': return 'chip-grey';
      case 'suspended': return 'chip-red';
      default: return 'chip-grey';
    }
  }

  barWidth(count: number): number {
    return Math.round((count / this.mccMax) * 100);
  }
}
