import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAuth } = useAuth();
  const { compareIds } = useCompare();
  const navigate = useNavigate();
  const location = useRouterLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          Auto<span>Gen</span>
        </Link>

        <button className="navbar__burger" onClick={() => setMenuOpen((p) => !p)} aria-label="Menu">
          <span /><span /><span />
        </button>

        <div className={`navbar__links ${menuOpen ? 'open' : ''}`}>
          <Link to="/search" className={isActive('/search') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
            Browse
          </Link>
          {compareIds.length > 0 && (
            <Link to="/compare" className="navbar__compare-badge" onClick={() => setMenuOpen(false)}>
              Compare <span>{compareIds.length}</span>
            </Link>
          )}
          {isAuth && (
            <Link to="/listings/new" className={isActive('/listings/new') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              Sell
            </Link>
          )}
          {isAuth && (
            <Link to="/bookmarks" className={isActive('/bookmarks') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              Saved
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin" className={location.pathname.startsWith('/admin') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
              Admin
            </Link>
          )}
        </div>

        <div className="navbar__auth">
          {isAuth ? (
            <div className="navbar__user">
              <Link to="/profile" className="navbar__avatar" title={user?.name}>
                {user?.name?.charAt(0).toUpperCase()}
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar__auth-links">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
