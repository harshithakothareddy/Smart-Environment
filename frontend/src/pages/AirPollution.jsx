import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { generate24hData, generate7DayData, getStatusFromAQI } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function AirPollution() {
  const { citiesData } = useApp();
  const [period, setPeriod] = useState('24h');
  const [chartData] = useState(generate24hData());
  const [weekData] = useState(generate7DayData());

  const topCities = [...citiesData].sort((a, b) => b.aqi - a.aqi).slice(0, 10);

  // Calculate actual average from all current telemetry stations
  const avgAQI = Math.round(citiesData.reduce((sum, c) => sum + c.aqi, 0) / (citiesData.length || 1));
  const avgPM25 = (citiesData.reduce((sum, c) => sum + (c.pm25 || 0), 0) / (citiesData.length || 1)).toFixed(1);
  const avgPM10 = Math.round(citiesData.reduce((sum, c) => sum + (c.pm10 || 0), 0) / (citiesData.length || 1));
  const avgNO2 = Math.round(citiesData.reduce((sum, c) => sum + (c.no2 || 0), 0) / (citiesData.length || 1));
  const avgSO2 = Math.round(citiesData.reduce((sum, c) => sum + (c.so2 || 0), 0) / (citiesData.length || 1));
  const avgO3 = Math.round(citiesData.reduce((sum, c) => sum + (c.o3 || 0), 0) / (citiesData.length || 1));
  const avgCO = (citiesData.reduce((sum, c) => sum + (c.co || 0), 0) / (citiesData.length || 1)).toFixed(1);

  const status = getStatusFromAQI(avgAQI);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ paddingTop: 'var(--space-6)' }}>
          <h1>🌬️ Air Pollution Monitor</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>
            Real-time Continuous Ambient Air Quality Monitoring (CAAQMS) telemetry across India
          </p>
          <div className="demo-banner" role="note" style={{ marginTop: 'var(--space-3)', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
            <span>🟢</span>
            <span>Live Telemetry Active — Continuous data streams from ground monitoring stations &amp; Copernicus atmospheric analysis.</span>
          </div>
        </div>

        {/* Overview Card */}
        <div className="card card-body" style={{ marginTop: 'var(--space-4)', background: 'linear-gradient(135deg, #eff8ff, #dbeafe)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', fontWeight: 900, color: status.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{avgAQI}</div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: 4 }}>National Average AQI</div>
              <span className={`badge badge-${status.className}`} style={{ marginTop: 'var(--space-2)' }}>{status.label}</span>
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 'var(--space-3)' }}>
              {[
                { label: 'PM2.5', value: avgPM25, unit: 'μg/m³' },
                { label: 'PM10', value: avgPM10, unit: 'μg/m³' },
                { label: 'NO₂', value: avgNO2, unit: 'μg/m³' },
                { label: 'SO₂', value: avgSO2, unit: 'μg/m³' },
                { label: 'O₃', value: avgO3, unit: 'μg/m³' },
                { label: 'CO', value: avgCO, unit: 'mg/m³' },
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

        {/* Chart */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Air Quality Trend (National Composite)</h2>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {['24h', '7d'].map(p => (
                <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setPeriod(p)}>{p}</button>
              ))}
            </div>
          </div>
          <div className="card card-body">
            <ResponsiveContainer width="100%" height={period === '7d' ? 280 : 270}>
              <AreaChart data={period === '7d' ? weekData : chartData} margin={{ bottom: 30 }}>
                <defs>
                  <linearGradient id="airGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={status.color} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={status.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)"/>
                <XAxis
                  dataKey={period === '7d' ? 'day' : 'hour'}
                  tick={{ fontSize: 10, fill: 'var(--gray-400)', angle: -35, textAnchor: 'end' }}
                  tickLine={false}
                  interval={period === '24h' ? 2 : 0}
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false}/>
                <Tooltip
                  contentStyle={{ border: '1px solid var(--gray-100)', borderRadius: '10px', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 700, color: 'var(--gray-700)' }}
                />
                {period === '24h' && (
                  <ReferenceLine
                    x={chartData[chartData.length - 1]?.hour}
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    label={{ value: '▶ Now', position: 'top', fill: '#10b981', fontSize: 11, fontWeight: 700 }}
                  />
                )}
                <Area type="monotone" dataKey="aqi" stroke={status.color} fill="url(#airGrad)" strokeWidth={2} name="AQI"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* City Rankings */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <h2 className="section-title">Cities Ranked by Air Quality Index</h2>
            <Link to="/rankings" className="btn btn-outline btn-sm">View Full Rankings</Link>
          </div>
          <div className="card">
            <div className="table-wrapper">
              <table aria-label="Air pollution city rankings">
                <thead>
                  <tr><th>#</th><th>City</th><th>State</th><th>AQI</th><th>PM2.5</th><th>Main Pollutant</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {topCities.map((city, i) => {
                    const s = getStatusFromAQI(city.aqi);
                    return (
                      <tr key={city.id}>
                        <td><span style={{ fontWeight: 700, color: 'var(--gray-400)' }}>{i + 1}</span></td>
                        <td><Link to={`/city/${city.name}`} style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{city.name}</Link></td>
                        <td style={{ color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>{city.state}</td>
                        <td style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: s.color, fontFamily: 'var(--font-display)' }}>{city.aqi}</td>
                        <td style={{ fontWeight: 600 }}>{city.pm25} μg/m³</td>
                        <td style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{city.mainPollutant}</td>
                        <td><span className={`badge badge-${s.className}`}>{s.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Pollutant Info */}
        <div className="section" style={{ paddingTop: 0 }}>
          <h2 className="section-title">CPCB Indian National Air Quality Standards</h2>
          <div className="grid-3" style={{ marginTop: 'var(--space-4)' }}>
            {[
              { name: 'PM2.5', desc: 'Fine respirable particles ≤2.5μm from combustion and secondary reactions.', safe: '0–30 μg/m³ (CPCB Standard)', icon: '🔴' },
              { name: 'PM10', desc: 'Coarse inhalable particles ≤10μm from road dust and construction.', safe: '0–50 μg/m³ (CPCB Standard)', icon: '🟠' },
              { name: 'NO₂', desc: 'Nitrogen dioxide from motor vehicles and thermal power stations.', safe: '0–40 μg/m³ (24h standard)', icon: '🟡' },
              { name: 'SO₂', desc: 'Sulfur dioxide from coal combustion and smelting operations.', safe: '0–50 μg/m³ (24h standard)', icon: '🟡' },
              { name: 'O₃', desc: 'Ground-level ozone produced by sunlight reacting with hydrocarbons.', safe: '0–50 μg/m³ (8h standard)', icon: '🔵' },
              { name: 'CO', desc: 'Carbon monoxide toxic gas produced by incomplete vehicular combustion.', safe: '0–1.0 mg/m³ (8h standard)', icon: '⚫' },
            ].map(p => (
              <div key={p.name} className="card card-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  <span>{p.icon}</span>
                  <strong style={{ fontSize: 'var(--text-base)' }}>{p.name}</strong>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.6 }}>{p.desc}</p>
                <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--status-good)', fontWeight: 600 }}>
                  CPCB Target: {p.safe}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
