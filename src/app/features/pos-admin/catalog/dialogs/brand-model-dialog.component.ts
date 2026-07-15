import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CatalogStatus, POS_TYPES, PosCatalogItem } from '../../../../core/models/pos-admin';
import { PosCatalogService } from '../../../../core/services/pos-admin/pos-catalog.service';

export interface BrandModelDialogData {
  item?: PosCatalogItem;
}

@Component({
  selector: 'app-brand-model-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="cf-modal">
      <div class="modal-head">
        <span class="modal-title">{{ data.item ? 'Editar marca/modelo' : 'Nuevo registro' }}</span>
        <button type="button" class="modal-close" aria-label="Cerrar" (click)="dialogRef.close()">&times;</button>
      </div>
      <form [formGroup]="form" class="modal-body" (ngSubmit)="save()">
        <div class="grid-2">
          <div class="field">
            <label for="brand">Marca</label>
            <input id="brand" formControlName="brand" placeholder="PAX, Sunmi…" autocomplete="off" spellcheck="false" />
          </div>
          <div class="field">
            <label for="model">Modelo</label>
            <input id="model" formControlName="model" placeholder="A920…" autocomplete="off" spellcheck="false" />
          </div>
          <div class="field">
            <label for="posType">Tipo de POS</label>
            <select id="posType" formControlName="posType">
              @for (t of posTypes; track t) {
                <option [value]="t">{{ t }}</option>
              }
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
        </div>
        <div class="field">
          <label for="description">Descripción</label>
          <textarea id="description" formControlName="description" rows="2"></textarea>
        </div>
        @if (duplicateError) {
          <p class="dialog-error">Ya existe un registro con esta marca y modelo.</p>
        }
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="dialogRef.close()">Cancelar</button>
          <button type="submit" class="btn-primary" [disabled]="form.invalid">
            {{ data.item ? 'Guardar' : 'Crear' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`.dialog-error { color: #c62828; font-size: 12px; margin: 0 0 12px; }`],
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
