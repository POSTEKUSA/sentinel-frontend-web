import { Injectable } from '@angular/core';
import { DeviceStatus } from '../models/device-summary.model';

@Injectable({ providedIn: 'root' })
export class DeviceStatusService {
  /**
   * Calcula el estado del dispositivo basado en el último heartbeat.
   * Online:  < 2 min
   * Delayed: 2–5 min
   * Offline: > 5 min
   */
  computeStatus(lastHeartbeatIso: string): DeviceStatus {
    const diffMs = Date.now() - new Date(lastHeartbeatIso).getTime();
    const diffMin = diffMs / 60_000;

    if (diffMin < 2) return 'online';
    if (diffMin < 5) return 'delayed';
    return 'offline';
  }

  // /** Etiqueta display para el status */
  // getLabel(status: DeviceStatus): string {
  //   switch (status) {
  //     case 'online':  return 'Online';
  //     case 'delayed': return 'Delayed';
  //     case 'offline': return 'Offline';
  //   }
  // }

  // /** Color Material para el status */
  // getColor(status: DeviceStatus): 'primary' | 'warn' | 'accent' {
  //   //TODO
  //   switch (status) {
  //     case 'online':  return 'primary';
  //     case 'delayed': return 'accent';
  //     case 'offline': return 'warn';
  //   }
  // }

  /** Formatea un timestamp ISO a "X min ago" / "X h ago" */
  formatRelative(isoString: string): string {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH} h ago`;
    return `${Math.floor(diffH / 24)} d ago`;
  }
}
