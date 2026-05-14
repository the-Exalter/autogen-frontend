import React, { useState, useEffect } from 'react';
import { adminUsers, adminBanUser } from '../../services/api';
import AdminNav from './AdminNav';
import './AdminLayout.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminUsers().then((r) => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleBan = async (id) => {
    await adminBanUser(id);
    load();
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-page__header">
          <h1 className="section-title">User Management</h1>
          <span style={{ color: 'var(--text-secondary)' }}>{users.length} users</span>
        </div>
        <AdminNav />

        {loading ? <div className="skeleton" style={{ height: 300 }} /> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge" style={{ background: u.role === 'admin' ? 'var(--accent)' : 'var(--bg-elevated)', color: u.role === 'admin' ? '#09090b' : 'var(--text-secondary)' }}>{u.role}</span></td>
                    <td style={{ color: u.is_banned ? 'var(--danger)' : 'var(--success)' }}>
                      {u.is_banned ? 'Banned' : 'Active'}
                    </td>
                    <td>
                      <button className={`btn btn-sm ${u.is_banned ? 'btn-primary' : 'btn-danger'}`} onClick={() => handleBan(u._id)}>
                        {u.is_banned ? 'Unban' : 'Ban'}
                      </button>
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
