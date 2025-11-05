# RuuviTag Physical Sensor Reader

This guide explains how to use your actual physical RuuviTag sensor with the test drive system.

## Prerequisites

1. **Physical RuuviTag sensor** - Make sure it's powered on and nearby
2. **Bluetooth enabled** - Your Mac must have Bluetooth turned on
3. **Python packages installed** - Run: `pip3 install ruuvitag-sensor requests`

## Finding Your RuuviTag MAC Address

You need the MAC address of your RuuviTag sensor. You can find it in several ways:

1. **RuuviTag Mobile App** - Open the app and view device settings
2. **Bluetooth Scanner** - Use any Bluetooth scanner app on your phone
3. **On the Sensor** - Some RuuviTags have the MAC printed on them

The MAC address format is: `AA:BB:CC:DD:EE:FF`

## Quick Start (Easiest Method)

Run the startup script which will guide you through configuration:

```bash
cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership
./start_ruuvitag_reader.sh
```

The script will:
- Check if required packages are installed
- Ask for your RuuviTag MAC address
- Optionally ask for a test drive ID (or auto-detect)
- Start reading sensor data

## Manual Start

If you prefer to run the reader directly:

```bash
cd /Users/juhopurola/Documents/repos/node-playground/ruuvitag-dealership

# Set your RuuviTag MAC address
export RUUVITAG_MAC="AA:BB:CC:DD:EE:FF"

# Optional: Set a specific test drive ID
export TEST_DRIVE_ID="your-test-drive-id"

# Run the reader
python3 real_ruuvitag_reader.py
```

## How It Works

The reader will:

1. **Scan for your RuuviTag** - Using Bluetooth LE
2. **Auto-detect test drive** - If no TEST_DRIVE_ID is provided, it will automatically find active test drives for your RuuviTag
3. **Read sensor data** - Every time the RuuviTag broadcasts (approximately every 1-2 seconds)
4. **Send to API** - Forwards data to the Railway API at: https://ruuvitag-api-production.up.railway.app
5. **Display in dashboard** - Data appears in real-time at: http://localhost:5173

## Data Being Read

The reader collects:
- **Temperature** (°C)
- **Humidity** (%)
- **Pressure** (hPa)
- **Acceleration X** - Forward/backward motion (g)
- **Acceleration Y** - Left/right motion (g)
- **Acceleration Z** - Up/down motion (g)
- **Battery** - Converted from mV to percentage

## Dashboard Features

Once data is flowing, the dashboard will show:
- Real-time sensor readings (refreshes every 3 seconds)
- Driving behavior analysis (hard accelerations, braking, sharp turns)
- Driving score (0-100) with 5 rating levels:
  - 90+: Excellent Driver
  - 75-89: Safe Driver
  - 60-74: Moderate Driver
  - 40-59: Risky Driver
  - 0-39: Dangerous Driver

## Troubleshooting

### "No active test drives found"
1. Make sure you've started a test drive from the mobile app
2. Verify the vehicle has the correct RuuviTag MAC address configured
3. Check that the test drive status is "active"

### "Cannot find RuuviTag"
1. Make sure the RuuviTag is powered on and nearby (within ~10 meters)
2. Verify Bluetooth is enabled on your Mac
3. Try moving the RuuviTag closer
4. Double-check the MAC address is correct

### "Required packages not installed"
Run the installation command:
```bash
pip3 install ruuvitag-sensor requests
```

### "Permission denied"
Make the startup script executable:
```bash
chmod +x start_ruuvitag_reader.sh
```

## Example Output

When working correctly, you'll see output like:

```
============================================================
🏷️  Real RuuviTag Reader
============================================================
API URL: https://ruuvitag-api-production.up.railway.app
RuuviTag MAC: AA:BB:CC:DD:EE:FF

✅ Found active test drive:
   Vehicle: 2024 Toyota RAV4
   Customer: John Doe
   Test Drive ID: abc123

🔍 Scanning for RuuviTag...
   Looking for MAC: AA:BB:CC:DD:EE:FF
   Press Ctrl+C to stop

📡 Received data from AA:BB:CC:DD:EE:FF
   Temperature: 22.5°C
   Humidity: 45.3%
   Pressure: 1013.2 hPa
   Acceleration: X=0.012, Y=-0.003, Z=0.998 g
   Battery: 2950 mV
   ✅ Data sent to API successfully
```

## Stopping the Reader

Press `Ctrl+C` to stop the reader at any time.

## Support

If you encounter issues:
1. Check that the API is running: https://ruuvitag-api-production.up.railway.app/health
2. Verify the dashboard is running: http://localhost:5173
3. Make sure you have an active test drive in the system
