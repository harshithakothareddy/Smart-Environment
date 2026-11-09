import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalMode, setAuthModalMode, login } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setError('');
    login(email.trim(), name.trim() || email.split('@')[0]);
  };

  const handleDemoLogin = () => {
    setError('');
    login('citizen@econexus.in', 'Citizen Steward', 'Citizen');
  };

  const handleClose = () => {
    setError('');
    setAuthModalOpen(false);
  };

  return (
    <div
      className="auth-modal-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="auth-modal-card card animate-scale-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid var(--gray-200)'
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #047857 100%)',
            padding: '24px 24px 20px',
            color: 'white',
            position: 'relative'
          }}
        >
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              transition: 'all 0.15s ease'
            }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>🌿</span>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                {authModalMode === 'login' ? 'Sign In to EcoNexus' : 'Create EcoNexus Account'}
              </h2>
              <span style={{ fontSize: '11px', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Environmental Telemetry &amp; Maps
              </span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.85, lineHeight: 1.4 }}>
            Sign in to unlock live Air &amp; Water data, location searching, pollution-aware routes, and hazard reporting.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: authModalMode === 'login' ? 'white' : 'transparent',
              fontWeight: authModalMode === 'login' ? 700 : 500,
              color: authModalMode === 'login' ? 'var(--primary-600)' : 'var(--gray-500)',
              borderBottom: authModalMode === 'login' ? '2px solid var(--primary-600)' : 'none',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            🔑 Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('signup');
              setError('');
            }}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: authModalMode === 'signup' ? 'white' : 'transparent',
              fontWeight: authModalMode === 'signup' ? 700 : 500,
              color: authModalMode === 'signup' ? 'var(--primary-600)' : 'var(--gray-500)',
              borderBottom: authModalMode === 'signup' ? '2px solid var(--primary-600)' : 'none',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            ✨ Register New Account
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{ padding: '10px 14px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '12px', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {authModalMode === 'signup' && (
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Your Full Name
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Email Address
              </label>
              <input
                type="email"
                className="input"
                placeholder="citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%' }}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-md"
              style={{ width: '100%', marginTop: '6px', justifyContent: 'center', fontWeight: 700 }}
            >
              {authModalMode === 'login' ? 'Sign In to Account →' : 'Complete Registration →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }}></div>
            <span style={{ fontSize: '11px', color: 'var(--gray-400)', textTransform: 'uppercase', fontWeight: 600 }}>OR FAST ACCESS</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--gray-200)' }}></div>
          </div>

          {/* Quick 1-Click Demo Login */}
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn btn-secondary btn-md"
            style={{
              width: '100%',
              justifyContent: 'center',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              fontWeight: 700,
              gap: '8px'
            }}
          >
            ⚡ Quick 1-Click Demo Citizen Login
          </button>

          {/* Unlocked Features Preview */}
          <div style={{ marginTop: '20px', padding: '12px', background: 'var(--gray-50)', borderRadius: '10px', fontSize: '11px', color: 'var(--gray-600)' }}>
            <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: '4px' }}>
              🔒 Protected Features Unlocked Upon Sign In:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
              <div>🌬️ Live Air Quality Telemetry</div>
              <div>💧 Real-Time Water Quality</div>
              <div>🗺️ Pollution-Aware Road Routes</div>
              <div>📍 Search Any Place in India</div>
              <div>📊 City &amp; State Rankings</div>
              <div>📢 Citizen Incident Reporting</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
