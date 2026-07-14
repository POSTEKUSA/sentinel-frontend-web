export interface TelemetryEvent {
  id: string;
  deviceId: string;
  eventType: 'heartbeat' | 'location' | 'health' | 'sync' | 'alert' | 'custom';
  timestamp: string; // ISO 8601
  payload: Record<string, unknown>;
}
