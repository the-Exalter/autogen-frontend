import React, { useState, useEffect } from 'react';
import { adminGetCache, adminDeleteCache } from '../../services/api';
import { formatPrice } from '../../utils/format';
import AdminNav from './AdminNav';
import './AdminLayout.css';

export default function AdminCache() {
  const [cache, setCache] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminGetCache().then((r) => setCache(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    await adminDeleteCache(id);
    load();
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <h1 className="section-title">AI Cache Management</h1>
          <span style={{ color: 'var(--text-secondary)' }}>{cache.length} entries</span>
        </div>
        <AdminNav />

        {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Vehicle</th><th>Year</th><th>Price</th>
                  <th>Search Count</th><th>Expires</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cache.map((v) => {
                  const expired = v.expires_at && new Date(v.expires_at) < new Date();
                  return (
                    <tr key={v._id}>
                      <td>{v.make} {v.model}</td>
                      <td>{v.year}</td>
                      <td>{formatPrice(v.price_pkr)}</td>
                      <td>
                        <strong style={{ color: v.search_count >= 3 ? 'var(--success)' : 'var(--text-secondary)' }}>
                          {v.search_count}
                        </strong>
                      </td>
                      <td style={{ color: expired ? 'var(--danger)' : 'var(--text-secondary)', fontSize: 12 }}>
                        {v.expires_at ? new Date(v.expires_at).toLocaleDateString() : '—'}
                        {expired && ' (expired)'}
                      </td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>Purge</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
