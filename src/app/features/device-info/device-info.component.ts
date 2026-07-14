import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TelemetryService } from '../../core/services/telemetry.service';
import { DeviceStatusService } from '../../core/services/device-status.service';
import { DeviceSummary } from '../../core/models/device-summary.model';
import { StatusBadgeComponent } from '../../shared/status-badge/status-badge.component';
import { BatteryIndicatorComponent } from '../../shared/battery-indicator/battery-indicator.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-device-info',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatListModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    StatusBadgeComponent,
    BatteryIndicatorComponent,
    EmptyStateComponent,
  ],
  templateUrl: './device-info.component.html',
  styleUrl: './device-info.component.css',
})
export class DeviceInfoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  device: DeviceSummary | undefined;
  loading = true;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private telemetry: TelemetryService,
    public statusSvc: DeviceStatusService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => this.telemetry.getDevice(params.get('id') ?? '')),
        takeUntil(this.destroy$),
      )
      .subscribe(device => {
        this.loading = false;
        if (!device) {
          this.notFound = true;
        } else {
          this.device = device;
          this.notFound = false;
        }
      });
  }

  formatJson(obj: unknown): string {
    return JSON.stringify(obj, null, 2);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
