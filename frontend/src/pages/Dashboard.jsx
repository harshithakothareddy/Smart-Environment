import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { CITIES, ALL_INDIAN_STATES, NEWS, ALERTS, generate24hData, generate7DayData, getStatusFromAQI, getStatusFromWQI } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { searchIndiaLocations, searchNominatimIndia, findNearestStation, buildCustomLocation } from '../utils/indiaGeoSearch';

const LOCATION_TYPES = ['India', 'State', 'City'];

function AQIRing({ aqi, size = 120 }) {
  const max = 500;
  const pct = Math.min(aqi / max, 1);
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const status = getStatusFromAQI(aqi);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--gray-100)" strokeWidth="10"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={status.color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size > 100 ? '28px' : '20px', fontWeight: '800', color: status.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{aqi}</span>
        <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--gray-500)', marginTop: '2px' }}>AQI</span>
      </div>
    </div>
  );
}

function PollutionCard({ type, icon, color, bgColor, title, index, score, status, metrics, linkTo }) {
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="pollution-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="pollution-card-header" style={{ background: bgColor }}>
        <div className="pollution-card-type">
          <span className="pollution-card-icon">{icon}</span>
          <span className="pollution-card-type-label">{type}</span>
        </div>
        <span className={`badge badge-${statusClass}`}>{status}</span>
      </div>
      <div className="pollution-card-body">
        <div className="pollution-card-score-row">
          {type === 'Air' ? (
            <AQIRing aqi={score} size={100} />
          ) : (
            <div className="score-circle" style={{ borderColor: color }}>
              <span className="score-value" style={{ color }}>{score}</span>
              <span className="score-label">/100</span>
            </div>
          )}
          <div className="pollution-card-metrics">
            {metrics.map((m, i) => (
              <div key={i} className="mini-metric">
                <span className="mini-metric-label">{m.label}</span>
                <span className="mini-metric-value" style={{ color: m.alert ? 'var(--status-unhealthy)' : 'var(--gray-800)' }}>
                  {m.value}<span className="mini-metric-unit">{m.unit}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
        <Link to={linkTo} className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: 'var(--space-3)', justifyContent: 'center' }}>
          View Details →
        </Link>
      </div>
    </div>
  );
}

function AlertBanner({ alert }) {
  const colorMap = { Critical: 'var(--status-hazardous)', High: 'var(--status-unhealthy)', Medium: 'var(--status-poor)', Low: 'var(--status-moderate)' };
  const bgMap = { Critical: 'var(--status-hazardous-bg)', High: 'var(--status-unhealthy-bg)', Medium: 'var(--status-poor-bg)', Low: 'var(--status-moderate-bg)' };
  return (
    <div className="alert-banner" style={{ background: bgMap[alert.severity], borderColor: colorMap[alert.severity] }}>
      <span style={{ fontSize: '20px' }}>{alert.icon}</span>
      <div style={{ flex: 1 }}>
        <div className="alert-banner-title" style={{ color: colorMap[alert.severity] }}>{alert.title}</div>
        <div className="alert-banner-msg">{alert.message}</div>
      </div>
      <span className="alert-banner-loc">📍 {alert.location}</span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { alerts, citizenReports, citiesData, selectedCity, setSelectedCity, user, setAuthModalOpen, setAuthModalMode } = useApp();
  const [chartData] = useState(generate24hData());
  const [weekData] = useState(generate7DayData());

  // Location search state
  const [searchCity, setSearchCity] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoResults, setGeoResults] = useState([]);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Instant local search (0ms)
  const localResults = searchCity.trim().length >= 1
    ? searchIndiaLocations(searchCity, 10)
    : [];

  // Live OpenStreetMap Nominatim geocoding across India
  useEffect(() => {
    const q = searchCity.trim();
    if (q.length < 2) {
      setGeoResults([]);
      setGeoLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setGeoLoading(true);
      try {
        const results = await searchNominatimIndia(q, 6);
        const localNames = new Set(localResults.map(r => r.name.toLowerCase()));
        setGeoResults(results.filter(r => !localNames.has(r.name.toLowerCase())));
      } catch {
        setGeoResults([]);
      } finally {
        setGeoLoading(false);
      }
    }, 280);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchCity, localResults.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Use global selectedCity as currentCity for the dashboard
  const currentCity = selectedCity || citiesData[14] || citiesData[0];
  const setCurrentCity = (city) => setSelectedCity(city);

  const topCities = [...citiesData].sort((a, b) => b.aqi - a.aqi).slice(0, 5);
  const cleanCities = [...citiesData].sort((a, b) => a.aqi - b.aqi).slice(0, 5);

  const airStatus = getStatusFromAQI(currentCity.aqi);
  const waterStatus = getStatusFromWQI(currentCity.waterWQI);
  const activeAlerts = alerts.filter(a => a.active);

  const handleLocSelect = (loc) => {
    const { city: nearest, distanceKm } = findNearestStation(loc.lat, loc.lng, citiesData);
    const resolvedNearest = nearest || citiesData[0];
    const updated = {
      ...resolvedNearest,
      _searchedLocation: loc.name,
      _searchedState: loc.state || resolvedNearest.state,
      _searchedType: loc.type || 'Area',
      _searchedLat: loc.lat,
      _searchedLng: loc.lng,
      _distanceKm: distanceKm,
    };
    setSelectedCity(updated);
    setSearchCity('');
    setShowDropdown(false);
    navigate(`/city/${resolvedNearest.name}?from=${encodeURIComponent(loc.name)}&state=${encodeURIComponent(loc.state || '')}&type=${encodeURIComponent(loc.type || '')}&lat=${loc.lat}&lng=${loc.lng}`);
  };

  const handleCustomSelect = () => {
    if (!searchCity.trim()) return;
    const custom = buildCustomLocation(searchCity, citiesData);
    handleLocSelect(custom);
  };

  return (
    <div className="page-wrapper">
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="container">
          {/* Guest Starting Page Banner if not logged in */}
          {!user && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.08) 0%, rgba(4, 120, 87, 0.08) 100%)',
                border: '1px solid rgba(37, 99, 235, 0.25)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginBottom: 'var(--space-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>👋</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--gray-900)' }}>
                    Starting Page Preview Mode
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--gray-600)', marginTop: '2px' }}>
                    Sign in to search any Indian location, unlock live Air &amp; Water telemetry, and access pollution-aware routes.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => { setAuthModalMode('login'); setAuthModalOpen(true); }}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 700 }}
                >
                  🔑 Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthModalMode('signup'); setAuthModalOpen(true); }}
                  className="btn btn-outline btn-sm"
                  style={{ fontWeight: 600 }}
                >
                  Register
                </button>
              </div>
            </div>
          )}

          <div className="hero-content">
            <div className="hero-text animate-fade-in">
              <h1 className="hero-title">India Environmental Dashboard</h1>
              <p className="hero-subtitle">Real-time air &amp; water pollution monitoring, safe route navigation &amp; citizen reporting</p>
              <div className="demo-banner" role="note" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
                <span style={{ fontSize: '14px' }}>🟢</span>
                <span>Live Environmental Telemetry — Continuous Ground Ambient Air &amp; CPCB Hydrological Monitoring.</span>
              </div>
            </div>

            {/* Location Selector — Universal India Search */}
            <div ref={dropdownRef} className="location-selector card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📍 Search Any Location
                </span>
                <span style={{ fontSize: '10px', color: user ? 'var(--gray-400)' : '#ea580c', fontWeight: user ? 400 : 700 }}>
                  {user ? 'Every place in India' : 'Login Required to Search'}
                </span>
              </div>

              {/* Search input */}
              <div className="input-group" style={{ position: 'relative' }}>
                {geoLoading ? (
                  <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, border: '2px solid var(--gray-200)', borderTopColor: 'var(--primary-500)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                ) : (
                  <svg className="input-icon input-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                )}
                <input
                  ref={searchRef}
                  className="input with-icon-left"
                  type="text"
                  placeholder={user ? "Type any area, village, town, city, district..." : "Sign in to search locations across India..."}
                  value={searchCity}
                  onChange={e => {
                    if (!user) {
                      setAuthModalMode('login');
                      setAuthModalOpen(true);
                      return;
                    }
                    setSearchCity(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    if (!user) {
                      setAuthModalMode('login');
                      setAuthModalOpen(true);
                      return;
                    }
                    setShowDropdown(true);
                  }}
                  onKeyDown={e => {
                    if (!user) {
                      setAuthModalMode('login');
                      setAuthModalOpen(true);
                      return;
                    }
                    if (e.key === 'Enter') {
                      if (localResults.length > 0) handleLocSelect(localResults[0]);
                      else if (geoResults.length > 0) handleLocSelect(geoResults[0]);
                      else handleCustomSelect();
                    }
                  }}
                  aria-label="Search any location in India"
                  id="dashboard-location-search"
                  autoComplete="off"
                />
                {searchCity && (
                  <button type="button" onClick={() => { setSearchCity(''); }}
                    style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 13 }}>
                    ✕
                  </button>
                )}
              </div>

              {/* Instant Search Results Dropdown */}
              {showDropdown && searchCity.trim().length >= 1 && (
                <div style={{ marginTop: 6, maxHeight: 280, overflowY: 'auto', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', background: 'white', boxShadow: 'var(--shadow-lg)' }}>
                  {/* Universal custom location fallback — Select ANY typed location */}
                  <button
                    onClick={handleCustomSelect}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 12px', border: 'none', background: 'var(--primary-50)', cursor: 'pointer', borderBottom: '1px solid var(--primary-100)', transition: 'background 0.1s', textAlign: 'left' }}
                  >
                    <span style={{ fontSize: 16 }}>✨</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary-700)' }}>Select "{searchCity.trim()}"</div>
                      <div style={{ fontSize: 11, color: 'var(--primary-600)' }}>Search this exact place across India · Instant telemetry</div>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--primary-600)', fontWeight: 600 }}>Select →</span>
                  </button>

                  {/* Local DB matches */}
                  {localResults.map((loc, i) => {
                    const { city: nearest, distanceKm } = findNearestStation(loc.lat, loc.lng, citiesData);
                    const s = getStatusFromAQI(nearest?.aqi || 100);
                    const typeIcon = loc.type === 'State' ? '🗺️' : loc.type === 'City' ? '🏙️' : loc.type === 'Town' ? '🏘️' : loc.type === 'Village' ? '🌾' : loc.type === 'District' ? '📍' : '🏠';
                    return (
                      <button key={`local-${loc.name}-${i}`}
                        onClick={() => handleLocSelect(loc)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid var(--gray-50)', transition: 'background 0.1s', textAlign: 'left' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-50)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>{typeIcon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{loc.type} · {loc.state}{distanceKm > 0 ? ` · ~${distanceKm}km from ${nearest?.name}` : ''}</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                          <span style={{ background: s.color, color: 'white', fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 99 }}>{nearest?.aqi}</span>
                          <span style={{ fontSize: 10, color: s.color, fontWeight: 600 }}>{s.label}</span>
                        </div>
                      </button>
                    );
                  })}

                  {/* Live OpenStreetMap Nominatim matches */}
                  {geoResults.length > 0 && (
                    <>
                      <div style={{ padding: '6px 12px', fontSize: 10, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--gray-50)' }}>
                        Live OpenStreetMap Places
                      </div>
                      {geoResults.map((loc, i) => {
                        const { city: nearest, distanceKm } = findNearestStation(loc.lat, loc.lng, citiesData);
                        const s = getStatusFromAQI(nearest?.aqi || 100);
                        return (
                          <button key={`geo-${loc.name}-${i}`}
                            onClick={() => handleLocSelect(loc)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '9px 12px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid var(--gray-50)', transition: 'background 0.1s', textAlign: 'left' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-50)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <span style={{ fontSize: 16, width: 22, textAlign: 'center', flexShrink: 0 }}>📍</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{loc.type} · {loc.state}{distanceKm > 0 ? ` · ~${distanceKm}km from ${nearest?.name}` : ''}</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                              <span style={{ background: s.color, color: 'white', fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 99 }}>{nearest?.aqi}</span>
                            </div>
                          </button>
                        );
                      })}
                    </>
                  )}
                </div>
              )}

              {/* Quick City Chips */}
              {!(showDropdown && searchCity.trim().length >= 1) && (
                <div className="location-chips" style={{ marginTop: 'var(--space-3)' }}>
                  {['Hyderabad', 'Mumbai', 'Delhi', 'Bengaluru', 'Chennai', 'Kochi', 'Shimla'].map(city => (
                    <button
                      key={city}
                      className={`location-chip ${currentCity.name === city && !currentCity._searchedLocation ? 'active' : ''}`}
                      onClick={() => {
                        if (!user) {
                          setAuthModalMode('login');
                          setAuthModalOpen(true);
                          return;
                        }
                        const c = citiesData.find(c => c.name === city);
                        if (c) { setSelectedCity(c); setSearchCity(''); }
                      }}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}

              {/* Currently selected location display */}
              <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-800)' }}>
                    📍 {currentCity._searchedLocation || currentCity.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                    {currentCity._searchedState || currentCity.state}
                    {currentCity._searchedLocation && currentCity._searchedLocation !== currentCity.name ? ` · via ${currentCity.name} sensor station` : ''}
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => navigate(`/city/${currentCity.name}?from=${encodeURIComponent(currentCity._searchedLocation || currentCity.name)}&state=${encodeURIComponent(currentCity._searchedState || currentCity.state)}`)} style={{ fontSize: 11 }}>
                  Full Report →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE CALLOUT BANNERS: SAFE ROUTE & CITIZEN REPORTING */}
      <div className="container" style={{ paddingTop: 'var(--space-5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {/* SAFE ROUTE CARD */}
          <div className="card card-body" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ fontSize: '38px', background: 'rgba(255,255,255,0.1)', width: 64, height: 64, borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              🚗
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Eco-Navigation Engine
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', color: 'white', margin: '2px 0 4px' }}>
                Safe Route &amp; Hazard Navigator
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: '#94a3b8', margin: '0 0 10px', lineHeight: 1.4 }}>
                Find travel routes with up to 55% lower PM2.5 exposure and detour around toxic smog alerts.
              </p>
              <Link to="/map" className="btn btn-sm" style={{ background: '#0284c7', color: 'white', border: 'none' }}>
                Plan Safe Route on India Map →
              </Link>
            </div>
          </div>

          {/* CITIZEN REPORTING CARD */}
          <div className="card card-body" style={{ background: 'linear-gradient(135deg, #14532d, #052e16)', color: 'white', display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
            <div style={{ fontSize: '38px', background: 'rgba(255,255,255,0.1)', width: 64, height: 64, borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              📢
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', color: '#4ade80', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Community Vigilance
              </div>
              <h3 style={{ fontSize: 'var(--text-base)', color: 'white', margin: '2px 0 4px' }}>
                Report Air &amp; Water Hazards
              </h3>
              <p style={{ fontSize: 'var(--text-xs)', color: '#86efac', margin: '0 0 10px', lineHeight: 1.4 }}>
                {citizenReports.length} reports logged by citizens. File incidents with photos to alert boards.
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <Link to="/report" className="btn btn-sm" style={{ background: '#16a34a', color: 'white', border: 'none' }}>
                  + Report Incident
                </Link>
                <Link to="/report" className="btn btn-sm btn-ghost" style={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
                  View Incident Feed
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="container" style={{ paddingTop: 'var(--space-4)' }}>
        <div className="alerts-strip">
          {activeAlerts.slice(0, 3).map(a => <AlertBanner key={a.id} alert={a} />)}
        </div>

        {/* Current Location Header */}
        <div className="current-location-header">
          <div>
            <h2 className="section-title">📍 {currentCity.name}, {currentCity.state}</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>Updated: {new Date().toLocaleTimeString('en-IN')} · Sample Data</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <span>🌡️ {currentCity.temp}°C</span>
            <span>💧 {currentCity.humidity}%</span>
            <span>💨 {currentCity.wind} km/h</span>
          </div>
        </div>

        {/* Two Pollution Cards (Air & Water) */}
        <div className="pollution-cards-grid" style={{ marginTop: 'var(--space-4)' }}>
          <PollutionCard
            type="Air" icon="🌬️" index={0}
            color={airStatus.color} bgColor="var(--primary-50)"
            title="Air Quality Index" score={currentCity.aqi} status={airStatus.label}
            linkTo={`/air`}
            metrics={[
              { label: 'PM2.5', value: currentCity.pm25.toFixed(1), unit: ' μg/m³', alert: currentCity.pm25 > 35 },
              { label: 'PM10',  value: currentCity.pm10,  unit: ' μg/m³', alert: currentCity.pm10 > 60 },
              { label: 'NO₂',   value: currentCity.no2,   unit: ' ppb' },
              { label: 'SO₂',   value: currentCity.so2,   unit: ' ppb' },
              { label: 'O₃',    value: currentCity.o3,    unit: ' ppb' },
              { label: 'CO',    value: currentCity.co,    unit: ' mg/m³' },
            ]}
          />
          <PollutionCard
            type="Water" icon="💧" index={1}
            color={waterStatus.color} bgColor="#eff8ff"
            title="Water Quality Index" score={currentCity.waterWQI} status={waterStatus.label}
            linkTo="/water"
            metrics={[
              { label: 'WQI',       value: currentCity.waterWQI, unit: '/100' },
              { label: 'pH',        value: '7.2', unit: '' },
              { label: 'DO',        value: '6.5', unit: ' mg/L' },
              { label: 'BOD',       value: '3.1', unit: ' mg/L', alert: true },
              { label: 'Turbidity', value: '4.2', unit: ' NTU' },
              { label: 'COD',       value: '12.5',unit: ' mg/L' },
            ]}
          />
        </div>

        {/* Charts Section */}
        <div className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">24-Hour Trend</h2>
              <p className="section-subtitle">Air Quality over the last 24 hours · {currentCity.name}</p>
            </div>
          </div>
          <div className="card card-body">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ bottom: 30 }}>
                <defs>
                  <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-500)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary-500)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)"/>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: 'var(--gray-400)', angle: -35, textAnchor: 'end' }}
                  tickLine={false}
                  interval={2}
                  height={60}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false}/>
                <Tooltip
                  contentStyle={{ border: '1px solid var(--gray-100)', borderRadius: '10px', fontSize: '12px' }}
                  formatter={(v, name) => [v.toFixed(0), 'AQI']}
                  labelStyle={{ fontWeight: 700, color: 'var(--gray-700)' }}
                />
                <ReferenceLine
                  x={chartData[chartData.length - 1]?.hour}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  label={{ value: '▶ Now', position: 'top', fill: '#10b981', fontSize: 11, fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="aqi" stroke="var(--primary-500)" fill="url(#aqiGrad)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Bar */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">7-Day Comparison</h2>
              <p className="section-subtitle">PM2.5 &amp; PM10 weekly trend — last 7 days</p>
            </div>
          </div>
          <div className="card card-body">
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={weekData} margin={{ bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--gray-100)"/>
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--gray-400)', angle: -35, textAnchor: 'end' }} tickLine={false} interval={0} height={60}/>
                <YAxis tick={{ fontSize: 11, fill: 'var(--gray-400)' }} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ border: '1px solid var(--gray-100)', borderRadius: '10px', fontSize: '12px' }}/>
                <Legend wrapperStyle={{ fontSize: '12px' }}/>
                <Bar dataKey="pm25" name="PM2.5" fill="var(--primary-400)" radius={[4,4,0,0]}/>
                <Bar dataKey="pm10" name="PM10"  fill="var(--green-400)"  radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rankings Preview */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="grid-2" style={{ gap: 'var(--space-6)' }}>
            {/* Most Polluted */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="section-title" style={{ fontSize: 'var(--text-lg)' }}>🔴 Most Polluted Cities</h3>
                  <Link to="/rankings" className="btn btn-ghost btn-sm">See all →</Link>
                </div>
              </div>
              <div className="card-body" style={{ paddingTop: 'var(--space-3)' }}>
                {topCities.map((city, i) => {
                  const s = getStatusFromAQI(city.aqi);
                  return (
                    <Link key={city.id} to={`/city/${city.name}`} className="ranking-row-link">
                      <div className="ranking-row">
                        <span className="ranking-num">{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--gray-800)' }}>{city.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{city.state}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '800', fontSize: 'var(--text-xl)', color: s.color, fontFamily: 'var(--font-display)' }}>{city.aqi}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{city.mainPollutant}</div>
                        </div>
                        <span className={`status-dot dot-${s.className}`} style={{ marginLeft: '8px' }}/>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Cleanest */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="section-title" style={{ fontSize: 'var(--text-lg)' }}>🟢 Cleanest Cities</h3>
                  <Link to="/rankings" className="btn btn-ghost btn-sm">See all →</Link>
                </div>
              </div>
              <div className="card-body" style={{ paddingTop: 'var(--space-3)' }}>
                {cleanCities.map((city, i) => {
                  const s = getStatusFromAQI(city.aqi);
                  return (
                    <Link key={city.id} to={`/city/${city.name}`} className="ranking-row-link">
                      <div className="ranking-row">
                        <span className="ranking-num">{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--gray-800)' }}>{city.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{city.state}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: '800', fontSize: 'var(--text-xl)', color: s.color, fontFamily: 'var(--font-display)' }}>{city.aqi}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{city.mainPollutant}</div>
                        </div>
                        <span className={`status-dot dot-${s.className}`} style={{ marginLeft: '8px' }}/>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* News Preview */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">📰 Latest News</h2>
              <p className="section-subtitle">Environmental updates across India</p>
            </div>
            <Link to="/news" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <div className="grid-3">
            {NEWS.slice(0, 3).map(n => (
              <Link key={n.id} to={`/news`} className="card news-card">
                <div className="news-card-cat-bar" style={{ background: n.category === 'Air' ? 'var(--primary-100)' : n.category === 'Water' ? '#dbeafe' : 'var(--green-100)' }}>
                  <span className="badge" style={{ background: 'transparent', border: 'none', fontSize: '11px', fontWeight: 700, color: 'var(--gray-700)', padding: '6px 12px' }}>
                    {n.category} · {n.date}
                  </span>
                </div>
                <div className="card-body">
                  <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--gray-800)', lineHeight: 1.4, marginBottom: 'var(--space-2)' }}>{n.title}</h4>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', lineHeight: 1.5 }}>{n.description}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-500)', fontWeight: 600, marginTop: 'var(--space-3)' }}>📍 {n.location}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Environmental Score */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #16a34a 100%)', color: 'white' }}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
                <div>
                  <h2 style={{ color: 'white', marginBottom: 'var(--space-2)' }}>Environmental Health Score</h2>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--text-sm)' }}>Combined Air + Water quality rating</p>
                  <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-6)' }}>
                    {[
                      { label: 'Air',   score: Math.max(0, 100 - Math.round(currentCity.aqi / 5)) },
                      { label: 'Water', score: currentCity.waterWQI },
                    ].map(item => (
                      <div key={item.label}>
                        <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{item.score}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '72px', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                    {Math.round((Math.max(0, 100 - currentCity.aqi / 5) + currentCity.waterWQI) / 2)}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)' }}>/ 100 Overall</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-hero {
          background: linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%);
          border-bottom: 1px solid var(--gray-100);
          padding: var(--space-8) 0 var(--space-6);
        }
        .hero-title { font-size: var(--text-3xl); margin-bottom: var(--space-2); color: var(--gray-900); }
        .hero-subtitle { color: var(--gray-500); font-size: var(--text-base); margin-bottom: var(--space-4); }
        .hero-content { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-8); align-items: start; }
        .location-selector { padding: var(--space-4); }
        .location-chips { display: flex; flex-wrap: wrap; gap: var(--space-2); }
        .location-chip {
          padding: 5px 14px;
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 500;
          background: white;
          border: 1.5px solid var(--gray-200);
          color: var(--gray-600);
          transition: all var(--transition-fast);
        }
        .location-chip:hover, .location-chip.active {
          background: var(--primary-600);
          border-color: var(--primary-600);
          color: white;
        }
        .alerts-strip { display: flex; flex-direction: column; gap: var(--space-2); margin-bottom: var(--space-4); }
        .alert-banner {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-lg);
          border: 1.5px solid;
          font-size: var(--text-sm);
        }
        .alert-banner-title { font-weight: 700; font-size: var(--text-sm); }
        .alert-banner-msg { color: var(--gray-700); font-size: var(--text-xs); margin-top: 2px; }
        .alert-banner-loc { font-size: var(--text-xs); color: var(--gray-500); white-space: nowrap; margin-top: 2px; }
        .current-location-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: var(--space-3); margin-top: var(--space-4); color: var(--gray-600); font-size: var(--text-sm); }
        .pollution-cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-4); }
        .pollution-card { background: white; border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); border: 1px solid var(--gray-100); overflow: hidden; }
        .pollution-card-header { padding: var(--space-3) var(--space-4); display: flex; align-items: center; justify-content: space-between; }
        .pollution-card-type { display: flex; align-items: center; gap: var(--space-2); }
        .pollution-card-icon { font-size: 20px; }
        .pollution-card-type-label { font-size: var(--text-sm); font-weight: 700; color: var(--gray-700); text-transform: uppercase; letter-spacing: 0.05em; }
        .pollution-card-body { padding: var(--space-4); }
        .pollution-card-score-row { display: flex; gap: var(--space-3); align-items: flex-start; }
        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 8px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .score-value { font-size: 28px; font-weight: 800; font-family: var(--font-display); line-height: 1; }
        .score-label { font-size: 10px; color: var(--gray-500); }
        .pollution-card-metrics { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .mini-metric { background: var(--gray-50); border-radius: var(--radius-sm); padding: 6px 8px; }
        .mini-metric-label { font-size: 10px; color: var(--gray-500); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; display: block; }
        .mini-metric-value { font-size: 13px; font-weight: 700; color: var(--gray-800); }
        .mini-metric-unit { font-size: 10px; font-weight: 400; color: var(--gray-400); }
        .ranking-row { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) 0; border-bottom: 1px solid var(--gray-50); }
        .ranking-row-link { text-decoration: none; display: block; }
        .ranking-row-link:hover .ranking-row { background: var(--gray-50); border-radius: var(--radius-md); padding-left: 8px; }
        .ranking-num { font-size: var(--text-sm); font-weight: 700; color: var(--gray-400); width: 20px; text-align: center; flex-shrink: 0; }
        .news-card { text-decoration: none; display: block; }
        .news-card-cat-bar { padding: 0; }
        @media (max-width: 1024px) {
          .hero-content { grid-template-columns: 1fr; }
          .pollution-cards-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .dashboard-hero { padding: var(--space-5) 0; }
          .hero-title { font-size: var(--text-2xl); }
          .pollution-cards-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
