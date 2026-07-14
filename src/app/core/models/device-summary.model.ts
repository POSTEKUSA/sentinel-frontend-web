import { DeviceHealth } from './device-health.model';
import { DeviceLocation } from './device-location.model';
import { DeviceMetadata } from './device-metadata.model';
import { TelemetryEvent } from './telemetry-event.model';

export type DeviceStatus = 'online' | 'delayed' | 'offline';

export interface DeviceSummary {
  metadata: DeviceMetadata;
  health: DeviceHealth;
  location: DeviceLocation;
  lastHeartbeat: string;   // ISO 8601
  lastSync: string;        // ISO 8601
  status: DeviceStatus;
  recentEvents: TelemetryEvent[];
}
