import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { compareVehicles } from '../services/api';
import { useCompare } from '../context/CompareContext';
import { formatPrice, formatMileage } from '../utils/format';
import './Compare.css';

const SPEC_ROWS = [
  { key: 'price_pkr', label: 'Price', format: formatPrice },
  { key: 'year', label: 'Year' },
  { key: 'body_type', label: 'Body Type' },
  { key: 'fuel_type', label: 'Fuel Type' },
  { key: 'engine_capacity', label: 'Engine' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'assembly', label: 'Assembly' },
  { key: 'color', label: 'Color' },
  { key: 'province', label: 'Province' },
  { key: 'mileage_km', label: 'Mileage', format: formatMileage },
  { key: 'condition', label: 'Condition' },
];

export default function Compare() {
  const { compareIds, removeFromCompare, clearCompare } = useCompare();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!compareIds.length) { setVehicles([]); return; }
    setLoading(true);
    compareVehicles(compareIds)
      .then((r) => setVehicles(r.data))
      .finally(() => setLoading(false));
  }, [compareIds]);

  if (!compareIds.length) return (
    <div className="compare-page">
      <div className="container compare-empty">
        <h1 className="section-title">Compare Vehicles</h1>
        <p>Add up to 3 vehicles to compare. Click "+ Compare" on any vehicle card.</p>
        <Link to="/search" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Vehicles</Link>
      </div>
    </div>
  );

  const getBestValue = (key) => {
    const vals = vehicles.map((v) => v[key]).filter((v) => v != null);
    if (!vals.length) return null;
    // Lower is better for price and mileage; higher is better for year
    if (key === 'price_pkr' || key === 'mileage_km') return Math.min(...vals);
    if (key === 'year') return Math.max(...vals);
    return null;
  };

  return (
    <div className="compare-page">
      <div className="container">
        <div className="compare-header">
          <h1 className="section-title">Compare Vehicles</h1>
          <button className="btn btn-ghost btn-sm" onClick={clearCompare}>Clear All</button>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 400 }} />
        ) : (
          <div className="compare-table-wrap">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="compare-table__label-col">Spec</th>
                  {vehicles.map((v) => (
                    <th key={v._id}>
                      <div className="compare-vehicle-head">
                        <Link to={`/vehicle/${v._id}`}>{v.make} {v.model}</Link>
                        <span className="compare-vehicle-year">{v.year}</span>
                        <button
                          className="compare-vehicle-remove"
                          onClick={() => removeFromCompare(v._id)}
                          title="Remove"
                        >×</button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SPEC_ROWS.map(({ key, label, format }) => {
                  const best = getBestValue(key);
                  return (
                    <tr key={key}>
                      <td className="compare-table__label">{label}</td>
                      {vehicles.map((v) => {
                        const raw = v[key];
                        const val = format ? format(raw) : (raw ?? '—');
                        const isBest = best != null && raw === best;
                        return (
                          <td key={v._id} className={isBest ? 'compare-best' : ''}>
                            {val || '—'}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr>
                  <td className="compare-table__label">Features</td>
                  {vehicles.map((v) => (
                    <td key={v._id} className="compare-features-cell">
                      {v.features?.slice(0, 5).map((f) => (
                        <span key={f} className="compare-feature-chip">{f}</span>
                      ))}
                      {v.features?.length > 5 && <span className="compare-feature-more">+{v.features.length - 5} more</span>}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
