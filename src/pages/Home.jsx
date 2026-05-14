import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getVehicles, getSuggestions } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { formatPrice, formatMileage, imageUrl } from '../utils/format';
import './Home.css';

// ── Constants ──────────────────────────────────────────────────────────────────

const KB_MAKES_TWO_WORD = [
  'Land Rover', 'Aston Martin', 'Rolls-Royce', 'Mercedes-Benz',
  'Alfa Romeo', 'Harley-Davidson', 'Royal Enfield', 'General Atomics',
  'Lockheed Martin', 'General Motors', 'Hobie Cat',
];

const GRADIENTS = [
  'linear-gradient(180deg, #0f0c29 0%, #302b63 100%)',
  'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
  'linear-gradient(180deg, #0d0d0d 0%, #1a1a1a 100%)',
  'linear-gradient(180deg, #0f2027 0%, #203a43 100%)',
  'linear-gradient(180deg, #1a0533 0%, #2d1b69 100%)',
  'linear-gradient(180deg, #000000 0%, #1a1a2e 100%)',
];

const CATEGORY_COLORS = {
  Land: '#22c55e',
  Air: '#60a5fa',
  Sea: '#38bdf8',
  Space: '#a78bfa',
};

const SUBCATEGORIES = {
  Land: ['Cars', 'Motorcycles', 'Trucks', 'Heavy Machinery', 'Other'],
  Air: ['Commercial Aviation', 'Military', 'UAV/Drone'],
  Sea: ['Recreational', 'Commercial', 'Military'],
  Space: ['Rockets', 'Rovers', 'Specialty'],
};

const DEFAULT_FILTERS = {
  category: 'All',
  subcategories: [],
  fuelType: [],
  transmission: [],
  yearFrom: '',
  yearTo: '',
  priceFrom: '',
  priceTo: '',
  condition: [],
  mileage: '',
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function getCategory(bodyType) {
  if (!bodyType) return 'Land';
  const bt = bodyType.toLowerCase();

  if (/rocket|spacecraft|lunar|orbital|satellite|space shuttle|capsule/.test(bt))
    return 'Space';

  if (/aircraft|helicopter|drone|uav|jet|plane|fighter|bomber|airship|dirigible|glider|rotorcraft|turboprop|biplane/.test(bt))
    return 'Air';

  if (/boat|yacht|ship|submarine|vessel|ferry|catamaran|dinghy|frigate|destroyer|carrier|cruiser|submersible/.test(bt))
    return 'Sea';

  return 'Land';
}

function buildParams(filters, usedMode) {
  const p = {};
  if (usedMode) p.source = 'user_listing';
  else p.source = 'db';
  if (filters.fuelType.length === 1) p.fuel_type = filters.fuelType[0];
  if (filters.transmission.length === 1) p.transmission = filters.transmission[0];
  if (filters.yearFrom) p.year_from = filters.yearFrom;
  if (filters.yearTo) p.year_to = filters.yearTo;
  if (usedMode) {
    if (filters.priceFrom) p.price_from = filters.priceFrom;
    if (filters.priceTo) p.price_to = filters.priceTo;
    if (filters.condition.length === 1) p.condition = filters.condition[0];
  }
  p.limit = 12;
  return p;
}

// ── Icons ──────────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

// ── VehicleHomeCard ────────────────────────────────────────────────────────────

function VehicleHomeCard({ vehicle, usedMode }) {
  const navigate = useNavigate();
  const category = getCategory(vehicle.body_type);
  const thumb = vehicle.images?.[0] ? imageUrl(vehicle.images[0]) : null;

  return (
    <article className="vhc" onClick={() => navigate(`/vehicle/${vehicle._id}`)}>
      <div className="vhc__image">
        {thumb
          ? <img src={thumb} alt={`${vehicle.make} ${vehicle.model}`} loading="lazy" />
          : <div className="vhc__placeholder" />
        }
        <span className="vhc__category" style={{ color: CATEGORY_COLORS[category] }}>
          {category}
        </span>
      </div>

      <div className="vhc__body">
        <div className="vhc__name">{vehicle.make} {vehicle.model}</div>
        <div className="vhc__meta">
          {vehicle.make && <span>{vehicle.make}</span>}
          {vehicle.year && <span>· {vehicle.year}</span>}
        </div>

        {usedMode ? (
          <>
            <div className="vhc__pills">
              {vehicle.mileage_km != null && <span className="spec-pill">{formatMileage(vehicle.mileage_km)}</span>}
              {vehicle.condition && <span className="spec-pill">{vehicle.condition}</span>}
              {vehicle.transmission && <span className="spec-pill">{vehicle.transmission}</span>}
            </div>
            {(vehicle.price_usd != null || vehicle.price_pkr != null) && (
              <div className="vhc__price">
                {vehicle.price_usd
                  ? `$${vehicle.price_usd.toLocaleString()}`
                  : formatPrice(vehicle.price_pkr)}
              </div>
            )}
            {(vehicle.seller_name || vehicle.province) && (
              <div className="vhc__seller">
                {vehicle.seller_name && <span>{vehicle.seller_name}</span>}
                {vehicle.province && <span>{vehicle.province}</span>}
              </div>
            )}
            <div className="vhc__actions">
              <button
                className="vhc__btn vhc__btn--filled"
                onClick={e => { e.stopPropagation(); navigate(`/vehicle/${vehicle._id}`); }}
              >View Listing</button>
            </div>
          </>
        ) : (
          <>
            <div className="vhc__pills">
              {vehicle.body_type && <span className="spec-pill">{vehicle.body_type}</span>}
              {vehicle.fuel_type && <span className="spec-pill">{vehicle.fuel_type}</span>}
              {vehicle.engine_capacity && <span className="spec-pill">{vehicle.engine_capacity}</span>}
            </div>
            <div className="vhc__actions vhc__actions--two">
              <button
                className="vhc__btn vhc__btn--ghost"
                onClick={e => { e.stopPropagation(); navigate(`/vehicle/${vehicle._id}`); }}
              >Read More</button>
              <button
                className="vhc__btn vhc__btn--filled"
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/search?q=${encodeURIComponent(`${vehicle.make} ${vehicle.model}`)}&source=user_listing`);
                }}
              >Find in Used Market</button>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

// ── FilterModal ────────────────────────────────────────────────────────────────

function FilterModal({ usedMode, filters, setFilters, onApply, onReset, onClose }) {
  const FUEL_TYPES = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Other'];
  const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT', 'PDK', 'Other'];
  const CATEGORIES = ['All', 'Land', 'Air', 'Sea', 'Space'];
  const CONDITIONS = ['Excellent', 'Good', 'Fair'];
  const MILEAGE_OPTS = ['Under 30k', '30k-60k', '60k-100k', '100k+'];

  const toggle = (field, val) =>
    setFilters(p => ({
      ...p,
      [field]: p[field].includes(val) ? p[field].filter(v => v !== val) : [...p[field], val],
    }));

  return (
    <div className="fm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fm">
        <div className="fm__header">
          <h2 className="fm__title">Filter Vehicles</h2>
          <button className="fm__close" onClick={onClose}><CloseIcon /></button>
        </div>

        <div className="fm__body">
          <div className="fm__section">
            <p className="fm__label">Category</p>
            <div className="fm__pills">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`fm__pill ${filters.category === cat ? 'active' : ''}`}
                  onClick={() => setFilters(p => ({ ...p, category: cat, subcategories: [] }))}
                >{cat}</button>
              ))}
            </div>
          </div>

          {filters.category !== 'All' && SUBCATEGORIES[filters.category] && (
            <div className="fm__section">
              <p className="fm__label">{filters.category} Types</p>
              <div className="fm__checks">
                {SUBCATEGORIES[filters.category].map(sub => (
                  <label key={sub} className="fm__check">
                    <input
                      type="checkbox"
                      checked={filters.subcategories.includes(sub)}
                      onChange={() => toggle('subcategories', sub)}
                    />
                    <span>{sub}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="fm__section">
            <p className="fm__label">Fuel Type</p>
            <div className="fm__pills">
              {FUEL_TYPES.map(ft => (
                <button key={ft} className={`fm__pill ${filters.fuelType.includes(ft) ? 'active' : ''}`}
                  onClick={() => toggle('fuelType', ft)}>{ft}</button>
              ))}
            </div>
          </div>

          <div className="fm__section">
            <p className="fm__label">Transmission</p>
            <div className="fm__pills">
              {TRANSMISSIONS.map(t => (
                <button key={t} className={`fm__pill ${filters.transmission.includes(t) ? 'active' : ''}`}
                  onClick={() => toggle('transmission', t)}>{t}</button>
              ))}
            </div>
          </div>

          <div className="fm__section">
            <p className="fm__label">Year Range</p>
            <div className="fm__range">
              <input type="number" placeholder="From" value={filters.yearFrom}
                onChange={e => setFilters(p => ({ ...p, yearFrom: e.target.value }))} min="1900" max="2030" />
              <span className="fm__sep">—</span>
              <input type="number" placeholder="To" value={filters.yearTo}
                onChange={e => setFilters(p => ({ ...p, yearTo: e.target.value }))} min="1900" max="2030" />
            </div>
          </div>

          {usedMode && (
            <>
              <div className="fm__section">
                <p className="fm__label">Price Range (PKR)</p>
                <div className="fm__range">
                  <input type="number" placeholder="From" value={filters.priceFrom}
                    onChange={e => setFilters(p => ({ ...p, priceFrom: e.target.value }))} />
                  <span className="fm__sep">—</span>
                  <input type="number" placeholder="To" value={filters.priceTo}
                    onChange={e => setFilters(p => ({ ...p, priceTo: e.target.value }))} />
                </div>
              </div>

              <div className="fm__section">
                <p className="fm__label">Condition</p>
                <div className="fm__pills">
                  {CONDITIONS.map(c => (
                    <button key={c} className={`fm__pill ${filters.condition.includes(c) ? 'active' : ''}`}
                      onClick={() => toggle('condition', c)}>{c}</button>
                  ))}
                </div>
              </div>

              <div className="fm__section">
                <p className="fm__label">Mileage</p>
                <select value={filters.mileage}
                  onChange={e => setFilters(p => ({ ...p, mileage: e.target.value }))}>
                  <option value="">Any</option>
                  {MILEAGE_OPTS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="fm__footer">
          <button className="fm__apply" onClick={onApply}>Apply Filters</button>
          <button className="fm__reset" onClick={onReset}>Reset</button>
        </div>
      </div>
    </div>
  );
}

// ── Home ───────────────────────────────────────────────────────────────────────

export default function Home() {
  const { user, isAuth } = useAuth();
  const { compareIds } = useCompare();
  const navigate = useNavigate();

  const [usedMode, setUsedMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);
  const [correctedQuery, setCorrectedQuery] = useState(null);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [searchStage, setSearchStage] = useState('make');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(DEFAULT_FILTERS);
  const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [columnsVisible, setColumnsVisible] = useState(Array(6).fill(false));
  const [scrolled, setScrolled] = useState(false);
  const [navSearchOpen, setNavSearchOpen] = useState(false);
  const [navQuery, setNavQuery] = useState('');

  const heroRef = useRef(null);
  const searchContainerRef = useRef(null);
  const debounceRef = useRef(null);

  // Hide global navbar on home page
  useEffect(() => {
    document.body.classList.add('home-page');
    return () => document.body.classList.remove('home-page');
  }, []);

  // Sticky nav trigger on scroll past 75% of hero height
  useEffect(() => {
    const onScroll = () => {
      const h = heroRef.current;
      setScrolled(h ? window.scrollY > h.offsetHeight * 0.75 : false);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Column stagger via IntersectionObserver
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const timeouts = [];
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        GRADIENTS.forEach((_, i) => {
          timeouts.push(setTimeout(() => {
            setColumnsVisible(prev => {
              const n = [...prev];
              n[i] = true;
              return n;
            });
          }, i * 150));
        });
        obs.disconnect();
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => { obs.disconnect(); timeouts.forEach(clearTimeout); };
  }, []);

  // Close suggestions when clicking outside search container
  useEffect(() => {
    const handler = e => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch vehicles whenever mode or active filters change
  useEffect(() => {
    setLoading(true);
    getVehicles(buildParams(activeFilters, usedMode))
      .then(r => setVehicles(r.data.vehicles || []))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, [usedMode, activeFilters]);

  // Debounced suggestions
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestionsLoaded(false);
      setCorrectedQuery(null);
      setAiAvailable(false);
      setSearchStage('make');
      return;
    }
    setSuggestionsLoaded(false);
    debounceRef.current = setTimeout(() => {
      getSuggestions(searchQuery)
        .then(r => {
          const { suggestions: s = [], corrected, correctedQuery: cq, aiAvailable: aiAvail, stage } = r.data;
          setSuggestions(s);
          setCorrectedQuery(corrected ? cq : null);
          setAiAvailable(!!aiAvail);
          setSearchStage(stage || 'make');
          setShowSuggestions(s.length > 0 || !!aiAvail || corrected);
          setSuggestionsLoaded(true);
        })
        .catch(() => setSuggestionsLoaded(true));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const goSearch = (q = searchQuery) => {
    const trimmed = (correctedQuery || q).trim();
    if (!trimmed) return navigate('/search');
    const words = trimmed.split(/\s+/);
    const sp = new URLSearchParams({ q: trimmed });
    const yearWord = words.find(w => /^\d{4}$/.test(w));
    const nonYearWords = words.filter(w => w !== yearWord);
    if (yearWord) sp.set('year', yearWord);
    const firstWord = nonYearWords[0] || '';
    const firstTwo = nonYearWords.slice(0, 2).join(' ');
    const twoWordMake = KB_MAKES_TWO_WORD.find(m => m.toLowerCase() === firstTwo.toLowerCase());
    if (twoWordMake) {
      sp.set('make', twoWordMake);
      const rest = nonYearWords.slice(2).join(' ');
      if (rest) sp.set('model', rest);
    } else if (firstWord) {
      sp.set('make', firstWord);
      const rest = nonYearWords.slice(1).join(' ');
      if (rest) sp.set('model', rest);
    }
    navigate(`/search?${sp.toString()}`);
    setShowSuggestions(false);
  };

  const openModal = () => {
    setPendingFilters(activeFilters);
    setFilterModalOpen(true);
  };

  const applyFilters = () => {
    setActiveFilters(pendingFilters);
    setFilterModalOpen(false);
  };

  const closeModal = () => {
    setPendingFilters(activeFilters);
    setFilterModalOpen(false);
  };

  return (
    <div className="home">

      {/* ── Sticky Nav ──────────────────────────────────────────────── */}
      <nav className={`hn ${scrolled ? 'hn--visible' : ''}`}>
        <div className="hn__inner">
          <Link to="/" className="hn__logo">Auto<span>Gen</span></Link>

          <div className="hn__center">
            {navSearchOpen ? (
              <div className="hn__search">
                <SearchIcon />
                <input
                  autoFocus
                  value={navQuery}
                  onChange={e => setNavQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { goSearch(navQuery); setNavSearchOpen(false); }
                    if (e.key === 'Escape') { setNavSearchOpen(false); setNavQuery(''); }
                  }}
                  placeholder="Search vehicles…"
                />
              </div>
            ) : (
              <button className="hn__search-trigger" onClick={() => setNavSearchOpen(true)}>
                <SearchIcon />
              </button>
            )}
          </div>

          <div className="hn__right">
            <Link to="/search" className="hn__link">Browse</Link>
            {compareIds.length > 0 && (
              <Link to="/compare" className="hn__compare">
                Compare <span>{compareIds.length}</span>
              </Link>
            )}
            {isAuth ? (
              <Link to="/profile" className="hn__avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </Link>
            ) : (
              <>
                <Link to="/login" className="hn__link">Login</Link>
                <Link to="/register" className="hn__link hn__link--filled">Register</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="hero2" ref={heroRef}>
        <div className="hero2__cols">
          {GRADIENTS.map((g, i) => (
            <div
              key={i}
              className={`hero2__col ${columnsVisible[i] ? 'hero2__col--on' : ''}`}
              style={{ background: g }}
            />
          ))}
        </div>

        <div className="hero2__center">
          <div className="hero2__wordmark">Auto<span>Gen</span></div>
          <p className="hero2__subtitle">Every vehicle. Every category. Every era.</p>

          <div className="search-wrap" ref={searchContainerRef}>
            <div className="sbar">
              <button className="sbar__icon" onClick={() => goSearch()} aria-label="Search">
                <SearchIcon />
              </button>
              <input
                className="sbar__input"
                type="text"
                placeholder="Search make, model, year…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') goSearch();
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
                onFocus={() => {
                  if (suggestionsLoaded && (suggestions.length > 0 || aiAvailable || correctedQuery)) {
                    setShowSuggestions(true);
                  }
                }}
              />
              <button className="sbar__filter" onClick={openModal} aria-label="Filters">
                <FilterIcon />
              </button>
            </div>

            <button
              className={`used-toggle ${usedMode ? 'used-toggle--on' : ''}`}
              onClick={() => setUsedMode(p => !p)}
            >
              <span>Used Vehicles</span>
              <span>{usedMode ? '●' : '○'}</span>
            </button>

            {showSuggestions && suggestionsLoaded && (
              <>
                {/* "Did you mean?" banner — above the dropdown, outside .sugg */}
                {correctedQuery && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0, right: 0,
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: '10px 10px 0 0',
                    padding: '9px 14px',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: 'rgba(255,255,255,0.5)',
                    zIndex: 51,
                  }}>
                    <span>Did you mean:</span>
                    <button
                      style={{
                        background: 'none', border: 'none',
                        color: '#818cf8', fontWeight: 600, fontSize: 12,
                        cursor: 'pointer', padding: 0,
                        textDecoration: 'underline',
                        textUnderlineOffset: 2,
                      }}
                      onClick={() => {
                        setSearchQuery(correctedQuery);
                        setCorrectedQuery(null);
                        // keep dropdown open — debounce fires on searchQuery change
                      }}
                    >{correctedQuery}</button>
                    <span>?</span>
                    <button
                      style={{
                        background: 'none', border: 'none',
                        color: 'rgba(255,255,255,0.35)', fontSize: 14,
                        cursor: 'pointer', padding: '0 2px',
                        marginLeft: 'auto', lineHeight: 1,
                      }}
                      onClick={() => setCorrectedQuery(null)}
                      aria-label="Dismiss"
                    >✕</button>
                  </div>
                )}

                {/* Suggestions dropdown */}
                <div
                  className="sugg"
                  style={correctedQuery ? { top: 'calc(100% + 36px)' } : undefined}
                >
                  {/* Stage label */}
                  <div style={{
                    padding: '7px 16px 5px',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    {searchStage === 'make' ? 'Models' : searchStage === 'model' ? 'Year & Variant' : 'Matching Vehicles'}
                  </div>

                  {/* DB suggestion rows */}
                  {suggestions.slice(0, 6).map((s, i) => (
                    <button
                      key={i}
                      className="sugg__row"
                      onClick={() => {
                        if (s.isExact && s._id) {
                          // Specific vehicle — go straight to detail page
                          navigate(`/vehicle/${s._id}`);
                          setShowSuggestions(false);
                          setSearchQuery('');
                        } else {
                          // Grouped result — refine to next stage
                          const refined = s.variant
                            ? `${s.make} ${s.model} ${s.variant}`
                            : `${s.make} ${s.model}`;
                          setSearchQuery(refined);
                          // Keep dropdown open; debounce will fetch model-stage suggestions
                        }
                      }}
                    >
                      <span className="sugg__name">
                        {s.make} {s.model}
                        {s.year && <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 6, fontSize: 13 }}>{s.year}</span>}
                        {s.variant && <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 4, fontSize: 12 }}>{s.variant}</span>}
                      </span>
                      <span className="sugg__info">
                        {s.body_type && <span>{s.body_type}</span>}
                      </span>
                      {/* › = refine more, → = go to detail */}
                      <span style={{
                        color: s.isExact ? '#818cf8' : 'rgba(255,255,255,0.25)',
                        fontSize: s.isExact ? 14 : 16,
                        marginLeft: 8, flexShrink: 0,
                        fontWeight: s.isExact ? 600 : 400,
                      }}>
                        {s.isExact ? '→' : '›'}
                      </span>
                    </button>
                  ))}

                  {/* AI Knowledge Card fallback */}
                  {aiAvailable && (
                    <button
                      className="sugg__row"
                      onClick={() => {
                        const q = (correctedQuery || searchQuery).trim();
                        const words = q.split(/\s+/);
                        const make = words[0] || '';
                        const yearWord = words.find(w => /^\d{4}$/.test(w)) || '';
                        const nonYear = words.filter(w => w !== yearWord);
                        const model = nonYear.slice(1).join(' ') || make;
                        const sp = new URLSearchParams();
                        if (yearWord) sp.set('year', yearWord);
                        const qs = sp.toString();
                        navigate(
                          `/knowledge/${encodeURIComponent(make)}/${encodeURIComponent(model)}${qs ? '?' + qs : ''}`
                        );
                        setShowSuggestions(false);
                        setSearchQuery('');
                      }}
                    >
                      <span className="sugg__name">{correctedQuery || searchQuery}</span>
                      <span className="sugg__info"><span>not in database</span></span>
                      <span className="sugg__ai">AI Knowledge Card</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Vehicles Grid ───────────────────────────────────────────── */}
      <section className="home-grid-section">
        <div className="container">
          <div className="home-grid-section__header">
            <h2 className="home-grid-section__title">
              {usedMode ? 'Used Vehicles' : 'Explore Vehicles'}
            </h2>
            {usedMode && <p className="home-grid-section__sub">Browse available listings</p>}
          </div>

          <div className="home-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="vhc vhc--skeleton">
                    <div className="vhc__image skeleton" style={{ height: 200 }} />
                    <div className="vhc__body">
                      <div className="skeleton" style={{ height: 18, marginBottom: 8, borderRadius: 4 }} />
                      <div className="skeleton" style={{ height: 13, width: '55%', borderRadius: 4 }} />
                    </div>
                  </div>
                ))
              : vehicles.length === 0
                ? usedMode
                  ? (
                    <div style={{
                      gridColumn: '1/-1',
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: 'rgba(255,255,255,0.3)',
                    }}>
                      <p style={{ fontSize: 48, marginBottom: 16 }}>🚗</p>
                      <p style={{ fontSize: 18, marginBottom: 8 }}>No used listings yet</p>
                      <p style={{ fontSize: 14 }}>Be the first to list a vehicle</p>
                    </div>
                  )
                  : <p className="home-grid__empty">No vehicles found. Try adjusting your filters.</p>
                : vehicles.map(v => (
                    <VehicleHomeCard key={v._id} vehicle={v} usedMode={usedMode} />
                  ))
            }
          </div>
        </div>
      </section>

      {/* ── Filter Modal ────────────────────────────────────────────── */}
      {filterModalOpen && (
        <FilterModal
          usedMode={usedMode}
          filters={pendingFilters}
          setFilters={setPendingFilters}
          onApply={applyFilters}
          onReset={() => setPendingFilters(DEFAULT_FILTERS)}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
