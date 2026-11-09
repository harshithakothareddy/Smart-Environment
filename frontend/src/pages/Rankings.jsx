import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CITIES, ALL_INDIAN_STATES, WATER_BODIES, getStatusFromAQI, getStatusFromWQI } from '../data/mockData';

const TABS = ['Air', 'Water', 'Overall'];
const FILTERS = ['India', 'State', 'City'];
const TIME_FILTERS = ['LIVE', 'Today', 'Yesterday', '7 Days', '30 Days'];
const SORT_OPTIONS = ['Most Polluted', 'Cleanest', 'Alphabetical'];

import { useApp } from '../context/AppContext';

function getRankingData(tab, filter, citiesData) {
  const cities = citiesData || CITIES;
  if (tab === 'Air') {
    const data = filter === 'City' ? cities : ALL_INDIAN_STATES.map(s => ({ ...s, aqi: s.airAQI, name: s.name, mainPollutant: 'PM2.5' }));
    return data.map(d => ({ name: d.name, state: d.state || '', value: d.aqi || d.airAQI, secondary: d.mainPollutant || 'PM2.5', status: getStatusFromAQI(d.aqi || d.airAQI) }));
  }
  if (tab === 'Water') {
    return WATER_BODIES.map(w => ({ name: w.name, state: w.state, value: w.wqi, secondary: w.mainPollutant, status: getStatusFromWQI(w.wqi), reversed: true }));
  }
  // Overall
  return ALL_INDIAN_STATES.map(s => {
    const airScore = Math.max(0, 100 - Math.round(s.airAQI / 5));
    const combined = Math.round((airScore + s.waterQuality) / 2);
    return { name: s.name, state: s.capital, value: combined, secondary: s.code, status: getStatusFromAQI(200 - combined * 2), reversed: true };
  });
}

function StatusDot({ className }) {
  return <span className={`status-dot dot-${className}`} aria-hidden="true"/>;
}

export default function Rankings() {
  const { citiesData } = useApp();
  const [activeTab, setActiveTab] = useState('Air');
  const [filter, setFilter] = useState('India');
  const [timeFilter, setTimeFilter] = useState('LIVE');
  const [sortOrder, setSortOrder] = useState('Most Polluted');
  const [search, setSearch] = useState('');

  const rawData = useMemo(() => getRankingData(activeTab, filter, citiesData), [activeTab, filter, citiesData]);

  const sorted = useMemo(() => {
    let d = [...rawData].filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    if (sortOrder === 'Most Polluted') d.sort((a, b) => (a.reversed ? a.value - b.value : b.value - a.value));
    if (sortOrder === 'Cleanest')     d.sort((a, b) => (a.reversed ? b.value - a.value : a.value - b.value));
    if (sortOrder === 'Alphabetical') d.sort((a, b) => a.name.localeCompare(b.name));
    return d.slice(0, 30).map((item, i) => ({ ...item, rank: i + 1 }));
  }, [rawData, sortOrder, search]);

  const chartData = sorted.slice(0, 10);

  const getValueLabel = () => {
    if (activeTab === 'Air') return 'AQI';
    if (activeTab === 'Water') return 'WQI';
    return 'Score';
  };

  const getBarColor = () => {
    if (activeTab === 'Air') return 'var(--primary-500)';
    if (activeTab === 'Water') return '#0ea5e9';
    return 'var(--primary-500)';
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ paddingTop: 'var(--space-6)' }}>
          <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>📊 India Pollution Ranking</h1>
          <div className="demo-banner" role="note" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
            <span>🟢</span>
            <span>Real-Time Environmental Rankings — Central Pollution Control Board (CPCB) Continuous Telemetry &amp; NWMP Basin Metrics.</span>
          </div>
        </div>

        {/* Live indicator */}
        <div className="rankings-live-bar">
          <span className="live-dot" aria-label="Live data indicator"/>
          <span className="live-label">LIVE</span>
          <span style={{ color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>
            12:00 PM – 1:00 PM · {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Controls */}
        <div className="rankings-controls">
          {/* Tabs */}
          <div className="tabs" style={{ maxWidth: '360px' }}>
            {TABS.map(t => (
              <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} aria-pressed={activeTab === t}>
                {t}
              </button>
            ))}
          </div>

          <div className="rankings-filters-row">
            {/* Filter */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {FILTERS.map(f => (
                <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
              ))}
            </div>

            {/* Time filter */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {TIME_FILTERS.map(t => (
                <button key={t} className={`filter-pill ${timeFilter === t ? 'active' : ''}`} onClick={() => setTimeFilter(t)}>{t}</button>
              ))}
            </div>

            {/* Sort */}
            <select
              className="input"
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value)}
              style={{ width: 'auto', fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-4)' }}
              aria-label="Sort order"
            >
              {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Search */}
          <div className="input-group" style={{ maxWidth: '320px' }}>
            <svg className="input-icon input-icon-left" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="input with-icon-left" type="search" placeholder="Search location..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search locations"/>
          </div>
        </div>

        {/* Chart */}
        <div className="card card-body" style={{ marginTop: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--gray-700)' }}>
            Top 10 — {getValueLabel()} Comparison
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--gray-100)"/>
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false}/>
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--gray-600)' }} tickLine={false} width={80}/>
              <Tooltip contentStyle={{ border: '1px solid var(--gray-100)', borderRadius: '10px', fontSize: '12px' }} formatter={(v) => [v, getValueLabel()]}/>
              <Bar dataKey="value" fill={getBarColor()} radius={[0,4,4,0]} maxBarSize={20}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="card" style={{ marginTop: 'var(--space-4)' }}>
          <div className="table-wrapper">
            <table aria-label={`${activeTab} pollution rankings`}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Location</th>
                  {activeTab !== 'Overall' && <th>State</th>}
                  <th>{getValueLabel()}</th>
                  <th>Main Concern</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(item => (
                  <tr key={item.rank}>
                    <td>
                      <span className={`rank-badge ${item.rank <= 3 ? `rank-${item.rank}` : ''}`}>{item.rank}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--gray-800)' }}>
                      <Link to={`/city/${item.name}`} style={{ color: 'inherit' }}>{item.name}</Link>
                    </td>
                    {activeTab !== 'Overall' && <td style={{ color: 'var(--gray-500)' }}>{item.state}</td>}
                    <td>
                      <span style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: item.status.color, fontFamily: 'var(--font-display)' }}>
                        {item.value}
                      </span>
                    </td>
                    <td style={{ color: 'var(--gray-600)', fontSize: 'var(--text-xs)' }}>{item.secondary}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <StatusDot className={item.status.className}/>
                        <span className={`badge badge-${item.status.className}`}>{item.status.label}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* State overview grid */}
        <div className="section">
          <h2 className="section-title">All Indian States &amp; UTs</h2>
          <div className="states-overview-grid" style={{ marginTop: 'var(--space-4)' }}>
            {ALL_INDIAN_STATES.map(state => {
              const s = getStatusFromAQI(state.airAQI);
              return (
                <Link key={state.id} to={`/state/${state.name}`} className="state-mini-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--gray-800)' }}>{state.name}</span>
                    <StatusDot className={s.className}/>
                  </div>
                  <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-3)' }}>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Air</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{state.airAQI}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '10px', color: 'var(--gray-400)', textTransform: 'uppercase' }}>Water</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: getStatusFromWQI(state.waterQuality).color, fontFamily: 'var(--font-display)' }}>{state.waterQuality}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '10px', color: 'var(--gray-400)' }}>Trend:</span>
                    <span style={{ fontSize: '10px', color: state.trend === 'improving' ? 'var(--status-good)' : state.trend === 'worsening' ? 'var(--status-unhealthy)' : 'var(--gray-500)', fontWeight: 600 }}>
                      {state.trend === 'improving' ? '↗ Improving' : state.trend === 'worsening' ? '↘ Worsening' : '→ Stable'}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .rankings-live-bar {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin: var(--space-3) 0;
        }
        .live-dot {
          width: 8px; height: 8px; background: var(--status-unhealthy);
          border-radius: 50%;
          animation: pulse-ring 1.5s infinite;
          display: inline-block;
        }
        .live-label {
          font-size: var(--text-xs);
          font-weight: 700;
          color: var(--status-unhealthy);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .rankings-controls {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin: var(--space-4) 0;
        }
        .rankings-filters-row {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          align-items: center;
        }
        .filter-pill {
          padding: 5px 14px;
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 600;
          background: white;
          border: 1.5px solid var(--gray-200);
          color: var(--gray-600);
          transition: all var(--transition-fast);
        }
        .filter-pill:hover, .filter-pill.active {
          background: var(--primary-600);
          border-color: var(--primary-600);
          color: white;
        }
        .rank-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: var(--text-xs);
          font-weight: 700;
          background: var(--gray-100);
          color: var(--gray-600);
        }
        .rank-badge.rank-1 { background: #fef9c3; color: #92400e; }
        .rank-badge.rank-2 { background: var(--gray-200); color: var(--gray-700); }
        .rank-badge.rank-3 { background: #ffedd5; color: #9a3412; }
        .states-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-3);
        }
        .state-mini-card {
          background: white;
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          border: 1px solid var(--gray-100);
          box-shadow: var(--shadow-xs);
          text-decoration: none;
          transition: all var(--transition-base);
        }
        .state-mini-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
