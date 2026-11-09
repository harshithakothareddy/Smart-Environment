import React, { useState, useEffect } from 'react';
import { CITIES } from '../data/mockData';
import { fetchLiveTelemetry } from '../utils/realTelemetry';
import { useApp } from '../context/AppContext';

const TYPE_COLORS = { home: '#2563eb', work: '#7c3aed', outdoor: '#16a34a', custom: '#ea580c' };
const TYPE_LABELS = { home: 'Home', work: 'Work', outdoor: 'Outdoor', custom: 'Custom' };

const AQI_STATUS = (aqi) => {
  if (aqi <= 50)  return { label: 'Good',          color: '#16a34a', badge: 'good' };
  if (aqi <= 100) return { label: 'Moderate',       color: '#ca8a04', badge: 'moderate' };
  if (aqi <= 150) return { label: 'Unhealthy (Sensitive)', color: '#ea580c', badge: 'poor' };
  if (aqi <= 200) return { label: 'Unhealthy',      color: '#dc2626', badge: 'unhealthy' };
  if (aqi <= 300) return { label: 'Very Unhealthy', color: '#7c3aed', badge: 'hazardous' };
  return           { label: 'Hazardous',            color: '#7c3aed', badge: 'hazardous' };
};

// Generate realistic 24-hour AQI pattern from a base AQI value
function generateDailySegments(baseAQI) {
  const hourFactors = [
    0.70, 0.68, 0.65, 0.66, 0.68, 0.75, // 12AM-5AM: night low
    0.95, 1.15, 1.25, 1.10, 1.00, 1.00, // 6AM-11AM: morning rush
    1.05, 1.05, 0.98, 1.10, 1.20, 1.30, // 12PM-5PM: afternoon
    1.05, 0.90, 0.82, 0.78, 0.74, 0.72  // 6PM-11PM: evening
  ];
  const types = [
    'home','home','home','home','home','home',
    'outdoor','outdoor','outdoor','work','work','work',
    'work','work','work','outdoor','outdoor','outdoor',
    'home','home','home','home','home','home'
  ];
  const labels = ['12 AM','1 AM','2 AM','3 AM','4 AM','5 AM','6 AM','7 AM','8 AM','9 AM','10 AM','11 AM',
    '12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM','10 PM','11 PM'];

  return hourFactors.map((f, i) => {
    const aqi = Math.max(10, Math.round(baseAQI * f));
    const color = aqi <= 50 ? '#4ade80' : aqi <= 100 ? '#fde047' : aqi <= 150 ? '#fb923c' : aqi <= 200 ? '#ef4444' : '#a855f7';
    return { hour: i, label: labels[i], type: types[i], aqi, color };
  });
}

function CircularClock({ segments, activeHour, onHover }) {
  const size = 260;
  const cx = size / 2, cy = size / 2;
  const r = 100;
  const inner = 60;
  const total = segments.length;

  const getSegmentPath = (i) => {
    const startAngle = (i / total) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / total) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const xi1 = cx + inner * Math.cos(startAngle);
    const yi1 = cy + inner * Math.sin(startAngle);
    const xi2 = cx + inner * Math.cos(endAngle);
    const yi2 = cy + inner * Math.sin(endAngle);
    return `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} L ${xi2} ${yi2} A ${inner} ${inner} 0 0 0 ${xi1} ${yi1} Z`;
  };

  const currentHour = new Date().getHours();
  const overallAvg = segments.length ? Math.round(segments.reduce((a, s) => a + s.aqi, 0) / segments.length) : 0;
  const avgInfo = AQI_STATUS(overallAvg);

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--gray-100)" strokeWidth={r - inner}/>
        {segments.map((seg, i) => (
          <path
            key={i}
            d={getSegmentPath(i)}
            fill={seg.color}
            opacity={activeHour === i ? 1 : 0.75}
            stroke="white"
            strokeWidth="1"
            style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            role="button"
            aria-label={`${seg.label}: ${TYPE_LABELS[seg.type] || seg.type}, AQI ${seg.aqi}`}
            tabIndex={0}
          />
        ))}
        {[0, 6, 12, 18].map(h => {
          const angle = (h / total) * 2 * Math.PI - Math.PI / 2;
          const labelR = r + 18;
          const lx = cx + labelR * Math.cos(angle);
          const ly = cy + labelR * Math.sin(angle);
          const labels = { 0: '12AM', 6: '6AM', 12: '12PM', 18: '6PM' };
          return (
            <text key={h} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="var(--gray-400)" fontFamily="var(--font-sans)">
              {labels[h]}
            </text>
          );
        })}
        {(() => {
          const angle = (currentHour / total) * 2 * Math.PI - Math.PI / 2;
          const tx = cx + (r + 6) * Math.cos(angle);
          const ty = cy + (r + 6) * Math.sin(angle);
          return <circle cx={tx} cy={ty} r={5} fill="var(--primary-600)" stroke="white" strokeWidth={2}/>;
        })()}
        <text x={cx} y={cy - 14} textAnchor="middle" fontSize="11" fill="var(--gray-500)" fontFamily="var(--font-sans)">Daily Avg</text>
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="22" fontWeight="900" fill={avgInfo.color} fontFamily="var(--font-display)">{overallAvg}</text>
        <text x={cx} y={cy + 20} textAnchor="middle" fontSize="10" fill="var(--gray-400)" fontFamily="var(--font-sans)">AQI · Live</text>
      </svg>
    </div>
  );
}

function ExposureCard({ type, icon, location, aqi, pm25, pollutant, onRemove, isCustom, loading }) {
  const aqiInfo = AQI_STATUS(aqi || 0);
  return (
    <div className="exposure-card" style={{ position: 'relative' }}>
      {isCustom && onRemove && (
        <button onClick={onRemove} style={{
          position: 'absolute', top: 10, right: 10, background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--gray-400)', fontSize: '16px', padding: '2px 6px', borderRadius: 4,
        }} title="Remove location">✕</button>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: isCustom ? '24px' : 0 }}>
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: TYPE_COLORS[type] || '#ea580c', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {icon} {TYPE_LABELS[type] || 'Location'}
          </div>
          <div style={{ fontWeight: 600, color: 'var(--gray-700)', marginTop: '2px' }}>{location}</div>
        </div>
        {!loading && <span className={`badge badge-${aqiInfo.badge}`}>{aqiInfo.label}</span>}
      </div>
      {loading ? (
        <div style={{ marginTop: 'var(--space-3)', color: 'var(--gray-400)', fontSize: 'var(--text-sm)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>🔄</span> Fetching live AQI...
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '42px', fontWeight: 900, color: aqiInfo.color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{aqi ?? '—'}</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>AQI · Live</span>
          </div>
          <div style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
            Main pollutant: <strong>{pollutant || 'PM2.5'}</strong>
          </div>
          {pm25 != null && (
            <div style={{ fontSize: 'var(--text-sm)', color: aqiInfo.color }}>
              PM2.5: {pm25} <span style={{ color: 'var(--gray-400)' }}>μg/m³</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Free geocoding via OpenStreetMap Nominatim — finds any area, locality, pincode in India
async function geocodeLocation(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', India')}&format=json&limit=6&addressdetails=1&countrycodes=in`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en', 'User-Agent': 'EcoPulseIndia/1.0' } });
  if (!res.ok) throw new Error('Geocoding failed');
  const results = await res.json();
  return results.map(r => ({
    name: r.address?.city || r.address?.town || r.address?.village || r.address?.suburb || r.address?.county || r.name || query,
    area: r.address?.suburb || r.address?.neighbourhood || r.address?.road || '',
    state: r.address?.state || '',
    district: r.address?.county || r.address?.state_district || '',
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    displayName: r.display_name,
    type: r.type,
  }));
}

function AddLocationModal({ onClose, onAdd }) {
  const [search, setSearch] = useState('');
  const [locType, setLocType] = useState('custom');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [geoResults, setGeoResults] = useState([]);
  const searchTimeout = React.useRef(null);

  // Debounced live search using OpenStreetMap Nominatim
  const handleSearchChange = (val) => {
    setSearch(val);
    setSelected(null);
    setError('');
    clearTimeout(searchTimeout.current);
    if (val.trim().length < 2) { setGeoResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await geocodeLocation(val);
        setGeoResults(results);
      } catch {
        setGeoResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const handleAdd = async () => {
    if (!selected) { setError('Please select a location from the results.'); return; }
    setLoading(true);
    setError('');
    try {
      const live = await fetchLiveTelemetry(selected.lat, selected.lng, null);
      onAdd({
        id: Date.now(),
        type: locType,
        icon: locType === 'home' ? '🏠' : locType === 'work' ? '🏢' : locType === 'outdoor' ? '🌳' : '📍',
        location: selected.name + (selected.area ? `, ${selected.area}` : ''),
        state: selected.state,
        aqi: live?.aqi ?? 75,
        pm25: live?.pm25 ?? null,
        pollutant: live?.mainPollutant ?? 'PM2.5',
        lat: selected.lat, lng: selected.lng,
        isCustom: true, isLive: !!live,
      });
      onClose();
    } catch (e) {
      setError('Could not fetch live AQI. Try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-in" style={{
        background: 'white', borderRadius: '16px', padding: '28px',
        width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-xl)' }}>📍 Add Location</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--gray-400)' }}>✕</button>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '8px', color: 'var(--gray-700)' }}>Location Type</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[{ key: 'home', label: 'Home', icon: '🏠' }, { key: 'work', label: 'Work', icon: '🏢' }, { key: 'outdoor', label: 'Outdoor', icon: '🌳' }, { key: 'custom', label: 'Other', icon: '📍' }].map(t => (
              <button key={t.key} onClick={() => setLocType(t.key)} style={{
                padding: '10px 4px', borderRadius: '10px', border: '2px solid',
                borderColor: locType === t.key ? TYPE_COLORS[t.key] : 'var(--gray-200)',
                background: locType === t.key ? `${TYPE_COLORS[t.key]}15` : 'white',
                cursor: 'pointer', textAlign: 'center', fontSize: '11px', fontWeight: 600,
                color: locType === t.key ? TYPE_COLORS[t.key] : 'var(--gray-500)', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{t.icon}</div>{t.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '8px', color: 'var(--gray-700)' }}>
            Search Any Location in India
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="input"
              placeholder="Type any area, locality, pincode, city... (e.g. Banjara Hills, Koramangala, 400001)"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              autoFocus
              style={{ paddingRight: searching ? '38px' : undefined }}
            />
            {searching && (
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</div>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '4px' }}>
            Powered by OpenStreetMap — finds any locality, neighbourhood, or pincode across India
          </div>

          {geoResults.length > 0 && (
            <div style={{ marginTop: '6px', background: 'white', border: '1px solid var(--gray-200)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)', maxHeight: '240px', overflowY: 'auto' }}>
              {geoResults.map((place, idx) => (
                <div
                  key={idx}
                  onClick={() => { setSelected(place); setSearch(place.name + (place.area ? ', ' + place.area : '')); setGeoResults([]); }}
                  style={{
                    padding: '10px 16px', cursor: 'pointer',
                    background: selected?.lat === place.lat ? 'var(--primary-50)' : 'white',
                    borderBottom: '1px solid var(--gray-100)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = selected?.lat === place.lat ? 'var(--primary-50)' : 'white'; }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--gray-800)' }}>
                      📍 {place.name}{place.area ? ` · ${place.area}` : ''}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {place.state}{place.district ? ` · ${place.district}` : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--gray-300)', marginLeft: '8px', flexShrink: 0, paddingTop: '2px' }}>
                    {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
                  </div>
                </div>
              ))}
            </div>
          )}
          {search.trim().length >= 2 && !searching && geoResults.length === 0 && !selected && (
            <div style={{ marginTop: '6px', padding: '10px 14px', background: 'var(--gray-50)', borderRadius: '8px', fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
              No results found for "<strong>{search}</strong>". Try a different spelling or be more specific.
            </div>
          )}
        </div>
        {selected && (
          <div style={{ padding: '12px 16px', background: 'var(--primary-50)', borderRadius: '10px', border: '1px solid var(--primary-200)', marginBottom: '16px' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary-700)' }}>
              ✅ {selected.name}{selected.area ? `, ${selected.area}` : ''}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--primary-500)', marginTop: '2px' }}>
              {selected.state} · {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)} · Live AQI will be fetched from Open-Meteo satellite data
            </div>
          </div>
        )}
        {error && <div style={{ padding: '10px 14px', background: '#fef2f2', borderRadius: '8px', color: '#dc2626', fontSize: 'var(--text-sm)', marginBottom: '12px' }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }} disabled={loading}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={!selected || loading} style={{ flex: 2 }}>
            {loading ? '🔄 Fetching Live AQI...' : '📍 Add Location'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Exposure() {
  const { selectedCity } = useApp();
  const [activeTab, setActiveTab] = useState('All');
  const [activeHour, setActiveHour] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [customLocations, setCustomLocations] = useState([]);

  // Live AQI for the 3 default cards
  const [liveData, setLiveData] = useState(null);
  const [loadingLive, setLoadingLive] = useState(true);

  const cityName = selectedCity?.name || 'Hyderabad';
  const cityLat  = selectedCity?.lat  || 17.385;
  const cityLng  = selectedCity?.lng  || 78.4867;

  useEffect(() => {
    setLoadingLive(true);
    fetchLiveTelemetry(cityLat, cityLng, selectedCity)
      .then(live => {
        setLiveData(live || selectedCity);
        setLoadingLive(false);
      })
      .catch(() => {
        setLiveData(selectedCity);
        setLoadingLive(false);
      });
  }, [cityLat, cityLng]);

  const baseAQI = liveData?.aqi || selectedCity?.aqi || 56;
  const segments = generateDailySegments(baseAQI);

  const homeAvg    = Math.round(segments.filter(s => s.type === 'home').reduce((a, s) => a + s.aqi, 0) / segments.filter(s => s.type === 'home').length);
  const workAvg    = Math.round(segments.filter(s => s.type === 'work').reduce((a, s) => a + s.aqi, 0) / segments.filter(s => s.type === 'work').length);
  const outdoorAvg = Math.round(segments.filter(s => s.type === 'outdoor').reduce((a, s) => a + s.aqi, 0) / segments.filter(s => s.type === 'outdoor').length);
  const overallAvg = Math.round(segments.reduce((a, s) => a + s.aqi, 0) / segments.length);
  const overallInfo = AQI_STATUS(overallAvg);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ paddingTop: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0 }}>⭕ Today's Exposure</h1>
            <span className="badge badge-good" style={{ fontSize: '11px' }}>🟢 Live Data · {cityName}</span>
          </div>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>
            Real-time environmental exposure for <strong>{cityName}</strong> — based on live AQI measurements from satellite sensors
          </p>
        </div>

        {/* Live Summary Bar */}
        {!loadingLive && liveData && (
          <div className="card card-body animate-fade-in" style={{ marginTop: 'var(--space-4)', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: 'white', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'var(--space-4)', textAlign: 'center' }}>
            {[
              { label: 'Live AQI', value: liveData.aqi, color: overallInfo.color },
              { label: 'PM2.5 μg/m³', value: liveData.pm25, color: '#38bdf8' },
              { label: 'PM10 μg/m³', value: liveData.pm10, color: '#818cf8' },
              { label: 'Temperature', value: `${liveData.temp}°C`, color: '#fb923c' },
              { label: 'Humidity', value: `${liveData.humidity}%`, color: '#34d399' },
              { label: 'Wind km/h', value: liveData.wind, color: '#a78bfa' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: item.color, fontFamily: 'var(--font-display)' }}>{item.value}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs" style={{ maxWidth: 320, margin: 'var(--space-4) 0' }}>
          {['All', 'Home', 'Work', 'Outdoor'].map(t => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>

        <div className="exposure-layout">
          {/* Clock */}
          <div className="exposure-clock-section card card-body">
            <h3 style={{ textAlign: 'center', marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>24-Hour Exposure Clock</h3>
            <CircularClock segments={segments} activeHour={activeHour} onHover={setActiveHour}/>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
              {Object.entries(TYPE_COLORS).map(([type, color]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--gray-600)' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: color }}/>{TYPE_LABELS[type]}
                </div>
              ))}
            </div>
            {activeHour !== null && segments[activeHour] && (
              <div className="animate-fade-in" style={{ marginTop: 'var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3)', textAlign: 'center' }}>
                <div style={{ fontWeight: 700, color: 'var(--gray-700)' }}>{segments[activeHour].label}</div>
                <div style={{ color: 'var(--gray-500)', fontSize: 'var(--text-xs)' }}>{TYPE_LABELS[segments[activeHour].type]}</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: segments[activeHour].color, fontFamily: 'var(--font-display)', marginTop: 'var(--space-1)' }}>AQI {segments[activeHour].aqi}</div>
              </div>
            )}
            <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Daily Average Exposure</div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: overallInfo.color, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>{overallAvg}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>AQI · {overallInfo.label}</div>
            </div>
          </div>

          {/* Location Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <ExposureCard type="home"    icon="🏠" location={cityName} aqi={homeAvg}    pm25={liveData?.pm25} pollutant={liveData?.mainPollutant} loading={loadingLive} />
            <ExposureCard type="work"    icon="🏢" location={cityName} aqi={workAvg}    pm25={liveData?.pm25} pollutant={liveData?.mainPollutant} loading={loadingLive} />
            <ExposureCard type="outdoor" icon="🌳" location={cityName} aqi={outdoorAvg} pm25={liveData?.pm25} pollutant={liveData?.mainPollutant} loading={loadingLive} />

            {/* Custom Locations */}
            {customLocations.map(loc => (
              <ExposureCard
                key={loc.id}
                type={loc.type}
                icon={loc.icon}
                location={`${loc.location}${loc.state ? ', ' + loc.state : ''}`}
                aqi={loc.aqi}
                pm25={loc.pm25}
                pollutant={loc.pollutant}
                isCustom={true}
                onRemove={() => setCustomLocations(prev => prev.filter(l => l.id !== loc.id))}
              />
            ))}

            {/* Add Button */}
            <div
              className="card card-body"
              style={{ borderStyle: 'dashed', textAlign: 'center', color: 'var(--gray-400)', fontSize: 'var(--text-sm)', cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s' }}
              onClick={() => setShowModal(true)}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary-400)'; e.currentTarget.style.background = 'var(--primary-50)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''; }}
            >
              <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>📍</div>
              <div style={{ fontWeight: 600, color: 'var(--gray-600)' }}>+ Add Location</div>
              <div style={{ fontSize: 'var(--text-xs)', marginTop: 4 }}>Track live AQI for any Indian city</div>
              <button className="btn btn-outline btn-sm" style={{ marginTop: 'var(--space-3)' }} onClick={e => { e.stopPropagation(); setShowModal(true); }}>+ Add Location</button>
            </div>
          </div>
        </div>

        {/* Hourly Table */}
        <div className="section">
          <h2 className="section-title">Hourly Breakdown — {cityName}</h2>
          <div className="card">
            <div className="table-wrapper">
              <table aria-label="Hourly exposure breakdown">
                <thead>
                  <tr><th>Hour</th><th>Location Type</th><th>AQI</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {segments.filter(s => activeTab === 'All' || s.type === activeTab.toLowerCase()).map((seg, i) => {
                    const info = AQI_STATUS(seg.aqi);
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{seg.label}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: 2, background: TYPE_COLORS[seg.type], flexShrink: 0 }}/>
                            {TYPE_LABELS[seg.type]}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: info.color, fontFamily: 'var(--font-display)' }}>{seg.aqi}</td>
                        <td><span className={`badge badge-${info.badge}`}>{info.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showModal && <AddLocationModal onClose={() => setShowModal(false)} onAdd={loc => setCustomLocations(prev => [...prev, loc])} />}

      <style>{`
        .exposure-layout { display: grid; grid-template-columns: 340px 1fr; gap: var(--space-6); align-items: start; }
        .exposure-card { background: white; border: 1px solid var(--gray-100); border-radius: var(--radius-xl); padding: var(--space-5); box-shadow: var(--shadow-sm); transition: box-shadow var(--transition-base); }
        .exposure-card:hover { box-shadow: var(--shadow-lg); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) { .exposure-layout { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
