import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest } from 'rxjs';

import {
  AccessoryCatalogItem,
  ACCESSORY_CATEGORY_LABELS,
  PosCatalogItem,
  Supplier,
} from '../../../core/models/pos-admin';
import { PosCatalogService } from '../../../core/services/pos-admin/pos-catalog.service';
import { userDisplayName } from '../../../core/utils/user-display.util';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { BrandModelDialogComponent } from './dialogs/brand-model-dialog.component';
import { SupplierDialogComponent } from './dialogs/supplier-dialog.component';
import { AccessoryDialogComponent } from './dialogs/accessory-dialog.component';
import {
  StatusTagComponent,
  STATUS_TAG_ACTIVE_INACTIVE,
  STATUS_TAG_CATALOG,
  StatusTagOption,
} from '../../../shared/status-tag/status-tag.component';
import { DataGridComponent } from '../../../shared/data-grid/data-grid.component';
import {
  DataGridAction,
  DataGridActionEvent,
  DataGridColumn,
  DataGridQueryChange,
} from '../../../shared/data-grid/data-grid.types';
import {
  applyListQuery,
  createListQuery,
  ListQuery,
  ListResult,
} from '../../../shared/data-grid/list-query';

@Component({
  selector: 'app-pos-catalog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmptyStateComponent,
    StatusTagComponent,
    DataGridComponent,
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css',
})
export class CatalogComponent implements OnInit {
  readonly catalogStatusOptions: StatusTagOption[] = STATUS_TAG_CATALOG;
  readonly supplierStatusOptions: StatusTagOption[] = STATUS_TAG_ACTIVE_INACTIVE;
  categoryLabels: Record<string, string> = ACCESSORY_CATEGORY_LABELS;
  activeTab: 'brands' | 'suppliers' | 'accessories' = 'brands';
  openMenuId: string | null = null;

  brandModelSearch = new FormControl('');
  supplierSearch = new FormControl('');
  accessorySearch = new FormControl('');

  allCatalog: PosCatalogItem[] = [];
  allSuppliers: Supplier[] = [];
  allAccessories: AccessoryCatalogItem[] = [];

  brandQuery: ListQuery = createListQuery({ pageSize: 25 });
  brandResult: ListResult<PosCatalogItem> = { items: [], total: 0 };

  filteredSuppliers: Supplier[] = [];
  filteredAccessories: AccessoryCatalogItem[] = [];

  readonly brandColumns: DataGridColumn<PosCatalogItem>[] = [
    {
      key: 'brand',
      header: 'Marca',
      type: 'text',
      sortable: true,
      filterable: true,
      emphasize: true,
      class: 'td-name',
    },
    { key: 'model', header: 'Modelo', type: 'text', sortable: true },
    { key: 'posType', header: 'Tipo de POS', type: 'text' },
    {
      key: 'status',
      header: 'Estado',
      type: 'status',
      statusOptions: STATUS_TAG_CATALOG,
    },
    {
      key: 'createdAt',
      header: 'Creado',
      type: 'date',
      dateFormat: 'short',
      sortable: true,
      sub: row => userDisplayName(row.createdBy),
    },
  ];

  readonly brandActions: DataGridAction<PosCatalogItem>[] = [
    { id: 'edit', label: 'Editar', icon: 'edit' },
    { id: 'delete', label: 'Eliminar', icon: 'delete_outline', danger: true },
  ];

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
      this.refreshBrandResult();
    });
    combineLatest([this.catalogSvc.suppliers$]).subscribe(([items]) => {
      this.allSuppliers = items;
      this.applySupplierFilter();
    });
    combineLatest([this.catalogSvc.accessories$]).subscribe(([items]) => {
      this.allAccessories = items;
      this.applyAccessoryFilter();
    });

    this.brandModelSearch.valueChanges.subscribe(() => {
      this.brandQuery = {
        ...this.brandQuery,
        filters: { ...this.brandQuery.filters, q: this.brandModelSearch.value ?? '' },
        page: 1,
      };
      this.refreshBrandResult();
    });
    this.supplierSearch.valueChanges.subscribe(() => this.applySupplierFilter());
    this.accessorySearch.valueChanges.subscribe(() => this.applyAccessoryFilter());
  }

  onBrandQueryChange(change: DataGridQueryChange): void {
    this.brandQuery = {
      ...this.brandQuery,
      ...change,
      filters: this.brandQuery.filters,
      columnFilters: change.columnFilters ?? this.brandQuery.columnFilters,
      sort: change.sort !== undefined ? change.sort : this.brandQuery.sort,
      page: change.page ?? this.brandQuery.page,
      pageSize: change.pageSize ?? this.brandQuery.pageSize,
    };
    this.refreshBrandResult();
  }

  onBrandAction(event: DataGridActionEvent<PosCatalogItem>): void {
    if (event.id === 'edit') {
      this.openBrandModelDialog(event.row);
      return;
    }
    if (event.id === 'delete') {
      this.deleteBrandModel(event.row);
    }
  }

  private refreshBrandResult(): void {
    const q = String(this.brandQuery.filters['q'] ?? this.brandModelSearch.value ?? '');
    this.brandQuery = {
      ...this.brandQuery,
      filters: { ...this.brandQuery.filters, q },
    };
    const options = {
      matchFilters: (item: PosCatalogItem, filters: Record<string, unknown>) => {
        const term = String(filters['q'] ?? '')
          .toLowerCase()
          .trim();
        if (!term) return true;
        return (
          item.brand.toLowerCase().includes(term) ||
          item.model.toLowerCase().includes(term) ||
          item.posType.toLowerCase().includes(term)
        );
      },
    };
    this.brandResult = applyListQuery(this.allCatalog, this.brandQuery, options);
    const totalPages = Math.max(1, Math.ceil(this.brandResult.total / Math.max(1, this.brandQuery.pageSize)));
    if (this.brandQuery.page > totalPages) {
      this.brandQuery = { ...this.brandQuery, page: totalPages };
      this.brandResult = applyListQuery(this.allCatalog, this.brandQuery, options);
    }
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
}
