import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing, uploadImages } from '../services/api';
import './NewListing.css';

const BODY_TYPES = ['Sedan', 'Hatchback', 'SUV', 'Crossover', 'Pickup', 'Van', 'Wagon', 'Coupe', 'MPV'];
const FUELS = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'LPG', 'CNG'];
const TRANSMISSIONS = ['Automatic', 'Manual', 'CVT'];
const PROVINCES = ['Islamabad', 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'Lahore', 'Karachi'];

export default function NewListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    make: '', model: '', year: '', variant: '', body_type: '', fuel_type: '',
    engine_capacity: '', transmission: '', color: '', assembly: 'Local',
    province: '', mileage_km: '', condition: 'Used', price_pkr: '', description: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.make || !form.model || !form.year || !form.price_pkr) {
      return setError('Make, model, year, and price are required.');
    }
    setLoading(true);
    setError('');
    try {
      let imagePaths = [];
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append('images', f));
        const uploadRes = await uploadImages(fd);
        imagePaths = uploadRes.data.paths;
      }
      await createListing({ ...form, images: imagePaths });
      navigate('/listings/new?success=1');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-listing-page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">Post a Vehicle</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
            List your vehicle for free. No approval required.
          </p>
        </div>

        <form className="listing-form" onSubmit={handleSubmit}>
          <div className="listing-form__section">
            <h3>Vehicle Info</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Make *</label>
                <input type="text" placeholder="e.g. Toyota" value={form.make} onChange={(e) => set('make', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Model *</label>
                <input type="text" placeholder="e.g. Corolla" value={form.model} onChange={(e) => set('model', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Year *</label>
                <input type="number" placeholder="2020" min="1970" max="2026" value={form.year} onChange={(e) => set('year', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Variant</label>
                <input type="text" placeholder="e.g. GLi" value={form.variant} onChange={(e) => set('variant', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="listing-form__section">
            <h3>Specs</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Body Type</label>
                <select value={form.body_type} onChange={(e) => set('body_type', e.target.value)}>
                  <option value="">Select</option>
                  {BODY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select value={form.fuel_type} onChange={(e) => set('fuel_type', e.target.value)}>
                  <option value="">Select</option>
                  {FUELS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Transmission</label>
                <select value={form.transmission} onChange={(e) => set('transmission', e.target.value)}>
                  <option value="">Select</option>
                  {TRANSMISSIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Engine Capacity</label>
                <input type="text" placeholder="e.g. 1600 cc" value={form.engine_capacity} onChange={(e) => set('engine_capacity', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Assembly</label>
                <select value={form.assembly} onChange={(e) => set('assembly', e.target.value)}>
                  <option>Local</option>
                  <option>Imported</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <input type="text" placeholder="e.g. White" value={form.color} onChange={(e) => set('color', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="listing-form__section">
            <h3>Location & Condition</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Province</label>
                <select value={form.province} onChange={(e) => set('province', e.target.value)}>
                  <option value="">Select</option>
                  {PROVINCES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Mileage (km)</label>
                <input type="number" placeholder="e.g. 50000" value={form.mileage_km} onChange={(e) => set('mileage_km', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select value={form.condition} onChange={(e) => set('condition', e.target.value)}>
                  <option>Used</option>
                  <option>New</option>
                  <option>Certified Pre-Owned</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (PKR) *</label>
                <input type="number" placeholder="e.g. 3500000" value={form.price_pkr} onChange={(e) => set('price_pkr', e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="listing-form__section">
            <h3>Description</h3>
            <div className="form-group">
              <textarea
                rows={4}
                placeholder="Describe your vehicle…"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
          </div>

          <div className="listing-form__section">
            <h3>Photos (up to 5)</h3>
            <div className="form-group">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))}
              />
              {files.length > 0 && (
                <div className="listing-form__previews">
                  {files.map((f, i) => (
                    <img key={i} src={URL.createObjectURL(f)} alt="" className="listing-form__preview" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
            {loading ? 'Publishing…' : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
