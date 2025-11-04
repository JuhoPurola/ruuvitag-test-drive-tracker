/**
 * Test Drive List Component
 * Displays all test drives with real-time updates
 */

import { useState, useEffect, type FC } from 'react';
import './TestDriveList.css';

interface TestDrive {
  id: string;
  vehicle: { make: string; model: string; year: number };
  customer: { name: string };
  salesPerson: { name: string };
  startTime: string;
  status: string;
  distance?: number;
  duration?: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const TestDriveList: FC = () => {
  const [testDrives, setTestDrives] = useState<TestDrive[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestDrives();
  }, []);

  const fetchTestDrives = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/testdrives`);
      const data = await response.json();
      if (data.success) {
        setTestDrives(data.data);
      }
    } catch (error) {
      console.error('Error fetching test drives:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string): string => {
    switch (status) {
      case 'active':
        return 'badge badge-success';
      case 'completed':
        return 'badge badge-info';
      case 'cancelled':
        return 'badge badge-error';
      default:
        return 'badge';
    }
  };

  if (loading) {
    return <div className="loading">Loading test drives...</div>;
  }

  if (testDrives.length === 0) {
    return (
      <div className="empty-state card">
        <h3>No test drives yet</h3>
        <p>Test drives will appear here when started from the mobile app.</p>
      </div>
    );
  }

  return (
    <div className="test-drive-list">
      <h2>Test Drives</h2>
      <div className="drive-grid">
        {testDrives.map((drive) => (
          <div key={drive.id} className="drive-card card">
            <div className="drive-header">
              <h3>
                {drive.vehicle.year} {drive.vehicle.make} {drive.vehicle.model}
              </h3>
              <span className={getStatusBadge(drive.status)}>{drive.status}</span>
            </div>

            <div className="drive-info">
              <div className="info-row">
                <span className="label">Customer:</span>
                <span>{drive.customer.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Salesperson:</span>
                <span>{drive.salesPerson.name}</span>
              </div>
              <div className="info-row">
                <span className="label">Started:</span>
                <span>{new Date(drive.startTime).toLocaleString()}</span>
              </div>
              {drive.distance && (
                <div className="info-row">
                  <span className="label">Distance:</span>
                  <span>{drive.distance} km</span>
                </div>
              )}
              {drive.duration && (
                <div className="info-row">
                  <span className="label">Duration:</span>
                  <span>{drive.duration} min</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
