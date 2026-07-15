import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { CustodyRole, PosUnit } from '../../../../core/models/pos-admin';
import { PosInventoryService } from '../../../../core/services/pos-admin/pos-inventory.service';

export interface CustodyAssignDialogData {
  availableUnits: PosUnit[];
}

@Component({
  selector: 'app-custody-assign-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="cf-modal">
      <div class="modal-head">
        <span class="modal-title">Asignar equipo en resguardo</span>
        <button type="button" class="modal-close" aria-label="Cerrar" (click)="dialogRef.close()">&times;</button>
      </div>
      <form [formGroup]="form" class="modal-body" (ngSubmit)="save()">
        <div class="field">
          <label for="posUnitId">Equipo (N° de serie)</label>
          <select id="posUnitId" formControlName="posUnitId">
            <option value="">Seleccionar…</option>
            @for (u of data.availableUnits; track u.id) {
              <option [value]="u.id">{{ u.serialNumber }} — {{ u.brand }} {{ u.model }}</option>
            }
          </select>
        </div>
        <div class="grid-2">
          <div class="field">
            <label for="role">Rol</label>
            <select id="role" formControlName="role">
              <option value="technician">Técnico</option>
              <option value="executive">Ejecutivo</option>
              <option value="operator">Operador</option>
            </select>
          </div>
          <div class="field">
            <label for="userName">Usuario responsable</label>
            <input id="userName" formControlName="userName" placeholder="Nombre completo" />
          </div>
        </div>
        <div class="field">
          <label for="observations">Observaciones</label>
          <textarea id="observations" formControlName="observations" rows="2"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid">Asignar</button>
        </div>
      </form>
    </div>
  `,
})
export class CustodyAssignDialogComponent {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    posUnitId: ['', Validators.required],
    role: ['technician' as CustodyRole, Validators.required],
    userName: ['', Validators.required],
    observations: [''],
  });

  constructor(
    public dialogRef: MatDialogRef<CustodyAssignDialogComponent, boolean>,
    @Inject(MAT_DIALOG_DATA) public data: CustodyAssignDialogData,
    private inventorySvc: PosInventoryService,
  ) {}

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const userId = 'user-' + value.userName!.toLowerCase().replace(/\s+/g, '-');
    this.inventorySvc.assignCustody(
      value.posUnitId!,
      userId,
      value.userName!,
      value.role!,
      value.observations || undefined,
    );
    this.dialogRef.close(true);
  }
}
