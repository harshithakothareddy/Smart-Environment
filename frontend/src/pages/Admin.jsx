import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getStatusFromAQI } from '../data/mockData';

const ADMIN_SECTIONS = [
  { id: 'dashboard', label: '📊 Dashboard Overview' },
  { id: 'reports',   label: '📢 Citizen Reports (Air/Water)' },
  { id: 'alerts',    label: '🔔 Live Alert Dispatcher' },
  { id: 'cities',    label: '🏙️ City Pollution Overrides' },
  { id: 'settings',  label: '⚙️ System Logs' }
];

export default function Admin() {
  const {
    citizenReports,
    updateReportStatus,
    deleteReport,
    alerts,
    addAlert,
    toggleAlertActive,
    deleteAlert,
    citiesData,
    updateCityData
  } = useApp();

  const [activeSection, setActiveSection] = useState('dashboard');
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // New Alert Form state
  const [alertForm, setAlertForm] = useState({
    title: '',
    type: 'Air',
    severity: 'Critical',
    location: 'Delhi',
    lat: 28.6139,
    lng: 77.2090,
    message: ''
  });
  const [alertSuccess, setAlertSuccess] = useState('');

  // Report resolution note modal/state
  const [resolvingReportId, setResolvingReportId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  // City edit modal state
  const [editingCity, setEditingCity] = useState(null);

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    if (password === 'admin123' || password === 'admin') {
      setAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password. Demo password is: admin123');
    }
  };

  const handleCreateAlert = (e) => {
    e.preventDefault();
    if (!alertForm.title || !alertForm.message) return;

    const matchedCity = citiesData.find(c => c.name.toLowerCase() === alertForm.location.toLowerCase());
    const lat = matchedCity ? matchedCity.lat : 28.6139;
    const lng = matchedCity ? matchedCity.lng : 77.2090;

    addAlert({
      ...alertForm,
      lat,
      lng,
      icon: alertForm.type === 'Air' ? '🌫️' : alertForm.type === 'Water' ? '💧' : '🌱'
    });

    setAlertSuccess('New emergency alert broadcasted across all platform maps and routes!');
    setAlertForm({
      title: '',
      type: 'Air',
      severity: 'Critical',
      location: 'Delhi',
      lat: 28.6139,
      lng: 77.2090,
      message: ''
    });
    setTimeout(() => setAlertSuccess(''), 4000);
  };

  const handleEscalateReportToAlert = (report) => {
    addAlert({
      title: `Emergency: ${report.title}`,
      type: report.category,
      severity: 'Critical',
      location: report.city,
      lat: report.lat,
      lng: report.lng,
      message: `Citizen verified incident at ${report.locationName}: ${report.description}`,
      icon: report.category === 'Air' ? '🌫️' : report.category === 'Water' ? '💧' : '🌱'
    });
    updateReportStatus(report.id, 'Investigating', 'Escalated to High Priority Alert by Control Room.');
    alert(`Report ${report.id} has been escalated to an active public alert!`);
  };

  const handleSaveResolution = () => {
    if (!resolvingReportId) return;
    updateReportStatus(resolvingReportId, 'Action Taken', resolutionNote || 'Action taken by municipal task force.');
    setResolvingReportId(null);
    setResolutionNote('');
  };

  const handleSaveCityEdit = (e) => {
    e.preventDefault();
    if (!editingCity) return;
    updateCityData(editingCity.id, {
      aqi: Number(editingCity.aqi),
      waterWQI: Number(editingCity.waterWQI),
      landSQI: Number(editingCity.landSQI)
    });
    setEditingCity(null);
  };

  // Auth screen
  if (!authenticated) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div style={{ maxWidth: 440, margin: '80px auto', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--primary-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', margin: '0 auto var(--space-4)' }}>
              🛡️
            </div>
            <h1 style={{ fontSize: 'var(--text-2xl)' }}>EcoPulse Admin Portal</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
              Central Monitoring, Incident Resolution &amp; Alert Dispatch System
            </p>

            <div className="card card-body" style={{ textAlign: 'left' }}>
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--gray-600)' }}>
                    Admin Access Passcode
                  </label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Enter password..."
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={{ marginTop: '4px' }}
                    autoFocus
                  />
                </div>
                {error && (
                  <div style={{ color: 'var(--status-unhealthy)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-3)' }}>
                    {error}
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Secure Admin Login →
                </button>
                <div className="demo-banner" style={{ marginTop: 'var(--space-4)' }}>
                  <span>ℹ️</span>
                  <span>Demo credentials: password is <code>admin123</code></span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending reports count
  const pendingReports = citizenReports.filter(r => r.status === 'Pending').length;
  const activeAlertsCount = alerts.filter(a => a.active).length;

  return (
    <div className="page-wrapper" style={{ minHeight: 'calc(100vh - var(--nav-height))' }}>
      <div className="admin-layout">
        {/* SIDEBAR NAVIGATION */}
        <aside className="admin-sidebar">
          <div style={{ padding: 'var(--space-5) var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontSize: '24px' }}>🛡️</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'white', fontFamily: 'var(--font-display)' }}>
                  EcoPulse Control
                </div>
                <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                  Super Admin Console
                </div>
              </div>
            </div>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 var(--space-2)' }}>
            {ADMIN_SECTIONS.map(sec => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'left',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 700,
                    color: isActive ? 'white' : '#94a3b8',
                    background: isActive ? 'var(--primary-600)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <span>{sec.label}</span>
                  {sec.id === 'reports' && pendingReports > 0 && (
                    <span style={{ background: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>
                      {pendingReports}
                    </span>
                  )}
                  {sec.id === 'alerts' && activeAlertsCount > 0 && (
                    <span style={{ background: '#f59e0b', color: 'black', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>
                      {activeAlertsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div style={{ marginTop: 'auto', padding: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
              Logged in as <strong>admin@ecopulse.in</strong>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', background: '#334155', color: 'white', borderColor: '#475569' }}
              onClick={() => setAuthenticated(false)}
            >
              🔒 Sign Out
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="admin-main">
          {/* 1. DASHBOARD OVERVIEW */}
          {activeSection === 'dashboard' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
                <div>
                  <h1 style={{ fontSize: 'var(--text-2xl)' }}>Environmental Authority Dashboard</h1>
                  <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                    Real-time oversight of national pollution indicators, incoming citizen complaints, and active advisories.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveSection('alerts')}>
                    + Broadcast Alert
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveSection('reports')}>
                    Review Reports ({pendingReports})
                  </button>
                </div>
              </div>

              {/* Top KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
                <div className="card card-body" style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Citizen Incidents
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--gray-900)', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
                    {citizenReports.length}
                  </div>
                  <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600, marginTop: '2px' }}>
                    {pendingReports} awaiting board verification
                  </div>
                </div>

                <div className="card card-body" style={{ borderLeft: '4px solid #ef4444' }}>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Active Emergency Alerts
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
                    {activeAlertsCount}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>
                    Broadcasting on Map &amp; Routes
                  </div>
                </div>

                <div className="card card-body" style={{ borderLeft: '4px solid #16a34a' }}>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Resolved Incidents
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#16a34a', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
                    {citizenReports.filter(r => r.status === 'Action Taken' || r.status === 'Resolved').length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>
                    Verified remediation logs
                  </div>
                </div>

                <div className="card card-body" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Cities Monitored
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: '#ca8a04', fontFamily: 'var(--font-display)', marginTop: '4px' }}>
                    {citiesData.length}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>
                    Live sensor telemetry feeds
                  </div>
                </div>
              </div>

              {/* Recent Citizen Incidents Requiring Action */}
              <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: 'var(--text-base)' }}>🚨 Urgent Citizen Reports Awaiting Action</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setActiveSection('reports')}>
                    View All ({citizenReports.length}) →
                  </button>
                </div>
                <div className="table-wrapper">
                  <table aria-label="Recent citizen reports">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Category</th>
                        <th>Title &amp; Location</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citizenReports.slice(0, 5).map(rep => (
                        <tr key={rep.id}>
                          <td><code>{rep.id}</code></td>
                          <td>
                            <span className="badge badge-moderate" style={{ fontSize: '10px' }}>
                              {rep.category === 'Air' ? '🌬️ Air' : '💧 Water'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{rep.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>📍 {rep.locationName}, {rep.city}</div>
                          </td>
                          <td>
                            <span className="badge" style={{ background: rep.severity === 'Critical' ? '#fee2e2' : '#fef3c7', color: rep.severity === 'Critical' ? '#dc2626' : '#b45309' }}>
                              {rep.severity}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: rep.status === 'Pending' ? '#dc2626' : '#16a34a' }}>
                              {rep.status}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '10px', padding: '3px 8px' }}
                                onClick={() => updateReportStatus(rep.id, 'Verified', 'Verified by Admin')}
                              >
                                ✓ Verify
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{ fontSize: '10px', padding: '3px 8px', background: '#dc2626', color: 'white' }}
                                onClick={() => handleEscalateReportToAlert(rep)}
                                title="Convert to Active Public Alert"
                              >
                                ⚠️ Escalate
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. CITIZEN REPORTS MANAGEMENT */}
          {activeSection === 'reports' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <div>
                  <h1 style={{ fontSize: 'var(--text-2xl)' }}>Manage Citizen Incident Reports</h1>
                  <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                    Review, verify, assign field investigators, or mark community pollution reports as resolved.
                  </p>
                </div>
              </div>

              {/* Reports Table */}
              <div className="card">
                <div className="table-wrapper">
                  <table aria-label="Citizen reports management table">
                    <thead>
                      <tr>
                        <th>Incident</th>
                        <th>Category</th>
                        <th>Location &amp; Coordinates</th>
                        <th>Severity</th>
                        <th>Status</th>
                        <th>Official Action Note</th>
                        <th>Manage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citizenReports.map(rep => (
                        <tr key={rep.id}>
                          <td style={{ maxWidth: '240px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 700 }}>{rep.id}</div>
                            <strong style={{ fontSize: '13px', color: 'var(--gray-800)' }}>{rep.title}</strong>
                            <p style={{ fontSize: '11px', color: 'var(--gray-600)', margin: '4px 0 0', lineHeight: 1.4 }}>
                              {rep.description}
                            </p>
                            <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: '4px' }}>
                              By {rep.reporterName} · {rep.date} · 👍 {rep.upvotes || 0} verifications
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-moderate" style={{ fontSize: '11px' }}>
                              {rep.category === 'Air' ? '🌬️ Air' : rep.category === 'Water' ? '💧 Water' : '🌱 Land'}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '12px' }}>{rep.locationName}</div>
                            <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{rep.city}, {rep.state}</div>
                            <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>
                              [{rep.lat.toFixed(3)}, {rep.lng.toFixed(3)}]
                            </div>
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: rep.severity === 'Critical' ? '#fee2e2' : rep.severity === 'High' ? '#ffedd5' : '#fef3c7',
                                color: rep.severity === 'Critical' ? '#dc2626' : rep.severity === 'High' ? '#c2410c' : '#b45309',
                                fontSize: '11px'
                              }}
                            >
                              {rep.severity}
                            </span>
                          </td>
                          <td>
                            <select
                              className="input"
                              value={rep.status}
                              onChange={(e) => updateReportStatus(rep.id, e.target.value)}
                              style={{ fontSize: '11px', padding: '4px 8px', width: 'auto' }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Verified">Verified</option>
                              <option value="Investigating">Investigating</option>
                              <option value="Action Taken">Action Taken</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </td>
                          <td style={{ maxWidth: '200px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--gray-700)', fontStyle: 'italic' }}>
                              {rep.actionNote || 'No action note logged yet.'}
                            </div>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: '10px', padding: 0, color: 'var(--primary-600)', marginTop: '2px' }}
                              onClick={() => {
                                setResolvingReportId(rep.id);
                                setResolutionNote(rep.actionNote || '');
                              }}
                            >
                              ✏️ Edit Action Note
                            </button>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '10px', padding: '3px 6px' }}
                                onClick={() => handleEscalateReportToAlert(rep)}
                                title="Broadcast emergency alert from this incident"
                              >
                                ⚠️ Escalate
                              </button>
                              <button
                                className="btn btn-sm"
                                style={{ fontSize: '10px', padding: '3px 6px', color: '#dc2626', borderColor: '#fca5a5' }}
                                onClick={() => deleteReport(rep.id)}
                              >
                                ✕ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RESOLUTION NOTE MODAL */}
              {resolvingReportId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                  <div className="card card-body" style={{ maxWidth: '480px', width: '90%', background: 'white' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>
                      Log Official Remediation Action
                    </h3>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-3)' }}>
                      Incident ID: <strong>{resolvingReportId}</strong>. This update will be published for the citizen and general public.
                    </p>
                    <textarea
                      className="input"
                      rows={3}
                      placeholder="e.g. Municipal cleanup team deployed. Notice issued to factory owner."
                      value={resolutionNote}
                      onChange={e => setResolutionNote(e.target.value)}
                      style={{ marginBottom: 'var(--space-4)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => setResolvingReportId(null)}>
                        Cancel
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={handleSaveResolution}>
                        Save Action Note
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. LIVE ALERT DISPATCHER */}
          {activeSection === 'alerts' && (
            <div>
              <div style={{ marginBottom: 'var(--space-5)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)' }}>Emergency Alert Dispatcher</h1>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                  Active alerts propagate immediately to the top notification banners, interactive India map markers, and the safe route navigation engine.
                </p>
              </div>

              {alertSuccess && (
                <div className="card card-body animate-fade-in" style={{ background: '#dcfce7', border: '1.5px solid #16a34a', color: '#166534', marginBottom: 'var(--space-4)', padding: 'var(--space-3)' }}>
                  ✅ {alertSuccess}
                </div>
              )}

              {/* Create Alert Form */}
              <div className="card card-body" style={{ marginBottom: 'var(--space-6)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>
                  📢 Broadcast New Pollution Warning
                </h3>
                <form onSubmit={handleCreateAlert} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Alert Title *</label>
                      <input
                        className="input"
                        placeholder="e.g., Heavy Toxic Smog Alert"
                        value={alertForm.title}
                        onChange={e => setAlertForm(p => ({ ...p, title: e.target.value }))}
                        required
                        style={{ marginTop: '2px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Pollution Type</label>
                      <select
                        className="input"
                        value={alertForm.type}
                        onChange={e => setAlertForm(p => ({ ...p, type: e.target.value }))}
                        style={{ marginTop: '2px' }}
                      >
                        <option value="Air">🌬️ Air Pollution</option>
                        <option value="Water">💧 Water Quality</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Severity</label>
                      <select
                        className="input"
                        value={alertForm.severity}
                        onChange={e => setAlertForm(p => ({ ...p, severity: e.target.value }))}
                        style={{ marginTop: '2px' }}
                      >
                        <option value="Critical">🔴 Critical Emergency</option>
                        <option value="High">🟠 High Risk</option>
                        <option value="Medium">🟡 Moderate Advisory</option>
                        <option value="Low">🟢 Low</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>City / Region</label>
                      <select
                        className="input"
                        value={alertForm.location}
                        onChange={e => setAlertForm(p => ({ ...p, location: e.target.value }))}
                        style={{ marginTop: '2px' }}
                      >
                        {citiesData.map(c => (
                          <option key={c.id} value={c.name}>{c.name} ({c.state})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Advisory Message &amp; Health Instructions *</label>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="e.g. PM2.5 has breached hazardous levels of 220 μg/m³. Close vehicle windows, avoid all outdoor exertion."
                      value={alertForm.message}
                      onChange={e => setAlertForm(p => ({ ...p, message: e.target.value }))}
                      required
                      style={{ marginTop: '2px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-primary">
                      📡 Broadcast Alert Now
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Alerts List */}
              <div className="card">
                <div className="card-header">
                  <h3 style={{ fontSize: 'var(--text-base)' }}>Active Alerts Catalog ({alerts.length})</h3>
                </div>
                <div className="table-wrapper">
                  <table aria-label="Active alerts catalog">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Type</th>
                        <th>Severity</th>
                        <th>Title &amp; Advisory</th>
                        <th>Location</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map(a => (
                        <tr key={a.id}>
                          <td>
                            <button
                              className={`btn btn-sm ${a.active ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ fontSize: '10px', padding: '3px 8px' }}
                              onClick={() => toggleAlertActive(a.id)}
                            >
                              {a.active ? '🟢 Broadcast Active' : '⚪ Paused'}
                            </button>
                          </td>
                          <td>
                            <span className="badge badge-moderate" style={{ fontSize: '10px' }}>
                              {a.type}
                            </span>
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={{
                                background: a.severity === 'Critical' ? '#fee2e2' : '#ffedd5',
                                color: a.severity === 'Critical' ? '#dc2626' : '#ea580c',
                                fontSize: '10px'
                              }}
                            >
                              {a.severity}
                            </span>
                          </td>
                          <td>
                            <strong>{a.title}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--gray-600)', marginTop: '2px' }}>
                              {a.message}
                            </div>
                          </td>
                          <td style={{ fontSize: '12px', fontWeight: 600 }}>
                            📍 {a.location}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm"
                              style={{ color: '#dc2626', borderColor: '#fca5a5', fontSize: '11px' }}
                              onClick={() => deleteAlert(a.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. CITY POLLUTION DATA OVERRIDES */}
          {activeSection === 'cities' && (
            <div>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <h1 style={{ fontSize: 'var(--text-2xl)' }}>City Environmental Telemetry</h1>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)' }}>
                  Override live air, water, and soil pollution values for any of the 29 monitored Indian cities. Changes immediately reflect across dashboard cards, rankings, and maps.
                </p>
              </div>

              <div className="card">
                <div className="table-wrapper">
                  <table aria-label="Cities pollution overrides">
                    <thead>
                      <tr>
                        <th>City</th>
                        <th>State</th>
                        <th>Air AQI</th>
                        <th>Water WQI</th>
                        <th>Land SQI</th>
                        <th>Status</th>
                        <th>Edit Indices</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citiesData.map(c => {
                        const s = getStatusFromAQI(c.aqi);
                        return (
                          <tr key={c.id}>
                            <td><strong>{c.name}</strong></td>
                            <td style={{ color: 'var(--gray-500)', fontSize: '12px' }}>{c.state}</td>
                            <td>
                              <span style={{ fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)', fontSize: '15px' }}>
                                {c.aqi}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-display)', fontSize: '15px' }}>
                                {c.waterWQI}
                              </span>
                            </td>
                            <td>
                              <span style={{ fontWeight: 800, color: '#16a34a', fontFamily: 'var(--font-display)', fontSize: '15px' }}>
                                {c.landSQI}
                              </span>
                            </td>
                            <td>
                              <span className={`badge badge-${s.className}`} style={{ fontSize: '10px' }}>
                                {s.label}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '11px' }}
                                onClick={() => setEditingCity({ ...c })}
                              >
                                ✏️ Adjust
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* EDIT CITY MODAL */}
              {editingCity && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                  <div className="card card-body" style={{ maxWidth: '420px', width: '90%', background: 'white' }}>
                    <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-2)' }}>
                      Override Environmental Indices for {editingCity.name}
                    </h3>
                    <form onSubmit={handleSaveCityEdit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Air AQI (0 - 500)</label>
                        <input
                          className="input"
                          type="number"
                          min="0"
                          max="500"
                          value={editingCity.aqi}
                          onChange={e => setEditingCity(p => ({ ...p, aqi: e.target.value }))}
                          required
                          style={{ marginTop: '2px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Water WQI (0 - 100)</label>
                        <input
                          className="input"
                          type="number"
                          min="0"
                          max="100"
                          value={editingCity.waterWQI}
                          onChange={e => setEditingCity(p => ({ ...p, waterWQI: e.target.value }))}
                          required
                          style={{ marginTop: '2px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase' }}>Land SQI (0 - 100)</label>
                        <input
                          className="input"
                          type="number"
                          min="0"
                          max="100"
                          value={editingCity.landSQI}
                          onChange={e => setEditingCity(p => ({ ...p, landSQI: e.target.value }))}
                          required
                          style={{ marginTop: '2px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingCity(null)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary btn-sm">
                          Save Overrides
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 5. SYSTEM LOGS */}
          {activeSection === 'settings' && (
            <div className="card card-body">
              <h2 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-2)' }}>System Audit &amp; Telemetry Logs</h2>
              <div style={{ background: '#0f172a', color: '#38bdf8', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.8 }}>
                <div>[SYSTEM OK] CPCB Telemetry Gateway: Connected (Sample Ingest active)</div>
                <div>[ROUTING ENGINE] Safe-Route Avoidance Matrix: Ready (30 Nodes, 87 Highway Corridors)</div>
                <div>[CITIZEN LOGS] Synchronized with local storage database. {citizenReports.length} reports in queue.</div>
                <div>[ALERT DISPATCHER] Active broadcast channels: Web Map, Push Notification Banner, Route Waypoints.</div>
                <div>[ADMIN SESSION] Authenticated with SuperUser credentials.</div>
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .admin-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          min-height: calc(100vh - var(--nav-height));
        }
        .admin-sidebar {
          background: #0f172a;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: var(--nav-height);
          height: calc(100vh - var(--nav-height));
          border-right: 1px solid rgba(255,255,255,0.05);
        }
        .admin-main {
          padding: var(--space-6);
          background: var(--gray-50);
          min-height: calc(100vh - var(--nav-height));
        }
        @media (max-width: 900px) {
          .admin-layout {
            grid-template-columns: 1fr;
          }
          .admin-sidebar {
            position: relative;
            height: auto;
            top: 0;
          }
        }
      `}</style>
    </div>
  );
}
