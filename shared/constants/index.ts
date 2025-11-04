/**
 * Shared constants across the application
 */

// RuuviTag BLE Service UUID
export const RUUVITAG_SERVICE_UUID = '6E400001-B5A3-F393-E0A9-E50E24DCCA9E';
export const RUUVITAG_MANUFACTURER_ID = 0x0499;

// Alert thresholds
export const GEOFENCE_RADIUS_KM = 10;
export const SPEED_LIMIT_KMH = 120;
export const MAX_TEST_DRIVE_DURATION_MIN = 120;
export const LOW_BATTERY_THRESHOLD_PERCENT = 20;
export const CRITICAL_BATTERY_THRESHOLD_PERCENT = 10;

// Update intervals (in milliseconds)
export const LOCATION_UPDATE_INTERVAL_MS = 5000; // 5 seconds
export const SENSOR_UPDATE_INTERVAL_MS = 10000; // 10 seconds
export const WEBSOCKET_RECONNECT_INTERVAL_MS = 3000;

// API endpoints
export const DEFAULT_API_URL = 'http://localhost:3001';
