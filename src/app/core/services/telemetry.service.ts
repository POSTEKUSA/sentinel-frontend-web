import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, timer } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { MOCK_DEVICES } from '../mock/mock-devices';
import { DeviceSummary } from '../models/device-summary.model';
import { DeviceStatusService } from './device-status.service';

const POLL_INTERVAL_MS = 30_000;

@Injectable({ providedIn: 'root' })
export class TelemetryService {
  /** Stream que emite la lista de dispositivos cada 30 segundos */
  readonly devices$: Observable<DeviceSummary[]>;

  constructor(
    private http: HttpClient,
    private statusSvc: DeviceStatusService,
  ) {
    this.devices$ = timer(0, POLL_INTERVAL_MS).pipe(
      switchMap(() => this.fetchDevices()),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  /** Busca un dispositivo por ID desde el stream cacheado */
  getDevice(deviceId: string): Observable<DeviceSummary | undefined> {
    return this.devices$.pipe(
      map(devices => devices.find(d => d.metadata.deviceId === deviceId)),
    );
  }

  private fetchDevices(): Observable<DeviceSummary[]> {
    if (environment.useMockData) {
      // Recalcula el status dinámicamente en cada poll para que el tiempo sea realista
      const refreshed = MOCK_DEVICES.map(d => ({
        ...d,
        status: this.statusSvc.computeStatus(d.lastHeartbeat),
      }));
      return of(refreshed);
    }

    return this.http
      .get<DeviceSummary[]>(`${environment.apiBaseUrl}/telemetry/devices`)
      .pipe(
        map(devices =>
          devices.map(d => ({
            ...d,
            status: this.statusSvc.computeStatus(d.lastHeartbeat),
          })),
        ),
      );
  }
}
