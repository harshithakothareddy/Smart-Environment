import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const BOTTOM_NAV = [
  { to: '/',          label: 'Home',     icon: HomeIcon },
  { to: '/map',       label: 'Safe Route',icon: MapIcon },
  { to: '/report',    label: 'Report',   icon: ReportIcon },
  { to: '/rankings',  label: 'Rankings', icon: RankingsIcon },
  { to: '/shop',      label: 'Shop',     icon: ShopIcon },
];

function ReportIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      {!active && <polyline points="9 22 9 12 15 12 15 22"/>}
    </svg>
  );
}
function MapIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'none' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
      <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
    </svg>
  );
}
function ExposureIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 6v6l4 2"/>
    </svg>
  );
}
function RankingsIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function ShopIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  );
}

export default function BottomNav() {
  const location = useLocation();
  const { cartCount } = useApp();

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <nav className="bottom-nav hide-desktop" role="navigation" aria-label="Mobile bottom navigation">
        {BOTTOM_NAV.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to} className={`bottom-nav-item ${active ? 'active' : ''}`} aria-current={active ? 'page' : undefined} aria-label={label}>
              <div className="bottom-nav-icon">
                <Icon active={active} />
                {to === '/shop' && cartCount > 0 && (
                  <span className="bottom-nav-badge" aria-label={`${cartCount} items in cart`}>{cartCount}</span>
                )}
              </div>
              <span className="bottom-nav-label">{label}</span>
            </Link>
          );
        })}
      </nav>

      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: rgba(255,255,255,0.97);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid var(--gray-100);
          box-shadow: 0 -4px 16px rgba(0,0,0,0.06);
          display: flex;
          height: var(--bottom-nav-height);
          padding: 0 var(--space-2);
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
        .bottom-nav-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          color: var(--gray-400);
          text-decoration: none;
          transition: color var(--transition-fast);
          padding: var(--space-2) 0;
          border-radius: var(--radius-lg);
          position: relative;
        }
        .bottom-nav-item.active { color: var(--primary-600); }
        .bottom-nav-item:not(.active):hover { color: var(--gray-600); }
        .bottom-nav-icon { position: relative; }
        .bottom-nav-label { font-size: 10px; font-weight: 500; letter-spacing: 0.02em; }
        .bottom-nav-badge {
          position: absolute;
          top: -4px;
          right: -6px;
          background: var(--primary-600);
          color: white;
          font-size: 9px;
          font-weight: 700;
          min-width: 14px;
          height: 14px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
        }
      `}</style>
    </>
  );
}
