import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Merchant, MERCHANT_STATUS_LABELS } from '../../../core/models/pos-admin';
import { MerchantService } from '../../../core/services/pos-admin/merchant.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { MerchantDialogComponent } from './dialogs/merchant-dialog.component';

@Component({
  selector: 'app-merchant-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EmptyStateComponent],
  templateUrl: './merchant-list.component.html',
  styleUrl: './merchant-list.component.css',
})
export class MerchantListComponent implements OnInit {
  statusLabels: Record<string, string> = MERCHANT_STATUS_LABELS;
  activeTab: 'comercios' | 'mcc' = 'comercios';

  all: Merchant[] = [];
  filtered: Merchant[] = [];

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
    this.filtered = this.all.filter(
      m =>
        (!f.affiliateCode || m.affiliateCode.toLowerCase().includes(f.affiliateCode.toLowerCase())) &&
        (!f.tradeName || m.tradeName.toLowerCase().includes(f.tradeName.toLowerCase())) &&
        (!f.mcc || m.mcc.includes(f.mcc)) &&
        (!f.department || m.department.toLowerCase().includes(f.department.toLowerCase())) &&
        (!f.municipality || m.municipality.toLowerCase().includes(f.municipality.toLowerCase())) &&
        (!f.status || m.status === f.status),
    );
  }

  clearFilters(): void {
    this.filterForm.reset({
      affiliateCode: '',
      tradeName: '',
      mcc: '',
      department: '',
      municipality: '',
      status: '',
    });
  }

  get hasActiveFilters(): boolean {
    const f = this.filterForm.getRawValue();
    return !!(f.affiliateCode || f.tradeName || f.mcc || f.department || f.municipality || f.status);
  }

  openCreateDialog(): void {
    this.dialog.open(MerchantDialogComponent, {
      width: '520px',
      maxWidth: '94vw',
      panelClass: 'cf-dialog-panel',
      autoFocus: 'dialog',
      data: {},
    });
  }

  activePosCount(merchantId: string): number {
    return this.merchantSvc.activePosCount(merchantId);
  }

  barWidth(count: number): number {
    return Math.round((count / this.mccMax) * 100);
  }
}
