import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { isStaleSync } from '../../core/utils/fleet-analytics.util';

import { TelemetryService } from '../../core/services/telemetry.service';
import { DeviceStatusService } from '../../core/services/device-status.service';
import { DeviceSummary, DeviceStatus } from '../../core/models/device-summary.model';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { BatteryIndicatorComponent } from '../../shared/battery-indicator/battery-indicator.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { BusyLoaderComponent } from '../../shared/busy-loader/busy-loader.component';
import { environment } from '../../../environments/environment';

type StatusFilter = DeviceStatus | 'all';

@Component({
  selector: 'app-device-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    StatusBadgeComponent,
    BatteryIndicatorComponent,
    EmptyStateComponent,
    BusyLoaderComponent,
  ],
  templateUrl: './device-list.component.html',
  styleUrl: './device-list.component.css',
})
export class DeviceListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  searchCtrl = new FormControl('');
  activeStatusFilter: StatusFilter = 'all';

  loading = true;
  allDevices: DeviceSummary[] = [];
  filtered: DeviceSummary[] = [];
  isMockMode = environment.useMockData;
  filterTenantId: string | null = null;
  filterMerchantId: string | null = null;
  filterStaleSyncOnly = false;

  constructor(
    private telemetry: TelemetryService,
    public statusSvc: DeviceStatusService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  get hasUrlFilters(): boolean {
    return !!(
      this.filterTenantId ||
      this.filterMerchantId ||
      this.filterStaleSyncOnly ||
      this.activeStatusFilter !== 'all'
    );
  }

  get hasToolbarFilters(): boolean {
    return !!(this.searchCtrl.value?.trim() || this.activeStatusFilter !== 'all');
  }

  clearToolbarFilters(): void {
    this.searchCtrl.reset('');
    this.setStatusFilter('all');
  }

  ngOnInit(): void {
    combineLatest([
      this.telemetry.devices$,
      this.route.queryParamMap,
      this.searchCtrl.valueChanges.pipe(startWith(this.searchCtrl.value ?? '')),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([devices, params, query]) => {
        this.allDevices = devices;
        this.loading = false;
        this.applyQueryParams(params);
        this.filtered = this.applyFilters(
          devices,
          query ?? this.searchCtrl.value ?? '',
          this.activeStatusFilter,
        );
        this.cdr.detectChanges();
      });
  }

  setStatusFilter(status: StatusFilter): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: status === 'all' ? null : status },
      queryParamsHandling: 'merge',
    });
  }

  clearUrlFilters(): void {
    void this.router.navigate(['/device-list']);
  }

  private applyQueryParams(params: ParamMap): void {
    const status = params.get('status');
    if (status === 'online' || status === 'delayed' || status === 'offline') {
      this.activeStatusFilter = status;
    } else {
      this.activeStatusFilter = 'all';
    }

    this.filterTenantId = params.get('tenant');
    this.filterMerchantId = params.get('merchant');
    this.filterStaleSyncOnly = params.get('staleSync') === 'true';
  }

  countByStatus(status: DeviceStatus): number {
    return this.allDevices.filter(d => d.status === status).length;
  }

  private applyFilters(
    devices: DeviceSummary[],
    query: string,
    status: StatusFilter,
  ): DeviceSummary[] {
    const q = query.toLowerCase().trim();
    return devices.filter(d => {
      const matchesStatus = status === 'all' || d.status === status;
      const matchesQuery =
        !q ||
        d.metadata.alias.toLowerCase().includes(q) ||
        d.metadata.deviceId.toLowerCase().includes(q) ||
        d.metadata.merchantId.toLowerCase().includes(q) ||
        d.metadata.tenantId.toLowerCase().includes(q);
      const matchesTenant = !this.filterTenantId || d.metadata.tenantId === this.filterTenantId;
      const matchesMerchant =
        !this.filterMerchantId || d.metadata.merchantId === this.filterMerchantId;
      const matchesStaleSync = !this.filterStaleSyncOnly || isStaleSync(d);
      return (
        matchesStatus &&
        matchesQuery &&
        matchesTenant &&
        matchesMerchant &&
        matchesStaleSync
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
