import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { AccessoryCatalogItem, AccessoryCategory, CatalogStatus } from '../../../../core/models/pos-admin';
import { PosCatalogService } from '../../../../core/services/pos-admin/pos-catalog.service';

export interface AccessoryDialogData {
  item?: AccessoryCatalogItem;
}

@Component({
  selector: 'app-accessory-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.item ? 'Editar' : 'Nuevo' }} accesorio / consumible</h2>
    <mat-dialog-content class="admin-form-dialog">
      <form [formGroup]="form" class="admin-form-grid">
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Tipo de accesorio/consumible</mat-label>
          <input matInput formControlName="type" placeholder="Rollo de papel térmico, batería...">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Categoría</mat-label>
          <mat-select formControlName="category">
            <mat-option value="accessory">Accesorio</mat-option>
            <mat-option value="consumable">Consumible</mat-option>
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
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Marca/modelo compatible</mat-label>
          <input matInput formControlName="compatibleBrandModel" placeholder="Universal, PAX A920...">
        </mat-form-field>
        <mat-form-field class="admin-form-field" appearance="outline">
          <mat-label>Unidad de medida</mat-label>
          <input matInput formControlName="unitOfMeasure" placeholder="Unidad, rollo, caja...">
        </mat-form-field>
        <mat-form-field class="admin-form-field full-width" appearance="outline">
          <mat-label>Stock mínimo</mat-label>
          <input matInput type="number" min="0" formControlName="minStock">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `,
})
export class AccessoryDialogComponent {
  dialogRef = inject<MatDialogRef<AccessoryDialogComponent, boolean>>(MatDialogRef);
  data = inject<AccessoryDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private catalogSvc = inject(PosCatalogService);

  form = this.fb.group({
    type: [this.data.item?.type ?? '', Validators.required],
    category: [this.data.item?.category ?? ('accessory' as AccessoryCategory), Validators.required],
    status: [this.data.item?.status ?? ('active' as CatalogStatus), Validators.required],
    compatibleBrandModel: [this.data.item?.compatibleBrandModel ?? 'Universal', Validators.required],
    unitOfMeasure: [this.data.item?.unitOfMeasure ?? 'Unidad', Validators.required],
    minStock: [this.data.item?.minStock ?? 0, [Validators.required, Validators.min(0)]],
  });

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue() as Omit<AccessoryCatalogItem, 'id'>;

    if (this.data.item) {
      this.catalogSvc.updateAccessory(this.data.item.id, value);
    } else {
      this.catalogSvc.createAccessory(value);
    }
    this.dialogRef.close(true);
  }
}
