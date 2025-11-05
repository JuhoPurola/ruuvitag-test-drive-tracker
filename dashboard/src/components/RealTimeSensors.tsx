/**
 * Real-Time Sensors Component
 * Displays live sensor data for a specific test drive
 */

import { useState, useEffect, type FC } from 'react';
import './RealTimeSensors.css';

interface SensorData {
  temperature: number;
  humidity: number;
  pressure: number;
  accelerationX: number;
  accelerationY: number;
  accelerationZ: number;
  battery: number;
  timestamp: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp: string;
}

interface RealTimeSensorsProps {
  testDriveId: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface DrivingStats {
  hardAccelerations: number;
  hardBraking: number;
  aggressiveTurns: number;
  totalReadings: number;
  drivingScore: number | null;
}

export const RealTimeSensors: FC<RealTimeSensorsProps> = ({ testDriveId }) => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [drivingStats, setDrivingStats] = useState<DrivingStats>({
    hardAccelerations: 0,
    hardBraking: 0,
    aggressiveTurns: 0,
    totalReadings: 0,
    drivingScore: null,
  });

  useEffect(() => {
    fetchLatestData();
    fetchDrivingStats();
    const interval = setInterval(() => {
      fetchLatestData();
      fetchDrivingStats();
    }, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [testDriveId]);

  const fetchLatestData = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/ruuvitag/latest/${testDriveId}`);
      const data = await response.json();
      if (data.success) {
        setSensorData(data.data.sensor);
        setLocationData(data.data.location);
      }
    } catch (error) {
      console.error('Error fetching latest data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivingStats = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/testdrives/${testDriveId}`);
      const data = await response.json();
      if (data.success) {
        const testDrive = data.data;
        setDrivingStats({
          hardAccelerations: testDrive.hardAccelerations || 0,
          hardBraking: testDrive.hardBraking || 0,
          aggressiveTurns: testDrive.aggressiveTurns || 0,
          totalReadings: testDrive.totalSensorReadings || 0,
          drivingScore: testDrive.drivingScore,
        });
        setStatsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching driving stats:', error);
      setStatsLoading(false);
    }
  };

  const calculateTotalAcceleration = (sensor: SensorData): number => {
    const { accelerationX, accelerationY, accelerationZ } = sensor;
    return Math.sqrt(
      accelerationX * accelerationX +
      accelerationY * accelerationY +
      accelerationZ * accelerationZ
    );
  };

  const getAccelerationStatus = (acceleration: number): string => {
    if (acceleration > 1.5) return 'status-danger'; // Hard acceleration/braking
    if (acceleration > 1.2) return 'status-warning'; // Moderate
    return 'status-normal'; // Normal driving
  };

  const getBatteryStatus = (battery: number): string => {
    if (battery < 20) return 'status-danger';
    if (battery < 50) return 'status-warning';
    return 'status-good';
  };

  const calculateDrivingScore = (): number => {
    // Use database score if available
    if (drivingStats.drivingScore !== null) {
      return drivingStats.drivingScore;
    }

    // Fallback: if no database score yet, return 100
    return 100;
  };

  const getDrivingRating = (score: number): { label: string; class: string; emoji: string } => {
    if (score >= 90) return { label: 'Excellent Driver', class: 'rating-excellent', emoji: '⭐' };
    if (score >= 75) return { label: 'Safe Driver', class: 'rating-good', emoji: '✅' };
    if (score >= 60) return { label: 'Moderate Driver', class: 'rating-moderate', emoji: '⚠️' };
    if (score >= 40) return { label: 'Risky Driver', class: 'rating-risky', emoji: '⚠️' };
    return { label: 'Dangerous Driver', class: 'rating-dangerous', emoji: '❌' };
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  if (loading) {
    return <div className="loading">Loading sensor data...</div>;
  }

  if (!sensorData) {
    return (
      <div className="empty-state">
        <p>No sensor data available yet</p>
      </div>
    );
  }

  const totalAccel = calculateTotalAcceleration(sensorData);
  const accelStatus = getAccelerationStatus(totalAccel);
  const drivingScore = calculateDrivingScore();
  const drivingRating = getDrivingRating(drivingScore);

  return (
    <div className="real-time-sensors">
      <div className="sensors-header">
        <span className="refresh-indicator">Auto-refreshing every 3s</span>
        <div className="last-update">
          Last update: {formatTimestamp(sensorData.timestamp)}
        </div>
      </div>

      {/* Driving Score Card */}
      {statsLoading ? (
        <div className="driving-score-card rating-excellent">
          <div className="loading">Loading driving statistics...</div>
        </div>
      ) : (
        <div className={`driving-score-card ${drivingRating.class}`}>
          <div className="score-main">
            <div className="score-value">{drivingScore}</div>
            <div className="score-label">
              <span className="score-emoji">{drivingRating.emoji}</span>
              <span className="score-rating">{drivingRating.label}</span>
            </div>
          </div>
          <div className="score-details">
            <div className="score-stat">
              <span className="stat-value">{drivingStats.hardAccelerations}</span>
              <span className="stat-label">Hard Accel</span>
            </div>
            <div className="score-stat">
              <span className="stat-value">{drivingStats.hardBraking}</span>
              <span className="stat-label">Hard Brake</span>
            </div>
            <div className="score-stat">
              <span className="stat-value">{drivingStats.aggressiveTurns}</span>
              <span className="stat-label">Sharp Turns</span>
            </div>
          </div>
        </div>
      )}

      <div className="sensor-card">
        <div className="sensor-grid">
          {/* Speed and Movement */}
          <div className="sensor-group">
            <h4>Motion</h4>
            <div className={`sensor-item large ${accelStatus}`}>
              <span className="sensor-label">Total Acceleration</span>
              <span className="sensor-value">{totalAccel.toFixed(2)} g</span>
            </div>
            {locationData && locationData.speed !== undefined && locationData.speed !== null && (
              <div className="sensor-item">
                <span className="sensor-label">Speed</span>
                <span className="sensor-value">{locationData.speed.toFixed(1)} km/h</span>
              </div>
            )}
          </div>

          {/* Acceleration Components */}
          <div className="sensor-group">
            <h4>Acceleration (g)</h4>
            <div className="sensor-item">
              <span className="sensor-label">X-Axis (Forward/Back)</span>
              <span className="sensor-value">{sensorData.accelerationX.toFixed(3)}</span>
            </div>
            <div className="sensor-item">
              <span className="sensor-label">Y-Axis (Left/Right)</span>
              <span className="sensor-value">{sensorData.accelerationY.toFixed(3)}</span>
            </div>
            <div className="sensor-item">
              <span className="sensor-label">Z-Axis (Up/Down)</span>
              <span className="sensor-value">{sensorData.accelerationZ.toFixed(3)}</span>
            </div>
          </div>

          {/* Environment */}
          <div className="sensor-group">
            <h4>Environment</h4>
            <div className="sensor-item">
              <span className="sensor-label">Temperature</span>
              <span className="sensor-value">{sensorData.temperature.toFixed(1)}°C</span>
            </div>
            <div className="sensor-item">
              <span className="sensor-label">Humidity</span>
              <span className="sensor-value">{sensorData.humidity.toFixed(1)}%</span>
            </div>
            <div className="sensor-item">
              <span className="sensor-label">Pressure</span>
              <span className="sensor-value">{sensorData.pressure.toFixed(1)} hPa</span>
            </div>
          </div>

          {/* Battery */}
          <div className="sensor-group">
            <h4>System</h4>
            <div className={`sensor-item large ${getBatteryStatus(sensorData.battery)}`}>
              <span className="sensor-label">Battery</span>
              <span className="sensor-value">{sensorData.battery.toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Driving Behavior Indicator */}
        <div className="behavior-indicator">
          {totalAccel > 1.5 && (
            <div className="alert alert-warning">
              Aggressive driving detected (high acceleration)
            </div>
          )}
          {sensorData.battery < 20 && (
            <div className="alert alert-danger">
              Low battery warning
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
