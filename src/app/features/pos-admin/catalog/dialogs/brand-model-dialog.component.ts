import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CatalogStatus, POS_TYPES, PosCatalogItem } from '../../../../core/models/pos-admin';
import { PosCatalogService } from '../../../../core/services/pos-admin/pos-catalog.service';

export interface BrandModelDialogData {
  item?: PosCatalogItem;
}

@Component({
  selector: 'app-brand-model-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.item ? 'Editar' : 'Nuevo' }} marca / modelo de POS</h2>
    <mat-dialog-content class="admin-form-dialog">
      <form [formGroup]="form" class="admin-form-grid">
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Marca</mat-label>
          <input matInput formControlName="brand" placeholder="PAX, Sunmi, Ingenico...">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Modelo</mat-label>
          <input matInput formControlName="model" placeholder="A920, V2 Pro...">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Tipo de POS</mat-label>
          <mat-select formControlName="posType">
            @for (t of posTypes; track t) {
              <mat-option [value]="t">{{ t }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option value="active">Activo</mat-option>
            <mat-option value="obsolete">Obsoleto</mat-option>
            <mat-option value="discontinued">Descontinuado</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Descripción</mat-label>
          <textarea matInput formControlName="description" rows="2"></textarea>
        </mat-form-field>
      </form>
      @if (duplicateError) {
        <p class="dialog-error">Ya existe un registro con esta marca y modelo.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`.dialog-error { color: #c62828; font-size: 12px; margin: 8px 0 0; }`],
})
export class BrandModelDialogComponent {
  posTypes = POS_TYPES;
  duplicateError = false;

  dialogRef = inject<MatDialogRef<BrandModelDialogComponent, boolean>>(MatDialogRef);
  data = inject<BrandModelDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private catalogSvc = inject(PosCatalogService);

  form = this.fb.group({
    brand: [this.data.item?.brand ?? '', Validators.required],
    model: [this.data.item?.model ?? '', Validators.required],
    posType: [this.data.item?.posType ?? POS_TYPES[0], Validators.required],
    status: [this.data.item?.status ?? ('active' as CatalogStatus), Validators.required],
    description: [this.data.item?.description ?? ''],
  });

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();

    if (this.catalogSvc.existsBrandModel(value.brand!, value.model!, this.data.item?.id)) {
      this.duplicateError = true;
      return;
    }

    if (this.data.item) {
      this.catalogSvc.updateCatalogItem(this.data.item.id, value as Partial<PosCatalogItem>);
    } else {
      this.catalogSvc.createCatalogItem(value as Omit<PosCatalogItem, 'id' | 'createdAt' | 'createdBy'>);
    }
    this.dialogRef.close(true);
  }
}
