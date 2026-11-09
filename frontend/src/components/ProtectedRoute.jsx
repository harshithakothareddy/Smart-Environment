import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function ProtectedRoute({ children, pageTitle = 'Environmental Telemetry' }) {
  const { user, setAuthModalOpen, setAuthModalMode, login } = useApp();

  if (user) {
    return children;
  }

  const handleOpenLogin = () => {
    setAuthModalMode('login');
    setAuthModalOpen(true);
  };

  const handleQuickDemo = () => {
    login('citizen@econexus.in', 'Citizen Steward', 'Citizen');
  };

  return (
    <div className="page-wrapper" style={{ padding: '60px 16px 100px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        className="card card-body animate-scale-up"
        style={{
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          padding: '40px 32px',
          borderRadius: '20px',
          border: '1px solid var(--gray-200)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #dbeafe 0%, #d1fae5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '34px',
            margin: '0 auto 20px',
            border: '2px solid white',
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.06)'
          }}
        >
          🔒
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '12px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
          Member Access Required
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Sign In to Access {pageTitle}
        </h2>

        <p style={{ color: 'var(--gray-600)', fontSize: '14px', lineHeight: 1.5, marginBottom: '24px' }}>
          Real-time telemetry, location search, air &amp; water monitoring, interactive road routes, and citizen pollution reports are available to registered citizens.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={handleOpenLogin}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', fontWeight: 700, fontSize: '15px' }}
          >
            🔑 Sign In to Your Account
          </button>

          <button
            onClick={handleQuickDemo}
            className="btn btn-secondary btn-md"
            style={{ width: '100%', justifyContent: 'center', fontWeight: 700, background: '#f8fafc', border: '1px solid #cbd5e1' }}
          >
            ⚡ 1-Click Quick Demo Sign In
          </button>

          <Link
            to="/"
            className="btn btn-ghost btn-sm"
            style={{ width: '100%', justifyContent: 'center', color: 'var(--gray-500)', marginTop: '8px' }}
          >
            ← Back to Home / Starting Page
          </Link>
        </div>

        {/* Feature List */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--gray-100)', textAlign: 'left' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            What you'll unlock after signing in:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--gray-700)' }}>
            <div>🌬️ Live Air Quality &amp; PM2.5</div>
            <div>💧 River &amp; Water Body WQI</div>
            <div>🗺️ Pollution-Aware Road Routes</div>
            <div>📍 Search 1,000+ Indian Places</div>
          </div>
        </div>
      </div>
    </div>
  );
}
