import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">Profile</h1>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
            <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', marginTop: 8 }}>
              {user?.role}
            </span>
          </div>
          <div className="profile-actions">
            <a href="/bookmarks" className="btn btn-ghost">My Saved</a>
            <a href="/listings/new" className="btn btn-primary">Post Vehicle</a>
            <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
