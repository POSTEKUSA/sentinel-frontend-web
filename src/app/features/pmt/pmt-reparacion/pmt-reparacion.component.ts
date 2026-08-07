import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormsModule } from '@angular/forms';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { WarehouseService } from '../../../core/services/pmt/warehouse.service';
import {
  Terminal, TrackingEvent,
  TERMINAL_ESTADO_LABELS, TERMINAL_ESTADO_BADGE
} from '../../../core/models/pmt/terminal.model';
import { CopyableCodeComponent } from '../../../shared/copyable-code/copyable-code.component';
import { UserNamePipe } from '../../../shared/pipes/user-name.pipe';

@Component({
  selector: 'app-pmt-reparacion',
  standalone: true,
  imports: [CopyableCodeComponent, CommonModule, ReactiveFormsModule, FormsModule, UserNamePipe],
  templateUrl: './pmt-reparacion.component.html',
  styleUrl: './pmt-reparacion.component.css',
})
export class PmtReparacionComponent implements OnInit {
  private svc = inject(PmtTerminalService);
  private warehouseSvc = inject(WarehouseService);
  private fb = inject(FormBuilder);

  all: Terminal[] = [];
  filtered: Terminal[] = [];
  readonly estadoLabels = TERMINAL_ESTADO_LABELS;
  readonly estadoBadge = TERMINAL_ESTADO_BADGE;

  selected: Terminal | null = null;
  resolution: 'reparado' | 'instalado' | 'garantia' | 'irreparable' | 'obsoleto' = 'reparado';
  comment = '';
  showResolve = false;

  viewTarget: Terminal | null = null;
  viewMotivo: TrackingEvent | null = null;

  historyTerminal: Terminal | null = null;
  historyEvents: TrackingEvent[] = [];

  openMenuId: string | null = null;
  menuTarget: Terminal | null = null;
  menuPos: { top: number; left: number } | null = null;

  filterForm = this.fb.group({ q: [''] });

  ngOnInit(): void {
    this.svc.terminals$.subscribe(ts => {
      this.all = ts.filter(t => t.estado === 'en_reparacion');
      this.applyFilters();
    });
    this.filterForm.valueChanges.subscribe(() => this.applyFilters());
  }

  applyFilters(): void {
    const q = (this.filterForm.value.q ?? '').toLowerCase().trim();
    this.filtered = q
      ? this.all.filter(t =>
          [t.serie, t.modelo, t.marca, t.inventario, t.nombre, this.placeCell(t)]
            .some(v => (v ?? '').toLowerCase().includes(q)))
      : [...this.all];
  }

  warehouseName(id?: number | null): string {
    if (id == null) return '—';
    return this.warehouseSvc.getById(id)?.nombre ?? '—';
  }

  placeCell(t: Terminal): string {
    if (t.estado === 'instalado') {
      const parts = [t.nombre, t.ciudad, t.zona].filter(v => !!v && String(v).trim());
      return parts.length ? parts.join(' · ') : '—';
    }
    if (t.nombre) {
      const parts = [t.nombre, t.ciudad, t.zona].filter(v => !!v && String(v).trim());
      return parts.length ? parts.join(' · ') : t.nombre;
    }
    if (t.warehouseId != null) return this.warehouseName(t.warehouseId);
    return '—';
  }

  motivoEnvio(t: Terminal): TrackingEvent | null {
    const events = this.svc.tracking
      .filter(e => e.terminalId === t.id && e.newStatus === 'en_reparacion')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return events[0] ?? null;
  }

  openView(t: Terminal): void {
    this.viewTarget = t;
    this.viewMotivo = this.motivoEnvio(t);
  }

  closeView(): void {
    this.viewTarget = null;
    this.viewMotivo = null;
  }

  openHistory(t: Terminal): void {
    this.historyTerminal = t;
    this.historyEvents = this.svc.tracking
      .filter(e => e.terminalId === t.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

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
    const id = `rep-${t.id}`;
    if (this.openMenuId === id) {
      this.closeMenus();
      return;
    }
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const panelWidth = 220;
    const panelHeight = 140;
    const left = Math.min(Math.max(8, rect.right - panelWidth), window.innerWidth - panelWidth - 8);
    const openUp = window.innerHeight - rect.bottom < panelHeight && rect.top > panelHeight;
    const top = openUp
      ? Math.max(8, rect.top - panelHeight - 4)
      : Math.min(rect.bottom + 4, window.innerHeight - panelHeight - 8);
    this.menuPos = { top, left };
    this.menuTarget = t;
    this.openMenuId = id;
  }

  openResolve(t: Terminal): void {
    this.selected = t;
    this.resolution = 'reparado';
    this.comment = '';
    this.showResolve = true;
  }

  resolve(): void {
    if (!this.selected) return;
    this.svc.changeEstado(this.selected.id, this.resolution, this.comment || 'Resolución de reparación');
    this.selected = null;
    this.showResolve = false;
  }
}
