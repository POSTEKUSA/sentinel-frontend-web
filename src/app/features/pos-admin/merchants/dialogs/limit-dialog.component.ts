import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { LimitStatus, TransactionLimit } from '../../../../core/models/pos-admin';
import { LimitCatalogService } from '../../../../core/services/pos-admin/limit-catalog.service';
import {
  StatusSwitchComponent,
  STATUS_ACTIVE_INACTIVE,
  StatusOption,
} from '../../../../shared/status-switch/status-switch.component';

export interface LimitDialogData {
  item?: TransactionLimit;
}

@Component({
  selector: 'app-limit-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, StatusSwitchComponent],
  template: `
    <div class="cf-modal">
      <div class="modal-head">
        <span class="modal-title">{{ data.item ? 'Editar límite' : 'Nuevo límite' }}</span>
        <button type="button" class="modal-close" aria-label="Cerrar" (click)="dialogRef.close()">&times;</button>
      </div>
      <form [formGroup]="form" class="modal-body" (ngSubmit)="save()">
        <div class="grid-2">
          <div class="field">
            <label for="code">Código</label>
            <input id="code" formControlName="code" placeholder="L1" autocomplete="off" spellcheck="false" />
          </div>
          <div class="field">
            <label for="name">Nombre</label>
            <input id="name" formControlName="name" placeholder="Básico…" autocomplete="off" />
          </div>
          <div class="field">
            <label for="maxAmount">Monto máximo</label>
            <input id="maxAmount" type="number" formControlName="maxAmount" min="0" step="1" placeholder="5000" />
          </div>
          <div class="field">
            <label>Estado</label>
            <app-status-switch formControlName="status" [options]="statusOptions" ariaLabel="Estado del límite" />
          </div>
        </div>
        <div class="field">
          <label for="description">Descripción</label>
          <input id="description" formControlName="description" placeholder="Uso / perfil…" autocomplete="off" />
        </div>
        @if (duplicateError) {
          <p class="dialog-error">Ya existe un límite con este código.</p>
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
export class LimitDialogComponent {
  readonly statusOptions: StatusOption[] = STATUS_ACTIVE_INACTIVE;
  duplicateError = false;

  dialogRef = inject<MatDialogRef<LimitDialogComponent, boolean>>(MatDialogRef);
  data = inject<LimitDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private limitSvc = inject(LimitCatalogService);

  form = this.fb.group({
    code: [this.data.item?.code ?? '', [Validators.required, Validators.pattern(/^[A-Za-z0-9_-]{1,10}$/)]],
    name: [this.data.item?.name ?? '', Validators.required],
    maxAmount: [this.data.item?.maxAmount ?? null as number | null],
    description: [this.data.item?.description ?? ''],
    status: [this.data.item?.status ?? ('active' as LimitStatus), Validators.required],
  });

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const code = (value.code ?? '').trim().toUpperCase();

    if (this.limitSvc.existsCode(code, this.data.item?.id)) {
      this.duplicateError = true;
      return;
    }

    const maxRaw = value.maxAmount;
    const maxAmount =
      maxRaw === null || maxRaw === undefined || maxRaw === ('' as unknown)
        ? undefined
        : Number(maxRaw);

    const payload: Omit<TransactionLimit, 'id'> = {
      code,
      name: (value.name ?? '').trim(),
      maxAmount: maxAmount != null && !Number.isNaN(maxAmount) ? maxAmount : undefined,
      description: (value.description ?? '').trim() || undefined,
      status: (value.status as LimitStatus) || 'active',
    };

    if (this.data.item) {
      this.limitSvc.update(this.data.item.id, payload);
    } else {
      this.limitSvc.create(payload);
    }
    this.dialogRef.close(true);
  }
}
