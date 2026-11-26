import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function Profile() {
  const {
    user,
    login,
    register,
    demoLogin,
    updateProfile,
    changePassword,
    logout,
    authLoading,
    savedLocations,
    setSavedLocations,
  } = useApp();

  const [activeTab, setActiveTab] = useState('Profile');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');

  // Authenticated profile edit state
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileFeedback, setProfileFeedback] = useState({ type: '', text: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwFeedback, setPwFeedback] = useState({ type: '', text: '' });
  const [savingPw, setSavingPw] = useState(false);

  // Add saved location state
  const [addingLocation, setAddingLocation] = useState(false);
  const [newLoc, setNewLoc] = useState({ label: 'Other', name: '', state: '' });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!loginForm.email.trim() || !loginForm.password) {
      setAuthError('Please enter both email and password.');
      return;
    }
    const res = await login(loginForm.email.trim(), loginForm.password);
    if (!res?.success) {
      setAuthError(res?.error || 'Sign in failed.');
    } else {
      setLoginForm({ email: '', password: '' });
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (signupForm.name.trim().length < 2) {
      setAuthError('Full name must be at least 2 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email.trim())) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (signupForm.password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }
    const res = await register(signupForm.name.trim(), signupForm.email.trim(), signupForm.password);
    if (!res?.success) {
      setAuthError(res?.error || 'Registration failed.');
    } else {
      setSignupForm({ name: '', email: '', password: '' });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileFeedback({ type: '', text: '' });
    if (profileForm.name.trim().length < 2) {
      setProfileFeedback({ type: 'error', text: 'Full name must be at least 2 characters.' });
      return;
    }
    setSavingProfile(true);
    const res = await updateProfile({
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
    });
    setSavingProfile(false);
    if (res.success) {
      setProfileFeedback({ type: 'success', text: 'Profile details saved to your account.' });
    } else {
      setProfileFeedback({ type: 'error', text: res.error || 'Could not save changes.' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwFeedback({ type: '', text: '' });
    if (!pwForm.currentPassword || pwForm.newPassword.length < 6) {
      setPwFeedback({ type: 'error', text: 'Enter current password and a new password (min 6 chars).' });
      return;
    }
    setSavingPw(true);
    const res = await changePassword(pwForm.currentPassword, pwForm.newPassword);
    setSavingPw(false);
    if (res.success) {
      setPwFeedback({ type: 'success', text: 'Password updated successfully.' });
      setPwForm({ currentPassword: '', newPassword: '' });
    } else {
      setPwFeedback({ type: 'error', text: res.error || 'Failed to update password.' });
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLoc.name.trim()) return;
    const updated = [
      ...savedLocations,
      {
        id: Date.now(),
        label: newLoc.label || 'Other',
        name: newLoc.name.trim(),
        state: newLoc.state.trim() || 'India',
        aqi: 65,
      },
    ];
    setSavedLocations(updated);
    await updateProfile({ savedLocations: updated });
    setNewLoc({ label: 'Other', name: '', state: '' });
    setAddingLocation(false);
  };

  const handleRemoveLocation = async (id) => {
    const updated = savedLocations.filter((l) => l.id !== id);
    setSavedLocations(updated);
    await updateProfile({ savedLocations: updated });
  };

  const handleToggleNotification = async (key) => {
    const current = user?.notificationPreferences || {
      airAlerts: true,
      waterAlerts: true,
      dailySummary: false,
      newsUpdates: false,
    };
    const updatedPrefs = { ...current, [key]: !current[key] };
    await updateProfile({ notificationPreferences: updatedPrefs });
  };

  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div style={{ maxWidth: 440, margin: '60px auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
              <div style={{ fontSize: 64, marginBottom: 'var(--space-3)' }}>👤</div>
              <h1>Welcome to EcoNexus India</h1>
              <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>
                Sign in or create an account to save locations and store your profile in MongoDB
              </p>
            </div>

            <div className="tabs" style={{ marginBottom: 'var(--space-5)' }}>
              <button
                className={`tab-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
              >
                Sign In
              </button>
              <button
                className={`tab-btn ${authMode === 'signup' ? 'active' : ''}`}
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError('');
                }}
              >
                Sign Up
              </button>
            </div>

            <div className="card card-body">
              {authError && (
                <div
                  style={{
                    padding: '10px 14px',
                    background: '#fee2e2',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    color: '#991b1b',
                    fontSize: '13px',
                    marginBottom: 'var(--space-3)',
                  }}
                >
                  ⚠️ {authError}
                </div>
              )}

              {authMode === 'login' ? (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <input
                    className="input"
                    type="email"
                    placeholder="Email Address"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm((p) => ({ ...p, email: e.target.value }))}
                    aria-label="Email"
                    required
                  />
                  <input
                    className="input"
                    type="password"
                    placeholder="Password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                    aria-label="Password"
                    required
                  />
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: 'var(--space-2)' }}
                  >
                    {authLoading ? 'Signing In...' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    disabled={authLoading}
                    onClick={async () => {
                      setAuthError('');
                      const res = await demoLogin();
                      if (!res?.success) setAuthError(res?.error || 'Demo login failed.');
                    }}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    ⚡ Quick Demo Citizen Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <input
                    className="input"
                    type="text"
                    placeholder="Full Name"
                    value={signupForm.name}
                    onChange={(e) => setSignupForm((p) => ({ ...p, name: e.target.value }))}
                    aria-label="Full name"
                    required
                  />
                  <input
                    className="input"
                    type="email"
                    placeholder="Email Address"
                    value={signupForm.email}
                    onChange={(e) => setSignupForm((p) => ({ ...p, email: e.target.value }))}
                    aria-label="Email"
                    required
                  />
                  <input
                    className="input"
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={signupForm.password}
                    onChange={(e) => setSignupForm((p) => ({ ...p, password: e.target.value }))}
                    aria-label="Password"
                    required
                  />
                  <button type="submit" disabled={authLoading} className="btn btn-primary" style={{ width: '100%' }}>
                    {authLoading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const notifPrefs = user?.notificationPreferences || {
    airAlerts: true,
    waterAlerts: true,
    dailySummary: false,
    newsUpdates: false,
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ paddingTop: 'var(--space-6)', paddingBottom: 'var(--space-8)' }}>
          {/* User Card */}
          <div
            className="card card-body"
            style={{
              display: 'flex',
              gap: 'var(--space-4)',
              alignItems: 'center',
              flexWrap: 'wrap',
              marginBottom: 'var(--space-5)',
              background: 'linear-gradient(135deg, var(--primary-50), var(--green-50))',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: 'var(--text-xl)',
                flexShrink: 0,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-xl)' }}>{user?.name}</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>{user?.email}</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 6 }}>
                <span className="badge badge-good">🟢 Verified {user?.role || 'Citizen'}</span>
                <span className="badge" style={{ background: 'white', color: 'var(--gray-700)', border: '1px solid var(--gray-200)' }}>
                  🔑 Logins: {user?.loginCount || 1}
                </span>
                {user?.lastLoginAt && (
                  <span className="badge" style={{ background: 'white', color: 'var(--gray-600)', border: '1px solid var(--gray-200)' }}>
                    🕒 Last login: {new Date(user.lastLoginAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={logout}>
              Sign Out
            </button>
          </div>

          {/* Profile Tabs */}
          <div className="tabs" style={{ maxWidth: 520, marginBottom: 'var(--space-4)' }}>
            {['Profile', 'Saved Locations', 'Notifications', 'Login Activity'].map((t) => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {activeTab === 'Profile' && (
            <div style={{ display: 'grid', gap: 'var(--space-4)', maxWidth: 540 }}>
              <form className="card card-body" onSubmit={handleSaveProfile}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Account Details</h3>
                {profileFeedback.text && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      marginBottom: 'var(--space-3)',
                      background: profileFeedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                      color: profileFeedback.type === 'success' ? '#166534' : '#991b1b',
                      border: `1px solid ${profileFeedback.type === 'success' ? '#86efac' : '#fca5a5'}`,
                    }}
                  >
                    {profileFeedback.text}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Full Name
                    </label>
                    <input
                      className="input"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                      style={{ marginTop: 4 }}
                      aria-label="Full name"
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Email
                    </label>
                    <input
                      className="input"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      style={{ marginTop: 4, background: 'var(--gray-50)', color: 'var(--gray-500)' }}
                      aria-label="Email"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Phone
                    </label>
                    <input
                      className="input"
                      type="tel"
                      placeholder="Add phone number"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                      style={{ marginTop: 4 }}
                      aria-label="Phone number"
                    />
                  </div>
                </div>
                <button type="submit" disabled={savingProfile} className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>

              <form className="card card-body" onSubmit={handleChangePassword}>
                <h3 style={{ marginBottom: 'var(--space-3)' }}>Change Password</h3>
                {pwFeedback.text && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      marginBottom: 'var(--space-3)',
                      background: pwFeedback.type === 'success' ? '#dcfce7' : '#fee2e2',
                      color: pwFeedback.type === 'success' ? '#166534' : '#991b1b',
                      border: `1px solid ${pwFeedback.type === 'success' ? '#86efac' : '#fca5a5'}`,
                    }}
                  >
                    {pwFeedback.text}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <input
                    className="input"
                    type="password"
                    placeholder="Current Password"
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    aria-label="Current Password"
                  />
                  <input
                    className="input"
                    type="password"
                    placeholder="New Password (min 6 characters)"
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                    aria-label="New Password"
                  />
                </div>
                <button type="submit" disabled={savingPw} className="btn btn-secondary" style={{ marginTop: 'var(--space-4)' }}>
                  {savingPw ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'Saved Locations' && (
            <div style={{ maxWidth: 540 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {savedLocations.map((loc) => (
                  <div key={loc.id} className="card card-body" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                    <span style={{ fontSize: '24px' }}>{loc.label === 'Home' ? '🏠' : loc.label === 'Work' ? '🏢' : '🌳'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{loc.label}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                        {loc.name}, {loc.state}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--status-good)', fontFamily: 'var(--font-display)' }}>
                        {loc.aqi}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>AQI</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => handleRemoveLocation(loc.id)}
                      aria-label={`Remove ${loc.label}`}
                      style={{ color: 'var(--gray-400)' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {addingLocation ? (
                  <form className="card card-body" onSubmit={handleAddLocation} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <select
                      className="input"
                      value={newLoc.label}
                      onChange={(e) => setNewLoc((p) => ({ ...p, label: e.target.value }))}
                      aria-label="Location Label"
                    >
                      <option value="Home">Home</option>
                      <option value="Work">Work</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Other">Other</option>
                    </select>
                    <input
                      className="input"
                      type="text"
                      placeholder="City Name (e.g. Bengaluru)"
                      value={newLoc.name}
                      onChange={(e) => setNewLoc((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                    <input
                      className="input"
                      type="text"
                      placeholder="State (e.g. Karnataka)"
                      value={newLoc.state}
                      onChange={(e) => setNewLoc((p) => ({ ...p, state: e.target.value }))}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Save Location
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAddingLocation(false)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingLocation(true)}
                    className="card card-body btn btn-ghost"
                    style={{ border: '2px dashed var(--gray-200)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}
                  >
                    <span>+</span> Add Location
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Notifications' && (
            <div className="card card-body" style={{ maxWidth: 540 }}>
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Notification Preferences</h3>
              {[
                { key: 'airAlerts', label: 'Air Quality Alerts', desc: 'Get notified when AQI exceeds thresholds' },
                { key: 'waterAlerts', label: 'Water Quality Alerts', desc: 'Water contamination warnings for saved locations' },
                { key: 'dailySummary', label: 'Daily Summary', desc: 'Receive a daily environmental summary' },
                { key: 'newsUpdates', label: 'News & Updates', desc: 'Environmental news and policy updates' },
              ].map((n, i) => (
                <div
                  key={n.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-3) 0',
                    borderBottom: i < 3 ? '1px solid var(--gray-100)' : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{n.label}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 2 }}>{n.desc}</div>
                  </div>
                  <label className="toggle-switch" htmlFor={`notif-${n.key}`} aria-label={n.label}>
                    <input
                      id={`notif-${n.key}`}
                      type="checkbox"
                      checked={Boolean(notifPrefs[n.key])}
                      onChange={() => handleToggleNotification(n.key)}
                      style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                    />
                    <span className="toggle-track" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Login Activity' && (
            <div className="card card-body" style={{ maxWidth: 540 }}>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>Stored Login Details</h3>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>
                Account created: {user?.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'} · Total sign-ins: {user?.loginCount || 1}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {(user?.loginHistory || []).length === 0 ? (
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>No recent login history recorded.</p>
                ) : (
                  user.loginHistory.map((ev, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'var(--gray-50)',
                        border: '1px solid var(--gray-200)',
                        fontSize: '12px',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>
                        {idx === 0 ? '🟢 Current / Latest Session' : 'Session'} — {new Date(ev.timestamp).toLocaleString()}
                      </div>
                      <div style={{ color: 'var(--gray-500)', marginTop: 2, wordBreak: 'break-word' }}>
                        IP: {ev.ip || 'unknown'} · Device: {ev.userAgent || 'unknown'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .toggle-switch { position: relative; display: inline-block; width: 44px; height: 24px; cursor: pointer; flex-shrink: 0; }
        .toggle-track { position: absolute; inset: 0; background: var(--gray-200); border-radius: 24px; transition: background 0.2s; }
        .toggle-switch input:checked + .toggle-track { background: var(--primary-600); }
        .toggle-track::after { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; top: 3px; background: white; border-radius: 50%; transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .toggle-switch input:checked + .toggle-track::after { transform: translateX(20px); }
      `}</style>
    </div>
  );
}
