import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WarehouseService } from '../../../core/services/pmt/warehouse.service';
import { CopyableCodeComponent } from '../../../shared/copyable-code/copyable-code.component';
import {
  StatusSwitchComponent,
  STATUS_ACTIVE_INACTIVE,
  StatusOption,
} from '../../../shared/status-switch/status-switch.component';
import {
  StatusTagComponent,
  STATUS_TAG_ACTIVE_INACTIVE,
  StatusTagOption,
} from '../../../shared/status-tag/status-tag.component';
import {
  Warehouse,
  WarehouseStatus,
} from '../../../core/models/pmt/warehouse.model';
import { CIUDADES_POR_PAIS, PAISES, ZONAS_DEFAULT } from '../../../core/constants/geo.constants';

@Component({
  selector: 'app-pmt-bodega',
  standalone: true,
  imports: [CopyableCodeComponent, StatusSwitchComponent, StatusTagComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './pmt-bodega.component.html',
  styleUrl: './pmt-bodega.component.css',
})
export class PmtBodegaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(WarehouseService);

  all: Warehouse[] = [];
  filtered: Warehouse[] = [];
  ciudades: string[] = [];
  openMenuId: string | null = null;

  readonly paises = PAISES;
  readonly zonasDefault = ZONAS_DEFAULT;
  readonly statusOptions: StatusOption[] = STATUS_ACTIVE_INACTIVE;
  readonly statusTagOptions: StatusTagOption[] = STATUS_TAG_ACTIVE_INACTIVE;

  filterForm = this.fb.group({
    q: [''],
    pais: [''],
    zona: [''],
    status: [''],
  });

  showForm = false;
  editId: number | null = null;
  formError = '';
  deleteTarget: Warehouse | null = null;

  formData = this.fb.group({
    codigo: [''],
    nombre: ['', Validators.required],
    pais: ['Honduras', Validators.required],
    ciudad: ['', Validators.required],
    zona: ['', Validators.required],
    direccion: [''],
    status: ['active' as WarehouseStatus, Validators.required],
  });

  ngOnInit(): void {
    this.svc.warehouses$.subscribe(list => {
      this.all = list;
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
    this.formData.get('pais')!.valueChanges.subscribe(pais => {
      this.setCiudadesForPais(pais || '', { clearCiudad: true });
    });
    this.setCiudadesForPais('Honduras');
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuId = null;
  }

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId = this.openMenuId === id ? null : id;
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    const q = (f.q ?? '').toLowerCase().trim();
    this.filtered = this.all.filter(w => {
      if (q && ![w.codigo, w.nombre, w.ciudad, w.zona, w.direccion]
        .some(v => (v ?? '').toLowerCase().includes(q))) return false;
      if (f.pais && w.pais !== f.pais) return false;
      if (f.zona && w.zona !== f.zona) return false;
      if (f.status && w.status !== f.status) return false;
      return true;
    });
  }

  clearFilters(): void {
    this.filterForm.reset({ q: '', pais: '', zona: '', status: '' });
  }

  get hasFilters(): boolean {
    const f = this.filterForm.getRawValue();
    return !!(f.q || f.pais || f.zona || f.status);
  }

  get zonasOpciones(): string[] {
    const fromData = this.all.map(w => w.zona).filter(Boolean);
    return [...new Set([...ZONAS_DEFAULT, ...fromData])].sort();
  }

  private setCiudadesForPais(pais: string, opts?: { clearCiudad?: boolean; keepCiudad?: string }): void {
    const list = [...(CIUDADES_POR_PAIS[pais] ?? [])];
    if (opts?.keepCiudad?.trim() && !list.includes(opts.keepCiudad)) {
      list.unshift(opts.keepCiudad);
    }
    this.ciudades = list;
    if (opts?.clearCiudad) {
      this.formData.patchValue({ ciudad: '' }, { emitEvent: false });
    }
  }

  openCreate(): void {
    this.editId = null;
    this.formError = '';
    this.openMenuId = null;
    this.formData.reset({
      codigo: this.svc.nextCodigo(),
      nombre: '',
      pais: 'Honduras',
      ciudad: '',
      zona: '',
      direccion: '',
      status: 'active',
    });
    this.setCiudadesForPais('Honduras');
    this.showForm = true;
  }

  openEdit(w: Warehouse, event?: Event): void {
    event?.stopPropagation();
    this.openMenuId = null;
    this.editId = w.id;
    this.formError = '';
    this.setCiudadesForPais(w.pais, { keepCiudad: w.ciudad });
    this.formData.patchValue({
      codigo: w.codigo,
      nombre: w.nombre,
      pais: w.pais,
      ciudad: w.ciudad,
      zona: w.zona,
      direccion: w.direccion ?? '',
      status: w.status,
    }, { emitEvent: false });
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.editId = null;
    this.formError = '';
  }

  saveForm(): void {
    if (this.formData.invalid) {
      this.formError = 'Complete los campos requeridos.';
      this.formData.markAllAsTouched();
      return;
    }
    const v = this.formData.getRawValue();
    const codigo = (v.codigo || '').trim().toUpperCase();
    if (codigo && this.svc.isCodigoDuplicate(codigo, this.editId ?? undefined)) {
      this.formError = `El código "${codigo}" ya existe.`;
      return;
    }

    const payload = {
      nombre: v.nombre!.trim(),
      pais: v.pais || 'Honduras',
      ciudad: v.ciudad!,
      zona: v.zona!,
      direccion: v.direccion?.trim() || undefined,
      status: (v.status as WarehouseStatus) || 'active',
    };

    if (this.editId === null) {
      this.svc.create({ ...payload, codigo: codigo || undefined });
    } else {
      this.svc.update(this.editId, { ...payload, codigo: codigo || undefined });
    }
    this.closeForm();
  }

  askDelete(w: Warehouse, event?: Event): void {
    event?.stopPropagation();
    this.openMenuId = null;
    this.deleteTarget = w;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.svc.delete(this.deleteTarget.id);
    this.deleteTarget = null;
  }
}
