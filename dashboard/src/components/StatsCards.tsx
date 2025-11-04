/**
 * Statistics Cards Component
 */

import type { FC } from 'react';
import './StatsCards.css';

interface Analytics {
  totalTestDrives: number;
  activeTestDrives: number;
  completedTestDrives: number;
  averageDistance: number;
  averageDuration: number;
  conversionRate: number;
}

interface Props {
  analytics: Analytics;
}

export const StatsCards: FC<Props> = ({ analytics }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label">Total Test Drives</div>
        <div className="stat-value">{analytics.totalTestDrives}</div>
      </div>

      <div className="stat-card active">
        <div className="stat-label">Active Now</div>
        <div className="stat-value">{analytics.activeTestDrives}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Completed</div>
        <div className="stat-value">{analytics.completedTestDrives}</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Avg Distance</div>
        <div className="stat-value">{analytics.averageDistance} km</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Avg Duration</div>
        <div className="stat-value">{analytics.averageDuration} min</div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Conversion Rate</div>
        <div className="stat-value">{analytics.conversionRate}%</div>
      </div>
    </div>
  );
};
