import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getStatusFromAQI } from '../data/mockData';
import {
  searchIndiaLocations,
  searchNominatimIndia,
  findNearestStation,
  buildCustomLocation,
  formatLocationBreadcrumb,
} from '../utils/indiaGeoSearch';

const TYPE_ICON = {
  State: '🗺️',
  City: '🏙️',
  Town: '🏘️',
  Village: '🌾',
  District: '📍',
  Area: '🏠',
  'Custom Area': '📌',
  Location: '📌',
  default: '📍',
};

export default function LocationSelector({ onClose }) {
  const { citiesData, selectedCity, setSelectedCity } = useApp();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoResults, setGeoResults] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Instant local results (0ms)
  const localResults = query.trim().length >= 1 ? searchIndiaLocations(query, 12) : [];

  // Debounced live geocoding (OpenStreetMap Nominatim for any village/area/district in India)
  useEffect(() => {
    const q = query.trim();
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
        // Exclude results already matched in localResults by name
        const localNames = new Set(localResults.map((r) => r.name.toLowerCase()));
        const filtered = results.filter((r) => !localNames.has(r.name.toLowerCase()));
        setGeoResults(filtered);
      } catch {
        setGeoResults([]);
      } finally {
        setGeoLoading(false);
      }
    }, 280);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, localResults.length]);

  const handleSelectLocation = (loc) => {
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
    setQuery('');
    setIsOpen(false);
    navigate(
      `/city/${resolvedNearest.name}?from=${encodeURIComponent(loc.name)}&state=${encodeURIComponent(
        loc.state || ''
      )}&type=${encodeURIComponent(loc.type || '')}&lat=${loc.lat}&lng=${loc.lng}`
    );
    if (onClose) onClose();
  };

  const handleSelectCustom = () => {
    if (!query.trim()) return;
    const custom = buildCustomLocation(query, citiesData);
    handleSelectLocation(custom);
  };

  const handleSelectCityDirect = (city) => {
    setSelectedCity(city);
    setQuery('');
    setIsOpen(false);
    navigate(`/city/${city.name}`);
    if (onClose) onClose();
  };

  const displayName = selectedCity?._searchedLocation || selectedCity?.name || 'Select Location';
  const status = getStatusFromAQI(selectedCity?.aqi || 100);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', flex: '0 0 auto' }}>
      {/* Pill Trigger */}
      <button
        id="location-selector-btn"
        className="location-pill-btn"
        onClick={() => {
          setIsOpen((v) => !v);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        aria-label="Select location"
        aria-expanded={isOpen}
      >
        <span style={{ fontSize: '14px' }}>📍</span>
        <span className="location-pill-city" title={displayName}>
          {displayName}
        </span>
        <span className="location-pill-aqi" style={{ background: status.color }}>
          AQI {selectedCity?.aqi || '--'}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
            opacity: 0.5,
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Box */}
      {isOpen && (
        <div className="loc-dropdown animate-fade-in" role="listbox">
          {/* Search Header */}
          <div className="loc-search-wrap">
            {geoLoading ? (
              <div
                style={{
                  width: 14,
                  height: 14,
                  border: '2px solid var(--gray-300)',
                  borderTopColor: 'var(--primary-500)',
                  borderRadius: '50%',
                  animation: 'spin 0.6s linear infinite',
                  flexShrink: 0,
                }}
              />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
            <input
              ref={inputRef}
              id="location-search-input"
              type="text"
              className="loc-search-input"
              placeholder="Type any area, village, town, city, district..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (localResults.length > 0) handleSelectLocation(localResults[0]);
                  else if (geoResults.length > 0) handleSelectLocation(geoResults[0]);
                  else handleSelectCustom();
                }
              }}
              aria-label="Search any location in India"
              autoComplete="off"
            />
            {query && (
              <button className="loc-clear-btn" onClick={() => setQuery('')} aria-label="Clear">
                ✕
              </button>
            )}
          </div>

          {/* ACTIVE SEARCH RESULTS */}
          {query.trim().length >= 1 ? (
            <div className="loc-results">
              {/* Fallback "Use entered place" button — ALWAYS available so no user input is ever rejected! */}
              <button
                className="loc-item loc-item-custom"
                onClick={handleSelectCustom}
                style={{ background: 'var(--primary-50)', borderBottom: '1px solid var(--primary-100)' }}
              >
                <span className="loc-item-icon">✨</span>
                <div className="loc-item-left">
                  <span className="loc-item-name" style={{ color: 'var(--primary-700)', fontWeight: 700 }}>
                    Select "{query.trim()}"
                  </span>
                  <span className="loc-item-state">Select this exact place across India · Instant telemetry</span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--primary-600)', fontWeight: 600 }}>Select →</span>
              </button>

              {/* LOCAL DATABASE MATCHES */}
              {localResults.map((loc, i) => {
                const { city: nearest, distanceKm } = findNearestStation(loc.lat, loc.lng, citiesData);
                const s = getStatusFromAQI(nearest?.aqi || 100);
                return (
                  <button
                    key={`local-${loc.name}-${i}`}
                    className="loc-item"
                    onClick={() => handleSelectLocation(loc)}
                  >
                    <span className="loc-item-icon">{TYPE_ICON[loc.type] || TYPE_ICON.default}</span>
                    <div className="loc-item-left">
                      <span className="loc-item-name">{loc.name}</span>
                      <span className="loc-item-state">
                        <span className="loc-breadcrumb">
                          <span className="loc-bc-type">{loc.type}</span>
                          {loc.district && <><span className="loc-bc-sep">›</span><span className="loc-bc-district">{loc.district}</span></>}
                          <span className="loc-bc-sep">›</span>
                          <span className="loc-bc-state">{loc.state}</span>
                        </span>
                        {distanceKm > 0 && <span className="loc-bc-dist"> · ~{distanceKm}km from {nearest?.name}</span>}
                      </span>
                    </div>
                    <div className="loc-item-right">
                      <span className="loc-aqi-badge" style={{ background: s.color }}>
                        {nearest?.aqi || '--'}
                      </span>
                      <span className="loc-status-label" style={{ color: s.color }}>
                        {s.label}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* LIVE OPENSTREETMAP GEOCODED MATCHES */}
              {geoResults.length > 0 && (
                <>
                  <div
                    style={{
                      padding: '6px 14px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: 'var(--gray-400)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: 'var(--gray-50)',
                    }}
                  >
                    Live OpenStreetMap Places
                  </div>
                  {geoResults.map((loc, i) => {
                    const { city: nearest, distanceKm } = findNearestStation(loc.lat, loc.lng, citiesData);
                    const s = getStatusFromAQI(nearest?.aqi || 100);
                    return (
                      <button
                        key={`geo-${loc.name}-${i}`}
                        className="loc-item"
                        onClick={() => handleSelectLocation(loc)}
                      >
                        <span className="loc-item-icon">{TYPE_ICON[loc.type] || '📍'}</span>
                        <div className="loc-item-left">
                          <span className="loc-item-name">{loc.name}</span>
                          <span className="loc-item-state">
                            <span className="loc-breadcrumb">
                              <span className="loc-bc-type">{loc.type}</span>
                              {loc.district && <><span className="loc-bc-sep">›</span><span className="loc-bc-district">{loc.district}</span></>}
                              <span className="loc-bc-sep">›</span>
                              <span className="loc-bc-state">{loc.state}</span>
                            </span>
                            {distanceKm > 0 && <span className="loc-bc-dist"> · ~{distanceKm}km from {nearest?.name}</span>}
                          </span>
                        </div>
                        <div className="loc-item-right">
                          <span className="loc-aqi-badge" style={{ background: s.color }}>
                            {nearest?.aqi || '--'}
                          </span>
                          <span className="loc-status-label" style={{ color: s.color }}>
                            {s.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          ) : (
            /* DEFAULT VIEW: ALL MONITORING CITIES */
            <>
              <div className="loc-section-label">Monitoring Stations Across India</div>
              <div className="loc-results">
                {citiesData.map((city) => {
                  const s = getStatusFromAQI(city.aqi);
                  const isSel = selectedCity?.name === city.name && !selectedCity?._searchedLocation;
                  return (
                    <button
                      key={city.id}
                      className={`loc-item ${isSel ? 'selected' : ''}`}
                      onClick={() => handleSelectCityDirect(city)}
                    >
                      <span className="loc-item-icon">🏙️</span>
                      <div className="loc-item-left">
                        <span className="loc-item-name">{city.name}</span>
                        <span className="loc-item-state">{city.state}</span>
                      </div>
                      <div className="loc-item-right">
                        <span className="loc-aqi-badge" style={{ background: s.color }}>
                          {city.aqi}
                        </span>
                        <span className="loc-status-label" style={{ color: s.color }}>
                          {s.label}
                        </span>
                      </div>
                      {isSel && <span className="loc-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer Info */}
          <div className="loc-footer">
            {query.trim().length >= 1
              ? `⚡ Shows every area, place, district & town in India · Press Enter to select`
              : `🏙️ Type any place in India to view environmental telemetry`}
          </div>
        </div>
      )}

      <style>{`
        .location-pill-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 5px 10px 5px 8px;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--gray-200);
          background: white; cursor: pointer;
          font-size: 13px; font-weight: 600; color: var(--gray-700);
          transition: all 0.15s; white-space: nowrap;
          box-shadow: var(--shadow-xs);
        }
        .location-pill-btn:hover {
          border-color: var(--primary-300); background: var(--primary-50);
          color: var(--primary-700); box-shadow: var(--shadow-sm);
        }
        .location-pill-city { max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
        .location-pill-aqi {
          color: white; font-size: 10px; font-weight: 800;
          padding: 2px 6px; border-radius: var(--radius-full);
          font-family: var(--font-display);
        }
        .loc-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          width: 380px; background: white;
          border: 1px solid var(--gray-200); border-radius: var(--radius-xl);
          box-shadow: 0 16px 48px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1);
          z-index: 9999; overflow: hidden;
        }
        .loc-search-wrap {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 14px; border-bottom: 1px solid var(--gray-100);
          background: var(--gray-50);
        }
        .loc-search-wrap svg { color: var(--gray-400); flex-shrink: 0; }
        .loc-search-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-size: 13px; color: var(--gray-800); font-family: var(--font-body);
        }
        .loc-search-input::placeholder { color: var(--gray-400); }
        .loc-clear-btn {
          background: none; border: none; cursor: pointer;
          color: var(--gray-400); font-size: 14px; line-height: 1;
          padding: 2px 4px; border-radius: 4px;
        }
        .loc-clear-btn:hover { color: var(--gray-700); background: var(--gray-200); }
        .loc-section-label {
          padding: 8px 14px 4px; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.05em; color: var(--gray-400);
        }
        .loc-results { max-height: 320px; overflow-y: auto; }
        .loc-item {
          width: 100%; display: flex; align-items: center; gap: 10px;
          padding: 9px 14px; border: none; background: none;
          cursor: pointer; text-align: left; transition: background 0.12s;
          border-bottom: 1px solid var(--gray-50);
        }
        .loc-item:hover { background: var(--primary-50); }
        .loc-item.selected { background: var(--primary-50); }
        .loc-item-icon { font-size: 16px; flex-shrink: 0; line-height: 1; }
        .loc-item-left { flex: 1; min-width: 0; }
        .loc-item-name {
          display: block; font-size: 13px; font-weight: 600;
          color: var(--gray-800); line-height: 1.3;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .loc-item-state {
          display: block; font-size: 11px; color: var(--gray-400);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .loc-breadcrumb { display: inline-flex; align-items: center; gap: 3px; flex-wrap: nowrap; overflow: hidden; }
        .loc-bc-type { font-size: 10px; font-weight: 700; color: var(--primary-500); text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap; }
        .loc-bc-sep { font-size: 10px; color: var(--gray-300); flex-shrink: 0; }
        .loc-bc-district { font-size: 11px; font-weight: 600; color: var(--gray-600); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px; }
        .loc-bc-state { font-size: 11px; color: var(--gray-500); white-space: nowrap; }
        .loc-bc-dist { font-size: 10px; color: var(--gray-400); }
        .loc-item-right {
          display: flex; flex-direction: column; align-items: flex-end;
          gap: 2px; flex-shrink: 0;
        }
        .loc-aqi-badge {
          color: white; font-size: 11px; font-weight: 800;
          padding: 2px 7px; border-radius: var(--radius-full);
          font-family: var(--font-display); line-height: 1.2;
        }
        .loc-status-label { font-size: 9px; font-weight: 600; }
        .loc-check { color: var(--primary-600); font-weight: 800; font-size: 14px; }
        .loc-footer {
          padding: 7px 14px; font-size: 11px; color: var(--gray-500);
          background: var(--gray-50); border-top: 1px solid var(--gray-100);
          line-height: 1.3;
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
