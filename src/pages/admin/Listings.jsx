import React, { useState, useEffect } from 'react';
import { adminGetListings, adminDeleteListing } from '../../services/api';
import { formatPrice } from '../../utils/format';
import AdminNav from './AdminNav';
import './AdminLayout.css';

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminGetListings().then((r) => setListings(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Remove this listing?')) return;
    await adminDeleteListing(id);
    load();
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <h1 className="section-title">Listings Management</h1>
        </div>
        <AdminNav />

        {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Vehicle</th><th>Price</th><th>Seller</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l._id}>
                    <td>{l.year} {l.make} {l.model}</td>
                    <td>{formatPrice(l.price_pkr)}</td>
                    <td>{l.user_id?.name || '—'}</td>
                    <td style={{ color: l.status === 'active' ? 'var(--success)' : 'var(--text-muted)' }}>{l.status}</td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l._id)}>Remove</button>
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
