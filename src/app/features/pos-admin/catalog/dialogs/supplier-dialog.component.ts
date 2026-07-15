import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Supplier, SupplierStatus } from '../../../../core/models/pos-admin';
import { PosCatalogService } from '../../../../core/services/pos-admin/pos-catalog.service';

export interface SupplierDialogData {
  item?: Supplier;
}

@Component({
  selector: 'app-supplier-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="cf-modal">
      <div class="modal-head">
        <span class="modal-title">{{ data.item ? 'Editar proveedor' : 'Nuevo registro' }}</span>
        <button type="button" class="modal-close" aria-label="Cerrar" (click)="dialogRef.close()">&times;</button>
      </div>
      <form [formGroup]="form" class="modal-body" (ngSubmit)="save()">
        <div class="field">
          <label for="name">Nombre del proveedor</label>
          <input id="name" formControlName="name" autocomplete="organization" />
        </div>
        <div class="grid-2">
          <div class="field">
            <label for="country">País</label>
            <input id="country" formControlName="country" autocomplete="country-name" />
          </div>
          <div class="field">
            <label for="status">Estado</label>
            <select id="status" formControlName="status">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          <div class="field">
            <label for="contactName">Contacto</label>
            <input id="contactName" formControlName="contactName" autocomplete="name" />
          </div>
          <div class="field">
            <label for="phone">Teléfono</label>
            <input id="phone" formControlName="phone" type="tel" autocomplete="tel" />
          </div>
        </div>
        <div class="field">
          <label for="email">Correo</label>
          <input id="email" formControlName="email" type="email" autocomplete="email" spellcheck="false" />
        </div>
        <div class="field">
          <label for="suppliedBrandsText">Marcas suministradas (separadas por coma)</label>
          <input id="suppliedBrandsText" formControlName="suppliedBrandsText" placeholder="PAX, Sunmi…" autocomplete="off" />
        </div>
        <div class="field">
          <label for="suppliedModelsText">Modelos suministrados (separados por coma)</label>
          <input id="suppliedModelsText" formControlName="suppliedModelsText" placeholder="PAX A920…" autocomplete="off" />
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
    return (text ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
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
