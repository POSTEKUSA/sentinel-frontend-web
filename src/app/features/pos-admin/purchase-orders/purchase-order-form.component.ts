import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import { PurchaseOrder, PurchaseOrderStatus, PURCHASE_ORDER_STATUS_LABELS } from '../../../core/models/pos-admin';
import { PurchaseOrderService } from '../../../core/services/pos-admin/purchase-order.service';
import { PosCatalogService } from '../../../core/services/pos-admin/pos-catalog.service';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule,
    MatNativeDateModule, MatTableModule, MatTooltipModule, MatChipsModule,
  ],
  templateUrl: './purchase-order-form.component.html',
  styleUrl: './purchase-order-form.component.css',
})
export class PurchaseOrderFormComponent implements OnInit {
  isNew = true;
  order?: PurchaseOrder;
  statusLabels: Record<string, string> = PURCHASE_ORDER_STATUS_LABELS;

  private fb = inject(FormBuilder);
  private catalogSvc = inject(PosCatalogService);

  suppliers: { id: string; name: string }[] = [];
  brandModelOptions = this.catalogSvc.brandModelOptions;

  form = this.fb.group({
    supplierId: ['', Validators.required],
    supplierName: [''],
    orderDate: [new Date(), Validators.required],
    estimatedReceiptDate: [new Date(), Validators.required],
    deliveryLocation: ['', Validators.required],
    lines: this.fb.array([this.buildLineGroup()]),
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private poSvc: PurchaseOrderService,
  ) {}

  get lines(): FormArray {
    return this.form.get('lines') as FormArray;
  }

  ngOnInit(): void {
    this.catalogSvc.suppliers$.subscribe(suppliers => {
      this.suppliers = suppliers;
    });

    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = !id || id === 'new';

    if (!this.isNew && id) {
      this.order = this.poSvc.getById(id);
      if (this.order) {
        this.form.patchValue({
          supplierId: this.order.supplierId,
          supplierName: this.order.supplierName,
          orderDate: new Date(this.order.orderDate),
          estimatedReceiptDate: new Date(this.order.estimatedReceiptDate),
          deliveryLocation: this.order.deliveryLocation,
        });
        this.form.get('supplierId')?.disable();
        this.lines.clear();
        this.order.lines.forEach(line => {
          this.lines.push(this.buildLineGroup(line));
          this.lines.at(this.lines.length - 1).disable();
        });
      }
    }
  }

  private buildLineGroup(line?: PurchaseOrder['lines'][number]) {
    return this.fb.group({
      itemType: [line?.itemType ?? 'pos', Validators.required],
      brand: [line?.brand ?? '', Validators.required],
      model: [line?.model ?? '', Validators.required],
      requestedQty: [line?.requestedQty ?? 1, [Validators.required, Validators.min(1)]],
      receivedQty: [line?.receivedQty ?? 0],
      unitPrice: [line?.unitPrice ?? null],
    });
  }

  addLine(): void {
    this.lines.push(this.buildLineGroup());
  }

  removeLine(index: number): void {
    if (this.lines.length > 1) this.lines.removeAt(index);
  }

  onSupplierChange(supplierId: string, suppliers: { id: string; name: string }[]): void {
    const supplier = suppliers.find(s => s.id === supplierId);
    this.form.patchValue({ supplierName: supplier?.name ?? '' });
  }

  save(): void {
    if (this.form.invalid || !this.isNew) return;
    const value = this.form.getRawValue();

    const created = this.poSvc.create({
      orderNumber: this.poSvc.nextOrderNumber(),
      supplierId: value.supplierId!,
      supplierName: value.supplierName!,
      orderDate: new Date(value.orderDate!).toISOString(),
      estimatedReceiptDate: new Date(value.estimatedReceiptDate!).toISOString(),
      deliveryLocation: value.deliveryLocation!,
      lines: value.lines!.map(l => ({
        id: '',
        itemType: l.itemType as 'pos' | 'accessory',
        brand: l.brand!,
        model: l.model!,
        requestedQty: l.requestedQty!,
        receivedQty: 0,
        unitPrice: l.unitPrice ?? undefined,
      })),
    });

    this.router.navigate(['/pos-admin/purchase-orders', created.id]);
  }

  changeStatus(status: PurchaseOrderStatus): void {
    if (!this.order) return;
    this.poSvc.updateStatus(this.order.id, status);
    this.order = this.poSvc.getById(this.order.id);
  }

  canTransitionTo(status: PurchaseOrderStatus): boolean {
    if (!this.order) return false;
    const current = this.order.status;
    if (current === 'cancelled' || current === 'closed') return false;
    if (status === 'in_transit') return current === 'created';
    if (status === 'cancelled') return current === 'created' || current === 'in_transit';
    if (status === 'closed') return current === 'received';
    return false;
  }

  goToReceiving(): void {
    if (!this.order) return;
    this.router.navigate(['/pos-admin/receiving'], { queryParams: { poId: this.order.id } });
  }
}
