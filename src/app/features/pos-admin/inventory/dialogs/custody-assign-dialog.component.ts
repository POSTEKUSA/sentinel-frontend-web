import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { CustodyRole, PosUnit } from '../../../../core/models/pos-admin';
import { PosInventoryService } from '../../../../core/services/pos-admin/pos-inventory.service';

export interface CustodyAssignDialogData {
  availableUnits: PosUnit[];
}

@Component({
  selector: 'app-custody-assign-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>Asignar equipo en resguardo</h2>
    <mat-dialog-content class="admin-form-dialog">
      <form [formGroup]="form" class="admin-form-grid">
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Equipo (N° de serie)</mat-label>
          <mat-select formControlName="posUnitId">
            @for (u of data.availableUnits; track u.id) {
              <mat-option [value]="u.id">{{ u.serialNumber }} — {{ u.brand }} {{ u.model }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Rol</mat-label>
          <mat-select formControlName="role">
            <mat-option value="technician">Técnico</mat-option>
            <mat-option value="executive">Ejecutivo</mat-option>
            <mat-option value="operator">Operador</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Usuario responsable</mat-label>
          <input matInput formControlName="userName" placeholder="Nombre completo">
        </mat-form-field>
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Observaciones</mat-label>
          <textarea matInput formControlName="observations" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Asignar</button>
    </mat-dialog-actions>
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
    this.inventorySvc.assignCustody(value.posUnitId!, userId, value.userName!, value.role!, value.observations || undefined);
    this.dialogRef.close(true);
  }
}
