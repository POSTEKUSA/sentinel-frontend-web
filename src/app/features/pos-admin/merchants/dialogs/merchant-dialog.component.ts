import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { Merchant, MerchantStatus } from '../../../../core/models/pos-admin';
import { MerchantService } from '../../../../core/services/pos-admin/merchant.service';

export interface MerchantDialogData {
  item?: Merchant;
}

@Component({
  selector: 'app-merchant-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="cf-modal">
      <div class="modal-head">
        <span class="modal-title">{{ data.item ? 'Editar comercio' : 'Nuevo registro' }}</span>
        <button type="button" class="modal-close" aria-label="Cerrar" (click)="dialogRef.close()">&times;</button>
      </div>

      <form [formGroup]="form" class="modal-body" (ngSubmit)="save()">
        <div class="grid-2">
          <div class="field">
            <label for="affiliateCode">Código de afiliado</label>
            <input id="affiliateCode" formControlName="affiliateCode" autocomplete="off" spellcheck="false" />
          </div>
          <div class="field">
            <label for="tradeName">Nombre comercial</label>
            <input id="tradeName" formControlName="tradeName" autocomplete="organization" />
          </div>
          <div class="field">
            <label for="mcc">MCC</label>
            <input id="mcc" formControlName="mcc" placeholder="5411…" autocomplete="off" spellcheck="false" />
          </div>
          <div class="field">
            <label for="mccDescription">Categoría (MCC)</label>
            <input id="mccDescription" formControlName="mccDescription" placeholder="Supermercados…" />
          </div>
          <div class="field">
            <label for="department">Departamento</label>
            <input id="department" formControlName="department" />
          </div>
          <div class="field">
            <label for="municipality">Municipio</label>
            <input id="municipality" formControlName="municipality" />
          </div>
        </div>

        <div class="field">
          <label for="address">Dirección</label>
          <input id="address" formControlName="address" autocomplete="street-address" />
        </div>

        <div class="grid-2">
          <div class="field">
            <label for="status">Estado</label>
            <select id="status" formControlName="status">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          <div class="field">
            <label for="responsibleName">Técnico/ejecutivo responsable</label>
            <input id="responsibleName" formControlName="responsibleName" autocomplete="name" />
          </div>
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
