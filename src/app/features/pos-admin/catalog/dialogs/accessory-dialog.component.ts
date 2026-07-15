import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AccessoryCatalogItem, AccessoryCategory, CatalogStatus } from '../../../../core/models/pos-admin';
import { PosCatalogService } from '../../../../core/services/pos-admin/pos-catalog.service';

export interface AccessoryDialogData {
  item?: AccessoryCatalogItem;
}

@Component({
  selector: 'app-accessory-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="cf-modal">
      <div class="modal-head">
        <span class="modal-title">{{ data.item ? 'Editar accesorio' : 'Nuevo registro' }}</span>
        <button type="button" class="modal-close" aria-label="Cerrar" (click)="dialogRef.close()">&times;</button>
      </div>
      <form [formGroup]="form" class="modal-body" (ngSubmit)="save()">
        <div class="field">
          <label for="type">Tipo de accesorio/consumible</label>
          <input id="type" formControlName="type" placeholder="Rollo de papel térmico…" autocomplete="off" />
        </div>
        <div class="grid-2">
          <div class="field">
            <label for="category">Categoría</label>
            <select id="category" formControlName="category">
              <option value="accessory">Accesorio</option>
              <option value="consumable">Consumible</option>
            </select>
          </div>
          <div class="field">
            <label for="status">Estado</label>
            <select id="status" formControlName="status">
              <option value="active">Activo</option>
              <option value="obsolete">Obsoleto</option>
              <option value="discontinued">Descontinuado</option>
            </select>
          </div>
          <div class="field">
            <label for="compatibleBrandModel">Marca/modelo compatible</label>
            <input id="compatibleBrandModel" formControlName="compatibleBrandModel" placeholder="Universal…" autocomplete="off" />
          </div>
          <div class="field">
            <label for="unitOfMeasure">Unidad de medida</label>
            <input id="unitOfMeasure" formControlName="unitOfMeasure" placeholder="Unidad, rollo…" autocomplete="off" />
          </div>
        </div>
        <div class="field">
          <label for="minStock">Stock mínimo</label>
          <input id="minStock" type="number" min="0" formControlName="minStock" inputmode="numeric" />
        </div>
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid">
            {{ data.item ? 'Guardar' : 'Crear' }}
          </button>
        </div>
      </form>
    </div>
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
