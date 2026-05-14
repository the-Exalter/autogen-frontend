import React, { useState, useEffect } from 'react';
import { getBookmarks } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import './Bookmarks.css';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getBookmarks()
      .then((r) => setBookmarks(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="bookmarks-page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">Saved Vehicles</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            {bookmarks.length} saved vehicle{bookmarks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="grid-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 300 }} />)}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="bookmarks-empty">
            <p>No saved vehicles yet.</p>
            <a href="/search" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Vehicles</a>
          </div>
        ) : (
          <div className="grid-3">
            {bookmarks.map((v) => (
              <VehicleCard
                key={v._id}
                vehicle={v}
                bookmarkedIds={bookmarks.map((b) => b._id)}
                onBookmarkChange={load}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
