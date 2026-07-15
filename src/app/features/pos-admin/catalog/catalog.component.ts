import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest } from 'rxjs';

import {
  AccessoryCatalogItem,
  ACCESSORY_CATEGORY_LABELS,
  CATALOG_STATUS_LABELS,
  PosCatalogItem,
  Supplier,
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
  imports: [CommonModule, ReactiveFormsModule, EmptyStateComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent implements OnInit {
  statusLabels: Record<string, string> = CATALOG_STATUS_LABELS;
  categoryLabels: Record<string, string> = ACCESSORY_CATEGORY_LABELS;
  activeTab: 'brands' | 'suppliers' | 'accessories' = 'brands';
  openMenuId: string | null = null;

  brandModelSearch = new FormControl('');
  supplierSearch = new FormControl('');
  accessorySearch = new FormControl('');

  allCatalog: PosCatalogItem[] = [];
  allSuppliers: Supplier[] = [];
  allAccessories: AccessoryCatalogItem[] = [];

  filteredCatalog: PosCatalogItem[] = [];
  filteredSuppliers: Supplier[] = [];
  filteredAccessories: AccessoryCatalogItem[] = [];

  constructor(
    private catalogSvc: PosCatalogService,
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
      c =>
        !q ||
        c.brand.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q) ||
        c.posType.toLowerCase().includes(q),
    );
  }

  private applySupplierFilter(): void {
    const q = (this.supplierSearch.value ?? '').toLowerCase().trim();
    this.filteredSuppliers = this.allSuppliers.filter(
      s =>
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.suppliedBrands.some(b => b.toLowerCase().includes(q)) ||
        s.suppliedModels.some(m => m.toLowerCase().includes(q)),
    );
  }

  private applyAccessoryFilter(): void {
    const q = (this.accessorySearch.value ?? '').toLowerCase().trim();
    this.filteredAccessories = this.allAccessories.filter(
      a => !q || a.type.toLowerCase().includes(q) || a.compatibleBrandModel.toLowerCase().includes(q),
    );
  }

  openBrandModelDialog(item?: PosCatalogItem): void {
    this.dialog.open(BrandModelDialogComponent, {
      width: '520px',
      maxWidth: '94vw',
      panelClass: 'cf-dialog-panel',
      data: { item },
    });
  }

  deleteBrandModel(item: PosCatalogItem): void {
    this.confirmDelete(`¿Eliminar "${item.brand} ${item.model}" del catálogo?`, () =>
      this.catalogSvc.deleteCatalogItem(item.id),
    );
  }

  openSupplierDialog(item?: Supplier): void {
    this.dialog.open(SupplierDialogComponent, {
      width: '560px',
      maxWidth: '94vw',
      panelClass: 'cf-dialog-panel',
      data: { item },
    });
  }

  deleteSupplier(item: Supplier): void {
    this.confirmDelete(`¿Eliminar al proveedor "${item.name}"?`, () => this.catalogSvc.deleteSupplier(item.id));
  }

  openAccessoryDialog(item?: AccessoryCatalogItem): void {
    this.dialog.open(AccessoryDialogComponent, {
      width: '520px',
      maxWidth: '94vw',
      panelClass: 'cf-dialog-panel',
      data: { item },
    });
  }

  deleteAccessory(item: AccessoryCatalogItem): void {
    this.confirmDelete(`¿Eliminar "${item.type}" del catálogo?`, () => this.catalogSvc.deleteAccessory(item.id));
  }

  private confirmDelete(message: string, onConfirm: () => void): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        panelClass: 'cf-dialog-panel',
        data: { title: 'Confirmar eliminación', message, danger: true, confirmLabel: 'Eliminar' },
      })
      .afterClosed()
      .subscribe(confirmed => {
        if (confirmed) onConfirm();
      });
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'active':
        return 'cf-badge-ok';
      case 'obsolete':
        return 'cf-badge-warn';
      case 'discontinued':
      case 'inactive':
        return 'cf-badge-off';
      default:
        return 'cf-badge-muted';
    }
  }
}
