import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PmtSolicitudService } from '../../../core/services/pmt/pmt-solicitud.service';
import { PosCatalogService } from '../../../core/services/pos-admin/pos-catalog.service';
import {
  SolicitudEquipo, SolicitudEquipoEstado, SolicitudEquipoItem,
  SOLICITUD_EQUIPO_ESTADO_LABELS, SOLICITUD_EQUIPO_ESTADO_BADGE, EQUIPO_ITEMS,
  EquipoItemTipo,
} from '../../../core/models/pmt/solicitud.model';
import { PosCatalogItem } from '../../../core/models/pos-admin';
import { UserNamePipe } from '../../../shared/pipes/user-name.pipe';

interface NewItemRow {
  nombre: EquipoItemTipo | string;
  cantidad: number;
  marca: string;
  modelo: string;
}

@Component({
  selector: 'app-pmt-solicitudes-equipo',
  standalone: true,
  imports: [CommonModule, FormsModule, UserNamePipe],
  templateUrl: './pmt-solicitudes-equipo.component.html',
  styleUrl: './pmt-solicitudes-equipo.component.css',
})
export class PmtSolicitudesEquipoComponent implements OnInit {
  private svc = inject(PmtSolicitudService);
  private catalogSvc = inject(PosCatalogService);

  all: SolicitudEquipo[] = [];
  filtered: SolicitudEquipo[] = [];
  catalogItems: PosCatalogItem[] = [];

  readonly estadoLabels = SOLICITUD_EQUIPO_ESTADO_LABELS;
  readonly estadoBadge  = SOLICITUD_EQUIPO_ESTADO_BADGE;
  readonly estadoKeys   = Object.keys(SOLICITUD_EQUIPO_ESTADO_LABELS) as SolicitudEquipoEstado[];
  readonly equipoItems  = EQUIPO_ITEMS;

  filterEstado = '';
  detail: SolicitudEquipo | null = null;
  historyComment = '';
  historyEstado: SolicitudEquipoEstado = 'aprobada';

  // create / edit
  showForm = false;
  editId: number | null = null;
  newNotas = '';
  newItems: NewItemRow[] = [this.emptyRow()];

  // row menu
  openMenuId: string | null = null;
  menuTarget: SolicitudEquipo | null = null;
  menuPos: { top: number; left: number } | null = null;

  // approve / delete
  approveTarget: SolicitudEquipo | null = null;
  approveEstado: SolicitudEquipoEstado = 'aprobada';
  approveComment = '';
  deleteTarget: SolicitudEquipo | null = null;

  ngOnInit(): void {
    this.svc.solicitudesEquipo$.subscribe(list => {
      this.all = list;
      this.applyFilters();
      if (this.detail) {
        this.detail = list.find(s => s.id === this.detail!.id) ?? null;
      }
    });
    this.catalogSvc.catalog$.subscribe(items => {
      this.catalogItems = items.filter(i => i.status === 'active');
    });
  }

  applyFilters(): void {
    this.filtered = this.filterEstado ? this.all.filter(s => s.estado === this.filterEstado) : [...this.all];
  }

  private emptyRow(): NewItemRow {
    return { nombre: 'POS', cantidad: 1, marca: '', modelo: '' };
  }

  needsMarcaModelo(nombre: string): boolean {
    return nombre === 'POS' || nombre === 'P';
  }

  isPrs(nombre: string): boolean {
    return nombre === 'PRS';
  }

  posLinesForPrs(): NewItemRow[] {
    return this.newItems.filter(
      i => i.nombre === 'POS' && i.marca && i.modelo,
    );
  }

  posBrands(): string[] {
    return [...new Set(this.catalogItems.map(i => i.brand))].sort();
  }

  posModels(brand: string): string[] {
    if (!brand) return [];
    return this.catalogItems.filter(i => i.brand === brand).map(i => i.model);
  }

  onTipoChange(item: NewItemRow): void {
    item.marca = '';
    item.modelo = '';
    this.syncPrsOptions();
  }

  onMarcaChange(item: NewItemRow): void {
    item.modelo = '';
    this.syncPrsOptions();
  }

  onModeloChange(): void {
    this.syncPrsOptions();
  }

  syncPrsOptions(): void {
    const keys = new Set(
      this.posLinesForPrs().map(p => `${p.marca}|${p.modelo}`),
    );
    for (const row of this.newItems) {
      if (row.nombre !== 'PRS') continue;
      const key = `${row.marca}|${row.modelo}`;
      if (row.marca && row.modelo && !keys.has(key)) {
        row.marca = '';
        row.modelo = '';
      }
    }
  }

  selectPrsPos(item: NewItemRow, key: string): void {
    if (!key) {
      item.marca = '';
      item.modelo = '';
      return;
    }
    const [marca, modelo] = key.split('|');
    item.marca = marca ?? '';
    item.modelo = modelo ?? '';
  }

  prsKey(item: NewItemRow): string {
    return item.marca && item.modelo ? `${item.marca}|${item.modelo}` : '';
  }

  addItem(): void {
    this.newItems.push(this.emptyRow());
  }

  removeItem(i: number): void {
    this.newItems.splice(i, 1);
    if (!this.newItems.length) this.newItems = [this.emptyRow()];
    this.syncPrsOptions();
  }

  private rowValid(item: NewItemRow): boolean {
    if (item.cantidad < 1) return false;
    if (this.needsMarcaModelo(item.nombre) || this.isPrs(item.nombre)) {
      return !!(item.marca && item.modelo);
    }
    return true;
  }

  canSave(): boolean {
    return this.newItems.length > 0 && this.newItems.every(item => this.rowValid(item));
  }

  private buildItems(): SolicitudEquipoItem[] {
    return this.newItems.map(i => {
      const base: SolicitudEquipoItem = { nombre: i.nombre, cantidad: i.cantidad };
      if (i.marca && i.modelo) {
        base.marca = i.marca;
        base.modelo = i.modelo;
      }
      return base;
    });
  }

  openCreate(): void {
    this.editId = null;
    this.newNotas = '';
    this.newItems = [this.emptyRow()];
    this.showForm = true;
    this.closeMenus();
  }

  openEdit(s: SolicitudEquipo): void {
    this.editId = s.id;
    this.newNotas = s.notas ?? '';
    this.newItems = s.items.map(i => ({
      nombre: i.nombre,
      cantidad: i.cantidad,
      marca: i.marca ?? '',
      modelo: i.modelo ?? '',
    }));
    if (!this.newItems.length) this.newItems = [this.emptyRow()];
    this.showForm = true;
    this.closeMenus();
  }

  closeForm(): void {
    this.showForm = false;
    this.editId = null;
    this.newNotas = '';
    this.newItems = [this.emptyRow()];
  }

  save(): void {
    if (!this.canSave()) return;
    const items = this.buildItems();
    if (this.editId != null) {
      this.svc.updateEquipo(this.editId, {
        items,
        notas: this.newNotas || undefined,
      });
    } else {
      this.svc.createEquipo({
        estado: 'pendiente',
        solicitadoPor: 'admin',
        items,
        notas: this.newNotas || undefined,
      });
    }
    this.closeForm();
    this.applyFilters();
  }

  openDetail(s: SolicitudEquipo): void {
    this.detail = s;
    this.historyEstado = 'aprobada';
    this.historyComment = '';
    this.closeMenus();
  }

  applyHistoryAction(): void {
    if (!this.detail) return;
    this.svc.changeEstadoEquipo(this.detail.id, this.historyEstado, this.historyComment || undefined, 'admin');
    this.historyComment = '';
  }

  // ── Row actions menu ────────────────────────────────────────────────────

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

  toggleMenu(s: SolicitudEquipo, event: Event): void {
    event.stopPropagation();
    const id = `req-${s.id}`;
    if (this.openMenuId === id) {
      this.closeMenus();
      return;
    }
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const panelWidth = 200;
    const panelHeight = 160;
    const left = Math.min(Math.max(8, rect.right - panelWidth), window.innerWidth - panelWidth - 8);
    const openUp = window.innerHeight - rect.bottom < panelHeight && rect.top > panelHeight;
    const top = openUp
      ? Math.max(8, rect.top - panelHeight - 4)
      : Math.min(rect.bottom + 4, window.innerHeight - panelHeight - 8);
    this.menuPos = { top, left };
    this.menuTarget = s;
    this.openMenuId = id;
  }

  openApprove(s: SolicitudEquipo): void {
    this.approveTarget = s;
    this.approveEstado = s.estado === 'pendiente' ? 'aprobada' : s.estado;
    this.approveComment = '';
    this.closeMenus();
  }

  cancelApprove(): void {
    this.approveTarget = null;
    this.approveComment = '';
  }

  confirmApprove(): void {
    if (!this.approveTarget) return;
    this.svc.changeEstadoEquipo(
      this.approveTarget.id,
      this.approveEstado,
      this.approveComment || undefined,
      'admin',
    );
    this.cancelApprove();
  }

  askDelete(s: SolicitudEquipo): void {
    this.deleteTarget = s;
    this.closeMenus();
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  confirmDelete(): void {
    if (!this.deleteTarget) return;
    const id = this.deleteTarget.id;
    this.svc.deleteEquipo(id);
    if (this.detail?.id === id) this.detail = null;
    this.cancelDelete();
  }
}
