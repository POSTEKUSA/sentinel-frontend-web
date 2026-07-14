import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { AccessoryCatalogItem, AccessoryMovementType } from '../../../../core/models/pos-admin';
import { AccessoryStockService } from '../../../../core/services/pos-admin/accessory-stock.service';

export interface RegisterMovementDialogData {
  accessories: AccessoryCatalogItem[];
}

@Component({
  selector: 'app-register-movement-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Registrar movimiento de accesorio/consumible</h2>
    <mat-dialog-content class="admin-form-dialog">
      <form [formGroup]="form" class="admin-form-grid">
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Accesorio/consumible</mat-label>
          <mat-select formControlName="accessoryId">
            @for (a of data.accessories; track a.id) {
              <mat-option [value]="a.id">{{ a.type }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Tipo de movimiento</mat-label>
          <mat-select formControlName="movementType">
            <mat-option value="in">Entrada</mat-option>
            <mat-option value="out">Salida</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Cantidad</mat-label>
          <input matInput type="number" min="1" formControlName="quantity">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Comercio/afiliado (opcional)</mat-label>
          <input matInput formControlName="merchantName">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Ejecutivo/técnico (opcional)</mat-label>
          <input matInput formControlName="executiveName">
        </mat-form-field>
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Zona</mat-label>
          <input matInput formControlName="zone">
        </mat-form-field>
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observations" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Registrar</button>
    </mat-dialog-actions>
  `,
})
export class RegisterMovementDialogComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    accessoryId: ['', Validators.required],
    movementType: ['out' as AccessoryMovementType, Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    merchantName: [''],
    executiveName: [''],
    zone: [''],
    observations: [''],
  });

  constructor(
    public dialogRef: MatDialogRef<RegisterMovementDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: RegisterMovementDialogData,
    private stockSvc: AccessoryStockService,
  ) {}

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const accessory = this.data.accessories.find(a => a.id === value.accessoryId);
    if (!accessory) return;

    this.stockSvc.registerMovement({
      accessoryId: accessory.id,
      accessoryType: accessory.type,
      movementType: value.movementType!,
      quantity: value.quantity!,
      date: new Date().toISOString(),
      merchantName: value.merchantName || undefined,
      executiveName: value.executiveName || undefined,
      zone: value.zone || undefined,
      observations: value.observations || undefined,
    });
    this.dialogRef.close(true);
  }
}
