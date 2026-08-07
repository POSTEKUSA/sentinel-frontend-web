import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { WarehouseService } from '../../../core/services/pmt/warehouse.service';
import { MerchantService } from '../../../core/services/pos-admin/merchant.service';
import { CopyableCodeComponent } from '../../../shared/copyable-code/copyable-code.component';
import { UserNamePipe } from '../../../shared/pipes/user-name.pipe';

import {
  Terminal, TerminalEstado,
  TERMINAL_ESTADO_LABELS, TERMINAL_ESTADO_BADGE
} from '../../../core/models/pmt/terminal.model';
import { Warehouse } from '../../../core/models/pmt/warehouse.model';
import { Merchant, MerchantSite } from '../../../core/models/pos-admin';
import {
  MOTIVOS_REPARACION, MOTIVOS_GARANTIA, buildMotivoComment
} from '../../../core/models/pmt/terminal-motivos';
import { ZONAS_DEFAULT } from '../../../core/constants/geo.constants';

export type TimelineKind = 'status' | 'field';

export interface TimelineEntry {
  id: string;
  kind: TimelineKind;
  title: string;
  icon: string;
  createdAt: string;
  createdBy?: string;
  comment?: string;
  // status
  previousStatus?: TerminalEstado;
  newStatus?: TerminalEstado;
  // field / logistics
  accion?: string;
  comercio?: string;
  ciudad?: string;
  zona?: string;
  direccion?: string;
}

export interface ResolvedLocation {
  zona?: string;
  ciudad?: string;
  direccion?: string;
  pais?: string;
  source: 'bodega' | 'comercio' | 'terminal';
  label?: string;
}

const FIELD_ACCION_LABELS: Record<string, string> = {
  instalacion: 'Instalación',
  retiro: 'Retiro',
  reparacion: 'Reparación',
};

const FIELD_ACCION_ICONS: Record<string, string> = {
  instalacion: 'storefront',
  retiro: 'logout',
  reparacion: 'build',
};

const WORKFLOW_STEPS: { statuses: TerminalEstado[]; label: string }[] = [
  { statuses: ['en_bodega'], label: 'Bodega' },
  { statuses: ['en_inyeccion'], label: 'Inyección' },
  { statuses: ['inyectado'], label: 'Inyectado' },
  { statuses: ['asignado_supervisor'], label: 'Asig. Supervisor' },
  { statuses: ['asignado_tecnico', 'asignado_ejecutivo'], label: 'Asig. Técnico / Ejecutivo' },
  { statuses: ['instalado'], label: 'Instalado' },
];

@Component({
  selector: 'app-pmt-inventory',
  standalone: true,
  imports: [CopyableCodeComponent, CommonModule, ReactiveFormsModule, FormsModule, RouterLink, UserNamePipe],
  templateUrl: './pmt-inventory.component.html',
  styleUrl: './pmt-inventory.component.css',
})
export class PmtInventoryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private svc = inject(PmtTerminalService);
  private warehouseSvc = inject(WarehouseService);
  private merchantSvc = inject(MerchantService);

  all: Terminal[] = [];
  filtered: Terminal[] = [];
  warehouses: Warehouse[] = [];
  siteOptions: { site: MerchantSite; merchant: Merchant; label: string }[] = [];
  zonas: string[] = [];
  marcas: string[] = [];
  modelos: string[] = [];

  readonly estadoLabels: Record<TerminalEstado, string> = TERMINAL_ESTADO_LABELS;
  readonly estadoBadge: Record<TerminalEstado, string> = TERMINAL_ESTADO_BADGE;
  readonly estadoKeys = Object.keys(TERMINAL_ESTADO_LABELS) as TerminalEstado[];

  openMenuId: string | null = null;
  menuTarget: Terminal | null = null;
  menuPos: { top: number; left: number } | null = null;

  // Row workflow action dialog
  workflowAction: 'inyeccion' | 'reparacion' | 'garantia' | null = null;
  workflowTarget: Terminal | null = null;
  workflowComment = '';
  workflowMotivo = '';
  workflowError = '';

  readonly motivosReparacion = MOTIVOS_REPARACION;
  readonly motivosGarantia = MOTIVOS_GARANTIA;

  // Pagination
  page = 1;
  readonly pageSize = 50;
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize); }
  get paged(): Terminal[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  filterForm = this.fb.group({
    q: [''],
    estado: [''],
    marca: [''],
    zona: [''],
    modelo: [''],
    warehouseId: [''],
  });

  // Dialog
  showForm = false;
  editId: number | null = null;
  readonly inventarioPrefijos = ['POS', 'SIM', 'ACT', 'INV'] as const;
  formData = this.fb.group({
    inventarioPrefijo: ['POS' as string],
    inventarioCodigo: [''],
    marca: [''],
    modelo: [''],
    serie: [''],
    estado: ['en_bodega' as TerminalEstado],
    fecha: [''],
    warehouseId: ['' as string | number],
    merchantSiteId: [''],
  });
  formError = '';

  // History dialog
  historyTerminal: Terminal | null = null;
  timeline: TimelineEntry[] = [];
  workflowSteps: { key: string; label: string; state: 'done' | 'active' | 'todo' }[] = [];

  // Delete confirm dialog
  deleteTarget: Terminal | null = null;

  // Read-only view dialog
  viewTarget: Terminal | null = null;

  ngOnInit(): void {
    this.warehouseSvc.warehouses$.subscribe(list => {
      this.warehouses = list;
    });
    this.merchantSvc.sites$.subscribe(() => {
      this.siteOptions = this.merchantSvc.activeSiteOptions();
    });
    this.siteOptions = this.merchantSvc.activeSiteOptions();
    this.svc.terminals$.subscribe(ts => {
      this.all = ts;
      this.zonas = [...new Set([
        ...ZONAS_DEFAULT,
        ...ts.map(t => this.locationOf(t).zona).filter((z): z is string => !!z),
      ])].sort();
      this.marcas = [...new Set(ts.map(t => t.marca).filter((m): m is string => !!m))].sort();
      this.modelos = [...new Set(ts.map(t => t.modelo).filter((m): m is string => !!m))].sort();
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => {
      this.page = 1;
      this.applyFilters();
    });
    this.formData.get('estado')!.valueChanges.subscribe(estado => {
      if (estado !== 'en_bodega') {
        this.formData.patchValue({ warehouseId: '' }, { emitEvent: false });
      }
      if (estado !== 'instalado') {
        this.formData.patchValue({ merchantSiteId: '' }, { emitEvent: false });
      }
    });
  }

  get formEstado(): TerminalEstado {
    return (this.formData.getRawValue().estado as TerminalEstado) || 'en_bodega';
  }

  get showWarehouseField(): boolean {
    return this.formEstado === 'en_bodega';
  }

  get showMerchantSiteField(): boolean {
    return this.formEstado === 'instalado';
  }

  get siteOptionsForForm(): { site: MerchantSite; merchant: Merchant; label: string }[] {
    const currentId = this.formData.getRawValue().merchantSiteId;
    if (!currentId || this.siteOptions.some(o => o.site.id === currentId)) {
      return this.siteOptions;
    }
    const site = this.merchantSvc.getSiteById(currentId);
    const merchant = site ? this.merchantSvc.getById(site.merchantId) : undefined;
    if (!site || !merchant) return this.siteOptions;
    return [
      ...this.siteOptions,
      { site, merchant, label: `${merchant.tradeName} · ${site.name}` },
    ];
  }

  get activeWarehouses(): Warehouse[] {
    return this.warehouses.filter(w => w.status === 'active'
      || (this.editId !== null && this.formData.getRawValue().warehouseId == w.id));
  }

  /** Solo nombre de bodega (sin código). */
  warehouseName(id?: number | null): string {
    if (id == null) return '—';
    return this.warehouses.find(x => x.id === id)?.nombre ?? '—';
  }

  /** Celda Bodega / Comercio del grid. */
  placeCell(t: Terminal): string {
    if (t.estado === 'instalado') {
      const parts = [t.nombre, t.ciudad, t.zona].filter(v => !!v && String(v).trim());
      return parts.length ? parts.join(' · ') : '—';
    }
    if (t.estado === 'en_bodega') {
      return this.warehouseName(t.warehouseId);
    }
    if (t.nombre) {
      const parts = [t.nombre, t.ciudad, t.zona].filter(v => !!v && String(v).trim());
      return parts.length ? parts.join(' · ') : t.nombre;
    }
    if (t.warehouseId != null) return this.warehouseName(t.warehouseId);
    return '—';
  }

  /** Ubicación mostrada: comercio si instalado; si no, bodega. */
  locationOf(t: Terminal): ResolvedLocation {
    if (t.estado === 'instalado' || t.merchantSiteId) {
      const site = t.merchantSiteId ? this.merchantSvc.getSiteById(t.merchantSiteId) : undefined;
      const merchant = t.merchantId ? this.merchantSvc.getById(t.merchantId) : undefined;
      return {
        zona: site?.zona ?? t.zona,
        ciudad: site?.ciudad ?? t.ciudad,
        direccion: site?.address ?? t.direccion,
        pais: merchant?.pais ?? t.pais,
        source: 'comercio',
        label: merchant && site
          ? `${merchant.tradeName} · ${site.name}`
          : (t.nombre ?? site?.name),
      };
    }
    if (t.warehouseId != null) {
      const w = this.warehouseSvc.getById(t.warehouseId);
      if (w) {
        return {
          zona: w.zona,
          ciudad: w.ciudad,
          direccion: w.direccion,
          pais: w.pais,
          source: 'bodega',
          label: w.nombre,
        };
      }
    }
    return {
      zona: t.zona,
      ciudad: t.ciudad,
      direccion: t.direccion,
      pais: t.pais,
      source: 'terminal',
      label: t.nombre,
    };
  }

  applyFilters(): void {
    const f = this.filterForm.getRawValue();
    this.filtered = this.all.filter(t => {
      const loc = this.locationOf(t);
      const q = (f.q ?? '').toLowerCase().trim();
      if (q && ![t.serie, t.marca, t.modelo, t.nombre, t.inventario, loc.zona, loc.ciudad, loc.direccion]
        .some(v => (v ?? '').toLowerCase().includes(q))) return false;
      if (f.estado && t.estado !== f.estado) return false;
      if (f.marca && t.marca !== f.marca) return false;
      if (f.zona && loc.zona !== f.zona) return false;
      if (f.modelo && t.modelo !== f.modelo) return false;
      if (f.warehouseId && String(t.warehouseId ?? '') !== String(f.warehouseId)) return false;
      return true;
    });
  }

  clearFilters(): void {
    this.filterForm.reset({ q: '', estado: '', marca: '', zona: '', modelo: '', warehouseId: '' });
  }

  get hasFilters(): boolean {
    const f = this.filterForm.getRawValue();
    return !!(f.q || f.estado || f.marca || f.zona || f.modelo || f.warehouseId);
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────

  private todayIso(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  openCreate(): void {
    this.editId = null;
    this.formData.reset({
      estado: 'en_bodega',
      fecha: this.todayIso(),
      inventarioPrefijo: 'POS',
      inventarioCodigo: '',
      marca: '',
      modelo: '',
      serie: '',
      warehouseId: '',
      merchantSiteId: '',
    });
    this.formError = '';
    this.showForm = true;
  }

  openView(t: Terminal): void {
    this.viewTarget = t;
  }

  closeView(): void {
    this.viewTarget = null;
  }

  openEdit(t: Terminal): void {
    this.editId = t.id;
    const parsed = this.parseInventario(t.inventario);
    this.formData.patchValue({
      marca: t.marca ?? '',
      modelo: t.modelo ?? '',
      serie: t.serie ?? '',
      estado: t.estado ?? 'en_bodega',
      fecha: t.fecha || this.todayIso(),
      warehouseId: t.warehouseId ?? '',
      merchantSiteId: t.merchantSiteId ?? '',
      inventarioPrefijo: parsed.prefijo,
      inventarioCodigo: parsed.codigo,
    }, { emitEvent: false });
    this.formError = '';
    this.showForm = true;
  }

  private parseInventario(value?: string): { prefijo: string; codigo: string } {
    const raw = (value ?? '').trim();
    const match = raw.match(/^([A-Za-z]+)\s*[-_]?\s*(.*)$/);
    if (match) {
      const prefijo = match[1].toUpperCase();
      const known = (this.inventarioPrefijos as readonly string[]).includes(prefijo);
      return {
        prefijo: known ? prefijo : 'POS',
        codigo: known ? match[2] : raw,
      };
    }
    return { prefijo: 'POS', codigo: raw };
  }

  private buildInventario(prefijo: string, codigo: string): string {
    const p = (prefijo || 'POS').trim().toUpperCase();
    const c = (codigo || '').trim();
    return c ? `${p}-${c}` : '';
  }

  saveForm(): void {
    const v = this.formData.getRawValue();
    const inventario = this.buildInventario(v.inventarioPrefijo ?? 'POS', v.inventarioCodigo ?? '');
    const estado = (v.estado as TerminalEstado) ?? 'en_bodega';
    if (!inventario) { this.formError = 'El código de inventario es requerido.'; return; }
    if (!v.marca?.trim()) { this.formError = 'La marca es requerida.'; return; }
    if (!v.modelo?.trim()) { this.formError = 'El modelo es requerido.'; return; }
    if (!v.serie?.trim()) { this.formError = 'El número de serie es requerido.'; return; }

    if (estado === 'en_bodega' && (v.warehouseId === '' || v.warehouseId == null)) {
      this.formError = 'Seleccione una bodega.';
      return;
    }
    if (estado === 'instalado' && !v.merchantSiteId) {
      this.formError = 'Seleccione un comercio / sucursal.';
      return;
    }

    const payload: Partial<Terminal> = {
      inventario,
      marca: v.marca!,
      modelo: v.modelo!,
      serie: v.serie!,
      estado,
      fecha: v.fecha || undefined,
    };

    if (estado === 'en_bodega') {
      const warehouseId = Number(v.warehouseId);
      const w = this.warehouseSvc.getById(warehouseId);
      payload.warehouseId = warehouseId;
      payload.merchantId = undefined;
      payload.merchantSiteId = undefined;
      payload.nombre = undefined;
      payload.codigo = undefined;
      if (w) {
        payload.pais = w.pais;
        payload.ciudad = w.ciudad;
        payload.zona = w.zona;
        payload.direccion = w.direccion;
      }
    } else if (estado === 'instalado') {
      const opt = this.siteOptions.find(o => o.site.id === v.merchantSiteId)
        ?? (() => {
          const site = this.merchantSvc.getSiteById(v.merchantSiteId!);
          const merchant = site ? this.merchantSvc.getById(site.merchantId) : undefined;
          return site && merchant ? { site, merchant, label: `${merchant.tradeName} · ${site.name}` } : null;
        })();
      if (!opt) {
        this.formError = 'Comercio / sucursal no válido.';
        return;
      }
      payload.warehouseId = undefined;
      payload.merchantId = opt.merchant.id;
      payload.merchantSiteId = opt.site.id;
      payload.nombre = opt.merchant.tradeName;
      payload.codigo = opt.merchant.affiliateCode;
      payload.pais = opt.merchant.pais;
      payload.ciudad = opt.site.ciudad ?? opt.merchant.ciudad;
      payload.zona = opt.site.zona ?? opt.merchant.zona;
      payload.direccion = opt.site.address ?? opt.merchant.address;
    } else {
      payload.warehouseId = undefined;
      payload.merchantSiteId = undefined;
    }

    if (this.editId === null) {
      if (this.svc.isSerieDuplicate(v.serie!, v.marca)) {
        this.formError = `La serie "${v.serie}" ya existe para la marca "${v.marca || '—'}".`;
        return;
      }
      this.svc.create({
        ...payload,
        serie: v.serie!,
        estado,
      } as Omit<Terminal, 'id' | 'createdAt' | 'updatedAt'>);
    } else {
      if (this.svc.isSerieDuplicate(v.serie!, v.marca, this.editId)) {
        this.formError = `La serie "${v.serie}" ya existe para la marca "${v.marca || '—'}".`;
        return;
      }
      this.svc.update(this.editId, payload);
    }
    this.showForm = false;
  }

  askDelete(t: Terminal): void {
    this.deleteTarget = t;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    this.svc.delete(this.deleteTarget.id);
    this.deleteTarget = null;
  }

  // ── Row workflow actions ──────────────────────────────────────────────────

  @HostListener('document:click')
  closeMenus(): void {
    this.openMenuId = null;
    this.menuTarget = null;
    this.menuPos = null;
  }

  @HostListener('window:resize')
  onViewportChange(): void {
    if (this.menuTarget) this.closeMenus();
  }

  toggleMenu(t: Terminal, event: Event): void {
    event.stopPropagation();
    const id = `inv-${t.id}`;
    if (this.openMenuId === id) {
      this.closeMenus();
      return;
    }
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const panelWidth = 220;
    const panelHeight = 240;
    const left = Math.min(Math.max(8, rect.right - panelWidth), window.innerWidth - panelWidth - 8);
    const openUp = window.innerHeight - rect.bottom < panelHeight && rect.top > panelHeight;
    const top = openUp
      ? Math.max(8, rect.top - panelHeight - 4)
      : Math.min(rect.bottom + 4, window.innerHeight - panelHeight - 8);
    this.menuPos = { top, left };
    this.menuTarget = t;
    this.openMenuId = id;
  }

  canSendToInyeccion(t: Terminal): boolean { return this.svc.canSendToInyeccion(t); }
  canSendToReparacion(t: Terminal): boolean { return this.svc.canSendToReparacion(t); }
  canSendToGarantia(t: Terminal): boolean { return this.svc.canSendToGarantia(t); }

  startWorkflow(type: 'inyeccion' | 'reparacion' | 'garantia', t: Terminal, event?: Event): void {
    event?.stopPropagation();
    this.workflowAction = type;
    this.workflowTarget = t;
    this.workflowComment = '';
    this.workflowMotivo = '';
    this.workflowError = '';
    this.closeMenus();
  }

  cancelWorkflow(): void {
    this.workflowAction = null;
    this.workflowTarget = null;
    this.workflowComment = '';
    this.workflowMotivo = '';
    this.workflowError = '';
  }

  get workflowNeedsMotivo(): boolean {
    return this.workflowAction === 'reparacion' || this.workflowAction === 'garantia';
  }

  get workflowMotivosList(): string[] {
    if (this.workflowAction === 'reparacion') return this.motivosReparacion;
    if (this.workflowAction === 'garantia') return this.motivosGarantia;
    return [];
  }

  workflowTitle(): string {
    switch (this.workflowAction) {
      case 'inyeccion': return 'Enviar a Inyección';
      case 'reparacion': return 'Enviar a Reparación';
      case 'garantia': return 'Enviar a Garantía';
      default: return '';
    }
  }

  applyWorkflow(): void {
    if (!this.workflowAction || !this.workflowTarget) return;

    if (this.workflowNeedsMotivo) {
      if (!this.workflowMotivo) {
        this.workflowError = 'Seleccione un motivo.';
        return;
      }
      if (this.workflowMotivo === 'Otro' && !this.workflowComment.trim()) {
        this.workflowError = 'Indique el detalle del motivo (Otro).';
        return;
      }
    }
    this.workflowError = '';

    const id = this.workflowTarget.id;
    const comment = this.workflowNeedsMotivo
      ? buildMotivoComment(this.workflowMotivo, this.workflowComment)
      : this.workflowComment;

    switch (this.workflowAction) {
      case 'inyeccion':
        this.svc.changeEstado(id, 'en_inyeccion', comment || 'Enviado a inyección');
        break;
      case 'reparacion':
        this.svc.changeEstado(id, 'en_reparacion', comment || 'Enviado a reparación');
        break;
      case 'garantia':
        this.svc.changeEstado(id, 'garantia', comment || 'Enviado a garantía');
        break;
    }
    this.cancelWorkflow();
  }

  // ── History ───────────────────────────────────────────────────────────────

  openHistory(t: Terminal): void {
    this.historyTerminal = t;
    this.timeline = this.buildTimeline(t);
    this.workflowSteps = this.buildWorkflowSteps(t.estado);
  }

  private buildTimeline(t: Terminal): TimelineEntry[] {
    const statusEntries: TimelineEntry[] = this.svc.tracking
      .filter(e => e.terminalId === t.id)
      .map(e => ({
        id: `status-${e.id}`,
        kind: 'status' as const,
        title: 'Cambio de Estado',
        icon: 'sell',
        createdAt: e.createdAt,
        createdBy: e.createdBy,
        comment: e.comment,
        previousStatus: e.previousStatus,
        newStatus: e.newStatus,
      }));

    const fieldEntries: TimelineEntry[] = this.svc.historical
      .filter(h => h.serie === t.serie)
      .map(h => ({
        id: `field-${h.id}`,
        kind: 'field' as const,
        title: FIELD_ACCION_LABELS[h.accion] ?? h.accion,
        icon: FIELD_ACCION_ICONS[h.accion] ?? 'place',
        createdAt: h.createdAt,
        createdBy: h.createdBy,
        comment: h.descripcion,
        accion: h.accion,
        comercio: h.comercio,
        ciudad: h.ciudad,
        zona: h.zona,
        direccion: h.direccion,
      }));

    return [...statusEntries, ...fieldEntries]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  private buildWorkflowSteps(estado: TerminalEstado) {
    const repairFlow: TerminalEstado[] = ['en_reparacion', 'reparado', 'garantia', 'irreparable', 'obsoleto', 'retirado', 'destruido'];
    let steps = WORKFLOW_STEPS.map(s => ({ ...s }));

    if (repairFlow.includes(estado)) {
      steps = [
        { statuses: ['instalado'], label: 'Instalado' },
        { statuses: ['en_reparacion'], label: 'En Reparación' },
      ];
      if (estado === 'reparado') steps.push({ statuses: ['reparado'], label: 'Reparado' });
      if (estado === 'garantia') steps.push({ statuses: ['garantia'], label: 'En Garantía' });
      if (estado === 'irreparable') steps.push({ statuses: ['irreparable'], label: 'Irreparable' });
      if (estado === 'obsoleto') steps.push({ statuses: ['obsoleto'], label: 'Obsoleto' });
      if (estado === 'retirado') steps.push({ statuses: ['retirado'], label: 'Retirado' });
      if (estado === 'destruido') steps.push({ statuses: ['destruido'], label: 'Destruido' });
    }

    const idx = steps.findIndex(s => s.statuses.includes(estado));
    return steps.map((s, i) => ({
      key: s.statuses.join('|'),
      label: s.label,
      state: (idx < 0 ? 'todo' : i < idx ? 'done' : i === idx ? 'active' : 'todo') as 'done' | 'active' | 'todo',
    }));
  }

  // ── Pagination ────────────────────────────────────────────────────────────

  prevPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }
}
