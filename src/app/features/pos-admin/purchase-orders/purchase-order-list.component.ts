import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { PurchaseOrder, PURCHASE_ORDER_STATUS_LABELS } from '../../../core/models/pos-admin';
import { PurchaseOrderService } from '../../../core/services/pos-admin/purchase-order.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EmptyStateComponent],
  templateUrl: './purchase-order-list.component.html',
  styleUrl: './purchase-order-list.component.css',
})
export class PurchaseOrderListComponent implements OnInit {
  statusLabels: Record<string, string> = PURCHASE_ORDER_STATUS_LABELS;
  statusKeys = Object.keys(PURCHASE_ORDER_STATUS_LABELS) as (keyof typeof PURCHASE_ORDER_STATUS_LABELS)[];

  all: PurchaseOrder[] = [];
  filtered: PurchaseOrder[] = [];

  private fb = inject(FormBuilder);

  filterForm = this.fb.group({
    orderNumber: [''],
    supplierName: [''],
    status: [''],
    brand: [''],
    model: [''],
    deliveryLocation: [''],
  });

  constructor(private poSvc: PurchaseOrderService) {}

  ngOnInit(): void {
    this.poSvc.orders$.subscribe(orders => {
      this.all = orders;
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(po => {
      const matchesOrderNumber = !f.orderNumber || po.orderNumber.toLowerCase().includes(f.orderNumber.toLowerCase());
      const matchesSupplier = !f.supplierName || po.supplierName.toLowerCase().includes(f.supplierName.toLowerCase());
      const matchesStatus = !f.status || po.status === f.status;
      const matchesBrand = !f.brand || po.lines.some(l => l.brand.toLowerCase().includes(f.brand!.toLowerCase()));
      const matchesModel = !f.model || po.lines.some(l => l.model.toLowerCase().includes(f.model!.toLowerCase()));
      const matchesLocation =
        !f.deliveryLocation || po.deliveryLocation.toLowerCase().includes(f.deliveryLocation.toLowerCase());
      return matchesOrderNumber && matchesSupplier && matchesStatus && matchesBrand && matchesModel && matchesLocation;
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      orderNumber: '',
      supplierName: '',
      status: '',
      brand: '',
      model: '',
      deliveryLocation: '',
    });
  }

  get hasActiveFilters(): boolean {
    const f = this.filterForm.getRawValue();
    return !!(f.orderNumber || f.supplierName || f.status || f.brand || f.model || f.deliveryLocation);
  }

  totalRequested(po: PurchaseOrder): number {
    return po.lines.reduce((sum, l) => sum + l.requestedQty, 0);
  }

  totalReceived(po: PurchaseOrder): number {
    return po.lines.reduce((sum, l) => sum + l.receivedQty, 0);
  }

  progressPercent(po: PurchaseOrder): number {
    const requested = this.totalRequested(po);
    return requested === 0 ? 0 : Math.round((this.totalReceived(po) / requested) * 100);
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'created':
        return 'cf-badge-muted';
      case 'in_transit':
        return 'cf-badge-info';
      case 'partially_received':
        return 'cf-badge-warn';
      case 'received':
        return 'cf-badge-ok';
      case 'cancelled':
        return 'cf-badge-off';
      case 'closed':
        return 'cf-badge-info';
      default:
        return 'cf-badge-muted';
    }
  }
}
