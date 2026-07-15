import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BusyLoaderComponent } from '../../shared/busy-loader/busy-loader.component';
import * as L from 'leaflet';

import { TelemetryService } from '../../core/services/telemetry.service';
import { DeviceStatusService } from '../../core/services/device-status.service';
import { DeviceSummary, DeviceStatus } from '../../core/models/device-summary.model';

const STATUS_COLORS: Record<DeviceStatus, string> = {
  online:  '#43a047',
  delayed: '#eab308',
  offline: '#e53935',
};

function createMarkerIcon(status: DeviceStatus): L.DivIcon {
  const color = STATUS_COLORS[status];
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 14px; height: 14px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        ${status === 'online' ? 'animation: pulse-marker 1.6s infinite;' : ''}
      "></div>
    `,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  });
}

function createUserMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `
      <div class="user-location-marker-container" style="
        position: relative;
        width: 18px;
        height: 18px;
      ">
        <div style="
          width: 18px;
          height: 18px;
          background: #1e88e5;
          border: 3px solid #fff;
          border-radius: 50%;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
          position: absolute;
          top: 0;
          left: 0;
          z-index: 2;
        "></div>
        <div style="
          width: 30px;
          height: 30px;
          background: rgba(30, 136, 229, 0.4);
          border-radius: 50%;
          position: absolute;
          top: -6px;
          left: -6px;
          animation: user-pulse 2s infinite ease-out;
          z-index: 1;
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

@Component({
  selector: 'app-device-map',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    BusyLoaderComponent,
  ],
  templateUrl: './device-map.component.html',
  styleUrl: './device-map.component.css',
})
export class DeviceMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private map!: L.Map;
  private markers = new Map<string, L.Marker>();
  private mapReady = false;
  private pendingDevices: DeviceSummary[] = [];
  private geolocationStatus: 'pending' | 'success' | 'failed' = 'pending';
  private userMarker?: L.Marker;

  loading = true;
  filteredDeviceId: string | null = null;
  filteredDevice: DeviceSummary | undefined;
  displayDevices: DeviceSummary[] = [];
  private initiatedWithFilter = false;
  private hasCenteredInitially = false;

  constructor(
    private telemetry: TelemetryService,
    public statusSvc: DeviceStatusService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    console.log('[DeviceMapComponent] ngOnInit: subscribing to telemetry.devices$ and queryParamMap');
    combineLatest([
      this.telemetry.devices$,
      this.route.queryParamMap
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([devices, queryParams]) => {
          const deviceId = queryParams.get('deviceId');
          if (this.filteredDeviceId === null && deviceId) {
            this.initiatedWithFilter = true;
          }
          this.filteredDeviceId = deviceId;

          if (devices) {
            if (deviceId) {
              this.filteredDevice = devices.find(d => d.metadata.deviceId === deviceId);
              this.displayDevices = devices.filter(d => d.metadata.deviceId === deviceId);
            } else {
              this.filteredDevice = undefined;
              this.displayDevices = devices;
            }
          } else {
            this.filteredDevice = undefined;
            this.displayDevices = [];
          }

          console.log('[DeviceMapComponent] received devices:', devices?.length || 0, 'filtered:', !!deviceId);
          this.loading = false;
          this.cdr.detectChanges();
          
          if (this.mapReady) {
            try {
              this.renderMarkers(this.displayDevices);
              
              if (deviceId && this.displayDevices.length > 0) {
                const matchedMarker = this.markers.get(deviceId);
                if (matchedMarker) {
                  const latlng = matchedMarker.getLatLng();
                  this.map.setView(latlng, 15);
                  this.hasCenteredInitially = true;
                  setTimeout(() => {
                    matchedMarker.openPopup();
                  }, 100);
                }
              }

              setTimeout(() => {
                try {
                  this.map.invalidateSize();
                  this.cdr.detectChanges();
                } catch (e) {
                  console.error('[DeviceMapComponent] Error in invalidateSize:', e);
                }
              }, 50);
            } catch (e) {
              console.error('[DeviceMapComponent] Error in renderMarkers during update:', e);
            }
          } else {
            console.log('[DeviceMapComponent] map is not ready yet, saving pending devices');
            this.pendingDevices = this.displayDevices;
          }
        },
        error: (error) => {
          console.error('[DeviceMapComponent] Error in combineLatest stream:', error);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
  }

  ngAfterViewInit(): void {
    console.log('[DeviceMapComponent] ngAfterViewInit: scheduling initMap');
    setTimeout(() => {
      try {
        this.initMap();
      } catch (e) {
        console.error('[DeviceMapComponent] Error during initMap execution:', e);
        this.loading = false;
        this.cdr.detectChanges();
      }
    }, 0);
  }

  private initMap(): void {
    console.log('[DeviceMapComponent] initMap started');
    const managua: L.LatLngExpression = [12.1150, -86.2362];

    const mapContainer = document.getElementById('leaflet-map');
    console.log('[DeviceMapComponent] leaflet-map container element in DOM:', !!mapContainer);
    if (mapContainer) {
      mapContainer.addEventListener('click', (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const href = target.getAttribute('href');
        if (target.tagName === 'A' && href && href.startsWith('/device-info/')) {
          event.preventDefault();
          this.router.navigateByUrl(href);
        }
      });
    }

    try {
      this.map = L.map('leaflet-map', {
        center: managua,
        zoom: 12,
      });
      console.log('[DeviceMapComponent] Leaflet map initialized successfully');
    } catch (e) {
      console.error('[DeviceMapComponent] Leaflet map initialization failed:', e);
      throw e;
    }

    try {
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(this.map);
      console.log('[DeviceMapComponent] Carto Voyager tile layer added');
    } catch (e) {
      console.error('[DeviceMapComponent] Error adding tile layer:', e);
    }

    this.mapReady = true;

    setTimeout(() => {
      try {
        this.map.invalidateSize();
        this.cdr.detectChanges();
      } catch (e) {
        console.error('[DeviceMapComponent] Error in map.invalidateSize in initMap:', e);
      }
    }, 50);

    const hasDevices = this.pendingDevices.length > 0;
    console.log('[DeviceMapComponent] pendingDevices count:', this.pendingDevices.length);
    if (hasDevices) {
      try {
        this.renderMarkers(this.pendingDevices);
        this.pendingDevices = [];
        
        if (this.filteredDeviceId) {
          const matchedMarker = this.markers.get(this.filteredDeviceId);
          if (matchedMarker) {
            const latlng = matchedMarker.getLatLng();
            this.map.setView(latlng, 15);
            this.hasCenteredInitially = true;
            setTimeout(() => {
              matchedMarker.openPopup();
            }, 100);
          }
        }
      } catch (e) {
        console.error('[DeviceMapComponent] Error rendering pending markers:', e);
      }
    }

    console.log('[DeviceMapComponent] Requesting navigator geolocation...');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('[DeviceMapComponent] Geolocation success:', position.coords.latitude, position.coords.longitude);
          this.geolocationStatus = 'success';
          const userLatLng = L.latLng(position.coords.latitude, position.coords.longitude);
          
          try {
            if (!this.initiatedWithFilter && !this.hasCenteredInitially) {
              this.map.setView(userLatLng, 13);
              this.hasCenteredInitially = true;
            }

            if (this.userMarker) {
              this.userMarker.setLatLng(userLatLng);
            } else {
              this.userMarker = L.marker(userLatLng, { icon: createUserMarkerIcon() })
                .bindPopup('<b>Tu ubicación actual</b>')
                .addTo(this.map);
            }
            this.cdr.detectChanges();
          } catch (e) {
            console.error('[DeviceMapComponent] Error positioning user marker:', e);
          }
        },
        (error) => {
          console.warn('[DeviceMapComponent] Geolocation failed or denied:', error);
          this.geolocationStatus = 'failed';
          try {
            if (!this.hasCenteredInitially) {
              this.fallbackCentering();
            }
            this.cdr.detectChanges();
          } catch (e) {
            console.error('[DeviceMapComponent] Error during fallback centering:', e);
          }
        }
      );
    } else {
      console.warn('[DeviceMapComponent] Geolocation not supported by browser');
      this.geolocationStatus = 'failed';
      try {
        this.fallbackCentering();
        this.cdr.detectChanges();
      } catch (e) {
        console.error('[DeviceMapComponent] Error during fallback centering:', e);
      }
    }
  }

  private fallbackCentering(): void {
    if (this.hasCenteredInitially) return;

    if (this.filteredDeviceId) {
      const matched = this.markers.get(this.filteredDeviceId);
      if (matched) {
        this.map.setView(matched.getLatLng(), 15);
        this.hasCenteredInitially = true;
      }
    } else if (this.markers.size > 0) {
      const bounds = Array.from(this.markers.values()).map(m => m.getLatLng());
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
      this.hasCenteredInitially = true;
    }
  }

  private renderMarkers(devices: DeviceSummary[]): void {
    const currentIds = new Set(devices.map(d => d.metadata.deviceId));

    // Remove stale markers
    this.markers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        this.markers.delete(id);
      }
    });

    const bounds: L.LatLng[] = [];

    devices.forEach(device => {
      const { latitude, longitude } = device.location;
      const id = device.metadata.deviceId;
      const latlng = L.latLng(latitude, longitude);
      bounds.push(latlng);

      const popupHtml = `
        <div style="min-width:160px; font-family: inherit;">
          <div style="font-weight:600; margin-bottom:4px;">${device.metadata.alias}</div>
          <div style="font-size:12px; color:#555; margin-bottom:6px;">${id}</div>
          <div style="font-size:12px; margin-bottom:2px;">🔋 ${device.health.batteryLevel}%</div>
          <div style="font-size:12px; margin-bottom:2px;">📡 ${device.health.networkType.toUpperCase()}</div>
          <div style="font-size:12px; margin-bottom:6px;">🕐 ${this.statusSvc.formatRelative(device.lastHeartbeat)}</div>
          <div style="font-size:12px; margin-bottom:6px;">${this.statusSvc.getLabel(device.status)}</div>
          <a href="/device-info/${id}" style="font-size:12px; color:#1565c0;">Ver detalle →</a>
        </div>
      `;

      if (this.markers.has(id)) {
        const existing = this.markers.get(id)!;
        existing.setLatLng(latlng);
        existing.setIcon(createMarkerIcon(device.status));
        existing.getPopup()?.setContent(popupHtml);
      } else {
        const marker = L.marker(latlng, { icon: createMarkerIcon(device.status) })
          .bindPopup(popupHtml)
          .addTo(this.map);
        this.markers.set(id, marker);
      }
    });

    if (this.geolocationStatus === 'failed' && bounds.length > 0) {
      if (!this.hasCenteredInitially) {
        if (this.filteredDeviceId && bounds.length === 1) {
          this.map.setView(bounds[0], 15);
          this.hasCenteredInitially = true;
        } else {
          this.map.fitBounds(L.latLngBounds(bounds), { padding: [40, 40] });
          this.hasCenteredInitially = true;
        }
      }
    }
  }

  clearFilter(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { deviceId: null },
      queryParamsHandling: 'merge',
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.map?.remove();
  }
}
