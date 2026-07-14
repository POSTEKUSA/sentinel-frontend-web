import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import * as L from 'leaflet';

import { DeviceSummary, DeviceStatus } from '../../core/models/device-summary.model';

const STATUS_COLORS: Record<DeviceStatus, string> = {
  online: '#43a047',
  delayed: '#fb8c00',
  offline: '#e53935',
};

function createMarkerIcon(status: DeviceStatus): L.DivIcon {
  const color = STATUS_COLORS[status];
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 12px; height: 12px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 1px 3px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
    popupAnchor: [0, -8],
  });
}

@Component({
  selector: 'app-dashboard-mini-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mini-map-shell" [class.fill-height]="fillHeight">
      <div [id]="mapElementId" class="mini-map-container"></div>
      @if (devices.length === 0) {
        <div class="mini-map-empty">No devices need attention</div>
      } @else if (showExpandControl) {
        <button
          type="button"
          class="map-expand-fab"
          title="Maximize map"
          aria-label="Maximize map"
          (click)="onExpandClick($event)">
          &#x26F6;
        </button>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }
    .mini-map-shell {
      position: relative;
      height: 100%;
      min-height: 280px;
    }
    .mini-map-shell.fill-height {
      min-height: 0;
      flex: 1;
    }
    .mini-map-container {
      height: 100%;
      width: 100%;
      min-height: 280px;
      border-radius: 8px;
      z-index: 0;
      cursor: pointer;
    }
    .fill-height .mini-map-shell {
      min-height: 0;
    }
    .fill-height .mini-map-container {
      min-height: 0;
    }
    .mini-map-empty {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      text-align: center;
      font-size: 13px;
      color: #64748b;
      background: #f8fafc;
      border-radius: 8px;
      pointer-events: none;
    }
    .map-expand-fab {
      position: absolute;
      right: 12px;
      bottom: 12px;
      z-index: 500;
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 8px;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #475569;
    }
    .map-expand-fab:hover {
      background: #f1f5f9;
    }
    .map-expand-fab {
      font-size: 18px;
      line-height: 1;
    }
  `],
})
export class DashboardMiniMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() devices: DeviceSummary[] = [];
  @Input() mapElementId = 'dashboard-mini-map';
  @Input() fillHeight = false;
  @Input() showExpandControl = false;
  @Output() expandRequested = new EventEmitter<void>();

  constructor(private router: Router) {}

  private map?: L.Map;
  private markers = new Map<string, L.Marker>();
  private mapReady = false;
  private pendingDevices: DeviceSummary[] = [];
  private popupClickHandler?: (event: MouseEvent) => void;

  ngAfterViewInit(): void {
    setTimeout(() => this.initMap(), 0);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['devices'] && this.mapReady && this.map) {
      this.renderMarkers(this.devices);
    } else if (changes['devices']) {
      this.pendingDevices = this.devices;
    }
  }

  ngOnDestroy(): void {
    const el = document.getElementById(this.mapElementId);
    if (el && this.popupClickHandler) {
      el.removeEventListener('click', this.popupClickHandler);
    }
    this.map?.remove();
    this.map = undefined;
  }

  onExpandClick(event: MouseEvent): void {
    event.stopPropagation();
    this.expandRequested.emit();
  }

  private initMap(): void {
    const el = document.getElementById(this.mapElementId);
    if (!el || this.map) return;

    const defaultCenter: L.LatLngExpression = [12.115, -86.236];

    this.map = L.map(this.mapElementId, {
      center: defaultCenter,
      zoom: 11,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(this.map);

    this.popupClickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const href = target.getAttribute('href');
      if (target.tagName === 'A' && href?.startsWith('/device-info/')) {
        event.preventDefault();
        void this.router.navigateByUrl(href);
      }
    };
    el.addEventListener('click', this.popupClickHandler);

    if (this.showExpandControl) {
      this.map.on('click', () => this.expandRequested.emit());
    }

    this.mapReady = true;

    if (this.pendingDevices.length > 0) {
      this.renderMarkers(this.pendingDevices);
      this.pendingDevices = [];
    } else {
      this.renderMarkers(this.devices);
    }

    setTimeout(() => this.map?.invalidateSize(), 50);
  }

  private renderMarkers(devices: DeviceSummary[]): void {
    if (!this.map) return;

    for (const marker of this.markers.values()) {
      marker.remove();
    }
    this.markers.clear();

    const bounds: L.LatLngExpression[] = [];

    for (const device of devices) {
      const { latitude, longitude } = device.location;
      if (latitude == null || longitude == null) continue;

      const latlng: L.LatLngExpression = [latitude, longitude];
      bounds.push(latlng);

      const marker = L.marker(latlng, { icon: createMarkerIcon(device.status) })
        .bindPopup(`
          <strong>${device.metadata.alias}</strong><br/>
          ${device.status}<br/>
          <a href="/device-info/${device.metadata.deviceId}">View details</a>
        `)
        .addTo(this.map);

      marker.on('click', (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
      });

      this.markers.set(device.metadata.deviceId, marker);
    }

    if (bounds.length === 1) {
      this.map.setView(bounds[0], 13);
    } else if (bounds.length > 1) {
      this.map.fitBounds(L.latLngBounds(bounds), { padding: [24, 24], maxZoom: 13 });
    }

    setTimeout(() => this.map?.invalidateSize(), 100);
  }
}
