import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { PosLocationType, POS_LOCATION_LABELS, PurchaseOrder, PurchaseOrderLine } from '../../../core/models/pos-admin';
import { BulkReceiveResultRow, PosInventoryService } from '../../../core/services/pos-admin/pos-inventory.service';
import { PurchaseOrderService } from '../../../core/services/pos-admin/purchase-order.service';
import { CurrentUserService } from '../../../core/services/pos-admin/current-user.service';

interface BulkRow {
  serialNumber: string;
  brand: string;
  model: string;
  posType: string;
}

@Component({
  selector: 'app-receiving',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule, MatTabsModule, MatCardModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatTableModule, MatChipsModule, MatSnackBarModule, MatTooltipModule,
  ],
  templateUrl: './receiving.component.html',
  styleUrl: './receiving.component.css',
})
export class ReceivingComponent implements OnInit {
  locationOptions = Object.entries(POS_LOCATION_LABELS).map(([value, label]) => ({ value: value as PosLocationType, label }));
  orders: PurchaseOrder[] = [];
  pendingLines: PurchaseOrderLine[] = [];
  duplicateError = false;
  lastReceived: string | null = null;

  bulkRows: BulkRow[] = [];
  bulkValidation: BulkReceiveResultRow[] = [];
  bulkResultColumns = ['row', 'serialNumber', 'brand', 'model', 'status'];
  bulkImported: { created: number; skipped: number } | null = null;
  bulkFileName = '';

  private fb = inject(FormBuilder);

  form = this.fb.group({
    purchaseOrderId: [''],
    purchaseOrderLineId: [''],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    posType: ['', Validators.required],
    serialNumber: ['', Validators.required],
    locationType: ['central_warehouse' as PosLocationType, Validators.required],
    locationLabel: [''],
    initialCondition: ['Nuevo, sellado de fábrica', Validators.required],
    observations: [''],
  });

  bulkForm = this.fb.group({
    purchaseOrderId: [''],
    purchaseOrderLineId: [''],
    locationType: ['central_warehouse' as PosLocationType, Validators.required],
    locationLabel: [''],
    initialCondition: ['Nuevo, sellado de fábrica', Validators.required],
  });

  constructor(
    private route: ActivatedRoute,
    private inventorySvc: PosInventoryService,
    private poSvc: PurchaseOrderService,
    public currentUser: CurrentUserService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.poSvc.orders$.subscribe(orders => {
      this.orders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'closed');
    });

    const poId = this.route.snapshot.queryParamMap.get('poId');
    if (poId) {
      this.form.patchValue({ purchaseOrderId: poId });
      this.onOrderChange(poId, this.form);
    }
  }

  onOrderChange(orderId: string, targetForm: typeof this.form | typeof this.bulkForm): void {
    this.pendingLines = orderId ? this.poSvc.pendingLines(orderId).filter(l => l.itemType === 'pos') : [];
    targetForm.patchValue({ purchaseOrderLineId: '' } as any);
    if (targetForm === this.form) {
      this.form.patchValue({ brand: '', model: '' });
    }
  }

  onLineChange(lineId: string): void {
    const line = this.pendingLines.find(l => l.id === lineId);
    if (line) {
      this.form.patchValue({ brand: line.brand, model: line.model, posType: this.form.value.posType || 'Android POS' });
    }
  }

  onBulkLineChange(_lineId: string): void {
    // La línea seleccionada solo determina la orden a incrementar; marca/modelo vienen del archivo.
  }

  submitSingle(): void {
    if (this.form.invalid) return;
    this.duplicateError = false;
    const value = this.form.getRawValue();

    try {
      const unit = this.inventorySvc.receiveUnit({
        serialNumber: value.serialNumber!,
        brand: value.brand!,
        model: value.model!,
        posType: value.posType!,
        purchaseOrderId: value.purchaseOrderId || undefined,
        purchaseOrderLineId: value.purchaseOrderLineId || undefined,
        locationType: value.locationType!,
        locationLabel: value.locationLabel || undefined,
        initialCondition: value.initialCondition!,
        observations: value.observations || undefined,
      });
      this.lastReceived = unit.serialNumber;
      this.snackBar.open(`Equipo ${unit.serialNumber} recibido e ingresado al inventario.`, 'Cerrar', { duration: 4000 });
      this.form.reset({
        purchaseOrderId: value.purchaseOrderId,
        purchaseOrderLineId: '',
        brand: value.purchaseOrderId ? value.brand : '',
        model: value.purchaseOrderId ? value.model : '',
        posType: value.posType,
        serialNumber: '',
        locationType: value.locationType,
        locationLabel: value.locationLabel,
        initialCondition: value.initialCondition,
        observations: '',
      });
    } catch (err) {
      this.duplicateError = true;
    }
  }

  // ── Carga masiva (HU-007) ──────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.bulkFileName = file.name;
    this.bulkImported = null;

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      this.bulkRows = this.parseCsv(text);
      this.bulkValidation = this.inventorySvc.validateBulkRows(this.bulkRows);
    };
    reader.readAsText(file);
  }

  private parseCsv(text: string): BulkRow[] {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return [];

    const header = lines[0].split(',').map(h => h.trim().toLowerCase());
    const idx = {
      serialNumber: header.findIndex(h => h.includes('serie') || h.includes('serial')),
      brand: header.findIndex(h => h.includes('marca') || h.includes('brand')),
      model: header.findIndex(h => h.includes('modelo') || h.includes('model')),
      posType: header.findIndex(h => h.includes('tipo')),
    };

    return lines.slice(1).map(line => {
      const cols = line.split(',').map(c => c.trim());
      return {
        serialNumber: idx.serialNumber >= 0 ? cols[idx.serialNumber] ?? '' : '',
        brand: idx.brand >= 0 ? cols[idx.brand] ?? '' : '',
        model: idx.model >= 0 ? cols[idx.model] ?? '' : '',
        posType: idx.posType >= 0 ? cols[idx.posType] ?? 'Android POS' : 'Android POS',
      };
    });
  }

  get validCount(): number {
    return this.bulkValidation.filter(r => r.status === 'valid').length;
  }

  get errorCount(): number {
    return this.bulkValidation.filter(r => r.status === 'error').length;
  }

  confirmBulkImport(): void {
    if (this.validCount === 0) return;
    const value = this.bulkForm.getRawValue();
    const result = this.inventorySvc.bulkReceive(this.bulkRows, {
      locationType: value.locationType!,
      locationLabel: value.locationLabel || undefined,
      initialCondition: value.initialCondition!,
      purchaseOrderId: value.purchaseOrderId || undefined,
      purchaseOrderLineId: value.purchaseOrderLineId || undefined,
    });
    this.bulkImported = { created: result.created.length, skipped: result.skipped };
    this.snackBar.open(`Carga masiva completada: ${result.created.length} equipos ingresados, ${result.skipped} omitidos.`, 'Cerrar', { duration: 5000 });
    this.bulkRows = [];
    this.bulkValidation = [];
    this.bulkFileName = '';
  }

  downloadTemplate(): void {
    const csv = 'numeroSerie,marca,modelo,tipoPos\nPAX-A920-000999,PAX,A920,Android POS\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_carga_masiva_pos.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
