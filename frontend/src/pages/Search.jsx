import React, { useState, useEffect, useRef } from 'react';
import { CITIES, ALL_INDIAN_STATES, PRODUCTS, NEWS, getStatusFromAQI, getStatusFromWQI } from '../data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { searchIndiaLocations, searchNominatimIndia, findNearestStation, buildCustomLocation } from '../utils/indiaGeoSearch';

export default function Search() {
  const [query, setQuery] = useState(new URLSearchParams(window.location.search).get('q') || '');
  const [activeFilter, setActiveFilter] = useState('All');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoResults, setGeoResults] = useState([]);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  const q = query.toLowerCase().trim();

  // Instant local results from India locations database
  const locResults     = q ? searchIndiaLocations(q, 15) : [];
  const cityResults    = q ? CITIES.filter(c => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)) : [];
  const stateResults   = q ? ALL_INDIAN_STATES.filter(s => s.name.toLowerCase().includes(q)) : [];
  const productResults = q ? PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) : [];
  const newsResults    = q ? NEWS.filter(n => n.title.toLowerCase().includes(q) || n.location.toLowerCase().includes(q)) : [];

  // Live OpenStreetMap Nominatim geocoding across India
  useEffect(() => {
    if (q.length < 2) {
      setGeoResults([]);
      setGeoLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setGeoLoading(true);
      try {
        const results = await searchNominatimIndia(query.trim(), 6);
        const localNames = new Set(locResults.map(r => r.name.toLowerCase()));
        setGeoResults(results.filter(r => !localNames.has(r.name.toLowerCase())));
      } catch {
        setGeoResults([]);
      } finally {
        setGeoLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, locResults.length]);

  const totalPlaces = locResults.length + geoResults.length;
  const hasResults = totalPlaces + cityResults.length + stateResults.length + productResults.length + newsResults.length > 0;

  // Custom fallback location for ANY query
  const customLocation = q ? buildCustomLocation(query.trim(), CITIES) : null;
  const customNearest = customLocation ? (customLocation.nearest || CITIES[0]) : null;
  const customAirStatus = customNearest ? getStatusFromAQI(customNearest.aqi) : null;
  const customWaterStatus = customNearest ? getStatusFromWQI(customNearest.waterWQI) : null;

  const FILTERS = [
    'All',
    `Places (${totalPlaces})`,
    `Cities (${cityResults.length})`,
    `States (${stateResults.length})`,
    `Products (${productResults.length})`,
    `News (${newsResults.length})`
  ];
  const filterKey = activeFilter.split(' ')[0].toLowerCase();

  const handleCustomGo = () => {
    if (!customLocation) return;
    navigate(`/city/${customNearest.name}?from=${encodeURIComponent(customLocation.name)}&state=${encodeURIComponent(customLocation.state)}&type=${encodeURIComponent(customLocation.type)}&lat=${customLocation.lat}&lng=${customLocation.lng}`);
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ paddingTop: 'var(--space-6)', maxWidth: 640 }}>
          <h1 style={{ marginBottom: 'var(--space-2)' }}>🔍 Search Any Area in India</h1>
          <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>
            Check real-time air and water pollution telemetry for any locality, town, district, or city.
          </p>

          <form onSubmit={e => { e.preventDefault(); if (locResults[0]) { const { city: nearest } = findNearestStation(locResults[0].lat, locResults[0].lng, CITIES); navigate(`/city/${nearest?.name || 'Delhi'}?from=${encodeURIComponent(locResults[0].name)}&state=${encodeURIComponent(locResults[0].state || '')}`); } else if (customLocation) { handleCustomGo(); } }}>
            <div className="input-group" style={{ position: 'relative' }}>
              {geoLoading ? (
                <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, border: '2px solid var(--gray-300)', borderTopColor: 'var(--primary-600)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              ) : (
                <svg className="input-icon input-icon-left" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              )}
              <input
                className="input with-icon-left"
                style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-4) var(--space-4) var(--space-4) 48px', borderRadius: 'var(--radius-xl)' }}
                type="search"
                placeholder="Search any area, village, town, district, city..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
                aria-label="Search any location in India"
              />
            </div>
          </form>
        </div>

        {q && (
          <>
            {/* Quick Check Card for ANY area searched */}
            <div className="card card-body" style={{ marginTop: 'var(--space-4)', background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)', border: '1.5px solid #a7f3d0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '20px' }}>📍</span>
                    <strong style={{ fontSize: 'var(--text-base)', color: 'var(--gray-900)' }}>
                      Check Telemetry for "{query.trim()}"
                    </strong>
                    <span className="badge badge-success" style={{ fontSize: '10px' }}>Instant Check</span>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-600)', marginTop: 4 }}>
                    Station: <strong>{customNearest?.name}</strong> ({customLocation?.distanceKm > 0 ? `~${customLocation.distanceKm}km away` : 'Direct'}) · Region: {customLocation?.state}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ textAlign: 'center', background: 'white', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Air AQI</div>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: customAirStatus?.color }}>{customNearest?.aqi}</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'white', padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                    <div style={{ fontSize: '10px', color: 'var(--gray-500)', textTransform: 'uppercase' }}>Water WQI</div>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: customWaterStatus?.color }}>{customNearest?.waterWQI}</div>
                  </div>
                  <button onClick={handleCustomGo} className="btn btn-primary btn-sm">
                    View Pollution Details →
                  </button>
                </div>
              </div>
            </div>

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', margin: 'var(--space-4) 0' }}>
              {FILTERS.map(f => (
                <button key={f} className={`filter-pill ${activeFilter === f.split(' ')[0] || (f === 'All' && activeFilter === 'All') ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f === 'All' ? 'All' : f.split(' ')[0])}
                >{f}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {/* Places, Districts & Localities in India (Local + Live Geocoded) */}
              {(locResults.length > 0 || geoResults.length > 0) && (filterKey === 'all' || filterKey === 'places') && (
                <section>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>
                    📍 Places, Areas &amp; Districts in India ({totalPlaces})
                  </h2>
                  <div className="grid-3">
                    {/* Local DB matches */}
                    {locResults.map((loc, i) => {
                      const { city: nearest, distanceKm } = findNearestStation(loc.lat, loc.lng, CITIES);
                      const resolvedNearest = nearest || CITIES[0];
                      const s = getStatusFromAQI(resolvedNearest.aqi || 100);
                      const w = getStatusFromWQI(resolvedNearest.waterWQI || 60);
                      return (
                        <Link key={`loc-${loc.name}-${i}`} to={`/city/${resolvedNearest.name}?from=${encodeURIComponent(loc.name)}&state=${encodeURIComponent(loc.state || '')}&type=${encodeURIComponent(loc.type || '')}&lat=${loc.lat}&lng=${loc.lng}`} className="card card-body" style={{ textDecoration: 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{loc.name}</div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{loc.type} · {loc.state}</div>
                              {distanceKm > 0 && <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: 2 }}>~{distanceKm}km from {resolvedNearest.name} station</div>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 900, fontSize: 'var(--text-xl)', color: s.color, fontFamily: 'var(--font-display)' }}>{resolvedNearest.aqi}</div>
                              <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>AQI</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', alignItems: 'center' }}>
                            <span className={`badge badge-${s.className}`}>{s.label}</span>
                            <span style={{ fontSize: '11px', color: w.color, fontWeight: 600 }}>💧 Water WQI {resolvedNearest.waterWQI}</span>
                          </div>
                        </Link>
                      );
                    })}

                    {/* Live OSM Nominatim matches */}
                    {geoResults.map((loc, i) => {
                      const { city: nearest, distanceKm } = findNearestStation(loc.lat, loc.lng, CITIES);
                      const resolvedNearest = nearest || CITIES[0];
                      const s = getStatusFromAQI(resolvedNearest.aqi || 100);
                      const w = getStatusFromWQI(resolvedNearest.waterWQI || 60);
                      return (
                        <Link key={`geo-${loc.name}-${i}`} to={`/city/${resolvedNearest.name}?from=${encodeURIComponent(loc.name)}&state=${encodeURIComponent(loc.state || '')}&type=${encodeURIComponent(loc.type || '')}&lat=${loc.lat}&lng=${loc.lng}`} className="card card-body" style={{ textDecoration: 'none', borderLeft: '3px solid var(--primary-500)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <span style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{loc.name}</span>
                                <span className="badge" style={{ fontSize: '9px', background: '#dbeafe', color: '#1d4ed8' }}>Live Geo</span>
                              </div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{loc.type} · {loc.state}</div>
                              {distanceKm > 0 && <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: 2 }}>~{distanceKm}km from {resolvedNearest.name} station</div>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 900, fontSize: 'var(--text-xl)', color: s.color, fontFamily: 'var(--font-display)' }}>{resolvedNearest.aqi}</div>
                              <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>AQI</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', alignItems: 'center' }}>
                            <span className={`badge badge-${s.className}`}>{s.label}</span>
                            <span style={{ fontSize: '11px', color: w.color, fontWeight: 600 }}>💧 Water WQI {resolvedNearest.waterWQI}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Cities */}
              {cityResults.length > 0 && (filterKey === 'all' || filterKey === 'cities') && (
                <section>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>🏙️ Cities ({cityResults.length})</h2>
                  <div className="grid-3">
                    {cityResults.map(city => {
                      const s = getStatusFromAQI(city.aqi);
                      const w = getStatusFromWQI(city.waterWQI);
                      return (
                        <Link key={city.id} to={`/city/${city.name}`} className="card card-body" style={{ textDecoration: 'none' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{city.name}</div>
                              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)' }}>{city.state}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 900, fontSize: 'var(--text-xl)', color: s.color, fontFamily: 'var(--font-display)' }}>{city.aqi}</div>
                              <div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>AQI</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', alignItems: 'center' }}>
                            <span className={`badge badge-${s.className}`}>{s.label}</span>
                            <span style={{ fontSize: '11px', color: w.color, fontWeight: 600 }}>💧 Water {city.waterWQI}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* States */}
              {stateResults.length > 0 && (filterKey === 'all' || filterKey === 'states') && (
                <section>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>🗺️ States ({stateResults.length})</h2>
                  <div className="grid-3">
                    {stateResults.map(state => {
                      const s = getStatusFromAQI(state.airAQI);
                      return (
                        <Link key={state.id} to={`/state/${state.name}`} className="card card-body" style={{ textDecoration: 'none' }}>
                          <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{state.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 2 }}>Capital: {state.capital}</div>
                          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                            <div><div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>Air AQI</div><div style={{ fontWeight: 800, color: s.color }}>{state.airAQI}</div></div>
                            <div><div style={{ fontSize: '10px', color: 'var(--gray-400)' }}>Water WQI</div><div style={{ fontWeight: 800, color: 'var(--primary-600)' }}>{state.waterQuality}</div></div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Products */}
              {productResults.length > 0 && (filterKey === 'all' || filterKey === 'products') && (
                <section>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>🛒 Products ({productResults.length})</h2>
                  <div className="grid-3">
                    {productResults.map(p => (
                      <Link key={p.id} to={`/shop/product/${p.id}`} className="card card-body" style={{ textDecoration: 'none' }}>
                        <div style={{ fontWeight: 700, color: 'var(--gray-800)' }}>{p.name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', margin: '4px 0 var(--space-2)' }}>{p.category}</div>
                        <div style={{ fontWeight: 800, color: 'var(--primary-600)', fontFamily: 'var(--font-display)' }}>₹{p.price.toLocaleString('en-IN')}</div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* News */}
              {newsResults.length > 0 && (filterKey === 'all' || filterKey === 'news') && (
                <section>
                  <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-3)' }}>📰 News ({newsResults.length})</h2>
                  {newsResults.map(n => (
                    <div key={n.id} className="card card-body" style={{ marginBottom: 'var(--space-3)' }}>
                      <span className="badge badge-moderate" style={{ fontSize: '10px', marginBottom: 'var(--space-2)' }}>{n.category}</span>
                      <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>{n.title}</h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginTop: 4 }}>{n.description}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 4 }}>📍 {n.location} · {n.date}</p>
                    </div>
                  ))}
                </section>
              )}
            </div>
          </>
        )}

        {!q && (
          <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--gray-400)' }}>
            <div style={{ fontSize: 64 }}>🔍</div>
            <h3 style={{ color: 'var(--gray-600)', marginTop: 'var(--space-4)' }}>Search Any Area in India</h3>
            <p style={{ marginTop: 'var(--space-2)' }}>Try: Koramangala, Connaught Place, Andheri, Wagholi, Whitefield, Varanasi...</p>
          </div>
        )}
      </div>

      <style>{`
        .filter-pill { padding: 5px 14px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: 600; background: white; border: 1.5px solid var(--gray-200); color: var(--gray-600); transition: all var(--transition-fast); }
        .filter-pill.active { background: var(--primary-600); border-color: var(--primary-600); color: white; }
      `}</style>
    </div>
  );
}
