import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { AccessoryCatalogItem, AccessoryMovementType } from '../../../../core/models/pos-admin';
import { AccessoryStockService } from '../../../../core/services/pos-admin/accessory-stock.service';

export interface RegisterMovementDialogData {
  accessories: AccessoryCatalogItem[];
}

@Component({
  selector: 'app-register-movement-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="cf-modal">
      <div class="modal-head">
        <span class="modal-title">Registrar movimiento</span>
        <button type="button" class="modal-close" aria-label="Cerrar" (click)="dialogRef.close()">&times;</button>
      </div>
      <form [formGroup]="form" class="modal-body" (ngSubmit)="save()">
        <div class="field">
          <label for="accessoryId">Accesorio/consumible</label>
          <select id="accessoryId" formControlName="accessoryId">
            <option value="">Seleccionar…</option>
            @for (a of data.accessories; track a.id) {
              <option [value]="a.id">{{ a.type }}</option>
            }
          </select>
        </div>
        <div class="grid-2">
          <div class="field">
            <label for="movementType">Tipo de movimiento</label>
            <select id="movementType" formControlName="movementType">
              <option value="in">Entrada</option>
              <option value="out">Salida</option>
            </select>
          </div>
          <div class="field">
            <label for="quantity">Cantidad</label>
            <input id="quantity" type="number" min="1" formControlName="quantity" />
          </div>
          <div class="field">
            <label for="merchantName">Comercio/afiliado (opcional)</label>
            <input id="merchantName" formControlName="merchantName" />
          </div>
          <div class="field">
            <label for="executiveName">Ejecutivo/técnico (opcional)</label>
            <input id="executiveName" formControlName="executiveName" />
          </div>
        </div>
        <div class="field">
          <label for="zone">Zona</label>
          <input id="zone" formControlName="zone" />
        </div>
        <div class="field">
          <label for="observations">Observaciones</label>
          <textarea id="observations" formControlName="observations" rows="2"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid">Registrar</button>
        </div>
      </form>
    </div>
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
