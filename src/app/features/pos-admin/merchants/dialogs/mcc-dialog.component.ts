import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MccCode, MccStatus } from '../../../../core/models/pos-admin';
import { MccCatalogService } from '../../../../core/services/pos-admin/mcc-catalog.service';
import {
  StatusSwitchComponent,
  STATUS_ACTIVE_INACTIVE,
  StatusOption,
} from '../../../../shared/status-switch/status-switch.component';

export interface MccDialogData {
  item?: MccCode;
}

@Component({
  selector: 'app-mcc-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, StatusSwitchComponent],
  template: `
    <div class="cf-modal">
      <div class="modal-head">
        <span class="modal-title">{{ data.item ? 'Editar MCC' : 'Nuevo MCC' }}</span>
        <button type="button" class="modal-close" aria-label="Cerrar" (click)="dialogRef.close()">&times;</button>
      </div>
      <form [formGroup]="form" class="modal-body" (ngSubmit)="save()">
        <div class="grid-2">
          <div class="field">
            <label for="code">Código MCC</label>
            <input id="code" formControlName="code" placeholder="5411" autocomplete="off" spellcheck="false" />
          </div>
          <div class="field">
            <label>Estado</label>
            <app-status-switch formControlName="status" [options]="statusOptions" ariaLabel="Estado del MCC" />
          </div>
        </div>
        <div class="field">
          <label for="description">Descripción / categoría</label>
          <input id="description" formControlName="description" placeholder="Supermercados…" autocomplete="off" />
        </div>
        @if (duplicateError) {
          <p class="dialog-error">Ya existe un MCC con este código.</p>
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
export class MccDialogComponent {
  readonly statusOptions: StatusOption[] = STATUS_ACTIVE_INACTIVE;
  duplicateError = false;

  dialogRef = inject<MatDialogRef<MccDialogComponent, boolean>>(MatDialogRef);
  data = inject<MccDialogData>(MAT_DIALOG_DATA);
  private fb = inject(FormBuilder);
  private mccSvc = inject(MccCatalogService);

  form = this.fb.group({
    code: [this.data.item?.code ?? '', [Validators.required, Validators.pattern(/^\d{4}$/)]],
    description: [this.data.item?.description ?? '', Validators.required],
    status: [this.data.item?.status ?? ('active' as MccStatus), Validators.required],
  });

  save(): void {
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const code = (value.code ?? '').trim();

    if (this.mccSvc.existsCode(code, this.data.item?.id)) {
      this.duplicateError = true;
      return;
    }

    const payload = {
      code,
      description: (value.description ?? '').trim(),
      status: (value.status as MccStatus) || 'active',
    };

    if (this.data.item) {
      this.mccSvc.update(this.data.item.id, payload);
    } else {
      this.mccSvc.create(payload);
    }
    this.dialogRef.close(true);
  }
}
