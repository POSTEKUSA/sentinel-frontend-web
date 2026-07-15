import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TelemetryService } from '../../core/services/telemetry.service';
import { DeviceStatusService } from '../../core/services/device-status.service';
import { PageChromeService } from '../../core/services/page-chrome.service';
import { DeviceSummary, DeviceStatus } from '../../core/models/device-summary.model';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { BatteryIndicatorComponent } from '../../shared/battery-indicator/battery-indicator.component';
import { BusyLoaderComponent } from '../../shared/busy-loader/busy-loader.component';
import { DashboardMiniMapComponent } from './dashboard-mini-map.component';
import {
  FleetGroupSummary,
  aggregateByMerchant,
  aggregateByTenant,
  countByStatus,
} from '../../core/utils/fleet-analytics.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StatusBadgeComponent,
    BatteryIndicatorComponent,
    BusyLoaderComponent,
    DashboardMiniMapComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private freshnessTimer?: ReturnType<typeof setInterval>;

  loading = true;
  devices: DeviceSummary[] = [];
  lastUpdatedAt: Date | null = null;
  mapMaximized = false;

  readonly attentionPanelHint = '(Dispositivos fuera de línea o retrasados)';

  constructor(
    private telemetry: TelemetryService,
    public statusSvc: DeviceStatusService,
    private pageChrome: PageChromeService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.telemetry.devices$.pipe(takeUntil(this.destroy$)).subscribe(devices => {
      this.devices = devices;
      this.loading = false;
      this.lastUpdatedAt = new Date();
      this.updateChromeSubtitle();
      this.cdr.detectChanges();
    });

    this.freshnessTimer = setInterval(() => this.updateChromeSubtitle(), 5_000);
  }

  private updateChromeSubtitle(): void {
    if (!this.lastUpdatedAt) {
      this.pageChrome.clear();
      return;
    }
    this.pageChrome.setSubtitle(
      `Datos actualizados ${this.lastUpdatedLabel} · se actualiza cada 30 s`,
    );
  }

  get lastUpdatedLabel(): string {
    if (!this.lastUpdatedAt) return '';
    const sec = Math.floor((Date.now() - this.lastUpdatedAt.getTime()) / 1000);
    if (sec < 5) return 'hace un momento';
    if (sec < 60) return `hace ${sec} s`;
    return `hace ${Math.floor(sec / 60)} min`;
  }

  countByStatus(status: DeviceStatus): number {
    return countByStatus(this.devices, status);
  }

  statusPercent(status: DeviceStatus): number {
    if (this.devices.length === 0) return 0;
    return Math.round((this.countByStatus(status) / this.devices.length) * 100);
  }

  groupStatusPercent(row: FleetGroupSummary, status: DeviceStatus): number {
    if (row.total === 0) return 0;
    return Math.round((row[status] / row.total) * 100);
  }

  get tenantBreakdown(): FleetGroupSummary[] {
    return aggregateByTenant(this.devices);
  }

  get merchantBreakdown(): FleetGroupSummary[] {
    return aggregateByMerchant(this.devices);
  }

  get attentionDevices(): DeviceSummary[] {
    return this.devices
      .filter(d => d.status !== 'online')
      .sort((a, b) => new Date(a.lastHeartbeat).getTime() - new Date(b.lastHeartbeat).getTime());
  }

  openMapMaximized(): void {
    this.mapMaximized = true;
    document.body.style.overflow = 'hidden';
  }

  closeMapMaximized(): void {
    this.mapMaximized = false;
    document.body.style.overflow = '';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    if (this.freshnessTimer) clearInterval(this.freshnessTimer);
    this.pageChrome.clear();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
