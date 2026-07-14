import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

import { AccessoryCatalogItem, AccessoryMovement } from '../../../core/models/pos-admin';
import { AccessoryStockService } from '../../../core/services/pos-admin/accessory-stock.service';
import { PosCatalogService } from '../../../core/services/pos-admin/pos-catalog.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { RegisterMovementDialogComponent } from './dialogs/register-movement-dialog.component';

interface StockRow {
  accessory: AccessoryCatalogItem;
  currentStock: number;
  lowStock: boolean;
}

@Component({
  selector: 'app-accessory-stock-tab',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatTableModule, EmptyStateComponent,
  ],
  templateUrl: './accessory-stock-tab.component.html',
  styleUrl: './accessory-stock-tab.component.css',
})
export class AccessoryStockTabComponent implements OnInit {
  accessories: AccessoryCatalogItem[] = [];
  stockRows: StockRow[] = [];
  stockColumns = ['type', 'category', 'currentStock', 'minStock', 'alert'];

  movements: AccessoryMovement[] = [];
  filteredMovements: AccessoryMovement[] = [];
  movementColumns = ['date', 'accessoryType', 'movementType', 'quantity', 'merchantName', 'executiveName', 'zone'];

  private fb = inject(FormBuilder);

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

  ngOnInit(): void {
    this.catalogSvc.accessories$.subscribe(accessories => {
      this.accessories = accessories;
      this.buildStockRows();
    });
    this.stockSvc.movements$.subscribe(movements => {
      this.movements = movements;
      this.buildStockRows();
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
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
    this.filteredMovements = this.movements.filter(m =>
      (!f.accessoryId || m.accessoryId === f.accessoryId) &&
      (!f.merchant || (m.merchantName ?? '').toLowerCase().includes(f.merchant.toLowerCase())) &&
      (!f.executive || (m.executiveName ?? '').toLowerCase().includes(f.executive.toLowerCase())) &&
      (!f.zone || (m.zone ?? '').toLowerCase().includes(f.zone.toLowerCase())) &&
      (!cutoff || m.date >= cutoff),
    );
  }

  get totalConsumption(): number {
    return this.filteredMovements.filter(m => m.movementType === 'out').reduce((sum, m) => sum + m.quantity, 0);
  }

  openRegisterDialog(): void {
    this.dialog.open(RegisterMovementDialogComponent, { width: '520px', data: { accessories: this.accessories } });
  }
}
