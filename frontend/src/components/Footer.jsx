import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <>
      <footer className="site-footer hide-mobile" role="contentinfo">
        <div className="container">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <div className="footer-brand">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="16" fill="url(#footerGrad)"/>
                  <path d="M16 8C13 8 10 10.5 10 14c0 4 4 8 6 10 2-2 6-6 6-10 0-3.5-3-6-6-6z" fill="white" opacity="0.9"/>
                  <circle cx="16" cy="14" r="2.5" fill="url(#footerGrad)"/>
                  <defs>
                    <linearGradient id="footerGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#2563eb"/>
                      <stop offset="100%" stopColor="#16a34a"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div>
                  <div style={{ fontWeight: 800, color: 'white', fontFamily: 'var(--font-display)' }}>EcoPulse India</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>India's Environmental Health Monitor</div>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginTop: 'var(--space-3)' }}>
                Continuous ground ambient air and CPCB hydrological monitoring across India's states, districts, and cities.
              </p>
            </div>

            {/* Pollution */}
            <div>
              <h4 className="footer-heading">Pollution</h4>
              <div className="footer-links">
                <Link to="/air">Air Quality</Link>
                <Link to="/water">Water Quality</Link>
                <Link to="/map">India Map</Link>
                <Link to="/rankings">Rankings</Link>
              </div>
            </div>

            {/* Explore */}
            <div>
              <h4 className="footer-heading">Explore</h4>
              <div className="footer-links">
                <Link to="/exposure">My Exposure</Link>
                <Link to="/news">News &amp; Alerts</Link>
                <Link to="/resources">Resources</Link>
                <Link to="/shop">Shop</Link>
                <Link to="/admin">Admin Panel</Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="footer-heading">Legal &amp; Info</h4>
              <div className="footer-links">
                <Link to="/resources">Data Sources</Link>
                <Link to="/resources">About EcoPulse</Link>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Contact Us</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 EcoPulse India. Central Pollution Control Board (CPCB) standards &amp; Copernicus in-situ telemetry.</p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <span className="badge" style={{ background: '#064e3b', color: '#6ee7b7', border: '1px solid #059669', fontSize: '10px' }}>🟢 Live Telemetry Active</span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 'var(--text-xs)' }}>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        .site-footer {
          background: var(--gray-900);
          padding: var(--space-10) 0 var(--space-6);
          margin-top: var(--space-8);
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--space-8);
          padding-bottom: var(--space-8);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
        }
        .footer-heading {
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: var(--space-3);
        }
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .footer-links a {
          font-size: var(--text-sm);
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color var(--transition-fast);
        }
        .footer-links a:hover { color: white; }
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: var(--space-4);
          font-size: var(--text-xs);
          color: rgba(255,255,255,0.3);
          flex-wrap: wrap;
          gap: var(--space-3);
        }
      `}</style>
    </>
  );
}
