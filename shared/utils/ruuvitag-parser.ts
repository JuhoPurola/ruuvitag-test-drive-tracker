/**
 * RuuviTag Data Parser
 * Parses RuuviTag sensor data from BLE advertisements
 * Supports RuuviTag format 5 (RAWv2)
 */

export interface RuuviTagData {
  macAddress: string;
  temperature: number; // Celsius
  humidity: number; // %
  pressure: number; // hPa
  accelerationX: number; // mG
  accelerationY: number; // mG
  accelerationZ: number; // mG
  battery: number; // mV
  txPower: number; // dBm
  movementCounter: number;
  measurementSequence: number;
  rssi?: number;
}

/**
 * Parse RuuviTag format 5 (RAWv2) data
 * Data format: https://docs.ruuvi.com/communication/bluetooth-advertisements/data-format-5-rawv2
 */
export function parseRuuviTagFormat5(data: Buffer | Uint8Array, macAddress: string, rssi?: number): RuuviTagData | null {
  try {
    // Check format (should be 0x05 for format 5)
    if (data[0] !== 0x05) {
      console.warn('Unknown RuuviTag format:', data[0]);
      return null;
    }

    // Temperature (index 1-2): -163.84°C to +163.83°C in 0.005°C increments
    const tempRaw = (data[1] << 8) | data[2];
    const temperature = tempRaw === 0x8000 ? NaN : tempRaw * 0.005;

    // Humidity (index 3-4): 0.0% to 163.83% in 0.0025% increments
    const humidityRaw = (data[3] << 8) | data[4];
    const humidity = humidityRaw === 0xFFFF ? NaN : humidityRaw * 0.0025;

    // Pressure (index 5-6): 50000Pa to 115535Pa in 1Pa increments
    const pressureRaw = (data[5] << 8) | data[6];
    const pressure = pressureRaw === 0xFFFF ? NaN : (pressureRaw + 50000) / 100; // Convert to hPa

    // Acceleration X (index 7-8): -32.767g to +32.767g in 0.001g increments
    const accelXRaw = (data[7] << 8) | data[8];
    const accelerationX = accelXRaw === 0x8000 ? NaN : (accelXRaw > 32767 ? accelXRaw - 65536 : accelXRaw);

    // Acceleration Y (index 9-10)
    const accelYRaw = (data[9] << 8) | data[10];
    const accelerationY = accelYRaw === 0x8000 ? NaN : (accelYRaw > 32767 ? accelYRaw - 65536 : accelYRaw);

    // Acceleration Z (index 11-12)
    const accelZRaw = (data[11] << 8) | data[12];
    const accelerationZ = accelZRaw === 0x8000 ? NaN : (accelZRaw > 32767 ? accelZRaw - 65536 : accelZRaw);

    // Battery voltage (index 13-14): 1600mV to 3647mV in 1mV increments
    const batteryRaw = (data[13] << 8) | data[14];
    const battery = batteryRaw === 0xFFFF ? NaN : (batteryRaw >> 5) + 1600;

    // TX Power (upper 5 bits of battery)
    const txPowerRaw = batteryRaw & 0x1F;
    const txPower = txPowerRaw === 0x1F ? NaN : txPowerRaw * 2 - 40;

    // Movement counter (index 15)
    const movementCounter = data[15];

    // Measurement sequence (index 16-17)
    const measurementSequence = (data[16] << 8) | data[17];

    return {
      macAddress,
      temperature: Math.round(temperature * 100) / 100,
      humidity: Math.round(humidity * 100) / 100,
      pressure: Math.round(pressure * 100) / 100,
      accelerationX: Math.round(accelerationX),
      accelerationY: Math.round(accelerationY),
      accelerationZ: Math.round(accelerationZ),
      battery: Math.round(battery),
      txPower: Math.round(txPower),
      movementCounter,
      measurementSequence,
      rssi,
    };
  } catch (error) {
    console.error('Error parsing RuuviTag data:', error);
    return null;
  }
}

/**
 * Calculate battery percentage from voltage
 * RuuviTag uses CR2450 coin cell (3.0V nominal, 2.0V cutoff)
 */
export function calculateBatteryPercentage(voltageMv: number): number {
  const voltage = voltageMv / 1000;
  const maxVoltage = 3.0;
  const minVoltage = 2.0;

  if (voltage >= maxVoltage) return 100;
  if (voltage <= minVoltage) return 0;

  const percentage = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
  return Math.round(percentage);
}

/**
 * Check if device is moving based on acceleration
 */
export function isDeviceMoving(accelX: number, accelY: number, accelZ: number, threshold = 100): boolean {
  const totalAcceleration = Math.sqrt(accelX ** 2 + accelY ** 2 + accelZ ** 2);
  const gravity = 1000; // 1g in mG
  return Math.abs(totalAcceleration - gravity) > threshold;
}
