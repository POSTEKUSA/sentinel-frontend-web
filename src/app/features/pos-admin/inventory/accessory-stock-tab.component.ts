import { Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { AccessoryCatalogItem, AccessoryCategory, AccessoryMovement } from '../../../core/models/pos-admin';
import { AccessoryStockService } from '../../../core/services/pos-admin/accessory-stock.service';
import { PosCatalogService } from '../../../core/services/pos-admin/pos-catalog.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { CopyableCodeComponent } from '../../../shared/copyable-code/copyable-code.component';
import { RegisterMovementDialogComponent } from './dialogs/register-movement-dialog.component';

interface StockRow {
  accessory: AccessoryCatalogItem;
  currentStock: number;
  lowStock: boolean;
}

@Component({
  selector: 'app-accessory-stock-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EmptyStateComponent, CopyableCodeComponent],
  templateUrl: './accessory-stock-tab.component.html',
  styleUrl: './accessory-stock-tab.component.css',
})
export class AccessoryStockTabComponent implements OnInit, OnChanges {
  /** Filtra por categoría: accessory | consumable. Sin valor = todos. */
  @Input() category?: AccessoryCategory;

  accessories: AccessoryCatalogItem[] = [];
  stockRows: StockRow[] = [];

  movements: AccessoryMovement[] = [];
  filteredMovements: AccessoryMovement[] = [];

  private fb = inject(FormBuilder);
  private allAccessories: AccessoryCatalogItem[] = [];
  private allMovements: AccessoryMovement[] = [];

  filterForm = this.fb.group({
    accessoryId: [''],
    merchant: [''],
    executive: [''],
    zone: [''],
    period: ['all'],
  });

  constructor(
    private stockSvc: AccessoryStockService,
    private catalogSvc: PosCatalogService,
    private dialog: MatDialog,
  ) {}

  get categoryLabel(): string {
    return this.category === 'consumable' ? 'consumible' : 'accesorio';
  }

  get emptyTitle(): string {
    return this.category === 'consumable' ? 'Sin consumibles registrados' : 'Sin accesorios registrados';
  }

  ngOnInit(): void {
    this.catalogSvc.accessories$.subscribe(accessories => {
      this.allAccessories = accessories;
      this.refreshCategorySlice();
    });
    this.stockSvc.movements$.subscribe(movements => {
      this.allMovements = movements;
      this.refreshCategorySlice();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && !changes['category'].firstChange) {
      this.refreshCategorySlice();
    }
  }

  private refreshCategorySlice(): void {
    this.accessories = this.category
      ? this.allAccessories.filter(a => a.category === this.category)
      : [...this.allAccessories];
    const ids = new Set(this.accessories.map(a => a.id));
    this.movements = this.allMovements.filter(m => ids.has(m.accessoryId));
    this.buildStockRows();
    this.applyFilters();
  }

  private buildStockRows(): void {
    this.stockRows = this.accessories.map(accessory => {
      const currentStock = this.stockSvc.currentStock(accessory.id);
      return { accessory, currentStock, lowStock: currentStock < accessory.minStock };
    });
  }

  private periodCutoff(period: string): string | null {
    if (period === 'all') return null;
    const days = period === 'day' ? 1 : period === 'month' ? 30 : 365;
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    const cutoff = this.periodCutoff(f.period ?? 'all');
    this.filteredMovements = this.movements.filter(
      m =>
        (!f.accessoryId || m.accessoryId === f.accessoryId) &&
        (!f.merchant || (m.merchantName ?? '').toLowerCase().includes(f.merchant.toLowerCase())) &&
        (!f.executive || (m.executiveName ?? '').toLowerCase().includes(f.executive.toLowerCase())) &&
        (!f.zone || (m.zone ?? '').toLowerCase().includes(f.zone.toLowerCase())) &&
        (!cutoff || m.date >= cutoff),
    );
  }

  clearFilters(): void {
    this.filterForm.reset({
      accessoryId: '',
      merchant: '',
      executive: '',
      zone: '',
      period: 'all',
    });
  }

  get hasActiveFilters(): boolean {
    const f = this.filterForm.getRawValue();
    return !!(f.accessoryId || f.merchant || f.executive || f.zone || (f.period && f.period !== 'all'));
  }

  get totalConsumption(): number {
    return this.filteredMovements.filter(m => m.movementType === 'out').reduce((sum, m) => sum + m.quantity, 0);
  }

  openRegisterDialog(): void {
    this.dialog.open(RegisterMovementDialogComponent, {
      width: '520px',
      maxWidth: '94vw',
      panelClass: 'cf-dialog-panel',
      data: { accessories: this.accessories },
    });
  }
}
