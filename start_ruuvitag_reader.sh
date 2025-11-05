#!/bin/bash

# RuuviTag Reader Startup Script
# This script helps you configure and start the RuuviTag reader

echo "============================================================"
echo "  RuuviTag Reader - Configuration"
echo "============================================================"
echo ""

# Check if packages are installed
if ! python3 -c "import ruuvitag_sensor" 2>/dev/null; then
  echo "❌ Required packages not installed"
  echo ""
  echo "Please install required packages first:"
  echo "  pip3 install ruuvitag-sensor requests"
  echo ""
  exit 1
fi

echo "✅ Required packages are installed"
echo ""

# Ask for RuuviTag MAC address
echo "Enter your RuuviTag MAC address (format: AA:BB:CC:DD:EE:FF):"
echo "(You can find this in the RuuviTag mobile app or on the sensor itself)"
read -p "MAC Address: " RUUVITAG_MAC

if [ -z "$RUUVITAG_MAC" ]; then
  echo "❌ MAC address is required"
  exit 1
fi

# Ask for test drive ID (optional)
echo ""
echo "Enter Test Drive ID (optional - leave empty to auto-detect):"
read -p "Test Drive ID: " TEST_DRIVE_ID

# Set environment variables and run
export API_URL="https://ruuvitag-api-production.up.railway.app"
export RUUVITAG_MAC="$RUUVITAG_MAC"
export TEST_DRIVE_ID="$TEST_DRIVE_ID"

echo ""
echo "============================================================"
echo "  Starting RuuviTag Reader"
echo "============================================================"
echo ""
echo "Configuration:"
echo "  API URL: $API_URL"
echo "  RuuviTag MAC: $RUUVITAG_MAC"
if [ -n "$TEST_DRIVE_ID" ]; then
  echo "  Test Drive ID: $TEST_DRIVE_ID"
fi
echo ""
echo "Press Ctrl+C to stop the reader"
echo ""

# Run the reader
python3 real_ruuvitag_reader.py
