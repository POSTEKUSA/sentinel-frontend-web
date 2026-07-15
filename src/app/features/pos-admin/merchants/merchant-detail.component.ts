import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { Installation, Merchant, MERCHANT_STATUS_LABELS, PosUnit, POS_UNIT_STATUS_LABELS } from '../../../core/models/pos-admin';
import { MerchantService } from '../../../core/services/pos-admin/merchant.service';
import { PosInventoryService } from '../../../core/services/pos-admin/pos-inventory.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { InstallPosDialogComponent } from './dialogs/install-pos-dialog.component';

@Component({
  selector: 'app-merchant-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, EmptyStateComponent],
  templateUrl: './merchant-detail.component.html',
  styleUrl: './merchant-detail.component.css',
})
export class MerchantDetailComponent implements OnInit {
  statusLabels: Record<string, string> = MERCHANT_STATUS_LABELS;
  posStatusLabels: Record<string, string> = POS_UNIT_STATUS_LABELS;

  merchant?: Merchant;
  activeUnits: PosUnit[] = [];
  historicalUnits: PosUnit[] = [];
  installations: Installation[] = [];

  constructor(
    private route: ActivatedRoute,
    private merchantSvc: MerchantService,
    private inventorySvc: PosInventoryService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.load(id);
  }

  private load(id: string): void {
    this.merchant = this.merchantSvc.getById(id);
    this.installations = this.merchantSvc.installationsForMerchant(id);

    const relatedUnits = this.inventorySvc.units.filter(
      u => u.merchantId === id || this.installations.some(i => i.posUnitId === u.id),
    );
    this.activeUnits = relatedUnits.filter(u => u.status === 'installed');
    this.historicalUnits = relatedUnits;
  }

  openInstallDialog(): void {
    if (!this.merchant) return;
    const availableUnits = this.inventorySvc.units.filter(
      u => u.status === 'in_stock' || u.status === 'with_technician' || u.status === 'with_executive',
    );
    this.dialog
      .open(InstallPosDialogComponent, {
        width: '560px',
        maxWidth: '94vw',
        panelClass: 'cf-dialog-panel',
        data: { merchant: this.merchant, availableUnits },
      })
      .afterClosed()
      .subscribe(() => this.load(this.merchant!.id));
  }
}
