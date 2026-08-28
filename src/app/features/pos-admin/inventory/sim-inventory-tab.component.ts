import { Component, EventEmitter, HostListener, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { SimCard, SimCardEstado, SIM_CARD_ESTADO_BADGE, SIM_CARD_ESTADO_LABELS } from '../../../core/models/pmt/sim-card.model';
import { PmtSimCardService } from '../../../core/services/pmt/pmt-sim-card.service';
import { EmptyStateComponent } from '../../../shared/empty-state/empty-state.component';
import { CopyableCodeComponent } from '../../../shared/copyable-code/copyable-code.component';
import { UserNamePipe } from '../../../shared/pipes/user-name.pipe';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';
import { InventoryTabSummary } from './part-inventory-tab.component';

@Component({
  selector: 'app-sim-inventory-tab',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EmptyStateComponent, CopyableCodeComponent, UserNamePipe],
  templateUrl: './sim-inventory-tab.component.html',
  styleUrl: './sim-inventory-tab.component.css',
})
export class SimInventoryTabComponent implements OnInit {
  @Output() summaryChange = new EventEmitter<InventoryTabSummary>();

  estadoLabels = SIM_CARD_ESTADO_LABELS;
  estadoBadge = SIM_CARD_ESTADO_BADGE;
  estadoKeys = Object.keys(SIM_CARD_ESTADO_LABELS) as SimCardEstado[];
  companias = ['Claro', 'Tigo', 'Postek'];

  all: SimCard[] = [];
  filtered: SimCard[] = [];

  openMenuId: string | null = null;
  showForm = false;
  editId: number | null = null;
  formError = '';

  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private simSvc = inject(PmtSimCardService);

  filterForm = this.fb.group({
    q: [''],
    estado: [''],
    compania: [''],
  });

  formData = this.fb.group({
    iccid: ['', Validators.required],
    numero: [''],
    compania: ['Claro', Validators.required],
    estado: ['disponible' as SimCardEstado, Validators.required],
    terminalSerie: [''],
    posInventoryCode: [''],
    apn: [''],
    ip: [''],
    notes: [''],
  });

  ngOnInit(): void {
    this.simSvc.simCards$.subscribe(list => {
      this.all = list;
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    const q = (f.q ?? '').toLowerCase().trim();
    this.filtered = this.all.filter(s => {
      if (f.estado && s.estado !== f.estado) return false;
      if (f.compania && s.compania !== f.compania) return false;
      if (!q) return true;
      return (
        s.iccid.toLowerCase().includes(q) ||
        s.inventoryCode.toLowerCase().includes(q) ||
        (s.numero ?? '').toLowerCase().includes(q) ||
        (s.terminalSerie ?? '').toLowerCase().includes(q) ||
        (s.posInventoryCode ?? '').toLowerCase().includes(q)
      );
    });
    this.summaryChange.emit({ filtered: this.filtered.length, total: this.all.length });
  }

  clearFilters(): void {
    this.filterForm.reset({ q: '', estado: '', compania: '' });
  }

  get hasActiveFilters(): boolean {
    const f = this.filterForm.getRawValue();
    return !!(f.q || f.estado || f.compania);
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuId = null;
  }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  openCreate(): void {
    this.editId = null;
    this.formError = '';
    this.formData.reset({
      iccid: '',
      numero: '',
      compania: 'Claro',
      estado: 'disponible',
      terminalSerie: '',
      posInventoryCode: '',
      apn: '',
      ip: '',
      notes: '',
    });
    this.showForm = true;
  }

  openEdit(s: SimCard): void {
    this.editId = s.id;
    this.formError = '';
    this.formData.patchValue({
      iccid: s.iccid,
      numero: s.numero ?? '',
      compania: s.compania,
      estado: s.estado,
      terminalSerie: s.terminalSerie ?? '',
      posInventoryCode: s.posInventoryCode ?? '',
      apn: s.apn ?? '',
      ip: s.ip ?? '',
      notes: s.notes ?? '',
    });
    this.showForm = true;
  }

  saveForm(): void {
    if (this.formData.invalid) {
      this.formError = 'ICCID y compañía son requeridos.';
      this.formData.markAllAsTouched();
      return;
    }
    const v = this.formData.getRawValue();
    const iccid = v.iccid!.trim();
    const dup = this.all.find(s => s.iccid === iccid && s.id !== this.editId);
    if (dup) {
      this.formError = `ICCID "${iccid}" ya existe.`;
      return;
    }

    const payload = {
      iccid,
      numero: v.numero?.trim() || undefined,
      compania: v.compania!,
      estado: v.estado as SimCardEstado,
      terminalSerie: v.terminalSerie?.trim() || undefined,
      posInventoryCode: v.posInventoryCode?.trim() || undefined,
      apn: v.apn?.trim() || undefined,
      ip: v.ip?.trim() || undefined,
      notes: v.notes?.trim() || undefined,
    };

    if (this.editId === null) {
      this.simSvc.create(payload);
    } else {
      this.simSvc.update(this.editId, payload);
    }
    this.showForm = false;
  }

  askDelete(s: SimCard): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        panelClass: 'cf-dialog-panel',
        data: {
          title: 'Confirmar eliminación',
          message: `¿Eliminar SIM ${s.inventoryCode} (${s.iccid}) del inventario?`,
          danger: true,
          confirmLabel: 'Eliminar',
        },
      })
      .afterClosed()
      .subscribe(ok => {
        if (ok) this.simSvc.delete(s.id);
      });
  }
}
