import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Merchant, PosUnit } from '../../../../core/models/pos-admin';
import { PosInventoryService } from '../../../../core/services/pos-admin/pos-inventory.service';
import { MerchantService } from '../../../../core/services/pos-admin/merchant.service';

export interface InstallPosDialogData {
  merchant: Merchant;
  availableUnits: PosUnit[];
}

@Component({
  selector: 'app-install-pos-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Instalar POS en {{ data.merchant.tradeName }}</h2>
    <mat-dialog-content class="admin-form-dialog">
      <form [formGroup]="form" class="admin-form-grid">
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Equipo a instalar (N° de serie)</mat-label>
          <mat-select formControlName="posUnitId">
            @for (u of data.availableUnits; track u.id) {
              <mat-option [value]="u.id">{{ u.serialNumber }} — {{ u.brand }} {{ u.model }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Rol del responsable</mat-label>
          <mat-select formControlName="responsibleRole">
            <mat-option value="technician">Técnico</mat-option>
            <mat-option value="executive">Ejecutivo</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Nombre del responsable</mat-label>
          <input matInput formControlName="responsibleName">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Latitud (opcional)</mat-label>
          <input matInput type="number" formControlName="latitude">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Longitud (opcional)</mat-label>
          <input matInput type="number" formControlName="longitude">
        </mat-form-field>
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Estado inicial</mat-label>
          <input matInput formControlName="initialStatus">
        </mat-form-field>
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observations" rows="2"></textarea>
        </mat-form-field>
      </form>
      @if (data.availableUnits.length === 0) {
        <p class="dialog-warning">No hay equipos disponibles en almacén o resguardo para instalar. Reciba o libere un equipo primero.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || data.availableUnits.length === 0" (click)="save()">
        Registrar instalación
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.dialog-warning { color: #e65100; font-size: 12px; margin-top: 8px; }`],
})
export class InstallPosDialogComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    posUnitId: ['', Validators.required],
    responsibleRole: ['technician' as 'technician' | 'executive', Validators.required],
    responsibleName: ['', Validators.required],
    latitude: [null as number | null],
    longitude: [null as number | null],
    initialStatus: ['Operativo', Validators.required],
    observations: [''],
  });

  constructor(
    public dialogRef: MatDialogRef<InstallPosDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: InstallPosDialogData,
    private inventorySvc: PosInventoryService,
    private merchantSvc: MerchantService,
  ) {}

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const unit = this.data.availableUnits.find(u => u.id === value.posUnitId);
    if (!unit) return;

    const userId = 'user-' + value.responsibleName!.toLowerCase().replace(/\s+/g, '-');

    this.merchantSvc.registerInstallation({
      posUnitId: unit.id,
      serialNumber: unit.serialNumber,
      brand: unit.brand,
      model: unit.model,
      merchantId: this.data.merchant.id,
      responsibleUserId: userId,
      responsibleName: value.responsibleName!,
      responsibleRole: value.responsibleRole!,
      latitude: value.latitude ?? undefined,
      longitude: value.longitude ?? undefined,
      initialStatus: value.initialStatus!,
      observations: value.observations || undefined,
    });

    this.dialogRef.close(true);
  }
}
