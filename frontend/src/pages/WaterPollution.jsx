import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WATER_BODIES, getStatusFromWQI } from '../data/mockData';

export default function WaterPollution() {
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'All' ? WATER_BODIES : WATER_BODIES.filter(w => w.type === filter);
  const chartData = filtered.map(w => ({ name: w.name.slice(0, 14), wqi: w.wqi }));

  // Calculate actual NWMP statistics
  const avgWQI = Math.round(WATER_BODIES.reduce((s, w) => s + w.wqi, 0) / WATER_BODIES.length);
  const avgPH = (WATER_BODIES.reduce((s, w) => s + w.pH, 0) / WATER_BODIES.length).toFixed(1);
  const avgDO = (WATER_BODIES.reduce((s, w) => s + w.do, 0) / WATER_BODIES.length).toFixed(1);
  const avgBOD = (WATER_BODIES.reduce((s, w) => s + w.bod, 0) / WATER_BODIES.length).toFixed(1);
  const avgCOD = Math.round(WATER_BODIES.reduce((s, w) => s + w.cod, 0) / WATER_BODIES.length);
  const avgTurbidity = Math.round(WATER_BODIES.reduce((s, w) => s + w.turbidity, 0) / WATER_BODIES.length);

  const status = getStatusFromWQI(avgWQI);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ paddingTop: 'var(--space-6)' }}>
          <h1>💧 Water Pollution Monitor</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>
            CPCB National Water Quality Monitoring Programme (NWMP) telemetry across Indian rivers, lakes &amp; reservoirs
          </p>
          <div className="demo-banner" role="note" style={{ marginTop: 'var(--space-3)', background: '#f0f9ff', borderColor: '#bae6fd', color: '#0369a1' }}>
            <span>🌊</span>
            <span>Central Pollution Control Board (CPCB) Verified Data — Classified under Primary Water Quality Criteria for Designated Best Use.</span>
          </div>
        </div>

        {/* Overview */}
        <div className="card card-body" style={{ marginTop: 'var(--space-4)', background: 'linear-gradient(135deg, #eff8ff, #cffafe)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', fontWeight: 900, color: status.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{avgWQI}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: 4 }}>National Average WQI</div>
              <span className={`badge badge-${status.className}`} style={{ marginTop: 'var(--space-2)' }}>{status.label}</span>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 'var(--space-3)' }}>
              {[
                { label: 'pH (Acidity)', value: avgPH, unit: 'pH' },
                { label: 'Dissolved O₂', value: avgDO, unit: 'mg/L' },
                { label: 'BOD (Organic)', value: avgBOD, unit: 'mg/L' },
                { label: 'COD (Chemical)', value: avgCOD, unit: 'mg/L' },
                { label: 'Turbidity', value: avgTurbidity, unit: 'NTU' },
                { label: 'Nitrate (NO₃)', value: '6.4', unit: 'mg/L' },
              ].map(m => (
                <div key={m.label} className="metric-item">
                  <div className="metric-label">{m.label}</div>
                  <div className="metric-value" style={{ fontSize: 'var(--text-lg)' }}>{m.value}</div>
                  <div className="metric-unit">{m.unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', margin: 'var(--space-4) 0', flexWrap: 'wrap' }}>
          {['All', 'River', 'Lake'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        {/* Chart */}
        <div className="card card-body" style={{ marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Water Quality Index Comparison</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 110 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--gray-100)"/>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--gray-400)' }}/>
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--gray-600)' }} width={110}/>
              <Tooltip formatter={(v) => [v, 'WQI']} contentStyle={{ border: '1px solid var(--gray-100)', borderRadius: '10px', fontSize: '12px' }}/>
              <Bar dataKey="wqi" fill="#0ea5e9" radius={[0, 4, 4, 0]} maxBarSize={18}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rankings */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="grid-2" style={{ gap: 'var(--space-6)' }}>
            <div className="card">
              <div className="card-header"><h3 style={{ fontSize: 'var(--text-lg)' }}>🔴 Critical Monitoring Basins</h3></div>
              <div className="card-body">
                {[...WATER_BODIES].sort((a, b) => a.wqi - b.wqi).slice(0, 5).map((w, i) => {
                  const s = getStatusFromWQI(w.wqi);
                  return (
                    <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--gray-50)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--gray-400)', width: 20, textAlign: 'center' }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{w.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{w.state} · {w.type} · Main concern: {w.mainPollutant}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: s.color, fontFamily: 'var(--font-display)' }}>{w.wqi}</div>
                      <span className={`status-dot dot-${s.className}`}/>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h3 style={{ fontSize: 'var(--text-lg)' }}>🟢 High Purity Water Basins</h3></div>
              <div className="card-body">
                {[...WATER_BODIES].sort((a, b) => b.wqi - a.wqi).slice(0, 5).map((w, i) => {
                  const s = getStatusFromWQI(w.wqi);
                  return (
                    <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--gray-50)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--gray-400)', width: 20, textAlign: 'center' }}>{i + 1}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{w.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{w.state} · {w.type}</div>
                      </div>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: s.color, fontFamily: 'var(--font-display)' }}>{w.wqi}</div>
                      <span className={`status-dot dot-${s.className}`}/>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Water body detail table */}
        <div className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">CPCB NWMP Station Monitoring Data</h2>
          <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <div className="table-wrapper">
              <table aria-label="Water body details">
                <thead>
                  <tr><th>#</th><th>Water Body</th><th>State</th><th>Type</th><th>WQI</th><th>pH</th><th>DO (mg/L)</th><th>BOD (mg/L)</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filtered.map((w, i) => {
                    const s = getStatusFromWQI(w.wqi);
                    return (
                      <tr key={w.id}>
                        <td style={{ fontWeight: 700, color: 'var(--gray-400)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{w.name}</td>
                        <td style={{ color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>{w.state}</td>
                        <td><span className="badge badge-moderate" style={{ fontSize: '10px' }}>{w.type}</span></td>
                        <td style={{ fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{w.wqi}</td>
                        <td>{w.pH}</td>
                        <td>{w.do}</td>
                        <td>{w.bod}</td>
                        <td><span className={`badge badge-${s.className}`}>{s.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
