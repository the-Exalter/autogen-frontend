import React, { useState, useEffect } from 'react';
import { adminStats } from '../../services/api';
import AdminNav from './AdminNav';
import './AdminLayout.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminStats().then((r) => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return (
    <div className="admin-page">
      <div className="container">
        <AdminNav />
        <div className="skeleton" style={{ height: 200 }} />
      </div>
    </div>
  );

  const aiRate = stats.aiTriggerRate?.total
    ? ((stats.aiTriggerRate.ai / stats.aiTriggerRate.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <h1 className="section-title">Admin Dashboard</h1>
        </div>
        <AdminNav />

        <div className="stat-grid">
          {[
            { label: 'Seeded Vehicles', value: stats.totalVehicles?.toLocaleString(), accent: true },
            { label: 'Users', value: stats.totalUsers?.toLocaleString() },
            { label: 'Active Listings', value: stats.totalListings?.toLocaleString() },
            { label: 'AI Cache Size', value: stats.aiCacheSize?.toLocaleString() },
            { label: 'ML Predictions', value: stats.totalPredictions?.toLocaleString() },
            { label: 'AI Fallback Rate', value: `${aiRate}%` },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-card__label">{s.label}</div>
              <div className={`stat-card__value ${s.accent ? 'accent' : ''}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <h2 className="section-title" style={{ marginBottom: 20 }}>Top Searches</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Query</th><th>Count</th></tr>
            </thead>
            <tbody>
              {stats.topSearches?.map((s) => (
                <tr key={s._id}>
                  <td>{s._id}</td>
                  <td>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
