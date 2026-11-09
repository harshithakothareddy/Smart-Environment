import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ALL_INDIAN_STATES, CITIES, generate24hData, generate7DayData, getStatusFromAQI, getStatusFromWQI } from '../data/mockData';

export default function StateDetail() {
  const { stateName } = useParams();
  const [activeTab, setActiveTab] = useState('Air');
  const [chartPeriod, setChartPeriod] = useState('24h');
  const [chartData] = useState(generate24hData());
  const [weekData] = useState(generate7DayData());

  const state = ALL_INDIAN_STATES.find(s => s.name.toLowerCase() === stateName?.toLowerCase()) || ALL_INDIAN_STATES[0];
  const stateCities = CITIES.filter(c => c.state.toLowerCase().includes(state.name.toLowerCase())).slice(0, 5);

  const airStatus   = getStatusFromAQI(state.airAQI);
  const waterStatus = getStatusFromWQI(state.waterQuality);
  const overallScore = Math.round((Math.max(0, 100 - state.airAQI / 5) + state.waterQuality) / 2);

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ paddingTop: 'var(--space-6)', marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
          <Link to="/" style={{ color: 'var(--primary-600)' }}>Home</Link>
          <span>/</span>
          <Link to="/rankings" style={{ color: 'var(--primary-600)' }}>Rankings</Link>
          <span>/</span>
          <span>{state.name}</span>
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div>
            <h1>🗺️ {state.name} Environmental Report</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>Capital: {state.capital} · State Code: {state.code} · Central Pollution Control Board (CPCB) Telemetry</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--text-sm)', color: state.trend === 'improving' ? 'var(--status-good)' : state.trend === 'worsening' ? 'var(--status-unhealthy)' : 'var(--gray-500)', fontWeight: 700 }}>
              {state.trend === 'improving' ? '↗ Improving' : state.trend === 'worsening' ? '↘ Worsening' : '→ Stable'}
            </span>
          </div>
        </div>

        <div className="demo-banner" role="note" style={{ marginBottom: 'var(--space-4)', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
          <span>🟢</span><span>State Environmental Monitoring — Continuous ambient monitoring &amp; river basin metrics.</span>
        </div>

        {/* Score Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
          {[
            { label: 'Air AQI',    value: state.airAQI,       unit: 'AQI',  status: airStatus,   icon: '🌬️' },
            { label: 'Water WQI',  value: state.waterQuality,  unit: '/100', status: waterStatus, icon: '💧' },
            { label: 'Overall',    value: overallScore,         unit: '/100', status: { color: overallScore >= 70 ? 'var(--status-good)' : overallScore >= 50 ? 'var(--status-moderate)' : 'var(--status-poor)', label: overallScore >= 70 ? 'Good' : overallScore >= 50 ? 'Moderate' : 'Poor', className: overallScore >= 70 ? 'good' : overallScore >= 50 ? 'moderate' : 'poor' }, icon: '🌍' },
          ].map(item => (
            <div key={item.label} className="card card-body" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', marginBottom: 'var(--space-2)' }}>{item.icon}</div>
              <div style={{ fontSize: '42px', fontWeight: 900, color: item.status.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{item.value}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', margin: '4px 0' }}>{item.label}</div>
              <span className={`badge badge-${item.status.className}`}>{item.status.label}</span>
            </div>
          ))}
        </div>

        {/* Detail Tabs */}
        <div className="tabs" style={{ maxWidth: 240, marginBottom: 'var(--space-4)' }}>
          {['Air', 'Water'].map(t => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>

        {/* Metrics grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
          {activeTab === 'Air' && [
            { label: 'AQI',    value: state.airAQI,  unit: '',       color: airStatus.color },
            { label: 'PM2.5',  value: Math.round(state.airAQI * 0.4), unit: ' μg/m³' },
            { label: 'PM10',   value: Math.round(state.airAQI * 0.8), unit: ' μg/m³' },
            { label: 'NO₂',    value: Math.round(state.airAQI * 0.25), unit: ' ppb' },
            { label: 'SO₂',    value: Math.round(state.airAQI * 0.12), unit: ' ppb' },
            { label: 'O₃',     value: Math.round(state.airAQI * 0.35), unit: ' ppb' },
          ].map(m => (
            <div key={m.label} style={{ background: 'white', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: m.color || 'var(--gray-900)', fontFamily: 'var(--font-display)', lineHeight: 1.2, marginTop: 4 }}>{m.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>{m.unit}</div>
            </div>
          ))}
          {activeTab === 'Water' && [
            { label: 'WQI',       value: state.waterQuality, unit: '/100', color: waterStatus.color },
            { label: 'pH',        value: '7.1', unit: '' },
            { label: 'DO',        value: '6.2', unit: ' mg/L' },
            { label: 'BOD',       value: '5.8', unit: ' mg/L' },
            { label: 'COD',       value: '22', unit: ' mg/L' },
            { label: 'Turbidity', value: '15', unit: ' NTU' },
          ].map(m => (
            <div key={m.label} style={{ background: 'white', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)', textAlign: 'center', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: m.color || 'var(--gray-900)', fontFamily: 'var(--font-display)', lineHeight: 1.2, marginTop: 4 }}>{m.value}</div>
              <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>{m.unit}</div>
            </div>
          ))}

        </div>

        {/* Chart */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Historical Trend</h2>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {['24h', '7d', '30d'].map(p => (
                <button key={p} className={`btn btn-sm ${chartPeriod === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setChartPeriod(p)}>{p}</button>
              ))}
            </div>
          </div>
          <div className="card card-body">
            <ResponsiveContainer width="100%" height={chartPeriod === '7d' ? 280 : 260}>
              <AreaChart data={chartPeriod === '7d' ? weekData : chartData} margin={{ bottom: 30 }}>
                <defs>
                  <linearGradient id="stateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={airStatus.color} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={airStatus.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)"/>
                <XAxis
                  dataKey={chartPeriod === '7d' ? 'day' : 'hour'}
                  tick={{ fontSize: 10, fill: 'var(--gray-400)', angle: -35, textAnchor: 'end' }}
                  tickLine={false}
                  interval={chartPeriod === '24h' ? 2 : 0}
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false}/>
                <Tooltip
                  contentStyle={{ border: '1px solid var(--gray-100)', borderRadius: '10px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 700, color: 'var(--gray-700)' }}
                />
                {chartPeriod === '24h' && (
                  <ReferenceLine
                    x={chartData[chartData.length - 1]?.hour}
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    label={{ value: '▶ Now', position: 'top', fill: '#10b981', fontSize: 11, fontWeight: 700 }}
                  />
                )}
                <Area type="monotone" dataKey="aqi" stroke={airStatus.color} fill="url(#stateGrad)" strokeWidth={2} name="AQI"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cities in state */}
        {stateCities.length > 0 && (
          <div className="section" style={{ paddingTop: 0 }}>
            <h2 className="section-title">Major Cities in {state.name}</h2>
            <div className="grid-3" style={{ marginTop: 'var(--space-4)' }}>
              {stateCities.map(city => {
                const s = getStatusFromAQI(city.aqi);
                return (
                  <Link key={city.id} to={`/city/${city.name}`} className="card card-body" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{city.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 2 }}>{city.mainPollutant}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: 'var(--text-2xl)', color: s.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{city.aqi}</div>
                        <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>AQI</div>
                      </div>
                    </div>
                    <span className={`badge badge-${s.className}`} style={{ marginTop: 'var(--space-3)' }}>{s.label}</span>
                  </Link>
                );
              })}
            </div>
            {stateCities.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--gray-400)' }}>
                <p>No city-level data available for this state in demo mode.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
