import React, { useState, useEffect, useRef } from 'react';
import { searchIndiaLocations } from '../data/indiaLocations';
import { searchNominatimIndia, findNearestStation } from '../utils/indiaGeoSearch';
import { getStatusFromAQI } from '../data/mockData';

export default function RouteLocationInput({
  label,
  icon = '📍',
  selectedLocation,
  onSelect,
  citiesData = [],
  placeholder = 'Search any city, area, or landmark in India...',
  showGpsButton = false,
}) {
  const [query, setQuery] = useState(selectedLocation?.name || '');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(selectedLocation?.displayName || selectedLocation?.name || '');
  }, [selectedLocation?.name, selectedLocation?.displayName, selectedLocation?.lat, selectedLocation?.lng]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search local + live OSM Photon/Nominatim as user types
  useEffect(() => {
    const q = query.trim();
    if (!open) return;

    if (q.length < 2) {
      // Show top monitoring cities as quick suggestions when empty/short
      const quick = (citiesData || []).slice(0, 6).map((c) => ({
        name: c.name,
        displayName: `${c.name}, ${c.state}`,
        state: c.state,
        type: 'City',
        lat: Number(c.lat),
        lng: Number(c.lng),
        aqi: c.aqi,
      }));
      setResults(quick);
      return;
    }

    // Immediate local matches
    const localCities = (citiesData || [])
      .filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.state.toLowerCase().includes(q.toLowerCase()))
      .slice(0, 4)
      .map((c) => ({
        name: c.name,
        displayName: `${c.name}, ${c.state}`,
        state: c.state,
        type: 'Monitoring City',
        lat: Number(c.lat),
        lng: Number(c.lng),
        aqi: c.aqi,
      }));

    const localPlaces = searchIndiaLocations(q, 5).map((p) => {
      const nearest = findNearestStation(p.lat, p.lng, citiesData);
      return {
        name: p.name,
        displayName: `${p.name}, ${p.state}`,
        state: p.state,
        type: p.type || 'Place',
        lat: Number(p.lat),
        lng: Number(p.lng),
        aqi: nearest.city?.aqi || 85,
      };
    });

    const combinedLocal = [...localCities];
    for (const lp of localPlaces) {
      if (!combinedLocal.some((x) => x.name.toLowerCase() === lp.name.toLowerCase() && x.state === lp.state)) {
        combinedLocal.push(lp);
      }
    }
    setResults(combinedLocal);

    // Debounced live geocoding across all of India
    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const live = await searchNominatimIndia(q, 6);
        if (!cancelled && live.length > 0) {
          const mappedLive = live.map((item) => {
            const nearest = findNearestStation(item.lat, item.lng, citiesData);
            return {
              name: item.name,
              displayName: item.displayName || `${item.name}, ${item.state}`,
              state: item.state,
              type: item.type || 'Location',
              lat: Number(item.lat),
              lng: Number(item.lng),
              aqi: nearest.city?.aqi || 85,
              isLiveGeo: true,
            };
          });
          setResults((prev) => {
            const merged = [...prev];
            for (const m of mappedLive) {
              if (!merged.some((x) => Math.abs(x.lat - m.lat) < 0.01 && Math.abs(x.lng - m.lng) < 0.01)) {
                merged.push(m);
              }
            }
            return merged.slice(0, 10);
          });
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open, citiesData]);

  const handleSelectItem = (item) => {
    setQuery(item.displayName || item.name);
    setOpen(false);
    setGpsError('');
    onSelect({
      name: item.name,
      displayName: item.displayName || `${item.name}, ${item.state}`,
      state: item.state || 'India',
      lat: Number(item.lat),
      lng: Number(item.lng),
      aqi: item.aqi ?? 85,
    });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsError('');
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const nearest = findNearestStation(lat, lng, citiesData);
        const loc = {
          name: 'My Current Location',
          displayName: `My Location (${nearest.city?.name ? `near ${nearest.city.name}` : `${lat.toFixed(3)}, ${lng.toFixed(3)}`})`,
          state: nearest.city?.state || 'India',
          lat,
          lng,
          aqi: nearest.city?.aqi || 85,
        };
        setQuery(loc.displayName);
        setOpen(false);
        setGpsLoading(false);
        onSelect(loc);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(err.code === 1 ? 'Location permission denied.' : 'Unable to detect your location.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const aqiStatus = selectedLocation ? getStatusFromAQI(selectedLocation.aqi || 0) : null;

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '6px' }}>
        <label style={{ fontSize: '11px', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase' }}>
          {icon} {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {showGpsButton && (
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={gpsLoading}
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: '10px',
                border: '1px solid var(--primary-200)',
                background: 'var(--primary-50)',
                color: 'var(--primary-700)',
                cursor: 'pointer',
              }}
              title="Use my current GPS location"
            >
              {gpsLoading ? 'Locating...' : '📡 My Location'}
            </button>
          )}
          {selectedLocation && aqiStatus && (
            <span className={`badge badge-${aqiStatus.className}`} style={{ fontSize: '10px' }}>
              AQI {selectedLocation.aqi || 0}
            </span>
          )}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <input
          type="text"
          className="input"
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          style={{ width: '100%', paddingRight: '28px', fontSize: '13px' }}
          aria-label={label}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setOpen(true);
            }}
            aria-label={`Clear ${label}`}
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              border: 'none',
              background: 'transparent',
              color: 'var(--gray-400)',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px 4px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {gpsError && (
        <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '3px' }}>⚠️ {gpsError}</div>
      )}

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            background: 'white',
            border: '1px solid var(--gray-200)',
            borderRadius: '10px',
            boxShadow: '0 12px 28px rgba(0,0,0,0.14)',
            zIndex: 2000,
            maxHeight: '240px',
            overflowY: 'auto',
          }}
        >
          {searching && (
            <div style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--primary-600)', borderBottom: '1px solid var(--gray-100)' }}>
              🔍 Searching all Indian locations...
            </div>
          )}
          {results.length === 0 ? (
            <div style={{ padding: '10px 12px', fontSize: '12px', color: 'var(--gray-500)' }}>
              Type any city, neighborhood, town, or landmark in India...
            </div>
          ) : (
            results.map((item, idx) => (
              <button
                key={`${item.name}-${item.lat}-${item.lng}-${idx}`}
                type="button"
                onClick={() => handleSelectItem(item)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '8px 10px',
                  border: 'none',
                  borderBottom: idx < results.length - 1 ? '1px solid var(--gray-100)' : 'none',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-50)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'white'; }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--gray-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.displayName}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '6px',
                    background: 'var(--gray-100)',
                    color: 'var(--gray-700)',
                    flexShrink: 0,
                  }}
                >
                  {item.type}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

