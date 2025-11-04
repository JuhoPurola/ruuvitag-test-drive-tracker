/**
 * RuuviTag Dashboard - Main App Component
 * Real-time test drive monitoring for dealerships
 */

import { useState, useEffect, type FC } from 'react';
import { TestDriveList } from './components/TestDriveList';
import { StatsCards } from './components/StatsCards';
import './App.css';

interface Analytics {
  totalTestDrives: number;
  activeTestDrives: number;
  completedTestDrives: number;
  averageDistance: number;
  averageDuration: number;
  conversionRate: number;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const App: FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, [refreshKey]);

  const fetchAnalytics = async (): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/api/analytics/stats`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleRefresh = (): void => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1>RuuviTag Test Drive Tracker</h1>
          <p className="subtitle">Real-time dealership monitoring dashboard</p>
          <button onClick={handleRefresh} className="btn btn-primary refresh-btn">
            Refresh
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          {analytics && <StatsCards analytics={analytics} />}
          <TestDriveList key={refreshKey} />
        </div>
      </main>
    </div>
  );
};

export default App;
