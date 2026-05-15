import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVehicle, addBookmark, removeBookmark, getBookmarks, findUsedListings } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { formatMileage, imageUrl } from '../utils/format';
import './VehicleDetail.css';

const FORECAST_SUPPORTED = [
  { make: 'Toyota', model: 'Corolla' },
  { make: 'Honda', model: 'Civic' },
  { make: 'Honda', model: 'Accord' },
  { make: 'Toyota', model: 'Camry' },
  { make: 'Ford', model: 'F-150' },
  { make: 'Honda', model: 'CR-V' },
  { make: 'Toyota', model: 'RAV4' },
  { make: 'Nissan', model: 'Altima' },
  { make: 'Ford', model: 'Escape' },
];

function isForecastEligible(vehicle) {
  if (vehicle.source !== 'user_listing') return false;
  return FORECAST_SUPPORTED.some(
    s => s.make.toLowerCase() === (vehicle.make || '').toLowerCase() &&
         s.model.toLowerCase() === (vehicle.model || '').toLowerCase()
  );
}

export default function VehicleDetail() {
  const { id } = useParams();
  const { isAuth } = useAuth();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [usedMarket, setUsedMarket] = useState(null);
  const [usedMarketLoading, setUsedMarketLoading] = useState(false);
  const [usedMarketError, setUsedMarketError] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState(null);
  const [readMore, setReadMore] = useState(false);
  const [readMoreContent, setReadMoreContent] = useState(null);
  const [readMoreLoading, setReadMoreLoading] = useState(false);
  const [readMoreStatus, setReadMoreStatus] = useState('');
  const [readMoreVideos, setReadMoreVideos] = useState([]);
  const [readMoreError, setReadMoreError] = useState(null);
  const [openSections, setOpenSections] = useState({
    fast_facts: true,
    the_story: false,
    owners: false,
    facts: false,
    watch: false,
  });

  useEffect(() => {
    getVehicle(id)
      .then((r) => setVehicle(r.data))
      .catch(() => navigate('/search'))
      .finally(() => setLoading(false));

    if (isAuth) {
      getBookmarks()
        .then((r) => setIsBookmarked(r.data.some((b) => b._id === id || b === id)))
        .catch(() => {});
    }
  }, [id]);

  const handleBookmark = async () => {
    if (!isAuth) return navigate('/login');
    try {
      if (isBookmarked) { await removeBookmark(id); setIsBookmarked(false); }
      else { await addBookmark(id); setIsBookmarked(true); }
    } catch {}
  };

  const handleFindUsedListings = async () => {
    if (!isAuth) return navigate('/login');
    setUsedMarketLoading(true);
    setUsedMarketError(null);
    setUsedMarket(null);
    try {
      const res = await findUsedListings(id, { country: 'US', city: 'New York' });
      setUsedMarket(res.data);
    } catch (e) {
      setUsedMarketError(e.response?.data?.error || 'Used market search failed.');
    } finally {
      setUsedMarketLoading(false);
    }
  };

  const handleForecast = async (v) => {
    const target = v || vehicle;
    if (!target) return;
    setForecastLoading(true);
    setForecastError(null);
    try {
      const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';
      const res = await fetch(`${AI_URL}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: target.make,
          model: target.model,
          vehicle_age: target.year ? new Date().getFullYear() - target.year : 5,
          current_price_usd: target.price_usd || (target.price_pkr ? target.price_pkr / 280 : null),
          odometer_miles: target.mileage_km ? target.mileage_km * 0.621 : null,
        }),
      });
      const data = await res.json();
      setForecast(data);
    } catch (e) {
      setForecastError('Forecast unavailable. Please try again.');
    } finally {
      setForecastLoading(false);
    }
  };

  const toggleSection = (key) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleReadMore = async () => {
    if (readMoreContent) {
      setReadMore(true);
      return;
    }
    setReadMore(true);
    setReadMoreLoading(true);
    setReadMoreError(null);
    setReadMoreStatus('Researching...');

    const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

    try {
      const response = await fetch(`${AI_URL}/read-more-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year || null,
          variant: vehicle.variant || null,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          if (!part.trim()) continue;
          let eventType = 'message';
          let dataStr = '';
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            else if (line.startsWith('data: ')) dataStr = line.slice(6);
          }

          try {
            const data = JSON.parse(dataStr);
            if (eventType === 'status') {
              setReadMoreStatus(data.message);
            } else if (eventType === 'videos') {
              setReadMoreVideos(data.videos || []);
            } else if (eventType === 'done') {
              setReadMoreContent(data.content);
              setReadMoreVideos(data.videos || []);
              setReadMoreLoading(false);
            } else if (eventType === 'error') {
              setReadMoreError(data.message);
              setReadMoreLoading(false);
            }
          } catch {}
        }
      }
    } catch (e) {
      setReadMoreError('Failed to load content. Please try again.');
      setReadMoreLoading(false);
    }
  };

  // Auto-trigger forecast when vehicle loads and is eligible
  useEffect(() => {
    if (vehicle && isForecastEligible(vehicle)) {
      handleForecast(vehicle);
    }
  }, [vehicle]);

  if (loading) return (
    <div className="container" style={{ paddingTop: 60 }}>
      <div className="skeleton" style={{ height: 400 }} />
    </div>
  );
  if (!vehicle) return null;

  const images = vehicle.images || [];
  const inCompare = isInCompare(vehicle._id);

  return (
    <div className="vehicle-detail">
      <div className="container">
        {/* ── Gallery ─────────────────────────────────────────────── */}
        <div className="vd-layout">
          <div className="vd-gallery">
            <div className="vd-gallery__main">
              {images[activeImg] ? (
                <img src={imageUrl(images[activeImg])} alt={`${vehicle.make} ${vehicle.model}`} />
              ) : (
                <div className="vd-gallery__placeholder">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2h-2" />
                    <circle cx="7.5" cy="17.5" r="2.5" />
                    <circle cx="16.5" cy="17.5" r="2.5" />
                  </svg>
                  <span>No images available</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="vd-gallery__thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`vd-gallery__thumb ${i === activeImg ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={imageUrl(img)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Panel ────────────────────────────────────────── */}
          <div className="vd-info">
            <div className="vd-badges">
              {vehicle.source === 'ai_generated' && <span className="badge badge-ai">AI Generated</span>}
              {vehicle.is_featured && <span className="badge badge-featured">Featured</span>}
            </div>

            <h1 className="vd-title">
              {vehicle.year} {vehicle.make} {vehicle.model}
              {vehicle.variant && <span className="vd-variant">{vehicle.variant}</span>}
            </h1>

            {vehicle.source === 'user_listing' && (vehicle.price_usd || vehicle.price_pkr) && (
              <div className="vd-price">
                {vehicle.price_usd
                  ? `$${vehicle.price_usd.toLocaleString()}`
                  : `PKR ${vehicle.price_pkr.toLocaleString()}`}
              </div>
            )}

            <div className="vd-actions">
              <button
                className={`btn ${isBookmarked ? 'btn-ghost' : 'btn-primary'}`}
                onClick={handleBookmark}
              >
                {isBookmarked ? '✓ Saved' : '+ Save'}
              </button>
              <button
                className={`btn btn-ghost ${inCompare ? 'active-compare' : ''}`}
                onClick={() => inCompare ? removeFromCompare(vehicle._id) : addToCompare(vehicle._id)}
              >
                {inCompare ? '✓ In Compare' : '+ Compare'}
              </button>
            </div>

            {vehicle.source === 'user_listing' && (vehicle.seller_name || vehicle.seller_city) && (
              <div className="vd-seller">
                <div className="vd-seller__header">Listed by</div>
                <div className="vd-seller__card">
                  <div className="vd-seller__avatar">
                    {vehicle.seller_name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div className="vd-seller__info">
                    {vehicle.seller_name && (
                      <div className="vd-seller__name">{vehicle.seller_name}</div>
                    )}
                    {vehicle.seller_city && (
                      <div className="vd-seller__city">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {vehicle.seller_city}
                      </div>
                    )}
                  </div>
                  {vehicle.seller_phone && (
                    <a
                      href={`tel:${vehicle.seller_phone}`}
                      className="vd-seller__phone"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07
                          19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2
                          2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16
                          16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2
                          0 0122 16.92z"/>
                      </svg>
                      Call Seller
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* ── Quick Specs ─────────────────────────────────────── */}
            <div className="vd-specs-grid">
              {[
                { label: 'Body Type', value: vehicle.body_type },
                { label: 'Fuel', value: vehicle.fuel_type },
                { label: 'Transmission', value: vehicle.transmission },
                { label: 'Engine', value: vehicle.engine_capacity },
                { label: 'Assembly', value: vehicle.assembly },
                { label: 'Color', value: vehicle.color },
                { label: 'Mileage', value: formatMileage(vehicle.mileage_km) },
                { label: 'Condition', value: vehicle.condition },
              ].filter((s) => s.value).map((spec) => (
                <div key={spec.label} className="vd-spec">
                  <span className="vd-spec__label">{spec.label}</span>
                  <span className="vd-spec__value">{spec.value}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Features ──────────────────────────────────────────────── */}
        {vehicle.features?.length > 0 && (
          <div className="vd-features">
            <h2 className="section-title" style={{ marginBottom: 20 }}>Features</h2>
            <div className="vd-features__grid">
              {vehicle.features.map((f) => (
                <div key={f} className="vd-feature-item">
                  <span>✓</span> {f}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Description ─────────────────────────────────────────── */}
        {vehicle.description && (
          <div className="vd-description">
            <h2 className="section-title" style={{ marginBottom: 16 }}>About</h2>
            <p>{vehicle.description}</p>
          </div>
        )}

        {/* ── Read More ────────────────────────────────────────────── */}
        <button className="btn btn-ghost" onClick={handleReadMore}>
          📖 Read More
        </button>

        {readMore && (
          <div className="vd-read-more">
            {readMoreLoading && (
              <div className="vd-read-more__loading">
                <div className="vd-read-more__pulse" />
                <span>{readMoreStatus}</span>
              </div>
            )}

            {readMoreError && !readMoreLoading && (
              <div className="vd-read-more__error">
                <p>{readMoreError}</p>
                <button className="btn btn-ghost" onClick={handleReadMore}>
                  Try Again
                </button>
              </div>
            )}

            {readMoreContent && !readMoreLoading && (
              <div className="vd-read-more__sections">

                <div className="vd-read-more__section">
                  <button
                    className="vd-read-more__toggle"
                    onClick={() => toggleSection('fast_facts')}
                  >
                    <span>⚡ Fast Facts</span>
                    <span>{openSections.fast_facts ? '▲' : '▼'}</span>
                  </button>
                  {openSections.fast_facts && (
                    <div className="vd-read-more__content">
                      <div className="vd-read-more__facts-grid">
                        {readMoreContent.fast_facts?.map((fact, i) => (
                          <div key={i} className="vd-read-more__fact-card">
                            <div className="vd-read-more__fact-label">{fact.label}</div>
                            <div className="vd-read-more__fact-value">{fact.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {readMoreContent.the_story && (
                  <div className="vd-read-more__section">
                    <button
                      className="vd-read-more__toggle"
                      onClick={() => toggleSection('the_story')}
                    >
                      <span>📖 The Story</span>
                      <span>{openSections.the_story ? '▲' : '▼'}</span>
                    </button>
                    {openSections.the_story && (
                      <div className="vd-read-more__content">
                        <h4 className="vd-read-more__story-title">
                          {readMoreContent.the_story.title}
                        </h4>
                        {readMoreContent.the_story.paragraphs?.map((p, i) => (
                          <p key={i} className="vd-read-more__story-para">{p}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {readMoreContent.what_owners_say?.length > 0 && (
                  <div className="vd-read-more__section">
                    <button
                      className="vd-read-more__toggle"
                      onClick={() => toggleSection('owners')}
                    >
                      <span>💬 What Owners Say</span>
                      <span>{openSections.owners ? '▲' : '▼'}</span>
                    </button>
                    {openSections.owners && (
                      <div className="vd-read-more__content">
                        {readMoreContent.what_owners_say.map((item, i) => (
                          <div key={i} className="vd-read-more__quote">
                            <p className="vd-read-more__quote-text">"{item.quote}"</p>
                            <span className="vd-read-more__quote-source">— {item.source}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {readMoreContent.notable_facts?.length > 0 && (
                  <div className="vd-read-more__section">
                    <button
                      className="vd-read-more__toggle"
                      onClick={() => toggleSection('facts')}
                    >
                      <span>🔍 Notable Facts</span>
                      <span>{openSections.facts ? '▲' : '▼'}</span>
                    </button>
                    {openSections.facts && (
                      <div className="vd-read-more__content">
                        <ul className="vd-read-more__notable-list">
                          {readMoreContent.notable_facts.map((fact, i) => (
                            <li key={i} className="vd-read-more__notable-item">{fact}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {readMoreVideos.length > 0 && (
                  <div className="vd-read-more__section">
                    <button
                      className="vd-read-more__toggle"
                      onClick={() => toggleSection('watch')}
                    >
                      <span>▶ Watch</span>
                      <span>{openSections.watch ? '▲' : '▼'}</span>
                    </button>
                    {openSections.watch && (
                      <div className="vd-read-more__content">
                        <div className="vd-read-more__videos">
                          {readMoreVideos.slice(0, 2).map((video, i) => (
                            <div key={i} className="vd-read-more__video">
                              <iframe
                                width="100%"
                                height="315"
                                src={`https://www.youtube.com/embed/${video.id}`}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ borderRadius: 12 }}
                              />
                              <p className="vd-read-more__video-title">{video.title}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* ── Used Market Search ───────────────────────────────────── */}
        <div className="vd-used-market">
          <button
            className="btn btn-ghost"
            onClick={handleFindUsedListings}
            disabled={usedMarketLoading}
          >
            {usedMarketLoading
              ? 'Searching used market…'
              : vehicle.source === 'user_listing'
                ? '🔍 Find Similar Used Listings'
                : '🔍 Find in Used Market'}
          </button>

          {usedMarketError && (
            <p className="vd-used-market__error">{usedMarketError}</p>
          )}

          {usedMarket && (
            <div className="vd-used-market__result">
              {!usedMarket.found ? (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>
                  No listings found for this vehicle.
                </p>
              ) : (
                <>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                      {usedMarket.listings?.length} listings found across the web
                    </span>
                    <a
                      href={`https://www.google.com/search?q=${encodeURIComponent(usedMarket.search_query)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none' }}
                    >
                      Search more →
                    </a>
                  </div>

                  <div className="vd-used-market__listings">
                    {usedMarket.listings.map((listing, i) => (
                      <a
                        key={i}
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="vd-used-market__listing"
                      >
                        <div className="vd-used-market__listing-info">
                          <div className="vd-used-market__listing-title">
                            {listing.title}
                          </div>
                          <div className="vd-used-market__listing-meta">
                            {listing.price_str && (
                              <span className="vd-used-market__listing-price">
                                {listing.price_str}
                              </span>
                            )}
                            <span style={{
                              fontSize: 11,
                              background: 'rgba(255,255,255,0.06)',
                              padding: '2px 8px',
                              borderRadius: 4,
                              color: 'rgba(255,255,255,0.4)',
                            }}>
                              {listing.source}
                            </span>
                          </div>
                          {listing.description && (
                            <div style={{
                              fontSize: 12,
                              color: 'rgba(255,255,255,0.3)',
                              marginTop: 4,
                              lineHeight: 1.4,
                            }}>
                              {listing.description}
                            </div>
                          )}
                        </div>
                        <div className="vd-used-market__listing-arrow">→</div>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Price Forecast ───────────────────────────────────────── */}
        {isForecastEligible(vehicle) && (
          <div className="vd-forecast">
            <div className="vd-forecast__header">
              <h2 className="section-title" style={{ marginBottom: 8 }}>
                Price Forecast
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
                Based on US market depreciation data.
                Trained on {vehicle.make} {vehicle.model} historical sales.
              </p>
            </div>

            {forecastLoading && (
              <div className="vd-forecast__loading">
                <div className="spinner" />
                <span>Calculating depreciation curve…</span>
              </div>
            )}

            {forecastError && (
              <p style={{ color: 'var(--error)', fontSize: 14 }}>{forecastError}</p>
            )}

            {forecast && !forecastLoading && forecast.supported && (
              <div className="vd-forecast__content">
                <div className="vd-forecast__meta">
                  <div className="vd-forecast__stat">
                    <span className="vd-spec__label">Annual Depreciation</span>
                    <span className="vd-forecast__stat-val">
                      {(forecast.annual_depreciation_rate * 100).toFixed(1)}%/yr
                    </span>
                  </div>
                  <div className="vd-forecast__stat">
                    <span className="vd-spec__label">Model Accuracy (R²)</span>
                    <span className="vd-forecast__stat-val">
                      {(forecast.curve_r2 * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="vd-forecast__horizons">
                  {['3m', '6m', '12m'].map(horizon => {
                    const f = forecast.forecasts[horizon];
                    if (!f) return null;
                    const label = horizon === '3m' ? '3 Months' : horizon === '6m' ? '6 Months' : '12 Months';
                    const isNegative = f.change_pct < 0;
                    return (
                      <div key={horizon} className="vd-forecast__horizon">
                        <div className="vd-forecast__horizon-label">{label}</div>
                        <div className="vd-forecast__horizon-price">
                          ${f.median_usd.toLocaleString()}
                        </div>
                        <div
                          className="vd-forecast__horizon-change"
                          style={{ color: isNegative ? '#ef4444' : '#22c55e' }}
                        >
                          {f.change_pct > 0 ? '+' : ''}{f.change_pct}%
                        </div>
                        <div className="vd-forecast__horizon-range">
                          ${f.lower_usd.toLocaleString()} — ${f.upper_usd.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="vd-forecast__bars">
                  {['3m', '6m', '12m'].map(horizon => {
                    const f = forecast.forecasts[horizon];
                    if (!f) return null;
                    const maxVal = forecast.forecasts['3m']?.upper_usd || 30000;
                    const medianPct = (f.median_usd / maxVal) * 100;
                    const lowerPct = (f.lower_usd / maxVal) * 100;
                    const upperPct = (f.upper_usd / maxVal) * 100;
                    return (
                      <div key={horizon} className="vd-forecast__bar-row">
                        <span className="vd-forecast__bar-label">{horizon}</span>
                        <div className="vd-forecast__bar-track">
                          <div
                            className="vd-forecast__bar-range"
                            style={{ left: `${lowerPct}%`, width: `${upperPct - lowerPct}%` }}
                          />
                          <div
                            className="vd-forecast__bar-median"
                            style={{ left: `${medianPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 16 }}>
                  Forecast based on US market data.
                  Confidence intervals widen at longer horizons reflecting
                  increased uncertainty. Not financial advice.
                </p>
              </div>
            )}

            {forecast && !forecast.supported && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                Price forecasting not available for this vehicle model.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
