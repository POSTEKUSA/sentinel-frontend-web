import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import {
  AccessoryCatalogItem,
  PosCatalogItem,
  PurchaseOrder,
  PurchaseOrderStatus,
  PURCHASE_ORDER_STATUS_LABELS,
  Supplier,
} from '../../../core/models/pos-admin';
import { PurchaseOrderService } from '../../../core/services/pos-admin/purchase-order.service';
import { PosCatalogService } from '../../../core/services/pos-admin/pos-catalog.service';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './purchase-order-form.component.html',
  styleUrl: './purchase-order-form.component.css',
})
export class PurchaseOrderFormComponent implements OnInit {
  isNew = true;
  order?: PurchaseOrder;
  statusLabels: Record<string, string> = PURCHASE_ORDER_STATUS_LABELS;

  private fb = inject(FormBuilder);
  private catalogSvc = inject(PosCatalogService);

  suppliers: Supplier[] = [];
  catalogItems: PosCatalogItem[] = [];
  accessories: AccessoryCatalogItem[] = [];
  selectedSupplier?: Supplier;

  form = this.fb.group({
    supplierId: ['', Validators.required],
    supplierName: [''],
    orderDate: [this.toDateInput(new Date()), Validators.required],
    estimatedReceiptDate: [this.toDateInput(new Date()), Validators.required],
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

  private toDateInput(d: Date | string): string {
    const date = typeof d === 'string' ? new Date(d) : d;
    return date.toISOString().slice(0, 10);
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.isNew = !id || id === 'new';

    this.catalogSvc.suppliers$.subscribe(suppliers => {
      this.suppliers = this.isNew ? suppliers.filter(s => s.status === 'active') : suppliers;
      if (this.order) {
        this.selectedSupplier = this.suppliers.find(s => s.id === this.order!.supplierId);
      }
    });
    this.catalogSvc.catalog$.subscribe(items => {
      this.catalogItems = this.isNew ? items.filter(i => i.status === 'active') : items;
    });
    this.catalogSvc.accessories$.subscribe(items => {
      this.accessories = this.isNew ? items.filter(i => i.status === 'active') : items;
    });

    if (!this.isNew && id) {
      this.order = this.poSvc.getById(id);
      if (this.order) {
        this.selectedSupplier = this.suppliers.find(s => s.id === this.order!.supplierId);
        this.form.patchValue({
          supplierId: this.order.supplierId,
          supplierName: this.order.supplierName,
          orderDate: this.toDateInput(this.order.orderDate),
          estimatedReceiptDate: this.toDateInput(this.order.estimatedReceiptDate),
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

  onSupplierChange(supplierId: string): void {
    this.selectedSupplier = this.suppliers.find(s => s.id === supplierId);
    this.form.patchValue({ supplierName: this.selectedSupplier?.name ?? '' });
    this.lines.controls.forEach(line => {
      if (line.get('itemType')?.value === 'pos') {
        line.patchValue({ brand: '', model: '' });
      }
    });
  }

  onItemTypeChange(index: number): void {
    this.lines.at(index).patchValue({ brand: '', model: '' });
  }

  posBrands(): string[] {
    const items = this.posItemsForSupplier();
    return [...new Set(items.map(i => i.brand))].sort();
  }

  posModels(brand: string): string[] {
    if (!brand) return [];
    return this.posItemsForSupplier()
      .filter(i => i.brand === brand)
      .map(i => i.model);
  }

  private posItemsForSupplier(): PosCatalogItem[] {
    if (!this.selectedSupplier) return this.catalogItems;
    const brands = new Set(this.selectedSupplier.suppliedBrands.map(b => b.toLowerCase()));
    return this.catalogItems.filter(i => brands.has(i.brand.toLowerCase()));
  }

  onPosBrandChange(index: number): void {
    this.lines.at(index).patchValue({ model: '' });
  }

  onAccessoryChange(index: number, accessoryId: string): void {
    const acc = this.accessories.find(a => a.id === accessoryId);
    if (!acc) return;
    const brand =
      acc.compatibleBrandModel === 'Universal' ? 'Universal' : acc.compatibleBrandModel.split(' ')[0];
    this.lines.at(index).patchValue({ brand, model: acc.type });
  }

  accessoryIdForLine(brand: string, model: string): string {
    return this.accessories.find(a => a.type === model)?.id ?? '';
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
