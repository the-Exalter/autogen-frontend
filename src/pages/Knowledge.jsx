import React, { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import useVehicleStream from '../hooks/useVehicleStream';
import './Knowledge.css';

export default function Knowledge() {
  const { make, model } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const year = searchParams.get('year');
  const variant = searchParams.get('variant');

  const { streamingText, vehicle, isStreaming, error, startStream } =
    useVehicleStream();

  // Auto-start streaming on mount
  useEffect(() => {
    startStream({
      make: decodeURIComponent(make),
      model: decodeURIComponent(model),
      year: year ? Number(year) : undefined,
      variant: variant || undefined,
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When streaming completes and vehicle has _id, redirect to /vehicle/:id
  useEffect(() => {
    if (vehicle?._id && !isStreaming) {
      const timer = setTimeout(() => {
        navigate(`/vehicle/${vehicle._id}`, { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [vehicle, isStreaming, navigate]);

  const displayName = `${decodeURIComponent(make)} ${decodeURIComponent(model)}${year ? ` ${year}` : ''}`;

  return (
    <div className="knowledge-page">
      <div className="knowledge-page__container">

        {/* Streaming state */}
        {isStreaming && (
          <div className="knowledge-card knowledge-card--streaming">
            <div className="knowledge-card__badge">
              <span className="pulse-dot" />
              Synthesizing knowledge card…
            </div>
            <h1 className="knowledge-card__title">{displayName}</h1>
            <div className="knowledge-card__skeletons">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="knowledge-card__skeleton"
                  style={{ width: i === 4 ? '60%' : '100%' }}
                />
              ))}
            </div>
            <div className="knowledge-card__chars">
              {streamingText.length} characters synthesized…
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isStreaming && (
          <div className="knowledge-card">
            <h1 className="knowledge-card__title">{displayName}</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
              {error}
            </p>
            <button
              className="btn btn-ghost"
              style={{ marginTop: 20 }}
              onClick={() => startStream({
                make: decodeURIComponent(make),
                model: decodeURIComponent(model),
                year: year ? Number(year) : undefined,
                variant: variant || undefined,
              })}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Completed card — shows briefly before redirect */}
        {vehicle && !isStreaming && (
          <div className="knowledge-card knowledge-card--done">
            <div className="knowledge-card__badge knowledge-card__badge--done">
              ✨ AI Knowledge Card
            </div>
            <h1 className="knowledge-card__title">
              {vehicle.year} {vehicle.make} {vehicle.model}
              {vehicle.variant && (
                <span className="knowledge-card__variant"> {vehicle.variant}</span>
              )}
            </h1>

            <div className="knowledge-card__specs">
              {[
                { label: 'Body Type', value: vehicle.body_type },
                { label: 'Engine', value: vehicle.engine_capacity },
                { label: 'Transmission', value: vehicle.transmission },
                { label: 'Fuel', value: vehicle.fuel_type },
                { label: 'Assembly', value: vehicle.assembly },
                { label: 'Parts', value: vehicle.parts_availability },
              ].filter(s => s.value).map(s => (
                <div key={s.label} className="knowledge-card__spec">
                  <span className="knowledge-card__spec-label">{s.label}</span>
                  <span className="knowledge-card__spec-value">{s.value}</span>
                </div>
              ))}
            </div>

            {vehicle.description && (
              <p className="knowledge-card__description">{vehicle.description}</p>
            )}

            <p className="knowledge-card__redirect">
              Loading full details…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
