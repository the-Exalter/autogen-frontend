import React, { useState, useEffect } from 'react';
import { adminPredictionLogs, adminSearchLogs } from '../../services/api';
import { formatPrice } from '../../utils/format';
import AdminNav from './AdminNav';
import './AdminLayout.css';

export default function AdminLogs() {
  const [tab, setTab] = useState('predictions');
  const [predLogs, setPredLogs] = useState([]);
  const [searchLogs, setSearchLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminPredictionLogs(), adminSearchLogs()])
      .then(([p, s]) => { setPredLogs(p.data); setSearchLogs(s.data); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <h1 className="section-title">Logs</h1>
        </div>
        <AdminNav />

        <div className="logs-tabs">
          <button className={`btn btn-sm ${tab === 'predictions' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('predictions')}>
            ML Predictions
          </button>
          <button className={`btn btn-sm ${tab === 'searches' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('searches')}>
            Search Logs
          </button>
        </div>

        {loading ? <div className="skeleton" style={{ height: 300, marginTop: 24 }} /> : (
          <div className="admin-table-wrap" style={{ marginTop: 24 }}>
            {tab === 'predictions' ? (
              <table className="admin-table">
                <thead>
                  <tr><th>Vehicle</th><th>Predicted Price</th><th>Min</th><th>Max</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {predLogs.map((l) => (
                    <tr key={l._id}>
                      <td>{l.input_features?.make} {l.input_features?.model} {l.input_features?.year}</td>
                      <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatPrice(l.predicted_price)}</td>
                      <td>{formatPrice(l.confidence_range?.min)}</td>
                      <td>{formatPrice(l.confidence_range?.max)}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(l.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr><th>Query</th><th>Matched</th><th>AI Triggered</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {searchLogs.map((l) => (
                    <tr key={l._id}>
                      <td>{l.query}</td>
                      <td style={{ color: l.matched ? 'var(--success)' : 'var(--danger)' }}>
                        {l.matched ? 'Yes' : 'No'}
                      </td>
                      <td style={{ color: l.ai_triggered ? 'var(--ai-badge)' : 'var(--text-muted)' }}>
                        {l.ai_triggered ? 'Yes' : 'No'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {new Date(l.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
