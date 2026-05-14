import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/vehicles', label: 'Vehicles' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/listings', label: 'Listings' },
  { to: '/admin/cache', label: 'AI Cache' },
  { to: '/admin/logs', label: 'Logs' },
];

export default function AdminNav() {
  return (
    <nav className="admin-nav">
      {links.map(({ to, label, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'active' : ''}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
