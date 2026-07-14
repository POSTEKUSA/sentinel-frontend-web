export interface DeviceLocation {
  deviceId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;   // metros
  altitude?: number;   // metros
  timestamp: string;
}
