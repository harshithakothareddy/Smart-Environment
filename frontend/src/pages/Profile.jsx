import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const { user, login, logout, savedLocations, setSavedLocations, notifications, setNotifications } = useApp();
  const [activeTab, setActiveTab] = useState('Profile');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [authMode, setAuthMode] = useState('login');

  const handleLogin = (e) => {
    e.preventDefault();
    login(loginForm.email || 'citizen@econexus.in', loginForm.email ? loginForm.email.split('@')[0] : 'Citizen Steward');
  };

  const handleSignup = (e) => {
    e.preventDefault();
    login(signupForm.email || 'citizen@econexus.in', signupForm.name || 'Citizen Steward');
  };

  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div style={{ maxWidth: 420, margin: '60px auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div style={{ fontSize: 64, marginBottom: 'var(--space-3)' }}>👤</div>
              <h1>Welcome to EcoPulse India</h1>
              <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>Sign in to save locations and get personalized alerts</p>
            </div>

            <div className="tabs" style={{ marginBottom: 'var(--space-5)' }}>
              <button className={`tab-btn ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>Sign In</button>
              <button className={`tab-btn ${authMode === 'signup' ? 'active' : ''}`} onClick={() => setAuthMode('signup')}>Sign Up</button>
            </div>

            <div className="card card-body">
              {authMode === 'login' ? (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <input className="input" type="email" placeholder="Email Address" value={loginForm.email} onChange={e => setLoginForm(p => ({...p, email: e.target.value}))} aria-label="Email"/>
                  <input className="input" type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm(p => ({...p, password: e.target.value}))} aria-label="Password"/>
                  <Link to="#" style={{ fontSize: 'var(--text-sm)', color: 'var(--primary-600)', textAlign: 'right' }}>Forgot password?</Link>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--space-2)' }}>Sign In</button>
                  <div className="demo-banner"><span>ℹ️</span><span>Demo mode — any email/password will work.</span></div>
                </form>
              ) : (
                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <input className="input" type="text" placeholder="Full Name" value={signupForm.name} onChange={e => setSignupForm(p => ({...p, name: e.target.value}))} aria-label="Full name"/>
                  <input className="input" type="email" placeholder="Email Address" value={signupForm.email} onChange={e => setSignupForm(p => ({...p, email: e.target.value}))} aria-label="Email"/>
                  <input className="input" type="password" placeholder="Password" value={signupForm.password} onChange={e => setSignupForm(p => ({...p, password: e.target.value}))} aria-label="Password"/>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Account</button>
                  <div className="demo-banner"><span>ℹ️</span><span>Demo mode — sign up doesn't connect to a real auth system.</span></div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ paddingTop: 'var(--space-6)' }}>
          {/* User Card */}
          <div className="card card-body" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-5)', background: 'linear-gradient(135deg, var(--primary-50), var(--green-50))' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 'var(--text-xl)', flexShrink: 0 }}>
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)' }}>{user?.name || 'Demo User'}</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>{user?.email}</p>
              <span className="badge badge-good" style={{ marginTop: 4 }}>🟢 Active Account</span>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={logout}>Sign Out</button>
          </div>

          {/* Profile Tabs */}
          <div className="tabs" style={{ maxWidth: 480, marginBottom: 'var(--space-4)' }}>
            {['Profile', 'Saved Locations', 'Notifications'].map(t => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
            ))}
          </div>

          {activeTab === 'Profile' && (
            <div className="card card-body" style={{ maxWidth: 520 }}>
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Account Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label><input className="input" defaultValue={user?.name} style={{ marginTop: 4 }} aria-label="Full name"/></div>
                <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label><input className="input" type="email" defaultValue={user?.email} style={{ marginTop: 4 }} aria-label="Email"/></div>
                <div><label style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</label><input className="input" type="tel" placeholder="Add phone number" style={{ marginTop: 4 }} aria-label="Phone number"/></div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Save Changes (Demo)</button>
            </div>
          )}

          {activeTab === 'Saved Locations' && (
            <div style={{ maxWidth: 520 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {savedLocations.map(loc => (
                  <div key={loc.id} className="card card-body" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px' }}>{loc.label === 'Home' ? '🏠' : loc.label === 'Work' ? '🏢' : '🌳'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{loc.label}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>{loc.name}, {loc.state}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--status-good)', fontFamily: 'var(--font-display)' }}>{loc.aqi}</div>
                      <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>AQI</div>
                    </div>
                  </div>
                ))}
                <button className="card card-body btn btn-ghost" style={{ border: '2px dashed var(--gray-200)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                  <span>+</span> Add Location
                </button>
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="card card-body" style={{ maxWidth: 520 }}>
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Notification Preferences</h3>
              {[
                { label: 'Air Quality Alerts',   desc: 'Get notified when AQI exceeds thresholds' },
                { label: 'Water Quality Alerts',  desc: 'Water contamination warnings for saved locations' },
                { label: 'Daily Summary',          desc: 'Receive a daily environmental summary' },
                { label: 'News & Updates',         desc: 'Environmental news and policy updates' },
              ].map((n, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: i < 3 ? '1px solid var(--gray-100)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{n.label}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 2 }}>{n.desc}</div>
                  </div>
                  <label className="toggle-switch" htmlFor={`notif-${i}`} aria-label={n.label}>
                    <input id={`notif-${i}`} type="checkbox" defaultChecked={i < 2} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}/>
                    <span className="toggle-track"/>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer; flex-shrink: 0; }
        .toggle-track { position: absolute; inset: 0; background: var(--gray-200); border-radius: 24px; transition: background 0.2s; }
        .toggle-switch input:checked + .toggle-track { background: var(--primary-600); }
        .toggle-track::after { content: ''; position: absolute; left: 3px; top: 3px; width: 18px; height: 18px; border-radius: 50%; background: white; transition: transform 0.2s; box-shadow: var(--shadow-sm); }
        .toggle-switch input:checked + .toggle-track::after { transform: translateX(20px); }
      `}</style>
    </div>
  );
}
