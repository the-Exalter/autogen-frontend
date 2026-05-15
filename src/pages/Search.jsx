import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getVehicles } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import FilterSidebar from '../components/FilterSidebar';
import './Search.css';

const EMPTY_FILTERS = {
  body_type: '', fuel_type: '', transmission: '', province: '',
  year_min: '', year_max: '', price_min: '', price_max: '', variant: '',
};

export default function Search() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [variants, setVariants] = useState([]);
  const [filters, setFilters] = useState({
    ...EMPTY_FILTERS,
    body_type: params.get('body_type') || '',
    variant: params.get('variant') || '',
  });
  const q = params.get('q') || '';

  const fetchVehicles = useCallback(async (currentPage = 1) => {
    setLoading(true);
    try {
      const query = { ...filters, page: currentPage, limit: 20 };
      if (q) query.q = q;
      Object.keys(query).forEach((k) => { if (!query[k]) delete query[k]; });
      const res = await getVehicles(query);
      setVehicles(res.data.vehicles);
      setTotal(res.data.total);
      setPage(res.data.page);
      setPages(res.data.pages);
      setVariants(res.data.variants || []);
    } catch {
      setVehicles([]);
      setVariants([]);
    } finally {
      setLoading(false);
    }
  }, [filters, q]);

  useEffect(() => { fetchVehicles(1); }, [filters, q]);

  // Redirect to Knowledge page when no results found for a query
  useEffect(() => {
    if (!loading && q) {
      const queryWords = q.trim().split(/\s+/);
      const hasMultiWordQuery = queryWords.length >= 2;

      const fullQueryMatch = vehicles.some(v => {
        const vehicleName = `${v.make} ${v.model}`.toLowerCase();
        return vehicleName.includes(q.toLowerCase()) ||
          q.toLowerCase().includes(v.model.toLowerCase());
      });

      const shouldTriggerAI = (
        vehicles.length === 0 ||
        (hasMultiWordQuery && !fullQueryMatch)
      );

      if (!shouldTriggerAI) return;

      const make = params.get('make') || q.split(' ')[0];
      const model = params.get('model') || q.split(' ').slice(1).join(' ') || q;
      const year = params.get('year') || '';
      const variant = params.get('variant') || '';

      const sp = new URLSearchParams();
      if (year) sp.set('year', year);
      if (variant) sp.set('variant', variant);

      const qs = sp.toString();
      const path = `/knowledge/${encodeURIComponent(make)}/${encodeURIComponent(model)}${qs ? '?' + qs : ''}`;

      const timer = setTimeout(() => navigate(path), 800);
      return () => clearTimeout(timer);
    }
  }, [loading, vehicles, q]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setParams({});
  };

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-page__header">
          <div>
            <h1 className="section-title">
              {q ? `Results for "${q}"` : 'Browse Vehicles'}
            </h1>
            {!loading && (
              <p className="search-page__count">
                {total.toLocaleString()} vehicle{total !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        </div>

        <div className="search-page__layout">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleReset}
            variants={variants}
          />

          <main className="search-page__results">
            {loading ? (
              <div className="search-skeleton">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 320 }} />
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              /* No results — redirect to Knowledge page is in-flight */
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '60px 20px',
                gap: 16,
              }}>
                <p style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.35)',
                  marginBottom: 8,
                }}>
                  {q ? 'Not found in our database' : 'No vehicles found.'}
                </p>
                {q && (
                  <p style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.2)',
                  }}>
                    Redirecting to AI knowledge synthesis…
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="search-grid">
                  {vehicles.map((v) => <VehicleCard key={v._id} vehicle={v} />)}
                </div>

                {pages > 1 && (
                  <div className="pagination">
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={page <= 1}
                      onClick={() => fetchVehicles(page - 1)}
                    >← Prev</button>
                    <span className="pagination__info">Page {page} of {pages}</span>
                    <button
                      className="btn btn-ghost btn-sm"
                      disabled={page >= pages}
                      onClick={() => fetchVehicles(page + 1)}
                    >Next →</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
