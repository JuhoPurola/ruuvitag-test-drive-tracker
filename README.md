# RuuviTag Test Drive Tracker

## Overview
A comprehensive automotive dealership management system using RuuviTag Pro sensors to track and monitor test drives in real-time.

## System Components

### 🚗 Mobile App (React Native)
- Salesperson interface for test drive management
- Start/stop test drives with one tap
- Real-time vehicle location tracking
- Customer information capture
- Push notifications for alerts

### 🖥️ Dashboard (React Web App)
- Management interface for dealership staff
- Live map view of all active test drives
- Analytics and reporting
- Alert management
- Historical test drive data

### 🔌 Backend API (Node.js/Express)
- RuuviTag data processing
- Real-time WebSocket connections
- RESTful API endpoints
- PostgreSQL database
- Authentication and authorization

### 📡 RuuviTag Integration
- Bluetooth Low Energy (BLE) scanning
- GPS position tracking
- Environmental sensor data (temperature, humidity, pressure)
- Battery monitoring

## Hardware Requirements
- **1x RuuviTag Pro** with GPS module
- Android/iOS device with Bluetooth 4.0+
- Internet connection for data sync

## Technology Stack

### Frontend
- **Mobile**: React Native, TypeScript, React Navigation
- **Dashboard**: React 19, TypeScript, Vite, CSS Modules
- **State Management**: React Context API + Hooks

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io
- **Authentication**: JWT

### DevOps
- **Deployment**: Vercel (Dashboard), Heroku (API)
- **Version Control**: Git
- **Package Manager**: npm workspaces

## Project Structure

```
ruuvitag-dealership/
├── api/                    # Backend API
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── controllers/   # Business logic
│   │   ├── services/      # External services
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Express middleware
│   │   ├── config/        # Configuration files
│   │   └── types/         # TypeScript types
│   ├── prisma/            # Database schema
│   └── package.json
├── dashboard/             # React web dashboard
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # CSS modules
│   └── package.json
├── mobile/                # React Native mobile app
│   ├── src/
│   │   ├── screens/       # Screen components
│   │   ├── components/    # Reusable components
│   │   ├── navigation/    # Navigation setup
│   │   ├── services/      # API & BLE services
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript types
│   │   └── assets/        # Images, fonts
│   └── package.json
├── shared/                # Shared code
│   ├── types/             # Shared TypeScript types
│   ├── utils/             # Utility functions
│   └── constants/         # Constants
└── package.json           # Root workspace config
```

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Setup Environment Variables

**API (.env)**
```
DATABASE_URL="postgresql://user:password@localhost:5432/ruuvitag"
JWT_SECRET="your-secret-key"
PORT=3001
```

**Dashboard (.env)**
```
VITE_API_URL=http://localhost:3001
```

**Mobile (.env)**
```
API_URL=http://localhost:3001
RUUVITAG_MAC=AA:BB:CC:DD:EE:FF
```

### 3. Run Development Servers
```bash
# Terminal 1 - API
npm run api

# Terminal 2 - Dashboard
npm run dashboard

# Terminal 3 - Mobile
npm run mobile
```

## Features

### Test Drive Management
- ✅ Start/stop test drives with RuuviTag tracking
- ✅ Real-time GPS location updates
- ✅ Customer information capture
- ✅ Automatic time tracking
- ✅ Route history playback

### Safety & Alerts
- ⚠️ Geofence boundary alerts
- ⚠️ Speed limit notifications
- ⚠️ Extended duration warnings
- ⚠️ Low battery alerts

### Analytics
- 📊 Test drive statistics
- 📊 Popular routes
- 📊 Average duration and distance
- 📊 Conversion tracking
- 📊 Vehicle utilization reports

### Environmental Monitoring
- 🌡️ Interior temperature tracking
- 💧 Humidity levels
- 🔋 RuuviTag battery status

## API Endpoints

### Test Drives
```
POST   /api/testdrives        # Start new test drive
GET    /api/testdrives        # List all test drives
GET    /api/testdrives/:id    # Get test drive details
PUT    /api/testdrives/:id    # Update test drive
DELETE /api/testdrives/:id    # End test drive
```

### RuuviTag Data
```
POST   /api/ruuvitag/data     # Submit sensor data
GET    /api/ruuvitag/latest   # Get latest reading
```

### Analytics
```
GET    /api/analytics/stats   # Get statistics
GET    /api/analytics/routes  # Get popular routes
```

## Database Schema

```prisma
model TestDrive {
  id          String   @id @default(uuid())
  vehicleId   String
  customerId  String
  startTime   DateTime
  endTime     DateTime?
  status      String   # active, completed, cancelled
  locations   Location[]
  sensorData  SensorData[]
}

model Location {
  id          String   @id @default(uuid())
  testDriveId String
  latitude    Float
  longitude   Float
  speed       Float?
  timestamp   DateTime
}

model SensorData {
  id          String   @id @default(uuid())
  testDriveId String
  temperature Float
  humidity    Float
  pressure    Float
  battery     Int
  timestamp   DateTime
}
```

## Deployment

### API (Heroku)
```bash
cd api
heroku create ruuvitag-api
git push heroku main
```

### Dashboard (Vercel)
```bash
cd dashboard
vercel --prod
```

### Mobile App
- **iOS**: Submit to App Store via Xcode
- **Android**: Submit to Google Play via Android Studio

## License
MIT

## Support
For hackathon support, contact the development team.
