import { DeviceSummary, DeviceStatus } from '../models/device-summary.model';
import { TelemetryEvent } from '../models/telemetry-event.model';

/** Minutes between last heartbeat and last sync before flagging stale sync (online devices). */
export const SYNC_STALE_LAG_MINUTES = 10;

export interface FleetGroupSummary {
  groupId: string;
  total: number;
  online: number;
  delayed: number;
  offline: number;
}

export interface FleetEventRow {
  event: TelemetryEvent;
  deviceId: string;
  deviceAlias: string;
}

export function getSyncLagMinutes(device: DeviceSummary): number {
  const heartbeat = new Date(device.lastHeartbeat).getTime();
  const sync = new Date(device.lastSync).getTime();
  return Math.max(0, Math.round((heartbeat - sync) / 60_000));
}

/** Online device whose last sync lags far behind its heartbeat. */
export function isStaleSync(device: DeviceSummary): boolean {
  return device.status === 'online' && getSyncLagMinutes(device) >= SYNC_STALE_LAG_MINUTES;
}

export function aggregateByTenant(devices: DeviceSummary[]): FleetGroupSummary[] {
  return aggregateByKey(devices, d => d.metadata.tenantId);
}

export function aggregateByMerchant(devices: DeviceSummary[]): FleetGroupSummary[] {
  return aggregateByKey(devices, d => d.metadata.merchantId);
}

function aggregateByKey(
  devices: DeviceSummary[],
  keyFn: (d: DeviceSummary) => string,
): FleetGroupSummary[] {
  const map = new Map<string, FleetGroupSummary>();

  for (const device of devices) {
    const groupId = keyFn(device);
    let row = map.get(groupId);
    if (!row) {
      row = { groupId, total: 0, online: 0, delayed: 0, offline: 0 };
      map.set(groupId, row);
    }
    row.total++;
    row[device.status]++;
  }

  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function collectRecentFleetEvents(
  devices: DeviceSummary[],
  limit = 10,
): FleetEventRow[] {
  const rows: FleetEventRow[] = [];

  for (const device of devices) {
    for (const event of device.recentEvents) {
      rows.push({
        event,
        deviceId: device.metadata.deviceId,
        deviceAlias: device.metadata.alias,
      });
    }
  }

  return rows
    .sort((a, b) => new Date(b.event.timestamp).getTime() - new Date(a.event.timestamp).getTime())
    .slice(0, limit);
}

export function countByStatus(devices: DeviceSummary[], status: DeviceStatus): number {
  return devices.filter(d => d.status === status).length;
}

export function getEventTypeIcon(eventType: TelemetryEvent['eventType']): string {
  switch (eventType) {
    case 'heartbeat': return 'favorite';
    case 'location': return 'location_on';
    case 'health': return 'monitor_heart';
    case 'sync': return 'sync';
    case 'alert': return 'notifications_active';
    default: return 'event';
  }
}

/** Devices to show on the attention / problem mini-map. */
export function getProblemDevices(devices: DeviceSummary[]): DeviceSummary[] {
  const ids = new Set<string>();
  const result: DeviceSummary[] = [];

  const add = (d: DeviceSummary) => {
    if (!ids.has(d.metadata.deviceId)) {
      ids.add(d.metadata.deviceId);
      result.push(d);
    }
  };

  for (const d of devices) {
    if (d.status !== 'online' || isStaleSync(d)) {
      add(d);
    }
  }

  return result;
}
