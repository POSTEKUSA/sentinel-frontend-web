import { Component, HostListener, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Merchant } from '../../../core/models/pos-admin';
import { MerchantService } from '../../../core/services/pos-admin/merchant.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { MerchantDialogComponent } from './dialogs/merchant-dialog.component';
import { MccDialogComponent } from './dialogs/mcc-dialog.component';
import { LimitDialogComponent } from './dialogs/limit-dialog.component';
import {
  StatusTagComponent,
  STATUS_TAG_ACTIVE_INACTIVE,
  StatusTagOption,
} from '../../../shared/status-tag/status-tag.component';
import { CopyableCodeComponent } from '../../../shared/copyable-code/copyable-code.component';
import { MccCatalogPanelComponent } from './tabs/mcc-catalog-panel.component';
import { LimitCatalogPanelComponent } from './tabs/limit-catalog-panel.component';

export type MerchantHubTab = 'comercios' | 'mcc' | 'limites' | 'reporte';

@Component({
  selector: 'app-merchant-list',
  standalone: true,
  imports: [
    CopyableCodeComponent,
    StatusTagComponent,
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    EmptyStateComponent,
    MccCatalogPanelComponent,
    LimitCatalogPanelComponent,
  ],
  templateUrl: './merchant-list.component.html',
  styleUrl: './merchant-list.component.css',
})
export class MerchantListComponent implements OnInit {
  readonly statusOptions: StatusTagOption[] = STATUS_TAG_ACTIVE_INACTIVE;
  activeTab: MerchantHubTab = 'comercios';
  openMenuId: string | null = null;

  all: Merchant[] = [];
  filtered: Merchant[] = [];
  departments: string[] = [];
  municipalities: string[] = [];

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

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuId = null;
  }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  ngOnInit(): void {
    this.merchantSvc.merchants$.subscribe(merchants => {
      this.all = merchants;
      this.departments = [...new Set(merchants.map(m => m.department))].sort();
      this.refreshMunicipalities();
      this.applyFilters();
      this.mccReport = this.merchantSvc.countByMcc();
      this.mccMax = Math.max(1, ...this.mccReport.map(r => r.count));
    });
    this.filterForm.get('department')?.valueChanges.subscribe(() => {
      this.filterForm.patchValue({ municipality: '' }, { emitEvent: false });
      this.refreshMunicipalities();
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  setTab(tab: MerchantHubTab): void {
    this.activeTab = tab;
    this.closeMenus();
  }

  onPrimaryAction(): void {
    if (this.activeTab === 'comercios') {
      this.openCreateDialog();
      return;
    }
    if (this.activeTab === 'mcc') {
      this.dialog.open(MccDialogComponent, {
        width: '480px',
        maxWidth: '94vw',
        panelClass: 'cf-dialog-panel',
        data: {},
      });
      return;
    }
    if (this.activeTab === 'limites') {
      this.dialog.open(LimitDialogComponent, {
        width: '480px',
        maxWidth: '94vw',
        panelClass: 'cf-dialog-panel',
        data: {},
      });
    }
  }

  get primaryActionLabel(): string | null {
    if (this.activeTab === 'comercios') return 'Nuevo comercio';
    if (this.activeTab === 'mcc') return 'Nuevo MCC';
    if (this.activeTab === 'limites') return 'Nuevo límite';
    return null;
  }

  private refreshMunicipalities(): void {
    const dept = this.filterForm.getRawValue().department;
    const source = dept ? this.all.filter(m => m.department === dept) : this.all;
    this.municipalities = [...new Set(source.map(m => m.municipality))].sort();
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(
      m =>
        (!f.affiliateCode || m.affiliateCode.toLowerCase().includes(f.affiliateCode.toLowerCase())) &&
        (!f.tradeName || m.tradeName.toLowerCase().includes(f.tradeName.toLowerCase())) &&
        (!f.mcc || m.mcc.includes(f.mcc)) &&
        (!f.department || m.department === f.department) &&
        (!f.municipality || m.municipality === f.municipality) &&
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
    this.refreshMunicipalities();
  }

  get hasActiveFilters(): boolean {
    const f = this.filterForm.getRawValue();
    return !!(f.affiliateCode || f.tradeName || f.mcc || f.department || f.municipality || f.status);
  }

  openCreateDialog(): void {
    this.openMerchantDialog();
  }

  openEditDialog(m: Merchant): void {
    this.openMerchantDialog(m);
  }

  private openMerchantDialog(item?: Merchant): void {
    this.dialog.open(MerchantDialogComponent, {
      width: '520px',
      maxWidth: '94vw',
      panelClass: 'cf-dialog-panel',
      autoFocus: 'dialog',
      data: item ? { item } : {},
    });
  }

  activePosCount(merchantId: string): number {
    return this.merchantSvc.activePosCount(merchantId);
  }

  barWidth(count: number): number {
    return Math.round((count / this.mccMax) * 100);
  }
}
