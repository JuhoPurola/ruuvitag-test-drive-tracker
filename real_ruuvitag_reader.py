#!/usr/bin/env python3
"""
Real RuuviTag Reader
Reads data from physical RuuviTag sensors and sends to API
Requires: pip install ruuvitag-sensor requests
"""

import os
import sys
import time
import requests
from ruuvitag_sensor.ruuvi import RuuviTagSensor

# API Configuration
API_URL = os.getenv('API_URL', 'https://ruuvitag-api-production.up.railway.app')

# RuuviTag MAC address (from your vehicle configuration)
RUUVITAG_MAC = os.getenv('RUUVITAG_MAC', 'AA:BB:CC:DD:EE:FF')

# Test Drive ID (you'll need to pass this when starting)
TEST_DRIVE_ID = os.getenv('TEST_DRIVE_ID', '')


def get_active_test_drives():
    """Fetch active test drives from API"""
    try:
        response = requests.get(f"{API_URL}/api/testdrives", timeout=10)
        data = response.json()
        if data['success']:
            # Filter for active test drives with our RuuviTag
            active_drives = [
                drive for drive in data['data']
                if drive['status'] == 'active' and
                drive['vehicle'].get('ruuviTagMac') == RUUVITAG_MAC
            ]
            return active_drives
        return []
    except Exception as e:
        print(f"❌ Error fetching test drives: {e}")
        return []


def send_sensor_data(test_drive_id, sensor_data):
    """Send sensor data to the API"""
    try:
        # Convert RuuviTag data format to API format
        payload = {
            "testDriveId": test_drive_id,
            "temperature": sensor_data.get('temperature'),
            "humidity": sensor_data.get('humidity'),
            "pressure": sensor_data.get('pressure'),
            "accelerationX": sensor_data.get('acceleration_x', 0),
            "accelerationY": sensor_data.get('acceleration_y', 0),
            "accelerationZ": sensor_data.get('acceleration_z', 0),
            "battery": sensor_data.get('battery', 3000),  # Convert mV to percentage
        }

        # Convert battery voltage to percentage (rough estimation)
        if 'battery' in sensor_data:
            battery_mv = sensor_data['battery']
            # RuuviTag battery range: ~2000mV (dead) to ~3000mV (full)
            battery_percent = min(100, max(0, ((battery_mv - 2000) / 1000) * 100))
            payload['battery'] = battery_percent

        response = requests.post(
            f"{API_URL}/api/ruuvitag/sensor",
            json=payload,
            timeout=10
        )
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"❌ Error sending sensor data: {e}")
        return False


def main():
    """Main function to read from RuuviTag and send to API"""
    print("=" * 60)
    print("🏷️  Real RuuviTag Reader")
    print("=" * 60)
    print(f"API URL: {API_URL}")
    print(f"RuuviTag MAC: {RUUVITAG_MAC}")
    print()

    # Check if test drive ID is provided
    if not TEST_DRIVE_ID:
        print("🔍 No TEST_DRIVE_ID provided, checking for active test drives...")
        active_drives = get_active_test_drives()

        if not active_drives:
            print("❌ No active test drives found for this RuuviTag")
            print("   Please start a test drive from the mobile app first")
            sys.exit(1)

        test_drive_id = active_drives[0]['id']
        vehicle = active_drives[0]['vehicle']
        customer = active_drives[0]['customer']

        print(f"✅ Found active test drive:")
        print(f"   Vehicle: {vehicle['year']} {vehicle['make']} {vehicle['model']}")
        print(f"   Customer: {customer['name']}")
        print(f"   Test Drive ID: {test_drive_id}")
        print()
    else:
        test_drive_id = TEST_DRIVE_ID
        print(f"✅ Using provided test drive ID: {test_drive_id}")
        print()

    print("🔍 Scanning for RuuviTag...")
    print(f"   Looking for MAC: {RUUVITAG_MAC}")
    print("   Press Ctrl+C to stop")
    print()

    try:
        # Scan for the specific RuuviTag
        for data in RuuviTagSensor.get_data_for_sensors([RUUVITAG_MAC]):
            mac, sensor_data = data

            print(f"📡 Received data from {mac}")
            print(f"   Temperature: {sensor_data.get('temperature', 'N/A')}°C")
            print(f"   Humidity: {sensor_data.get('humidity', 'N/A')}%")
            print(f"   Pressure: {sensor_data.get('pressure', 'N/A')} hPa")
            print(f"   Acceleration: X={sensor_data.get('acceleration_x', 'N/A')}, "
                  f"Y={sensor_data.get('acceleration_y', 'N/A')}, "
                  f"Z={sensor_data.get('acceleration_z', 'N/A')} g")
            print(f"   Battery: {sensor_data.get('battery', 'N/A')} mV")

            # Send to API
            if send_sensor_data(test_drive_id, sensor_data):
                print("   ✅ Data sent to API successfully")
            else:
                print("   ❌ Failed to send data to API")

            print()
            time.sleep(2)  # Wait 2 seconds between readings

    except KeyboardInterrupt:
        print("\n\n🛑 Reader stopped by user")
        print("=" * 60)
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        print("=" * 60)
        print("\n💡 Troubleshooting:")
        print("   1. Make sure the RuuviTag is nearby and powered on")
        print("   2. Verify Bluetooth is enabled on this device")
        print("   3. Install required packages: pip install ruuvitag-sensor requests")
        print("   4. Check the MAC address matches your RuuviTag")
        sys.exit(1)


if __name__ == "__main__":
    main()
