import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { AccessoryCatalogItem, AccessoryCategory, CatalogStatus } from '../../../../core/models/pos-admin';
import { PosCatalogService } from '../../../../core/services/pos-admin/pos-catalog.service';
import {
  StatusSwitchComponent,
  STATUS_CATALOG,
  StatusOption,
} from '../../../../shared/status-switch/status-switch.component';

export interface AccessoryDialogData {
  item?: AccessoryCatalogItem;
  /** Categoría fija al crear desde un tab específico */
  defaultCategory?: AccessoryCategory;
  lockCategory?: boolean;
}

@Component({
  selector: 'app-accessory-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, StatusSwitchComponent],
  template: `
    <div class="cf-modal">
      <div class="modal-head">
        <span class="modal-title">{{ dialogTitle }}</span>
        <button type="button" class="modal-close" aria-label="Cerrar" (click)="dialogRef.close()">&times;</button>
      </div>
      <form [formGroup]="form" class="modal-body" (ngSubmit)="save()">
        <div class="field">
          <label for="type">Tipo</label>
          <input id="type" formControlName="type" [placeholder]="typePlaceholder" autocomplete="off" />
        </div>
        <div class="grid-2">
          @if (!data.lockCategory) {
            <div class="field">
              <label for="category">Categoría</label>
              <select id="category" formControlName="category">
                <option value="accessory">Accesorio</option>
                <option value="consumable">Consumible</option>
              </select>
            </div>
          }
          <div class="field">
            <label>Estado</label>
            <app-status-switch formControlName="status" [options]="statusOptions" ariaLabel="Estado" />
          </div>
          <div class="field">
            <label for="unitOfMeasure">Unidad de medida</label>
            <input id="unitOfMeasure" formControlName="unitOfMeasure" placeholder="Unidad, rollo…" autocomplete="off" />
          </div>
          <div class="field">
            <label for="minStock">Stock mínimo</label>
            <input id="minStock" type="number" min="0" formControlName="minStock" inputmode="numeric" />
          </div>
        </div>
        @if (data.item?.inventoryCode) {
          <div class="field">
            <label>Código de inventario</label>
            <input [value]="data.item!.inventoryCode" disabled />
          </div>
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
})
export class AccessoryDialogComponent {
  dialogRef = inject<MatDialogRef<AccessoryDialogComponent, boolean>>(MatDialogRef);
  data = inject<AccessoryDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private catalogSvc = inject(PosCatalogService);

  readonly statusOptions: StatusOption[] = STATUS_CATALOG;

  form = this.fb.group({
    type: [this.data.item?.type ?? '', Validators.required],
    category: [
      this.data.item?.category ?? this.data.defaultCategory ?? ('accessory' as AccessoryCategory),
      Validators.required,
    ],
    status: [this.data.item?.status ?? ('active' as CatalogStatus), Validators.required],
    unitOfMeasure: [this.data.item?.unitOfMeasure ?? 'Unidad', Validators.required],
    minStock: [this.data.item?.minStock ?? 0, [Validators.required, Validators.min(0)]],
  });

  get dialogTitle(): string {
    const cat = this.form.value.category ?? this.data.defaultCategory ?? 'accessory';
    const noun = cat === 'consumable' ? 'consumible' : 'accesorio';
    return this.data.item ? `Editar ${noun}` : `Nuevo ${noun}`;
  }

  get typePlaceholder(): string {
    return this.form.value.category === 'consumable' ? 'Rollo de papel térmico…' : 'Cargador, funda…';
  }

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue() as Omit<AccessoryCatalogItem, 'id' | 'inventoryCode'>;

    if (this.data.item) {
      this.catalogSvc.updateAccessory(this.data.item.id, value);
    } else {
      this.catalogSvc.createAccessory(value);
    }
    this.dialogRef.close(true);
  }
}
