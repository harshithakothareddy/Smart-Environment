import React, { useState } from 'react';
import { ALERTS } from '../data/mockData';

export default function AlertsPage() {
  const [filter, setFilter] = useState('All');
  const [notifEnabled, setNotifEnabled] = useState(true);

  const airWaterAlerts = ALERTS.filter(a => a.type !== 'Land');
  const filtered = filter === 'All' ? airWaterAlerts : airWaterAlerts.filter(a => a.type === filter || a.severity === filter);

  const colorMap = { Critical: 'var(--status-hazardous)', High: 'var(--status-unhealthy)', Medium: 'var(--status-poor)', Low: 'var(--status-moderate)' };
  const bgMap    = { Critical: 'var(--status-hazardous-bg)', High: 'var(--status-unhealthy-bg)', Medium: 'var(--status-poor-bg)', Low: 'var(--status-moderate-bg)' };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ paddingTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div>
              <h1>🔔 Environmental Alerts</h1>
              <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>Real-time pollution alerts across India · Demo Data</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>Push Notifications</span>
              <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer', flexShrink: 0 }}>
                <input type="checkbox" checked={notifEnabled} onChange={e => setNotifEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} aria-label="Toggle notifications"/>
                <span style={{ position: 'absolute', inset: 0, background: notifEnabled ? 'var(--primary-600)' : 'var(--gray-200)', borderRadius: 24, transition: '0.2s' }}>
                  <span style={{ position: 'absolute', left: notifEnabled ? 22 : 3, top: 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: '0.2s', boxShadow: 'var(--shadow-sm)' }}/>
                </span>
              </label>
            </div>
          </div>

          <div className="demo-banner" role="note" style={{ marginBottom: 'var(--space-4)', background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}>
            <span>🔔</span><span>Official Pollution Advisories — Synchronized with Central Pollution Control Board (CPCB) Thresholds.</span>
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
            {['All', 'Air', 'Water', 'Critical', 'High', 'Medium', 'Low'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>

          {/* Alert Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
            {[
              { label: 'Critical', count: airWaterAlerts.filter(a => a.severity === 'Critical').length, color: 'var(--status-hazardous)', bg: 'var(--status-hazardous-bg)' },
              { label: 'High',     count: airWaterAlerts.filter(a => a.severity === 'High').length,     color: 'var(--status-unhealthy)', bg: 'var(--status-unhealthy-bg)' },
              { label: 'Medium',   count: airWaterAlerts.filter(a => a.severity === 'Medium').length,   color: 'var(--status-poor)',      bg: 'var(--status-poor-bg)' },
              { label: 'Low',      count: airWaterAlerts.filter(a => a.severity === 'Low').length,      color: 'var(--status-moderate)',  bg: 'var(--status-moderate-bg)' },
            ].map(s => (
              <div key={s.label} className="card card-body" style={{ textAlign: 'center', background: s.bg, border: `1.5px solid ${s.color}30` }}>
                <div style={{ fontSize: '36px', fontWeight: 900, color: s.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{s.count}</div>
                <div style={{ fontSize: 'var(--text-xs)', color: s.color, fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Alert Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--gray-400)' }}>
                <div style={{ fontSize: 48 }}>✅</div>
                <h3 style={{ color: 'var(--gray-600)', marginTop: 'var(--space-3)' }}>No alerts in this category</h3>
              </div>
            ) : filtered.map(alert => (
              <div key={alert.id} className="card" style={{ borderLeft: `4px solid ${colorMap[alert.severity]}`, overflow: 'hidden' }}>
                <div className="card-body" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  <div style={{ width: 52, height: 52, background: bgMap[alert.severity], borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                    {alert.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                      <span className="badge" style={{ background: bgMap[alert.severity], color: colorMap[alert.severity], border: `1px solid ${colorMap[alert.severity]}`, fontSize: '10px' }}>
                        {alert.severity}
                      </span>
                      <span className="badge badge-moderate" style={{ fontSize: '10px' }}>{alert.type}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>📍 {alert.location}</span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>🕐 {new Date(alert.time).toLocaleTimeString('en-IN')}</span>
                    </div>
                    <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 'var(--space-1)' }}>{alert.title}</h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.6 }}>{alert.message}</p>
                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn btn-secondary btn-sm">View Details</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--gray-400)' }}>Dismiss</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Notification Settings */}
          <div className="card card-body" style={{ marginTop: 'var(--space-6)' }}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>⚙️ Alert Settings</h3>
            {[
              { label: 'Air Quality Alerts',  sub: 'Notify when AQI exceeds your threshold' },
              { label: 'Water Quality Alerts', sub: 'Contamination warnings for your area' },
              { label: 'Severe Weather Events', sub: 'Storm and climate event notifications' },
              { label: 'Daily Summary',        sub: 'Morning environmental summary report' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: i < 3 ? '1px solid var(--gray-100)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.label}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 2 }}>{s.sub}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: 44, height: 24, cursor: 'pointer' }}>
                  <input type="checkbox" defaultChecked={i < 2} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} aria-label={s.label}/>
                  <span style={{ position: 'absolute', inset: 0, background: i < 2 ? 'var(--primary-600)' : 'var(--gray-200)', borderRadius: 24, transition: '0.2s' }}>
                    <span style={{ position: 'absolute', left: i < 2 ? 22 : 3, top: 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: '0.2s', boxShadow: 'var(--shadow-sm)' }}/>
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
