import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';

import { TelemetryService } from '../../core/services/telemetry.service';
import { DeviceStatusService } from '../../core/services/device-status.service';
import { DeviceSummary, DeviceStatus } from '../../core/models/device-summary.model';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { BatteryIndicatorComponent } from '../../shared/battery-indicator/battery-indicator.component';
import { DashboardMiniMapComponent } from './dashboard-mini-map.component';
import {
  FleetGroupSummary,
  aggregateByMerchant,
  aggregateByTenant,
  countByStatus,
} from '../../core/utils/fleet-analytics.util';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatTableModule,
    StatusBadgeComponent,
    BatteryIndicatorComponent,
    DashboardMiniMapComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = true;
  devices: DeviceSummary[] = [];
  isMockMode = environment.useMockData;
  lastUpdatedAt: Date | null = null;
  mapMaximized = false;

  readonly breakdownColumns = ['groupId', 'online', 'delayed', 'offline', 'total'];
  readonly attentionColumns = ['alias', 'battery', 'lastSeen', 'status', 'actions'];
  readonly attentionPanelHint = '(Offline or delayed devices)';

  constructor(
    private telemetry: TelemetryService,
    public statusSvc: DeviceStatusService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.telemetry.devices$
      .pipe(takeUntil(this.destroy$))
      .subscribe(devices => {
        this.devices = devices;
        this.loading = false;
        this.lastUpdatedAt = new Date();
        this.cdr.detectChanges();
      });
  }

  get lastUpdatedLabel(): string {
    if (!this.lastUpdatedAt) return '';
    const sec = Math.floor((Date.now() - this.lastUpdatedAt.getTime()) / 1000);
    if (sec < 5) return 'just now';
    if (sec < 60) return `${sec}s ago`;
    return `${Math.floor(sec / 60)} min ago`;
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
    this.destroy$.next();
    this.destroy$.complete();
  }
}
