# RuuviTag Mobile App - Test Drive Tracker

## Overview
React Native mobile application for salespeople to manage test drives with RuuviTag Pro sensor integration.

## Features
- Start/stop test drives with one tap
- Real-time GPS location tracking
- RuuviTag Bluetooth Low Energy (BLE) scanning and data collection
- Customer information capture
- Push notifications for alerts
- Offline support with local data caching

## Prerequisites
- Node.js 20+
- React Native development environment
- iOS: Xcode 14+ (macOS only)
- Android: Android Studio with SDK 31+
- Physical device recommended for BLE and GPS testing

## Setup

### 1. Initialize React Native Project
```bash
# Using React Native CLI
npx react-native@latest init RuuviTagMobile --template react-native-template-typescript

# Or using Expo (recommended for faster development)
npx create-expo-app RuuviTagMobile --template blank-typescript
```

### 2. Install Dependencies
```bash
cd mobile
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context
npm install react-native-ble-plx  # Bluetooth Low Energy
npm install @react-native-community/geolocation  # GPS
npm install react-native-maps  # Map integration
npm install @react-native-async-storage/async-storage  # Local storage
npm install axios  # API calls
npm install socket.io-client  # Real-time updates
```

### 3. Platform-Specific Configuration

#### iOS (Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to track test drives</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>We need your location to track test drives</string>
<key>NSBluetoothAlwaysUsageDescription</key>
<string>We need Bluetooth to connect to RuuviTag sensors</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>We need Bluetooth to connect to RuuviTag sensors</string>
```

#### Android (AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
```

### 4. Environment Configuration
Create `.env` file:
```
API_URL=http://your-api-url:3001
RUUVITAG_MAC=AA:BB:CC:DD:EE:FF
```

## Key Components

### Screens
- **HomeScreen**: Dashboard with active test drive status
- **StartTestDriveScreen**: Customer information form
- **ActiveTestDriveScreen**: Real-time tracking display
- **TestDriveHistoryScreen**: Past test drive list
- **SettingsScreen**: App configuration

### Services

#### BLE Service (services/ble.ts)
```typescript
import { BleManager, Device } from 'react-native-ble-plx';
import { parseRuuviTagFormat5 } from '../../shared/utils/ruuvitag-parser';

export class RuuviTagBLEService {
  private manager: BleManager;
  private deviceMac: string;

  constructor(deviceMac: string) {
    this.manager = new BleManager();
    this.deviceMac = deviceMac;
  }

  async startScanning(onData: (data: RuuviTagData) => void): Promise<void> {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('BLE scan error:', error);
        return;
      }

      if (device?.id === this.deviceMac && device.manufacturerData) {
        const data = Buffer.from(device.manufacturerData, 'base64');
        const parsed = parseRuuviTagFormat5(data, device.id, device.rssi);
        if (parsed) onData(parsed);
      }
    });
  }

  stopScanning(): void {
    this.manager.stopDeviceScan();
  }
}
```

#### GPS Service (services/gps.ts)
```typescript
import Geolocation from '@react-native-community/geolocation';

export class GPSService {
  private watchId: number | null = null;

  startTracking(onLocation: (coords: GeolocationCoordinates) => void): void {
    this.watchId = Geolocation.watchPosition(
      (position) => {
        onLocation(position.coords);
      },
      (error) => {
        console.error('GPS error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
      }
    );
  }

  stopTracking(): void {
    if (this.watchId) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }
}
```

#### API Service (services/api.ts)
```typescript
import axios from 'axios';
import { API_URL } from '../config';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const startTestDrive = async (data: CreateTestDriveRequest) => {
  const response = await api.post('/api/testdrives', data);
  return response.data;
};

export const submitLocation = async (data: SubmitLocationRequest) => {
  await api.post('/api/ruuvitag/location', data);
};

export const submitSensorData = async (data: SubmitSensorDataRequest) => {
  await api.post('/api/ruuvitag/sensor', data);
};
```

## Workflow

### Starting a Test Drive
1. Salesperson opens app
2. Taps "Start Test Drive"
3. Enters customer information
4. Selects vehicle from list
5. App starts GPS tracking
6. App connects to RuuviTag via BLE
7. Real-time data sent to API

### During Test Drive
- GPS location updates every 5 seconds
- RuuviTag sensor data collected every 10 seconds
- Data sent to backend API
- Dashboard receives real-time updates via WebSocket
- Alerts generated for geofence, speed, battery

### Ending a Test Drive
1. Salesperson taps "End Test Drive"
2. App stops GPS and BLE tracking
3. Final data sent to API
4. Summary shown to salesperson
5. Vehicle marked as available

## Development Commands
```bash
# iOS
npm run ios

# Android
npm run android

# Start Metro bundler
npm start

# Run tests
npm test

# Build for production
npm run build:ios
npm run build:android
```

## Testing
- Use RuuviTag simulator for BLE testing
- Use GPS simulator in Xcode/Android Studio
- Test with actual RuuviTag device for production
- Test offline scenarios with airplane mode

## Deployment
- iOS: Submit to App Store via App Store Connect
- Android: Submit to Google Play Console
- Use Fastlane for automated deployment

## Notes
- Requires Bluetooth and GPS permissions
- Best tested on physical devices
- Battery optimization important for background tracking
- Consider implementing background location services carefully (privacy concerns)
