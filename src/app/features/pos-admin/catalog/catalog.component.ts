import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest } from 'rxjs';

import {
  AccessoryCatalogItem, ACCESSORY_CATEGORY_LABELS,
  CATALOG_STATUS_LABELS, PosCatalogItem, Supplier,
} from '../../../core/models/pos-admin';
import { PosCatalogService } from '../../../core/services/pos-admin/pos-catalog.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BrandModelDialogComponent } from './dialogs/brand-model-dialog.component';
import { SupplierDialogComponent } from './dialogs/supplier-dialog.component';
import { AccessoryDialogComponent } from './dialogs/accessory-dialog.component';

@Component({
  selector: 'app-pos-catalog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatTabsModule, MatTableModule, MatButtonModule,
    MatIconModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatTooltipModule, EmptyStateComponent,
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent implements OnInit {
  statusLabels: Record<string, string> = CATALOG_STATUS_LABELS;
  categoryLabels: Record<string, string> = ACCESSORY_CATEGORY_LABELS;

  brandModelSearch = new FormControl('');
  supplierSearch = new FormControl('');
  accessorySearch = new FormControl('');

  allCatalog: PosCatalogItem[] = [];
  allSuppliers: Supplier[] = [];
  allAccessories: AccessoryCatalogItem[] = [];

  filteredCatalog: PosCatalogItem[] = [];
  filteredSuppliers: Supplier[] = [];
  filteredAccessories: AccessoryCatalogItem[] = [];

  catalogColumns = ['brand', 'model', 'posType', 'status', 'createdAt', 'actions'];
  supplierColumns = ['name', 'country', 'contact', 'brands', 'status', 'actions'];
  accessoryColumns = ['type', 'category', 'compatibleBrandModel', 'unitOfMeasure', 'minStock', 'status', 'actions'];

  constructor(
    private catalogSvc: PosCatalogService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    combineLatest([this.catalogSvc.catalog$]).subscribe(([items]) => {
      this.allCatalog = items;
      this.applyBrandModelFilter();
    });
    combineLatest([this.catalogSvc.suppliers$]).subscribe(([items]) => {
      this.allSuppliers = items;
      this.applySupplierFilter();
    });
    combineLatest([this.catalogSvc.accessories$]).subscribe(([items]) => {
      this.allAccessories = items;
      this.applyAccessoryFilter();
    });

    this.brandModelSearch.valueChanges.subscribe(() => this.applyBrandModelFilter());
    this.supplierSearch.valueChanges.subscribe(() => this.applySupplierFilter());
    this.accessorySearch.valueChanges.subscribe(() => this.applyAccessoryFilter());
  }

  private applyBrandModelFilter(): void {
    const q = (this.brandModelSearch.value ?? '').toLowerCase().trim();
    this.filteredCatalog = this.allCatalog.filter(
      c => !q || c.brand.toLowerCase().includes(q) || c.model.toLowerCase().includes(q) || c.posType.toLowerCase().includes(q),
    );
  }

  private applySupplierFilter(): void {
    const q = (this.supplierSearch.value ?? '').toLowerCase().trim();
    this.filteredSuppliers = this.allSuppliers.filter(
      s => !q || s.name.toLowerCase().includes(q) || s.suppliedBrands.some(b => b.toLowerCase().includes(q)) || s.suppliedModels.some(m => m.toLowerCase().includes(q)),
    );
  }

  private applyAccessoryFilter(): void {
    const q = (this.accessorySearch.value ?? '').toLowerCase().trim();
    this.filteredAccessories = this.allAccessories.filter(
      a => !q || a.type.toLowerCase().includes(q) || a.compatibleBrandModel.toLowerCase().includes(q),
    );
  }

  // ── Marcas / Modelos ──
  openBrandModelDialog(item?: PosCatalogItem): void {
    this.dialog.open(BrandModelDialogComponent, { width: '520px', data: { item } });
  }

  deleteBrandModel(item: PosCatalogItem): void {
    this.confirmDelete(`¿Eliminar "${item.brand} ${item.model}" del catálogo?`, () => this.catalogSvc.deleteCatalogItem(item.id));
  }

  // ── Proveedores ──
  openSupplierDialog(item?: Supplier): void {
    this.dialog.open(SupplierDialogComponent, { width: '560px', data: { item } });
  }

  deleteSupplier(item: Supplier): void {
    this.confirmDelete(`¿Eliminar al proveedor "${item.name}"?`, () => this.catalogSvc.deleteSupplier(item.id));
  }

  // ── Accesorios ──
  openAccessoryDialog(item?: AccessoryCatalogItem): void {
    this.dialog.open(AccessoryDialogComponent, { width: '520px', data: { item } });
  }

  deleteAccessory(item: AccessoryCatalogItem): void {
    this.confirmDelete(`¿Eliminar "${item.type}" del catálogo?`, () => this.catalogSvc.deleteAccessory(item.id));
  }

  private confirmDelete(message: string, onConfirm: () => void): void {
    this.dialog
      .open(ConfirmDialogComponent, { width: '420px', data: { title: 'Confirmar eliminación', message, danger: true, confirmLabel: 'Eliminar' } })
      .afterClosed()
      .subscribe(confirmed => {
        if (confirmed) onConfirm();
      });
  }

  statusChipClass(status: string): string {
    switch (status) {
      case 'active': return 'chip-green';
      case 'obsolete': return 'chip-orange';
      case 'discontinued': return 'chip-red';
      case 'inactive': return 'chip-grey';
      default: return 'chip-grey';
    }
  }
}
