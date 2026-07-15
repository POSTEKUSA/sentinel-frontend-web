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

  /** Etiqueta display para el status */
  getLabel(status: DeviceStatus): string {
    switch (status) {
      case 'online':
        return 'En línea';
      case 'delayed':
        return 'Retrasado';
      case 'offline':
        return 'Fuera de línea';
    }
  }

  /** Formatea un timestamp ISO a relatividad en español */
  formatRelative(isoString: string): string {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return 'hace un momento';
    if (diffMin < 60) return `hace ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `hace ${diffH} h`;
    return `hace ${Math.floor(diffH / 24)} d`;
  }
}
