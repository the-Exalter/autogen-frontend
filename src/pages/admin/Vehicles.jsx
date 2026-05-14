import React, { useState, useEffect } from 'react';
import { adminGetVehicles, adminFeatureVehicle, adminDeleteVehicle } from '../../services/api';
import { formatPrice } from '../../utils/format';
import AdminNav from './AdminNav';
import './AdminLayout.css';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminGetVehicles().then((r) => setVehicles(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleFeature = async (id) => {
    await adminFeatureVehicle(id);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this vehicle?')) return;
    await adminDeleteVehicle(id);
    load();
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <h1 className="section-title">Vehicle Management</h1>
        </div>
        <AdminNav />

        {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Make / Model</th><th>Year</th><th>Price</th><th>Source</th>
                  <th>Featured</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id}>
                    <td>{v.make} {v.model}</td>
                    <td>{v.year}</td>
                    <td>{formatPrice(v.price_pkr)}</td>
                    <td><span className={`badge ${v.source === 'ai_generated' ? 'badge-ai' : ''}`}>{v.source}</span></td>
                    <td>{v.is_featured ? '★' : '—'}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => handleFeature(v._id)}>
                          {v.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
