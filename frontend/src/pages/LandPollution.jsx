import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LAND_HOTSPOTS, ALL_INDIAN_STATES, getStatusFromSQI } from '../data/mockData';

export default function LandPollution() {
  const statesByLand = [...ALL_INDIAN_STATES].sort((a, b) => a.landQuality - b.landQuality).slice(0, 10);
  const chartData = LAND_HOTSPOTS.map(l => ({ name: l.name.slice(0, 15), sqi: l.sqi }));

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ paddingTop: 'var(--space-6)' }}>
          <h1>🌱 Land &amp; Soil Pollution Monitor</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>Soil quality, contamination &amp; waste monitoring across India · Demo Data</p>
          <div className="demo-banner" role="note" style={{ marginTop: 'var(--space-3)' }}><span>⚠️</span><span>Demo Mode — All values are sample data.</span></div>
        </div>

        {/* Overview */}
        <div className="card card-body" style={{ marginTop: 'var(--space-4)', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', fontWeight: 900, color: 'var(--green-600)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>68</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: 4 }}>India Avg SQI</div>
              <span className="badge badge-moderate" style={{ marginTop: 'var(--space-2)' }}>Moderate</span>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 'var(--space-3)' }}>
              {[
                { label: 'Heavy Metals', value: 'Low-Moderate' },
                { label: 'Chemical Contam.', value: 'Moderate' },
                { label: 'Plastic Waste', value: 'Moderate' },
                { label: 'Soil Health', value: '65%' },
                { label: 'Waste Density', value: '42 kg/km²' },
                { label: 'Agricultural', value: '72% Healthy' },
              ].map(m => (
                <div key={m.label} className="metric-item">
                  <div className="metric-label">{m.label}</div>
                  <div className="metric-value" style={{ fontSize: 'var(--text-sm)' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="card card-body" style={{ margin: 'var(--space-4) 0' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>Most Contaminated Hotspots (SQI)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 120 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--gray-100)"/>
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: 'var(--gray-400)' }}/>
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--gray-600)' }} width={120}/>
              <Tooltip formatter={(v) => [v, 'SQI']} contentStyle={{ border: '1px solid var(--gray-100)', borderRadius: '10px', fontSize: '12px' }}/>
              <Bar dataKey="sqi" fill="var(--green-500)" radius={[0, 4, 4, 0]} maxBarSize={18}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hotspot Cards */}
        <div className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">Contamination Hotspots</h2>
          <div className="grid-3" style={{ marginTop: 'var(--space-4)' }}>
            {LAND_HOTSPOTS.map(l => {
              const s = getStatusFromSQI(l.sqi);
              return (
                <div key={l.id} className="card card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{l.name}</h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{l.state}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: s.color, fontFamily: 'var(--font-display)' }}>{l.sqi}</div>
                      <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>SQI</div>
                    </div>
                  </div>
                  <span className={`badge badge-${s.className}`} style={{ marginTop: 'var(--space-2)' }}>{s.label}</span>
                  <div style={{ marginTop: 'var(--space-3)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
                    <div className="metric-item"><div className="metric-label">Main Concern</div><div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{l.mainConcern}</div></div>
                    <div className="metric-item"><div className="metric-label">Heavy Metals</div><div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: l.heavyMetals === 'Very High' ? 'var(--status-unhealthy)' : 'inherit' }}>{l.heavyMetals}</div></div>
                    <div className="metric-item"><div className="metric-label">Plastic Waste</div><div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{l.plasticWaste}</div></div>
                    <div className="metric-item"><div className="metric-label">Status</div><div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{l.status}</div></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* State Rankings */}
        <div className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">States by Soil Quality (Worst First)</h2>
          <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <div className="table-wrapper">
              <table aria-label="State land quality rankings">
                <thead><tr><th>#</th><th>State</th><th>Land SQI</th><th>Air AQI</th><th>Water WQI</th><th>Trend</th><th>Status</th></tr></thead>
                <tbody>
                  {statesByLand.map((state, i) => {
                    const s = getStatusFromSQI(state.landQuality);
                    return (
                      <tr key={state.id}>
                        <td style={{ fontWeight: 700, color: 'var(--gray-400)' }}>{i + 1}</td>
                        <td><Link to={`/state/${state.name}`} style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{state.name}</Link></td>
                        <td style={{ fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{state.landQuality}</td>
                        <td>{state.airAQI}</td>
                        <td>{state.waterQuality}</td>
                        <td style={{ color: state.trend === 'improving' ? 'var(--status-good)' : state.trend === 'worsening' ? 'var(--status-unhealthy)' : 'var(--gray-500)', fontWeight: 600, fontSize: 'var(--text-xs)' }}>
                          {state.trend === 'improving' ? '↗ Better' : state.trend === 'worsening' ? '↘ Worse' : '→ Stable'}
                        </td>
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
