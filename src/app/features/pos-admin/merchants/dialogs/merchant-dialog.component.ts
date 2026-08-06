import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

import { Merchant, MerchantStatus } from '../../../../core/models/pos-admin';
import { MerchantService } from '../../../../core/services/pos-admin/merchant.service';
import { WarehouseService } from '../../../../core/services/pmt/warehouse.service';
import { Warehouse } from '../../../../core/models/pmt/warehouse.model';
import { CIUDADES_POR_PAIS, PAISES, ZONAS_DEFAULT } from '../../../../core/constants/geo.constants';
import {
  StatusSwitchComponent,
  STATUS_ACTIVE_INACTIVE,
  StatusOption,
} from '../../../../shared/status-switch/status-switch.component';

export interface MerchantDialogData {
  item?: Merchant;
}

@Component({
  selector: 'app-merchant-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, StatusSwitchComponent],
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

        <div class="grid-2">
          <div class="field">
            <label for="pais">País</label>
            <select id="pais" formControlName="pais">
              @for (p of paises; track p) {
                <option [value]="p">{{ p }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label for="ciudad">Ciudad</label>
            <select id="ciudad" formControlName="ciudad">
              <option value="">—</option>
              @for (c of ciudades; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label for="zona">Zona</label>
            <select id="zona" formControlName="zona">
              <option value="">—</option>
              @for (z of zonas; track z) {
                <option [value]="z">{{ z }}</option>
              }
            </select>
          </div>
          <div class="field">
            <label for="warehouseId">Bodega</label>
            <select id="warehouseId" formControlName="warehouseId">
              <option value="">— Sin bodega —</option>
              @for (w of warehouses; track w.id) {
                <option [value]="w.id">{{ w.codigo }} · {{ w.nombre }}</option>
              }
            </select>
          </div>
        </div>

        <div class="field">
          <label for="address">Dirección</label>
          <input id="address" formControlName="address" autocomplete="street-address" />
        </div>

        <div class="grid-2">
          <div class="field">
            <label>Estado</label>
            <app-status-switch formControlName="status" [options]="statusOptions" ariaLabel="Estado del comercio" />
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
  private warehouseSvc = inject(WarehouseService);

  readonly paises = PAISES;
  readonly zonas = ZONAS_DEFAULT;
  readonly statusOptions: StatusOption[] = STATUS_ACTIVE_INACTIVE;
  ciudades: string[] = [];
  warehouses: Warehouse[] = [];

  form = this.fb.group({
    affiliateCode: [this.data.item?.affiliateCode ?? '', Validators.required],
    tradeName: [this.data.item?.tradeName ?? '', Validators.required],
    mcc: [this.data.item?.mcc ?? '', Validators.required],
    mccDescription: [this.data.item?.mccDescription ?? '', Validators.required],
    department: [this.data.item?.department ?? '', Validators.required],
    municipality: [this.data.item?.municipality ?? '', Validators.required],
    address: [this.data.item?.address ?? ''],
    pais: [this.data.item?.pais ?? 'Honduras'],
    ciudad: [this.data.item?.ciudad ?? ''],
    zona: [this.data.item?.zona ?? ''],
    warehouseId: [this.data.item?.warehouseId != null ? String(this.data.item.warehouseId) : ''],
    status: [this.data.item?.status ?? ('active' as MerchantStatus), Validators.required],
    responsibleName: [this.data.item?.responsibleName ?? ''],
  });

  constructor() {
    this.warehouses = this.warehouseSvc.getActive();
    if (this.data.item?.warehouseId != null) {
      const current = this.warehouseSvc.getById(this.data.item.warehouseId);
      if (current && !this.warehouses.some(w => w.id === current.id)) {
        this.warehouses = [...this.warehouses, current];
      }
    }
    this.setCiudades(this.form.getRawValue().pais || 'Honduras', this.data.item?.ciudad);
    this.form.get('pais')!.valueChanges.subscribe(pais => {
      this.setCiudades(pais || '', undefined);
      this.form.patchValue({ ciudad: '' }, { emitEvent: false });
    });
    this.form.get('warehouseId')!.valueChanges.subscribe(raw => {
      const id = raw ? Number(raw) : null;
      if (id == null || Number.isNaN(id)) return;
      const w = this.warehouseSvc.getById(id);
      if (!w) return;
      this.setCiudades(w.pais, w.ciudad);
      this.form.patchValue({
        pais: w.pais,
        ciudad: w.ciudad,
        zona: w.zona,
      }, { emitEvent: false });
    });
  }

  private setCiudades(pais: string, keep?: string): void {
    const list = [...(CIUDADES_POR_PAIS[pais] ?? [])];
    if (keep?.trim() && !list.includes(keep)) list.unshift(keep);
    this.ciudades = list;
  }

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const warehouseId = v.warehouseId ? Number(v.warehouseId) : undefined;
    const value: Omit<Merchant, 'id' | 'createdAt'> = {
      affiliateCode: v.affiliateCode!,
      tradeName: v.tradeName!,
      mcc: v.mcc!,
      mccDescription: v.mccDescription!,
      department: v.department!,
      municipality: v.municipality!,
      address: v.address ?? '',
      pais: v.pais || 'Honduras',
      ciudad: v.ciudad || undefined,
      zona: v.zona || undefined,
      warehouseId: warehouseId != null && !Number.isNaN(warehouseId) ? warehouseId : undefined,
      status: (v.status as MerchantStatus) || 'active',
      responsibleName: v.responsibleName || undefined,
    };

    if (this.data.item) {
      this.merchantSvc.updateMerchant(this.data.item.id, value);
    } else {
      this.merchantSvc.createMerchant(value);
    }
    this.dialogRef.close(true);
  }
}
