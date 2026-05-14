import React from 'react';
import './FilterSidebar.css';

const BODY_TYPES = ['Sedan', 'Hatchback', 'SUV', 'Crossover', 'Pickup', 'Van', 'Wagon', 'Coupe', 'MPV'];
const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG', 'CNG'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];

export default function FilterSidebar({ filters, onChange, onReset, variants = [] }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <h3>Filters</h3>
        <button className="btn btn-ghost btn-sm" onClick={onReset}>Reset</button>
      </div>

      {variants.length >= 2 && (
        <div className="filter-group">
          <label className="form-label">Variant</label>
          <div className="filter-checkboxes">
            {variants.map((v) => (
              <label key={v} className="filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.variant === v}
                  onChange={() => set('variant', filters.variant === v ? '' : v)}
                />
                {v}
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="filter-group">
        <label className="form-label">Body Type</label>
        <div className="filter-chips">
          {BODY_TYPES.map((t) => (
            <button
              key={t}
              className={`chip ${filters.body_type === t ? 'active' : ''}`}
              onClick={() => set('body_type', filters.body_type === t ? '' : t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="form-label">Fuel Type</label>
        <div className="filter-chips">
          {FUELS.map((f) => (
            <button
              key={f}
              className={`chip ${filters.fuel_type === f ? 'active' : ''}`}
              onClick={() => set('fuel_type', filters.fuel_type === f ? '' : f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="form-label">Transmission</label>
        <div className="filter-chips">
          {TRANSMISSIONS.map((t) => (
            <button
              key={t}
              className={`chip ${filters.transmission === t ? 'active' : ''}`}
              onClick={() => set('transmission', filters.transmission === t ? '' : t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="form-label">Year Range</label>
        <div className="filter-range">
          <input
            type="number"
            placeholder="From"
            min="1970"
            max="2026"
            value={filters.year_min || ''}
            onChange={(e) => set('year_min', e.target.value)}
          />
          <span>–</span>
          <input
            type="number"
            placeholder="To"
            min="1970"
            max="2026"
            value={filters.year_max || ''}
            onChange={(e) => set('year_max', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <label className="form-label">Price Range (USD)</label>
        <div className="filter-range">
          <input
            type="number"
            placeholder="Min"
            value={filters.price_min || ''}
            onChange={(e) => set('price_min', e.target.value)}
          />
          <span>–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.price_max || ''}
            onChange={(e) => set('price_max', e.target.value)}
          />
        </div>
      </div>
    </aside>
  );
}
