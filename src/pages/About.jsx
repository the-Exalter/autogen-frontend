import React from 'react';
import './About.css';

const FEATURES = [
  { icon: '🔍', title: 'Two-Tier Search', desc: 'Database first, AI fallback second — find any vehicle, listed or not.' },
  { icon: '🤖', title: 'AI Vehicle Generation', desc: 'Claude generates structured specs for any make/model/year on demand.' },
  { icon: '📍', title: 'Availability Detection', desc: 'Web-search–powered checks tell you if a vehicle is sold in your market.' },
  { icon: '💰', title: 'ML Price Prediction', desc: 'scikit-learn models trained on PK + international market data.' },
  { icon: '⚖️', title: 'Vehicle Comparison', desc: 'Side-by-side specs and price comparisons across multiple vehicles.' },
  { icon: '🏷️', title: 'Marketplace Listings', desc: 'User-submitted listings sit alongside the knowledge layer.' },
];

const STACK = ['React.js', 'Express.js', 'FastAPI', 'MongoDB Atlas', 'Anthropic Claude API', 'scikit-learn'];

export default function About() {
  return (
    <div className="about">
      <div className="container">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="about__hero">
          <h1>About <span>AutoGen</span></h1>
          <p>
            An AI-powered vehicle knowledge and marketplace platform built as a Final Year
            Project at The Islamia University of Bahawalpur.
          </p>
        </section>

        {/* ── Problem / Solution ────────────────────────────────────── */}
        <section className="about__split">
          <div className="about__card">
            <div className="eyebrow">The Problem</div>
            <h2>Listings ≠ Knowledge</h2>
            <p>
              Existing platforms like PakWheels only show vehicles that are currently listed
              for sale. If a vehicle isn't being actively sold, it effectively doesn't exist —
              no specs, no price reference, no availability information.
            </p>
          </div>
          <div className="about__card">
            <div className="eyebrow">The Solution</div>
            <h2>Knowledge Layer + Marketplace</h2>
            <p>
              AutoGen separates vehicle knowledge from vehicle listings. A two-tier search
              hits the database first and falls back to AI generation second — so you can
              look up any vehicle, any time, regardless of whether anyone is selling one.
            </p>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────── */}
        <section className="about__section">
          <h2>Features</h2>
          <p style={{ marginBottom: 24 }}>The pieces that make the platform work.</p>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-item">
                <span className="feature-item__icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stack ─────────────────────────────────────────────────── */}
        <section className="about__section">
          <h2>Tech Stack</h2>
          <p style={{ marginBottom: 20 }}>Built with modern, production-grade tooling.</p>
          <div className="stack-list">
            {STACK.map((s) => <span key={s} className="stack-chip">{s}</span>)}
          </div>
        </section>

        {/* ── Team ──────────────────────────────────────────────────── */}
        <section className="about__section">
          <h2>Team</h2>
          <p style={{ marginBottom: 24 }}>The people behind AutoGen.</p>
          <div className="team-grid">
            <div className="team-card">
              <div className="role">Developer</div>
              <div className="name">Muhammad Abdul Rafay</div>
              <div className="meta">F21BDOCS1E02017</div>
            </div>
            <div className="team-card">
              <div className="role">Supervisor</div>
              <div className="name">Dr. Fariha Ashfaq</div>
              <div className="meta">Department of Computer Science</div>
            </div>
            <div className="team-card">
              <div className="role">Institution</div>
              <div className="name">The Islamia University of Bahawalpur</div>
              <div className="meta">Department of Computer Science</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
