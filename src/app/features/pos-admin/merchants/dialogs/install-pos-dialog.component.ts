import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

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
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="cf-modal">
      <div class="modal-head">
        <span class="modal-title">Instalar POS en {{ data.merchant.tradeName }}</span>
        <button type="button" class="modal-close" aria-label="Cerrar" (click)="dialogRef.close()">&times;</button>
      </div>
      <form [formGroup]="form" class="modal-body" (ngSubmit)="save()">
        <div class="field">
          <label for="posUnitId">Equipo a instalar (N° de serie)</label>
          <select id="posUnitId" formControlName="posUnitId">
            <option value="">Seleccionar…</option>
            @for (u of data.availableUnits; track u.id) {
              <option [value]="u.id">{{ u.serialNumber }} — {{ u.brand }} {{ u.model }}</option>
            }
          </select>
        </div>
        <div class="grid-2">
          <div class="field">
            <label for="responsibleRole">Rol del responsable</label>
            <select id="responsibleRole" formControlName="responsibleRole">
              <option value="technician">Técnico</option>
              <option value="executive">Ejecutivo</option>
            </select>
          </div>
          <div class="field">
            <label for="responsibleName">Nombre del responsable</label>
            <input id="responsibleName" formControlName="responsibleName" />
          </div>
          <div class="field">
            <label for="latitude">Latitud (opcional)</label>
            <input id="latitude" type="number" formControlName="latitude" />
          </div>
          <div class="field">
            <label for="longitude">Longitud (opcional)</label>
            <input id="longitude" type="number" formControlName="longitude" />
          </div>
        </div>
        <div class="field">
          <label for="initialStatus">Estado inicial</label>
          <input id="initialStatus" formControlName="initialStatus" />
        </div>
        <div class="field">
          <label for="observations">Observaciones</label>
          <textarea id="observations" formControlName="observations" rows="2"></textarea>
        </div>
        @if (data.availableUnits.length === 0) {
          <p class="dialog-warning">
            No hay equipos disponibles en almacén o resguardo para instalar. Reciba o libere un equipo primero.
          </p>
        }
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="dialogRef.close()">Cancelar</button>
          <button
            type="submit"
            class="btn-primary"
            [disabled]="form.invalid || data.availableUnits.length === 0">
            Registrar instalación
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .dialog-warning {
        color: #9a3412;
        font-size: 12px;
        margin: 0 0 12px;
        padding: 8px 10px;
        background: #fff7ed;
        border-radius: 6px;
      }
    `,
  ],
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
