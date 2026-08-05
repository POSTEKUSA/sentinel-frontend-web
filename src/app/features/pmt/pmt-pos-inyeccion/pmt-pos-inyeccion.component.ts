import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import {
  Terminal, QueryRecord,
  TERMINAL_ESTADO_LABELS, TERMINAL_ESTADO_BADGE,
} from '../../../core/models/pmt/terminal.model';

@Component({
  selector: 'app-pmt-pos-inyeccion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pmt-pos-inyeccion.component.html',
  styleUrl: './pmt-pos-inyeccion.component.css',
})
export class PmtPosInyeccionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PmtTerminalService);
  all: Terminal[] = [];
  filtered: Terminal[] = [];
  merchants: QueryRecord[] = [];
  selectedIds = new Set<number>();
  comment = '';
  showConfirm = false;
  readonly estadoLabels = TERMINAL_ESTADO_LABELS;
  readonly estadoBadge  = TERMINAL_ESTADO_BADGE;

  // Upload injection dialog
  uploadTarget: Terminal | null = null;
  selectedMerchantId: number | '' = '';
  jsonPreview = '';
  uploadFileName = '';
  uploadError = '';
  uploadSuccess = '';

  filterForm = this.fb.group({ q: [''] });

  ngOnInit(): void {
    this.svc.terminals$.subscribe(ts => {
      this.all = ts.filter(t => t.estado === 'en_inyeccion');
      this.applyFilters();
    });
    this.svc.queryRecords$.subscribe(list => {
      this.merchants = [...list].sort((a, b) => (a.comercio ?? '').localeCompare(b.comercio ?? ''));
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const q = (this.filterForm.value.q ?? '').toLowerCase().trim();
    this.filtered = q
      ? this.all.filter(t => [t.serie, t.modelo, t.zona, t.nombre].some(v => (v ?? '').toLowerCase().includes(q)))
      : [...this.all];
  }

  toggleSelect(id: number): void {
    if (this.selectedIds.has(id)) this.selectedIds.delete(id);
    else this.selectedIds.add(id);
    this.selectedIds = new Set(this.selectedIds);
  }
  toggleAll(): void {
    this.selectedIds = this.selectedIds.size === this.filtered.length
      ? new Set() : new Set(this.filtered.map(t => t.id));
  }
  get allSelected(): boolean { return this.filtered.length > 0 && this.selectedIds.size === this.filtered.length; }

  marcarSalida(): void {
    [...this.selectedIds].forEach(id => this.svc.changeEstado(id, 'asignado_supervisor', this.comment || 'Salida de inyección'));
    this.selectedIds = new Set();
    this.comment = '';
    this.showConfirm = false;
  }

  // ── Subir archivo de inyección ───────────────────────────────────────────

  openUpload(t: Terminal): void {
    this.uploadTarget = t;
    this.selectedMerchantId = '';
    this.jsonPreview = '';
    this.uploadFileName = '';
    this.uploadError = '';
    this.uploadSuccess = '';
  }

  closeUpload(): void {
    this.uploadTarget = null;
    this.uploadError = '';
    this.uploadSuccess = '';
  }

  onMerchantChange(): void {
    if (!this.uploadTarget || this.selectedMerchantId === '') {
      this.jsonPreview = '';
      return;
    }
    const merchant = this.merchants.find(m => m.id === this.selectedMerchantId);
    if (!merchant) return;
    const payload = this.svc.buildInjectionPayload(this.uploadTarget.serie, merchant);
    this.jsonPreview = JSON.stringify(payload, null, 2);
    this.uploadFileName = '';
    this.uploadError = '';
  }

  downloadExampleJson(): void {
    if (!this.jsonPreview || !this.uploadTarget) return;
    const blob = new Blob([this.jsonPreview], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inyeccion_${this.uploadTarget.serie}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.uploadFileName = file.name;
    this.uploadError = '';
    this.uploadSuccess = '';
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? '');
        const parsed = JSON.parse(text) as Record<string, unknown>;
        const normalized: Record<string, string> = {};
        for (const [k, v] of Object.entries(parsed)) {
          if (v != null) normalized[k] = String(v);
        }
        this.jsonPreview = JSON.stringify(normalized, null, 2);
        if (normalized['codigo'] || normalized['comercio']) {
          const match = this.merchants.find(m =>
            (normalized['codigo'] && m.codigo === normalized['codigo']) ||
            (normalized['comercio'] && m.comercio === normalized['comercio'])
          );
          if (match) this.selectedMerchantId = match.id;
        }
      } catch {
        this.uploadError = 'Archivo JSON inválido.';
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  confirmUpload(): void {
    if (!this.uploadTarget || !this.jsonPreview) {
      this.uploadError = 'Seleccione un merchant o suba un archivo JSON.';
      return;
    }
    let payload: Record<string, string>;
    try {
      payload = JSON.parse(this.jsonPreview) as Record<string, string>;
    } catch {
      this.uploadError = 'JSON inválido.';
      return;
    }
    const result = this.svc.applyInjectionFile(this.uploadTarget.id, payload, {
      fileName: this.uploadFileName || `inyeccion_${this.uploadTarget.serie}.json`,
    });
    if (!result.ok) {
      this.uploadError = result.message;
      return;
    }
    this.uploadSuccess = `Inyección aplicada a ${this.uploadTarget.serie}.`;
    setTimeout(() => this.closeUpload(), 900);
  }
}
