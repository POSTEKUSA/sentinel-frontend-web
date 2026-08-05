import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PmtTerminalService } from '../../../core/services/pmt/pmt-terminal.service';
import { PmtSimCardService } from '../../../core/services/pmt/pmt-sim-card.service';
import { TerminalEstado, TERMINAL_ESTADO_LABELS, TrackingEvent } from '../../../core/models/pmt/terminal.model';

@Component({
  selector: 'app-pmt-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pmt-dashboard.component.html',
  styleUrl: './pmt-dashboard.component.css',
})
export class PmtDashboardComponent implements OnInit {
  summary: ReturnType<PmtTerminalService['getSummary']> | null = null;
  byZone: { name: string; count: number }[] = [];
  byModel: { name: string; count: number }[] = [];
  simStats: ReturnType<PmtSimCardService['getStats']> | null = null;
  recentTracking: TrackingEvent[] = [];
  readonly labels: Record<TerminalEstado, string> = TERMINAL_ESTADO_LABELS;
  today = new Date().toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' });

  readonly primaryStats = [
    { key: 'enBodega', label: 'En Bodega', icon: 'inventory_2', color: 'blue' },
    { key: 'enInyeccion', label: 'En Inyección', icon: 'vaccines', color: 'purple' },
    { key: 'instalado', label: 'Instalados', icon: 'check_circle', color: 'green' },
  ];
  readonly secondaryStats = [
    { key: 'asignadoSupervisor', label: 'Asig. Supervisor', icon: 'manage_accounts', color: 'cyan' },
    { key: 'asignadoTecnico', label: 'Asig. Técnico / Ejecutivo', icon: 'engineering', color: 'indigo' },
    { key: 'enReparacion', label: 'En Reparación', icon: 'build', color: 'amber' },
    { key: 'garantia', label: 'Garantía', icon: 'shield', color: 'teal' },
  ];
  readonly tertiaryStats = [
    { key: 'retirado', label: 'Retirado', icon: 'undo', color: 'orange' },
    { key: 'irreparable', label: 'Irreparable', icon: 'warning', color: 'red' },
    { key: 'obsoleto', label: 'Obsoleto', icon: 'delete', color: 'slate' },
    { key: 'serieSustituida', label: 'Serie Sustituida', icon: 'swap_horiz', color: 'teal' },
  ];

  constructor(
    private terminalSvc: PmtTerminalService,
    private simSvc: PmtSimCardService,
  ) {}

  ngOnInit(): void {
    this.summary = this.terminalSvc.getSummary();
    this.byZone = this.terminalSvc.getByZone().slice(0, 8);
    this.byModel = this.terminalSvc.getByModel().slice(0, 6);
    this.simStats = this.simSvc.getStats();
    this.recentTracking = this.terminalSvc.tracking.slice(0, 8);
  }

  getValue(key: string): number {
    return (this.summary as any)?.[key] ?? 0;
  }

  pct(value: number): string {
    if (!this.summary?.total) return '0%';
    return ((value / this.summary.total) * 100).toFixed(1) + '%';
  }

  barWidth(value: number, max: number): string {
    if (!max) return '0%';
    return Math.min((value / max) * 100, 100) + '%';
  }

  get maxZoneCount(): number {
    return Math.max(...this.byZone.map(z => z.count), 1);
  }
}
