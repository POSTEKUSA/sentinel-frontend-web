import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Supplier, SupplierStatus } from '../../../../core/models/pos-admin';
import { PosCatalogService } from '../../../../core/services/pos-admin/pos-catalog.service';

export interface SupplierDialogData {
  item?: Supplier;
}

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatChipsModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.item ? 'Editar' : 'Nuevo' }} proveedor</h2>
    <mat-dialog-content class="admin-form-dialog">
      <form [formGroup]="form" class="admin-form-grid">
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Nombre del proveedor</mat-label>
          <input matInput formControlName="name">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>País</mat-label>
          <input matInput formControlName="country">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option value="active">Activo</mat-option>
            <mat-option value="inactive">Inactivo</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Contacto</mat-label>
          <input matInput formControlName="contactName">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Teléfono</mat-label>
          <input matInput formControlName="phone">
        </mat-form-field>
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Correo</mat-label>
          <input matInput formControlName="email" type="email">
        </mat-form-field>
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Marcas suministradas (separadas por coma)</mat-label>
          <input matInput formControlName="suppliedBrandsText" placeholder="PAX, Sunmi">
        </mat-form-field>
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Modelos suministrados (separados por coma)</mat-label>
          <input matInput formControlName="suppliedModelsText" placeholder="PAX A920, Sunmi V2 Pro">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `,
})
export class SupplierDialogComponent {
  dialogRef = inject<MatDialogRef<SupplierDialogComponent, boolean>>(MatDialogRef);
  data = inject<SupplierDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private catalogSvc = inject(PosCatalogService);

  form = this.fb.group({
    name: [this.data.item?.name ?? '', Validators.required],
    country: [this.data.item?.country ?? '', Validators.required],
    contactName: [this.data.item?.contactName ?? ''],
    phone: [this.data.item?.phone ?? ''],
    email: [this.data.item?.email ?? '', Validators.email],
    status: [this.data.item?.status ?? ('active' as SupplierStatus), Validators.required],
    suppliedBrandsText: [(this.data.item?.suppliedBrands ?? []).join(', ')],
    suppliedModelsText: [(this.data.item?.suppliedModels ?? []).join(', ')],
  });

  private toList(text: string | null | undefined): string[] {
    return (text ?? '').split(',').map(s => s.trim()).filter(Boolean);
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const payload = {
      name: value.name!,
      country: value.country!,
      contactName: value.contactName ?? '',
      phone: value.phone ?? '',
      email: value.email ?? '',
      status: value.status!,
      suppliedBrands: this.toList(value.suppliedBrandsText),
      suppliedModels: this.toList(value.suppliedModelsText),
    };

    if (this.data.item) {
      this.catalogSvc.updateSupplier(this.data.item.id, payload);
    } else {
      this.catalogSvc.createSupplier(payload);
    }
    this.dialogRef.close(true);
  }
}
