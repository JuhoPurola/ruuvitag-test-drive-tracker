/**
 * Shared TypeScript types for RuuviTag Test Drive Tracker
 * Used across mobile, dashboard, and API
 */

export interface TestDrive {
  id: string;
  vehicleId: string;
  vehicleName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  salesPersonId: string;
  salesPersonName: string;
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601
  status: TestDriveStatus;
  locations: Location[];
  sensorData: SensorData[];
  distance?: number; // in kilometers
  duration?: number; // in minutes
  notes?: string;
}

export enum TestDriveStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Location {
  id: string;
  testDriveId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number; // km/h
  heading?: number; // degrees
  accuracy?: number; // meters
  timestamp: string; // ISO 8601
}

export interface SensorData {
  id: string;
  testDriveId: string;
  temperature: number; // Celsius
  humidity: number; // percentage
  pressure: number; // hPa
  accelerationX?: number;
  accelerationY?: number;
  accelerationZ?: number;
  battery: number; // percentage
  rssi?: number; // signal strength
  timestamp: string; // ISO 8601
}

export interface RuuviTagReading {
  macAddress: string;
  temperature: number;
  humidity: number;
  pressure: number;
  accelerationX?: number;
  accelerationY?: number;
  accelerationZ?: number;
  battery: number;
  rssi: number;
  timestamp: string;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  available: boolean;
  ruuviTagMac?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  driversLicense: string;
  createdAt: string;
}

export interface SalesPerson {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface Alert {
  id: string;
  testDriveId: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  acknowledged: boolean;
}

export enum AlertType {
  GEOFENCE = 'geofence',
  SPEED = 'speed',
  DURATION = 'duration',
  BATTERY = 'battery',
  SENSOR = 'sensor',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export interface Analytics {
  totalTestDrives: number;
  activeTestDrives: number;
  completedTestDrives: number;
  averageDuration: number; // minutes
  averageDistance: number; // kilometers
  conversionRate: number; // percentage
  popularRoutes: RouteStats[];
  vehicleUtilization: VehicleStats[];
}

export interface RouteStats {
  startLocation: string;
  endLocation: string;
  count: number;
  averageDistance: number;
}

export interface VehicleStats {
  vehicleId: string;
  vehicleName: string;
  testDriveCount: number;
  totalDistance: number;
  utilization: number; // percentage
}

// API Request/Response types
export interface CreateTestDriveRequest {
  vehicleId: string;
  customerId: string;
  salesPersonId: string;
  notes?: string;
}

export interface CreateTestDriveResponse {
  testDrive: TestDrive;
  message: string;
}

export interface UpdateTestDriveRequest {
  endTime?: string;
  status?: TestDriveStatus;
  notes?: string;
}

export interface SubmitLocationRequest {
  testDriveId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

export interface SubmitSensorDataRequest {
  testDriveId: string;
  temperature: number;
  humidity: number;
  pressure: number;
  accelerationX?: number;
  accelerationY?: number;
  accelerationZ?: number;
  battery: number;
  rssi?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
