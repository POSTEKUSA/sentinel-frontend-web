import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { PmtSolicitudService } from '../../../core/services/pmt/pmt-solicitud.service';
import {
  SolicitudEquipo, SolicitudEquipoEstado, SolicitudEquipoItem,
  SOLICITUD_EQUIPO_ESTADO_LABELS, SOLICITUD_EQUIPO_ESTADO_BADGE, EQUIPO_ITEMS
} from '../../../core/models/pmt/solicitud.model';

@Component({
  selector: 'app-pmt-solicitudes-equipo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pmt-solicitudes-equipo.component.html',
  styleUrl: './pmt-solicitudes-equipo.component.css',
})
export class PmtSolicitudesEquipoComponent implements OnInit {
  private svc = inject(PmtSolicitudService);
  all: SolicitudEquipo[] = [];
  filtered: SolicitudEquipo[] = [];

  readonly estadoLabels = SOLICITUD_EQUIPO_ESTADO_LABELS;
  readonly estadoBadge  = SOLICITUD_EQUIPO_ESTADO_BADGE;
  readonly estadoKeys   = Object.keys(SOLICITUD_EQUIPO_ESTADO_LABELS) as SolicitudEquipoEstado[];
  readonly equipoItems  = EQUIPO_ITEMS;

  filterEstado = '';
  detail: SolicitudEquipo | null = null;
  historyComment = '';
  historyEstado: SolicitudEquipoEstado = 'aprobada';

  // create
  showCreate = false;
  newNotas = '';
  newItems: { nombre: string; cantidad: number }[] = [{ nombre: EQUIPO_ITEMS[0], cantidad: 1 }];

  ngOnInit(): void {
    this.svc.solicitudesEquipo$.subscribe(list => {
      this.all = list;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filtered = this.filterEstado ? this.all.filter(s => s.estado === this.filterEstado) : [...this.all];
  }

  addItem(): void { this.newItems.push({ nombre: EQUIPO_ITEMS[0], cantidad: 1 }); }
  removeItem(i: number): void { this.newItems.splice(i, 1); }

  create(): void {
    if (!this.newItems.length || this.newItems.some(item => item.cantidad < 1)) return;
    this.svc.createEquipo({ estado: 'pendiente', solicitadoPor: 'admin', items: this.newItems.map(i => ({ nombre: i.nombre, cantidad: i.cantidad })), notas: this.newNotas || undefined });
    this.showCreate = false;
    this.newNotas = '';
    this.newItems = [{ nombre: EQUIPO_ITEMS[0], cantidad: 1 }];
    this.applyFilters();
  }

  openDetail(s: SolicitudEquipo): void { this.detail = s; this.historyEstado = 'aprobada'; this.historyComment = ''; }

  applyHistoryAction(): void {
    if (!this.detail) return;
    this.svc.changeEstadoEquipo(this.detail.id, this.historyEstado, this.historyComment || undefined, 'admin');
    this.detail = this.all.find(s => s.id === this.detail!.id) ?? null;
    this.historyComment = '';
  }
}
