import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { addBookmark, removeBookmark } from '../services/api';
import { formatPrice, formatMileage, imageUrl } from '../utils/format';
import './VehicleCard.css';

export default function VehicleCard({ vehicle, bookmarkedIds = [], onBookmarkChange }) {
  const { isAuth } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(vehicle._id);
  const isBookmarked = bookmarkedIds.includes(vehicle._id);

  const handleBookmark = async (e) => {
    e.preventDefault();
    if (!isAuth) return;
    try {
      if (isBookmarked) {
        await removeBookmark(vehicle._id);
      } else {
        await addBookmark(vehicle._id);
      }
      onBookmarkChange?.();
    } catch {}
  };

  const handleCompare = (e) => {
    e.preventDefault();
    inCompare ? removeFromCompare(vehicle._id) : addToCompare(vehicle._id);
  };

  const thumb = vehicle.images?.[0] ? imageUrl(vehicle.images[0]) : null;

  return (
    <Link to={`/vehicle/${vehicle._id}`} className="vehicle-card">
      <div className="vehicle-card__image">
        {thumb ? (
          <img src={thumb} alt={`${vehicle.make} ${vehicle.model}`} loading="lazy" />
        ) : (
          <div className="vehicle-card__placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
              <circle cx="7.5" cy="17.5" r="2.5" />
              <circle cx="16.5" cy="17.5" r="2.5" />
            </svg>
          </div>
        )}
        <div className="vehicle-card__badges">
          {vehicle.source === 'ai_generated' && <span className="badge badge-ai">AI</span>}
          {vehicle.is_featured && <span className="badge badge-featured">Featured</span>}
          {vehicle.source === 'user_listing' && <span className="badge badge-user">Listed</span>}
        </div>
        {isAuth && (
          <button
            className={`vehicle-card__bookmark ${isBookmarked ? 'active' : ''}`}
            onClick={handleBookmark}
            title={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </button>
        )}
      </div>

      <div className="vehicle-card__body">
        <div className="vehicle-card__title">
          <span className="vehicle-card__year">{vehicle.year}</span>
          {vehicle.make} {vehicle.model}
        </div>
        {vehicle.variant && <div className="vehicle-card__variant">{vehicle.variant}</div>}

        <div className="vehicle-card__specs">
          {vehicle.engine_capacity && <span>{vehicle.engine_capacity}</span>}
          {vehicle.transmission && <span>{vehicle.transmission}</span>}
          {vehicle.fuel_type && <span>{vehicle.fuel_type}</span>}
          {vehicle.mileage_km != null && <span>{formatMileage(vehicle.mileage_km)}</span>}
        </div>

        <div className="vehicle-card__footer">
          {vehicle.source === 'user_listing' && (
            <span className="vehicle-card__price">
              {vehicle.price_usd
                ? `$${vehicle.price_usd.toLocaleString()}`
                : formatPrice(vehicle.price_pkr)}
            </span>
          )}
          <button
            className={`btn btn-ghost btn-sm vehicle-card__compare ${inCompare ? 'in-compare' : ''}`}
            onClick={handleCompare}
            title={inCompare ? 'Remove from compare' : 'Add to compare'}
          >
            {inCompare ? '✓ Compare' : '+ Compare'}
          </button>
        </div>
        {vehicle.province && (
          <div className="vehicle-card__location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {vehicle.province}
          </div>
        )}
      </div>
    </Link>
  );
}
