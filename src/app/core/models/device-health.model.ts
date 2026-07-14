export interface DeviceHealth {
  deviceId: string;
  batteryLevel: number;       // 0–100
  batteryCharging: boolean;
  networkType: 'wifi' | 'lte' | '3g' | 'none' | string;
  networkStrength: number;    // 0–4 bars
  cpuUsage?: number;          // 0–100 %
  memoryUsage?: number;       // 0–100 %
  storageTotal?: number;      // total storage in GB
  storageUsed?: number;       // used storage in GB
  timestamp: string;
}
