# Getting Started with RuuviTag Test Drive Tracker

This guide will walk you through setting up the complete RuuviTag Test Drive Tracker system for the hackathon.

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **RuuviTag Pro** device with GPS
- **Mobile device** (iOS/Android) for the mobile app

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd ruuvitag-dealership
npm install
```

### 2. Setup Database

```bash
# Create PostgreSQL database
createdb ruuvitag

# Or using psql
psql -U postgres
CREATE DATABASE ruuvitag;
\q
```

### 3. Configure Environment Variables

#### API (.env)
```bash
cd api
cp .env.example .env
```

Edit `api/.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/ruuvitag"
JWT_SECRET="your-random-secret-key-here"
PORT=3001
```

#### Dashboard (.env)
```bash
cd ../dashboard
cp .env.example .env
```

Edit `dashboard/.env`:
```
VITE_API_URL=http://localhost:3001
```

### 4. Initialize Database

```bash
cd ../api
npm install
npm run db:push
```

### 5. Start Development Servers

Open 3 terminal windows:

**Terminal 1 - API Server:**
```bash
cd api
npm run dev
```

**Terminal 2 - Dashboard:**
```bash
cd dashboard
npm install
npm run dev
```

**Terminal 3 - Mobile App (optional):**
```bash
cd mobile
# See mobile/README.md for React Native setup
```

### 6. Access the Dashboard

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Detailed Setup

### Database Schema

The database will be automatically created with these tables:
- `vehicles` - Vehicle inventory
- `customers` - Customer information
- `salespeople` - Salesperson accounts
- `test_drives` - Test drive records
- `locations` - GPS tracking data
- `sensor_data` - RuuviTag sensor readings
- `alerts` - System alerts

### Seeding Test Data

Create a seed file `api/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      make: 'Tesla',
      model: 'Model 3',
      year: 2024,
      vin: 'TEST123456789',
      color: 'Blue',
      ruuviTagMac: 'AA:BB:CC:DD:EE:FF',
    },
  });

  // Create salesperson
  const sales = await prisma.salesPerson.create({
    data: {
      name: 'John Doe',
      email: 'john@dealership.com',
      phone: '+1234567890',
      role: 'Senior Sales',
    },
  });

  // Create customer
  const customer = await prisma.customer.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+0987654321',
      driversLicense: 'DL123456',
    },
  });

  console.log('✅ Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npm install -D ts-node
npx ts-node prisma/seed.ts
```

### RuuviTag Configuration

1. **Find your RuuviTag MAC address:**
   - Download [RuuviTag app](https://ruuvi.com/downloads/) on your phone
   - Scan for nearby RuuviTags
   - Note the MAC address (format: AA:BB:CC:DD:EE:FF)

2. **Update vehicle with RuuviTag MAC:**
   ```bash
   # Open Prisma Studio
   cd api
   npm run db:studio
   ```
   - Navigate to `vehicles` table
   - Edit a vehicle and add the RuuviTag MAC address

### API Endpoints

Once the API is running on `http://localhost:3001`:

#### Health Check
```bash
curl http://localhost:3001/health
```

#### Create Test Drive
```bash
curl -X POST http://localhost:3001/api/testdrives \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "your-vehicle-id",
    "customerId": "your-customer-id",
    "salesPersonId": "your-salesperson-id"
  }'
```

#### Submit Location
```bash
curl -X POST http://localhost:3001/api/ruuvitag/location \
  -H "Content-Type: application/json" \
  -d '{
    "testDriveId": "test-drive-id",
    "latitude": 65.0121,
    "longitude": 25.4651,
    "speed": 50
  }'
```

#### Submit Sensor Data
```bash
curl -X POST http://localhost:3001/api/ruuvitag/sensor \
  -H "Content-Type: application/json" \
  -d '{
    "testDriveId": "test-drive-id",
    "temperature": 22.5,
    "humidity": 45,
    "pressure": 1013,
    "battery": 85
  }'
```

## Testing the System

### 1. Test Without RuuviTag

Use the API endpoints directly to simulate test drives:

```bash
# Terminal 1: Start a test drive
curl -X POST http://localhost:3001/api/testdrives \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "your-vehicle-id",
    "customerId": "your-customer-id",
    "salesPersonId": "your-salesperson-id"
  }'

# Terminal 2: Submit fake location updates
while true; do
  curl -X POST http://localhost:3001/api/ruuvitag/location \
    -H "Content-Type: application/json" \
    -d '{
      "testDriveId": "your-test-drive-id",
      "latitude": '$((RANDOM % 90))',
      "longitude": '$((RANDOM % 180))',
      "speed": '$((RANDOM % 100))
    }'
  sleep 5
done
```

### 2. Test With RuuviTag

If you have a physical RuuviTag:

1. Power on the RuuviTag
2. The mobile app will automatically scan for it
3. Start a test drive from the mobile app
4. Move around with the RuuviTag
5. Watch the dashboard for real-time updates

## Troubleshooting

### Database Connection Error
```
Error: P1001: Can't reach database server
```
**Solution:** Ensure PostgreSQL is running:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Start PostgreSQL service from Services panel
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Kill the process using the port:
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or use a different port in .env
PORT=3002
```

### Prisma Client Not Generated
```
Error: @prisma/client did not initialize yet
```
**Solution:** Generate Prisma client:
```bash
cd api
npm run db:generate
```

### CORS Errors in Dashboard
```
Access to fetch blocked by CORS policy
```
**Solution:** Ensure API CORS is configured:
- Check `api/src/index.ts` has `app.use(cors())`
- Verify `VITE_API_URL` in dashboard `.env` is correct

## Next Steps

1. **Customize the Dashboard**
   - Add your branding
   - Customize colors in CSS
   - Add additional analytics

2. **Deploy to Production**
   - API: Deploy to Heroku, Railway, or AWS
   - Dashboard: Deploy to Vercel or Netlify
   - Mobile: Publish to App Store / Google Play

3. **Add Features**
   - Email notifications
   - SMS alerts
   - Route replay on map
   - PDF report generation
   - Customer signatures

4. **Security**
   - Add authentication (JWT)
   - Rate limiting
   - Input validation
   - HTTPS in production

## Support

For questions or issues:
- Check the main [README.md](README.md)
- Review API documentation in [api/README.md](api/README.md)
- Mobile app setup in [mobile/README.md](mobile/README.md)

## License

MIT
