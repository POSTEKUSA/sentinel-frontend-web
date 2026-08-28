import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import {
  AccessoryCatalogItem,
  AccessoryCategory,
  AccessoryInventoryUnit,
  POS_LOCATION_LABELS,
  POS_UNIT_STATUS_LABELS,
  PosLocationType,
  PosUnitStatus,
} from '../../../core/models/pos-admin';
import { AccessoryInventoryService } from '../../../core/services/pos-admin/accessory-inventory.service';
import { PosCatalogService } from '../../../core/services/pos-admin/pos-catalog.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { CopyableCodeComponent } from '../../../shared/copyable-code/copyable-code.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

export interface InventoryTabSummary {
  filtered: number;
  total: number;
}

@Component({
  selector: 'app-part-inventory-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, EmptyStateComponent, CopyableCodeComponent],
  templateUrl: './part-inventory-tab.component.html',
  styleUrl: './part-inventory-tab.component.css',
})
export class PartInventoryTabComponent implements OnInit, OnChanges {
  @Input({ required: true }) category!: AccessoryCategory;
  @Output() summaryChange = new EventEmitter<InventoryTabSummary>();

  statusLabels: Record<string, string> = POS_UNIT_STATUS_LABELS;
  locationLabels: Record<string, string> = POS_LOCATION_LABELS;
  statusKeys = Object.keys(POS_UNIT_STATUS_LABELS);
  locationKeys = Object.keys(POS_LOCATION_LABELS);

  all: AccessoryInventoryUnit[] = [];
  filtered: AccessoryInventoryUnit[] = [];
  catalogOptions: AccessoryCatalogItem[] = [];

  openMenuId: string | null = null;
  showForm = false;
  editId: string | null = null;
  formError = '';

  private fb = inject(FormBuilder);
  private inventorySvc = inject(AccessoryInventoryService);
  private catalogSvc = inject(PosCatalogService);
  private dialog = inject(MatDialog);

  filterForm = this.fb.group({
    q: [''],
    type: [''],
    status: [''],
    locationType: [''],
    purchaseOrderNumber: [''],
  });

  formData = this.fb.group({
    catalogItemId: ['', Validators.required],
    type: ['', Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    unitOfMeasure: ['Unidad', Validators.required],
    serialNumber: [''],
    status: ['in_stock' as PosUnitStatus, Validators.required],
    locationType: ['central_warehouse' as PosLocationType, Validators.required],
    locationLabel: [''],
    purchaseOrderNumber: [''],
    observations: [''],
  });

  get noun(): string {
    return this.category === 'consumable' ? 'consumible' : 'accesorio';
  }

  get emptyTitle(): string {
    return this.category === 'consumable' ? 'Sin consumibles en inventario' : 'Sin accesorios en inventario';
  }

  get dialogTitle(): string {
    return this.editId ? `Editar ${this.noun}` : `Agregar ${this.noun}`;
  }

  ngOnInit(): void {
    this.refreshCatalogOptions();
    this.inventorySvc.units$.subscribe(() => this.reload());
    this.catalogSvc.accessories$.subscribe(() => this.refreshCatalogOptions());
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category']) {
      this.refreshCatalogOptions();
      this.reload();
    }
  }

  private refreshCatalogOptions(): void {
    this.catalogOptions = this.catalogSvc.accessories.filter(a => a.category === this.category);
  }

  private reload(): void {
    this.all = this.inventorySvc.byCategory(this.category);
    this.applyFilters();
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    const q = (f.q ?? '').toLowerCase().trim();
    this.filtered = this.all.filter(
      u =>
        (!q ||
          u.inventoryCode.toLowerCase().includes(q) ||
          u.type.toLowerCase().includes(q) ||
          (u.serialNumber ?? '').toLowerCase().includes(q)) &&
        (!f.type || u.type.toLowerCase().includes(f.type.toLowerCase())) &&
        (!f.status || u.status === f.status) &&
        (!f.locationType || u.locationType === f.locationType) &&
        (!f.purchaseOrderNumber ||
          (u.purchaseOrderNumber ?? '').toLowerCase().includes(f.purchaseOrderNumber.toLowerCase())),
    );
    this.summaryChange.emit({ filtered: this.filtered.length, total: this.all.length });
  }

  clearFilters(): void {
    this.filterForm.reset({
      q: '',
      type: '',
      status: '',
      locationType: '',
      purchaseOrderNumber: '',
    });
  }

  get hasActiveFilters(): boolean {
    const f = this.filterForm.getRawValue();
    return !!(f.q || f.type || f.status || f.locationType || f.purchaseOrderNumber);
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuId = null;
  }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  openCreate(): void {
    this.editId = null;
    this.formError = '';
    this.refreshCatalogOptions();
    this.formData.reset({
      catalogItemId: '',
      type: '',
      quantity: this.category === 'consumable' ? 50 : 1,
      unitOfMeasure: 'Unidad',
      serialNumber: '',
      status: 'in_stock',
      locationType: 'central_warehouse',
      locationLabel: '',
      purchaseOrderNumber: '',
      observations: '',
    });
    this.showForm = true;
  }

  openEdit(u: AccessoryInventoryUnit): void {
    this.editId = u.id;
    this.formError = '';
    this.refreshCatalogOptions();
    this.formData.patchValue({
      catalogItemId: u.catalogItemId,
      type: u.type,
      quantity: u.quantity,
      unitOfMeasure: u.unitOfMeasure,
      serialNumber: u.serialNumber ?? '',
      status: u.status,
      locationType: u.locationType,
      locationLabel: u.locationLabel,
      purchaseOrderNumber: u.purchaseOrderNumber ?? '',
      observations: u.observations ?? '',
    });
    this.showForm = true;
  }

  onCatalogChange(catalogItemId: string): void {
    const item = this.catalogOptions.find(a => a.id === catalogItemId);
    if (!item) return;
    this.formData.patchValue({
      type: item.type,
      unitOfMeasure: item.unitOfMeasure,
      catalogItemId: item.id,
    });
  }

  saveForm(): void {
    if (this.formData.invalid) {
      this.formError = 'Completa los campos requeridos.';
      this.formData.markAllAsTouched();
      return;
    }
    const v = this.formData.getRawValue();
    const payload = {
      catalogItemId: v.catalogItemId!,
      type: v.type!,
      category: this.category,
      quantity: Number(v.quantity) || 1,
      unitOfMeasure: v.unitOfMeasure!,
      serialNumber: v.serialNumber?.trim() || undefined,
      status: v.status as PosUnitStatus,
      locationType: v.locationType as PosLocationType,
      locationLabel: v.locationLabel?.trim() || undefined,
      purchaseOrderNumber: v.purchaseOrderNumber?.trim() || undefined,
      observations: v.observations?.trim() || undefined,
    };

    if (this.editId) {
      this.inventorySvc.update(this.editId, payload);
    } else {
      this.inventorySvc.create(payload);
    }
    this.showForm = false;
  }

  askDelete(u: AccessoryInventoryUnit): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        panelClass: 'cf-dialog-panel',
        data: {
          title: 'Confirmar eliminación',
          message: `¿Eliminar ${this.noun} ${u.inventoryCode} (${u.type}) del inventario?`,
          danger: true,
          confirmLabel: 'Eliminar',
        },
      })
      .afterClosed()
      .subscribe(ok => {
        if (ok) this.inventorySvc.delete(u.id);
      });
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'in_stock':
        return 'cf-badge-info';
      case 'installed':
        return 'cf-badge-ok';
      case 'with_technician':
      case 'with_executive':
      case 'in_transit':
        return 'cf-badge-info';
      case 'in_workshop':
        return 'cf-badge-warn';
      case 'decommissioned':
      case 'destroyed':
        return 'cf-badge-off';
      default:
        return 'cf-badge-muted';
    }
  }
}
