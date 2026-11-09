import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import LocationSelector from './LocationSelector';

const NAV_LINKS = [
  { to: '/air',       label: 'Air',        icon: '🌬️' },
  { to: '/water',     label: 'Water',      icon: '💧' },
  { to: '/map',       label: 'Safe Route & Map', icon: '🗺️' },
  { to: '/report',    label: '📢 Report',  icon: '📢' },
  { to: '/rankings',  label: 'Rankings',   icon: '📊' },
  { to: '/exposure',  label: 'Exposure',   icon: '⭕' },
  { to: '/news',      label: 'News',       icon: '📰' },
  { to: '/shop',      label: 'Shop',       icon: '🛒' },
  { to: '/admin',     label: '⚙️ Admin',   icon: '⚙️' },
];

export default function Navbar() {
  const { cartCount, searchQuery, setSearchQuery, user, dbStatus, setAuthModalOpen, setAuthModalMode, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const toggleSearch = () => {
    if (!user) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    setSearchOpen(v => !v);
  };

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  return (
    <>
      <header className="navbar-header" role="banner">
        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo" aria-label="EcoNexus Home">
            <div className="logo-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="url(#grad1)"/>
                <path d="M16 8C13 8 10 10.5 10 14c0 4 4 8 6 10 2-2 6-6 6-10 0-3.5-3-6-6-6z" fill="white" opacity="0.9"/>
                <circle cx="16" cy="14" r="2.5" fill="url(#grad1)"/>
                <path d="M10 20c0 0 2 3 6 4.5C20 23 22 20 22 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                <defs>
                  <linearGradient id="grad1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#2563eb"/>
                    <stop offset="100%" stopColor="#16a34a"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-brand">EcoNexus</span>
              <span className="logo-region">India</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="navbar-desktop-nav hide-mobile" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Location Selector - active after login, prompt before */}
          <div className="navbar-location-selector hide-mobile">
            {user ? (
              <LocationSelector />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                className="btn btn-outline btn-xs"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  padding: '5px 12px',
                  color: 'var(--gray-600)',
                  border: '1px dashed var(--gray-300)',
                  background: 'var(--gray-50)',
                  cursor: 'pointer'
                }}
                title="Sign in to select and search custom locations across India"
              >
                <span>📍</span>
                <span>Select Location (Login)</span>
              </button>
            )}
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* MongoDB Status Indicator */}
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '20px',
                  backgroundColor: dbStatus?.connected ? 'rgba(22, 163, 74, 0.1)' : 'rgba(234, 88, 12, 0.1)',
                  color: dbStatus?.connected ? '#16a34a' : '#ea580c',
                  border: `1px solid ${dbStatus?.connected ? 'rgba(22, 163, 74, 0.25)' : 'rgba(234, 88, 12, 0.25)'}`,
                }}
                title={dbStatus?.connected ? `Connected to MongoDB: ${dbStatus.host || 'Atlas'}` : 'MongoDB Backend Ready'}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: dbStatus?.connected ? '#16a34a' : '#ea580c',
                    boxShadow: dbStatus?.connected ? '0 0 6px #16a34a' : 'none',
                  }}
                />
                {dbStatus?.connected ? 'MongoDB Connected' : 'MongoDB Backend'}
              </span>
            </div>

            {/* Search */}
            <button
              className={`nav-icon-btn ${searchOpen ? 'active' : ''}`}
              onClick={toggleSearch}
              aria-label="Search"
              aria-expanded={searchOpen}
              title={user ? 'Search' : 'Sign in to search locations and data'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Cart */}
            <Link to="/shop/cart" className="nav-icon-btn cart-btn" aria-label={`Cart with ${cartCount} items`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && <span className="cart-badge" aria-live="polite">{cartCount}</span>}
            </Link>

            {/* Alerts */}
            <Link to="/alerts" className="nav-icon-btn hide-mobile" aria-label="Alerts">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </Link>

            {/* Profile / Auth Button */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Link to="/profile" className="nav-icon-btn hide-mobile" aria-label="Profile" title={`Signed in as ${user.name}`}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #16a34a)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '12px'
                  }}>
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="btn btn-ghost btn-xs hide-mobile"
                  style={{ color: 'var(--gray-500)', fontSize: '11px', padding: '3px 8px' }}
                  title="Sign Out"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                className="btn btn-primary btn-sm hide-mobile"
                style={{ fontWeight: 700, borderRadius: '20px', padding: '6px 14px', fontSize: '12px', gap: '4px' }}
              >
                <span>🔑</span> Sign In
              </button>
            )}

            {/* Mobile Menu */}
            <button
              className="nav-icon-btn hide-desktop"
              onClick={() => setMobileMenuOpen(v => !v)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="navbar-search-bar animate-fade-in">
            <form onSubmit={handleSearch} className="search-form">
              <div className="input-group">
                <svg className="input-icon input-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  ref={searchRef}
                  type="search"
                  className="input with-icon-left"
                  placeholder="Search cities, states, water bodies, products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  aria-label="Search"
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-menu hide-desktop animate-slide-up" role="navigation" aria-label="Mobile navigation">
            {!user ? (
              <div style={{ padding: '10px 14px', background: 'var(--primary-50)', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary-700)' }}>Guest Visitor</div>
                  <div style={{ fontSize: '11px', color: 'var(--primary-500)' }}>Sign in to unlock all data</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="btn btn-primary btn-xs"
                >
                  🔑 Sign In
                </button>
              </div>
            ) : (
              <div style={{ padding: '8px 14px', background: 'var(--gray-50)', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>👤 {user.name}</span>
                <button
                  type="button"
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="btn btn-ghost btn-xs"
                >
                  Sign Out
                </button>
              </div>
            )}
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
              >
                <span className="mobile-nav-icon">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <div className="mobile-nav-divider"/>
            <Link to="/alerts" className="mobile-nav-link">🔔 Alerts</Link>
            <Link to="/admin" className="mobile-nav-link">⚙️ Admin</Link>
            <Link to="/profile" className="mobile-nav-link">👤 Profile</Link>
          </div>
        )}
      </header>

      <style>{`
        .navbar-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--gray-100);
          box-shadow: var(--shadow-sm);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          height: var(--nav-height);
          max-width: var(--content-max);
          margin: 0 auto;
          padding: 0 var(--space-4);
          gap: var(--space-4);
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-shrink: 0;
          text-decoration: none;
        }
        .logo-icon { display: flex; align-items: center; }
        .logo-text { display: flex; flex-direction: column; line-height: 1.1; }
        .logo-brand { font-family: var(--font-display); font-size: 17px; font-weight: 800; color: var(--primary-700); }
        .logo-region { font-size: 10px; font-weight: 600; color: var(--green-600); letter-spacing: 0.08em; text-transform: uppercase; }
        .navbar-desktop-nav { display: flex; align-items: center; gap: 2px; flex: 1; }
        .navbar-location-selector { flex-shrink: 0; }
        .nav-link {
          padding: 6px 10px;
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 500;
          color: var(--gray-600);
          transition: all var(--transition-fast);
          white-space: nowrap;
          text-decoration: none;
        }
        .nav-link:hover { color: var(--primary-600); background: var(--primary-50); }
        .nav-link.active { color: var(--primary-700); background: var(--primary-100); font-weight: 600; }
        .navbar-actions { display: flex; align-items: center; gap: var(--space-1); margin-left: auto; }
        .nav-icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          color: var(--gray-600);
          transition: all var(--transition-fast);
          text-decoration: none;
        }
        .nav-icon-btn:hover, .nav-icon-btn.active { color: var(--primary-600); background: var(--primary-50); }
        .cart-btn { color: var(--gray-600); }
        .cart-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: var(--primary-600);
          color: white;
          font-size: 9px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
        }
        .navbar-search-bar {
          padding: var(--space-3) var(--space-4);
          border-top: 1px solid var(--gray-100);
          background: white;
        }
        .search-form { max-width: 600px; margin: 0 auto; }
        .navbar-mobile-menu {
          background: white;
          border-top: 1px solid var(--gray-100);
          padding: var(--space-3) var(--space-2);
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          font-size: 15px;
          font-weight: 500;
          color: var(--gray-700);
          text-decoration: none;
          transition: all var(--transition-fast);
        }
        .mobile-nav-link:hover, .mobile-nav-link.active { background: var(--primary-50); color: var(--primary-700); }
        .mobile-nav-icon { font-size: 18px; width: 24px; text-align: center; }
        .mobile-nav-divider { height: 1px; background: var(--gray-100); margin: var(--space-2) var(--space-4); }
      `}</style>
    </>
  );
}
