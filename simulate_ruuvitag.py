#!/usr/bin/env python3
"""
RuuviTag Data Simulator
Simulates sensor data from a RuuviTag and sends it to the test drive API.
"""

import requests
import time
import random
import sys
from datetime import datetime

# Configuration
API_URL = "https://ruuvitag-api-production.up.railway.app"
# API_URL = "http://localhost:3000"  # Uncomment for local testing

# Simulate realistic sensor values
def generate_sensor_data():
    """Generate realistic RuuviTag sensor data"""
    return {
        "temperature": round(random.uniform(18.0, 25.0), 2),  # Celsius
        "humidity": round(random.uniform(30.0, 60.0), 2),      # %
        "pressure": round(random.uniform(990.0, 1020.0), 2),   # hPa
        "batteryVoltage": round(random.uniform(2.8, 3.0), 3),  # V
        "accelerationX": round(random.uniform(-0.5, 0.5), 3),  # g
        "accelerationY": round(random.uniform(-0.5, 0.5), 3),  # g
        "accelerationZ": round(random.uniform(0.8, 1.2), 3),   # g
        "movementCounter": random.randint(0, 255)
    }

# Simulate GPS location (moving around Helsinki area)
def generate_location(iteration):
    """Generate realistic GPS coordinates simulating movement"""
    # Starting point: Helsinki city center
    base_lat = 60.1699
    base_lon = 24.9384

    # Simulate movement in a pattern
    offset = iteration * 0.0001
    lat = base_lat + (offset * random.uniform(-1, 1))
    lon = base_lon + (offset * random.uniform(-1, 1))

    return {
        "latitude": round(lat, 6),
        "longitude": round(lon, 6)
    }

def get_active_test_drives():
    """Fetch all active test drives"""
    try:
        response = requests.get(f"{API_URL}/api/testdrives?status=active", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                return data.get("data", [])
        return []
    except Exception as e:
        print(f"❌ Error fetching test drives: {e}")
        return []

def send_sensor_data(test_drive_id, sensor_data):
    """Send sensor data to the API"""
    try:
        # Add testDriveId to the sensor data and convert to expected format
        payload = {
            "testDriveId": test_drive_id,
            "temperature": sensor_data["temperature"],
            "humidity": sensor_data["humidity"],
            "pressure": sensor_data["pressure"],
            "accelerationX": sensor_data.get("accelerationX"),
            "accelerationY": sensor_data.get("accelerationY"),
            "accelerationZ": sensor_data.get("accelerationZ"),
            "battery": sensor_data.get("batteryVoltage", 3.0) * 33.33 if sensor_data.get("batteryVoltage") else 100,  # Convert voltage to percentage
        }
        response = requests.post(
            f"{API_URL}/api/ruuvitag/sensor",
            json=payload,
            timeout=10
        )
        return response.status_code == 200 or response.status_code == 201
    except Exception as e:
        print(f"❌ Error sending sensor data: {e}")
        return False

def send_location(test_drive_id, location_data):
    """Send location data to the API"""
    try:
        # Add testDriveId to the location data
        payload = {
            "testDriveId": test_drive_id,
            "latitude": location_data["latitude"],
            "longitude": location_data["longitude"],
        }
        response = requests.post(
            f"{API_URL}/api/ruuvitag/location",
            json=payload,
            timeout=10
        )
        return response.status_code == 200 or response.status_code == 201
    except Exception as e:
        print(f"❌ Error sending location: {e}")
        return False

def main():
    print("🏷️  RuuviTag Data Simulator")
    print("=" * 60)
    print(f"API Endpoint: {API_URL}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()

    iteration = 0

    try:
        while True:
            # Fetch active test drives
            test_drives = get_active_test_drives()

            if not test_drives:
                print(f"⏸️  No active test drives found. Waiting 10 seconds...")
                time.sleep(10)
                continue

            iteration += 1
            timestamp = datetime.now().strftime('%H:%M:%S')

            print(f"\n📡 Update #{iteration} at {timestamp}")
            print(f"   Found {len(test_drives)} active test drive(s)")

            for drive in test_drives:
                vehicle = drive.get("vehicle", {})
                customer = drive.get("customer", {})
                test_drive_id = drive.get("id")

                print(f"\n   🚗 {vehicle.get('year')} {vehicle.get('make')} {vehicle.get('model')}")
                print(f"      Customer: {customer.get('name')}")

                # Generate and send sensor data
                sensor_data = generate_sensor_data()
                print(f"      🌡️  Temp: {sensor_data['temperature']}°C, "
                      f"💧 Humidity: {sensor_data['humidity']}%, "
                      f"📊 Pressure: {sensor_data['pressure']}hPa")

                if send_sensor_data(test_drive_id, sensor_data):
                    print(f"      ✅ Sensor data sent")
                else:
                    print(f"      ❌ Failed to send sensor data")

                # Generate and send location data
                location = generate_location(iteration)
                print(f"      📍 Location: {location['latitude']}, {location['longitude']}")

                if send_location(test_drive_id, location):
                    print(f"      ✅ Location sent")
                else:
                    print(f"      ❌ Failed to send location")

            # Wait before next update (every 5 seconds)
            print(f"\n   ⏳ Waiting 5 seconds until next update...")
            time.sleep(5)

    except KeyboardInterrupt:
        print("\n\n🛑 Simulation stopped by user")
        print("=" * 60)
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
