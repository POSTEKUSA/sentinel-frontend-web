import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Merchant, MerchantStatus } from '../../../../core/models/pos-admin';
import { MerchantService } from '../../../../core/services/pos-admin/merchant.service';

export interface MerchantDialogData {
  item?: Merchant;
}

@Component({
  selector: 'app-merchant-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.item ? 'Editar' : 'Nuevo' }} comercio/afiliado</h2>
    <mat-dialog-content class="admin-form-dialog">
      <form [formGroup]="form" class="admin-form-grid">
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Código de afiliado</mat-label>
          <input matInput formControlName="affiliateCode">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Nombre comercial</mat-label>
          <input matInput formControlName="tradeName">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>MCC</mat-label>
          <input matInput formControlName="mcc" placeholder="5411">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Categoría (MCC)</mat-label>
          <input matInput formControlName="mccDescription" placeholder="Supermercados">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Departamento</mat-label>
          <input matInput formControlName="department">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Municipio</mat-label>
          <input matInput formControlName="municipality">
        </mat-form-field>
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Dirección</mat-label>
          <input matInput formControlName="address">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option value="active">Activo</mat-option>
            <mat-option value="inactive">Inactivo</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Técnico/ejecutivo responsable</mat-label>
          <input matInput formControlName="responsibleName">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `,
})
export class MerchantDialogComponent {
  dialogRef = inject<MatDialogRef<MerchantDialogComponent, boolean>>(MatDialogRef);
  data = inject<MerchantDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private merchantSvc = inject(MerchantService);

  form = this.fb.group({
    affiliateCode: [this.data.item?.affiliateCode ?? '', Validators.required],
    tradeName: [this.data.item?.tradeName ?? '', Validators.required],
    mcc: [this.data.item?.mcc ?? '', Validators.required],
    mccDescription: [this.data.item?.mccDescription ?? '', Validators.required],
    department: [this.data.item?.department ?? '', Validators.required],
    municipality: [this.data.item?.municipality ?? '', Validators.required],
    address: [this.data.item?.address ?? ''],
    status: [this.data.item?.status ?? ('active' as MerchantStatus), Validators.required],
    responsibleName: [this.data.item?.responsibleName ?? ''],
  });

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue() as Omit<Merchant, 'id' | 'createdAt'>;

    if (this.data.item) {
      this.merchantSvc.updateMerchant(this.data.item.id, value);
    } else {
      this.merchantSvc.createMerchant(value);
    }
    this.dialogRef.close(true);
  }
}
