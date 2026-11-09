import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext';
import {
  CITIES,
  WATER_BODIES,
  calculateSafeRoute,
  getStatusFromAQI,
  getStatusFromWQI
} from '../data/mockData';
import { fetchRoadRoutes } from '../utils/routeAnalyzer';

// Custom Map Controller to center map programmatically
function MapRecenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || 6, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

// Custom Marker Generator with CSS Badges
const createAqiIcon = (aqi, label) => {
  const status = getStatusFromAQI(aqi);
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${status.color};
        color: white;
        padding: 3px 7px;
        border-radius: 12px;
        font-weight: 800;
        font-size: 11px;
        font-family: var(--font-display, sans-serif);
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 3px;
      ">
        <span style="width: 6px; height: 6px; border-radius: 50%; background: white;"></span>
        ${aqi}
      </div>
    `,
    iconSize: [45, 24],
    iconAnchor: [22, 12]
  });
};

const createAlertIcon = (severity) => {
  const colors = { Critical: '#dc2626', High: '#ea580c', Medium: '#ca8a04', Low: '#16a34a' };
  const color = colors[severity] || '#dc2626';
  return L.divIcon({
    className: 'custom-alert-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        border: 2.5px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        animation: pulse 1.5s infinite;
      ">
        ⚠️
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const createReportIcon = (category) => {
  const icon = category === 'Air' ? '🌬️' : '💧';
  const color = category === 'Air' ? '#2563eb' : '#0ea5e9';
  return L.divIcon({
    className: 'custom-report-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      ">
        ${icon}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const ROUTE_PRESETS = [
  { origin: 'Delhi', dest: 'Jaipur', label: 'Delhi ➔ Jaipur' },
  { origin: 'Mumbai', dest: 'Pune', label: 'Mumbai ➔ Pune' },
  { origin: 'Bengaluru', dest: 'Chennai', label: 'Bengaluru ➔ Chennai' },
  { origin: 'Hyderabad', dest: 'Bengaluru', label: 'Hyderabad ➔ Bengaluru' },
  { origin: 'Delhi', dest: 'Kanpur', label: 'Delhi ➔ Kanpur' },
  { origin: 'Kolkata', dest: 'Bhubaneswar', label: 'Kolkata ➔ Bhubaneswar' },
];

export default function IndiaMap() {
  const { citizenReports, alerts, citiesData } = useApp();
  const [searchParams] = useSearchParams();

  // Map Filter Layers
  const [showAir, setShowAir] = useState(true);
  const [showWater, setShowWater] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showReports, setShowReports] = useState(true);

  // Safe Route Navigation State
  const [isRoutingActive, setIsRoutingActive] = useState(true);
  const [originCityName, setOriginCityName] = useState('Delhi');
  const [destCityName, setDestCityName] = useState('Jaipur');
  const [selectedRouteKey, setSelectedRouteKey] = useState('lower_pollution'); // 'lower_pollution' or 'normal'
  const [roadRouteData, setRoadRouteData] = useState(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Map Center
  const [mapCenter, setMapCenter] = useState([22.5, 79.5]);
  const [mapZoom, setMapZoom] = useState(5);

  // Check URL params for focusing on specific coords (e.g. from report click)
  useEffect(() => {
    const latParam = searchParams.get('lat');
    const lngParam = searchParams.get('lng');
    if (latParam && lngParam) {
      setMapCenter([parseFloat(latParam), parseFloat(lngParam)]);
      setMapZoom(11);
    }
  }, [searchParams]);

  // Filter valid cities with coordinates
  const validCities = useMemo(() => {
    return (citiesData || []).filter(c => c && Number.isFinite(Number(c.lat)) && Number.isFinite(Number(c.lng)));
  }, [citiesData]);

  // Cities selection
  const originCity = useMemo(() => {
    if (!validCities.length) return null;
    return validCities.find(c => c.name === originCityName) || validCities[0];
  }, [validCities, originCityName]);

  const destCity = useMemo(() => {
    if (!validCities.length) return null;
    return validCities.find(c => c.name === destCityName) || validCities[7] || validCities[1] || validCities[0];
  }, [validCities, destCityName]);

  // Fetch real road routes and analyze ambient pollution levels along waypoints
  useEffect(() => {
    let isCancelled = false;

    async function loadRoadRoutes() {
      if (!originCity || !destCity || originCity.name === destCity.name) {
        setRoadRouteData(null);
        return;
      }

      setIsCalculatingRoute(true);
      try {
        const result = await fetchRoadRoutes(originCity, destCity, validCities);
        if (!isCancelled && result) {
          setRoadRouteData(result);
          if (result.lowerPollutionRoute) {
            setSelectedRouteKey('lower_pollution');
          } else {
            setSelectedRouteKey('normal');
          }
        }
      } catch (err) {
        console.error('Error fetching pollution-aware road routes:', err);
      } finally {
        if (!isCancelled) {
          setIsCalculatingRoute(false);
        }
      }
    }

    loadRoadRoutes();

    return () => {
      isCancelled = true;
    };
  }, [originCity, destCity, validCities]);

  // Auto-center when road route changes
  useEffect(() => {
    if (roadRouteData && isRoutingActive) {
      const activeRoute =
        selectedRouteKey === 'lower_pollution' && roadRouteData.lowerPollutionRoute
          ? roadRouteData.lowerPollutionRoute
          : roadRouteData.normalRoute;

      if (activeRoute && activeRoute.waypoints && activeRoute.waypoints.length > 0) {
        const midIdx = Math.floor(activeRoute.waypoints.length / 2);
        const midPoint = activeRoute.waypoints[midIdx];
        if (midPoint && Number.isFinite(midPoint[0]) && Number.isFinite(midPoint[1])) {
          setMapCenter([midPoint[0], midPoint[1]]);
          setMapZoom(7);
        }
      }
    }
  }, [roadRouteData, selectedRouteKey, isRoutingActive]);

  return (
    <div className="page-wrapper" style={{ paddingBottom: 'var(--space-10)' }}>
      <div className="container">
        {/* Page Title & Navigation Header */}
        <div style={{ paddingTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="badge badge-moderate" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                🗺️ Real-Time Geo Spatial Platform
              </span>
            </div>
            <h1 style={{ fontSize: 'var(--text-3xl)', marginTop: 'var(--space-1)' }}>
              Interactive India Pollution Map &amp; Safe Route Navigator
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>
              Explore real-time air and water pollution markers, citizen reported hazards, and calculate clean air routes between Indian cities.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Link to="/report" className="btn btn-primary btn-sm">
              📢 Report Pollution Hazard
            </Link>
            <Link to="/alerts" className="btn btn-secondary btn-sm">
              🔔 View All Alerts ({alerts.filter(a => a.active).length})
            </Link>
          </div>
        </div>

        {/* Map Control Toolbar & Layer Toggles */}
        <div className="card card-body" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gray-700)', textTransform: 'uppercase' }}>
                Map Layers:
              </span>
              <button
                className={`filter-pill ${showAir ? 'active' : ''}`}
                onClick={() => setShowAir(!showAir)}
              >
                🌬️ Cities Air AQI ({citiesData.length})
              </button>
              <button
                className={`filter-pill ${showWater ? 'active' : ''}`}
                onClick={() => setShowWater(!showWater)}
              >
                💧 Water Bodies ({WATER_BODIES.length})
              </button>
              <button
                className={`filter-pill ${showAlerts ? 'active' : ''}`}
                onClick={() => setShowAlerts(!showAlerts)}
                style={{ borderColor: showAlerts ? '#dc2626' : 'var(--gray-200)', color: showAlerts ? 'white' : 'var(--gray-700)', background: showAlerts ? '#dc2626' : 'white' }}
              >
                ⚠️ Live Alerts ({alerts.filter(a => a.active).length})
              </button>
              <button
                className={`filter-pill ${showReports ? 'active' : ''}`}
                onClick={() => setShowReports(!showReports)}
              >
                📢 Citizen Reports ({citizenReports.length})
              </button>
            </div>

            <div>
              <button
                className={`btn btn-sm ${isRoutingActive ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setIsRoutingActive(!isRoutingActive)}
              >
                🚗 {isRoutingActive ? 'Hide Safe Route Panel' : 'Open Safe Route Planner'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Layout: Safe Route Panel + Leaflet Map */}
        <div className="map-page-layout">
          {/* LEFT SIDEBAR: POLLUTION-AWARE ROUTE PLANNER */}
          {isRoutingActive && (
            <div className="safe-route-sidebar card card-body animate-slide-up">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <h3 style={{ fontSize: 'var(--text-base)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span>🛣️</span> Pollution-Aware Route
                </h3>
                <span className="badge badge-good" style={{ fontSize: '10px' }}>
                  Real Road Analysis
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>
                Select a start location and destination to map real road routes and analyze ambient pollution levels along the corridor.
              </p>

              {/* Quick Presets */}
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <span style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Popular Inter-City Corridors:
                </span>
                <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginTop: 'var(--space-1)' }}>
                  {ROUTE_PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      className="filter-pill"
                      style={{ fontSize: '10px', padding: '3px 8px' }}
                      onClick={() => {
                        setOriginCityName(preset.origin);
                        setDestCityName(preset.dest);
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Location & Destination Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase' }}>
                      📍 Start Location
                    </label>
                    {originCity && (
                      <span className={`badge badge-${getStatusFromAQI(originCity.aqi || 0).className}`} style={{ fontSize: '10px' }}>
                        AQI {originCity.aqi || 0}
                      </span>
                    )}
                  </div>
                  <select
                    className="input"
                    value={originCityName}
                    onChange={e => setOriginCityName(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {validCities.map(c => (
                      <option key={`orig-${c.id || c._id || c.name}`} value={c.name}>
                        {c.name} ({c.state}) — AQI {c.aqi || 0}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ textAlign: 'center', margin: '-4px 0' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: '12px' }}
                    onClick={() => {
                      const temp = originCityName;
                      setOriginCityName(destCityName);
                      setDestCityName(temp);
                    }}
                    title="Swap Start Location and Destination"
                  >
                    ⇅ Swap Start &amp; Destination
                  </button>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--gray-600)', fontWeight: 700, textTransform: 'uppercase' }}>
                      🎯 Destination
                    </label>
                    {destCity && (
                      <span className={`badge badge-${getStatusFromAQI(destCity.aqi || 0).className}`} style={{ fontSize: '10px' }}>
                        AQI {destCity.aqi || 0}
                      </span>
                    )}
                  </div>
                  <select
                    className="input"
                    value={destCityName}
                    onChange={e => setDestCityName(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {validCities.map(c => (
                      <option key={`dest-${c.id || c._id || c.name}`} value={c.name}>
                        {c.name} ({c.state}) — AQI {c.aqi || 0}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Loading State */}
              {isCalculatingRoute && (
                <div style={{ padding: '12px 14px', background: 'var(--primary-50)', border: '1px solid var(--primary-200)', borderRadius: '8px', fontSize: '12px', color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div>
                  <span>Analyzing road route &amp; ambient pollution data...</span>
                </div>
              )}

              {/* Route Results Display */}
              {roadRouteData && !isCalculatingRoute && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {/* LOWER POLLUTION ALTERNATIVE (IF AVAILABLE) */}
                    {roadRouteData.lowerPollutionRoute && (
                      <div
                        onClick={() => setSelectedRouteKey('lower_pollution')}
                        style={{
                          border: `2px solid ${selectedRouteKey === 'lower_pollution' ? '#10b981' : 'var(--gray-200)'}`,
                          background: selectedRouteKey === 'lower_pollution' ? '#ecfdf5' : 'white',
                          borderRadius: 'var(--radius-lg)',
                          padding: 'var(--space-3)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          boxShadow: selectedRouteKey === 'lower_pollution' ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: '#047857', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🌱 Lower Pollution Route
                          </span>
                          {roadRouteData.lowerPollutionRoute.reductionPct > 0 ? (
                            <span className="badge badge-good" style={{ fontSize: '10px' }}>
                              ~{roadRouteData.lowerPollutionRoute.reductionPct}% Lower Exposure
                            </span>
                          ) : (
                            <span className="badge badge-good" style={{ fontSize: '10px' }}>
                              Cleaner Corridor
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>
                          <span>Distance: <strong>{roadRouteData.lowerPollutionRoute.distanceText}</strong></span>
                          <span>Est. Time: <strong>{roadRouteData.lowerPollutionRoute.durationText}</strong></span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)', paddingTop: '6px', borderTop: '1px solid #d1fae5' }}>
                          <span style={{ fontSize: '11px', color: 'var(--gray-600)' }}>Pollution Level along Route:</span>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '11px',
                            color: roadRouteData.lowerPollutionRoute.pollution.color,
                            background: roadRouteData.lowerPollutionRoute.pollution.bg,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: `1px solid ${roadRouteData.lowerPollutionRoute.pollution.border}`
                          }}>
                            AQI {roadRouteData.lowerPollutionRoute.pollution.avgAQI} ({roadRouteData.lowerPollutionRoute.pollution.label})
                          </span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--gray-500)', marginTop: '4px' }}>
                          {roadRouteData.lowerPollutionRoute.description}
                        </div>
                      </div>
                    )}

                    {/* NORMAL ROUTE */}
                    {roadRouteData.normalRoute && (
                      <div
                        onClick={() => setSelectedRouteKey('normal')}
                        style={{
                          border: `2px solid ${selectedRouteKey === 'normal' ? '#f97316' : 'var(--gray-200)'}`,
                          background: selectedRouteKey === 'normal' ? '#fff7ed' : 'white',
                          borderRadius: 'var(--radius-lg)',
                          padding: 'var(--space-3)',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          boxShadow: selectedRouteKey === 'normal' ? '0 4px 12px rgba(249, 115, 22, 0.12)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: '#c2410c', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            🚗 Normal Route
                          </span>
                          <span className="badge" style={{ background: '#f1f5f9', color: '#475569', fontSize: '10px' }}>
                            Standard Road Route
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--gray-600)' }}>
                          <span>Distance: <strong>{roadRouteData.normalRoute.distanceText}</strong></span>
                          <span>Est. Time: <strong>{roadRouteData.normalRoute.durationText}</strong></span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)', paddingTop: '6px', borderTop: '1px solid #fed7aa' }}>
                          <span style={{ fontSize: '11px', color: 'var(--gray-600)' }}>Pollution Level along Route:</span>
                          <span style={{
                            fontWeight: 800,
                            fontSize: '11px',
                            color: roadRouteData.normalRoute.pollution.color,
                            background: roadRouteData.normalRoute.pollution.bg,
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: `1px solid ${roadRouteData.normalRoute.pollution.border}`
                          }}>
                            AQI {roadRouteData.normalRoute.pollution.avgAQI} ({roadRouteData.normalRoute.pollution.label})
                          </span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--gray-500)', marginTop: '4px' }}>
                          {roadRouteData.normalRoute.description}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Realistic & Professional Environmental Advisory */}
                  <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '11px' }}>
                    <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      🛡️ Route Pollution Advisory:
                    </div>
                    <p style={{ margin: '0 0 6px 0', color: 'var(--gray-600)', lineHeight: 1.45 }}>
                      Pollution levels are estimated using ambient air quality sensors along the road network.
                      Actual in-cabin exposure depends on vehicle ventilation settings, window status, local congestion, and weather.
                    </p>
                    <div style={{ fontSize: '10px', color: 'var(--gray-500)', fontStyle: 'italic' }}>
                      * Note: No route is pollution-free or guaranteed healthier.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* RIGHT / MAIN: LEAFLET MAP CONTAINER */}
          <div className="map-view-card card" style={{ overflow: 'hidden', minHeight: '620px', position: 'relative' }}>
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%', minHeight: '620px', zIndex: 1 }}
            >
              <MapRecenter center={mapCenter} zoom={mapZoom} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* DRAW REAL ROAD ROUTES */}
              {roadRouteData && isRoutingActive && (
                <>
                  {/* Normal Route Polyline */}
                  {roadRouteData.normalRoute && (
                    <Polyline
                      positions={roadRouteData.normalRoute.waypoints}
                      color={selectedRouteKey === 'normal' ? '#ea580c' : '#94a3b8'}
                      weight={selectedRouteKey === 'normal' ? 6 : 4}
                      opacity={selectedRouteKey === 'normal' ? 0.95 : 0.55}
                      dashArray={selectedRouteKey === 'normal' ? null : '5, 8'}
                      eventHandlers={{
                        click: () => setSelectedRouteKey('normal')
                      }}
                    >
                      <Popup>
                        <div style={{ padding: '4px', minWidth: '170px' }}>
                          <strong style={{ color: '#ea580c' }}>🚗 Normal Route</strong>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Distance: <strong>{roadRouteData.normalRoute.distanceText}</strong>
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            Est. Travel Time: <strong>{roadRouteData.normalRoute.durationText}</strong>
                          </div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Pollution Level: <strong style={{ color: roadRouteData.normalRoute.pollution.color }}>
                              AQI {roadRouteData.normalRoute.pollution.avgAQI} ({roadRouteData.normalRoute.pollution.label})
                            </strong>
                          </div>
                        </div>
                      </Popup>
                    </Polyline>
                  )}

                  {/* Lower Pollution Route Polyline */}
                  {roadRouteData.lowerPollutionRoute && (
                    <Polyline
                      positions={roadRouteData.lowerPollutionRoute.waypoints}
                      color="#10b981"
                      weight={selectedRouteKey === 'lower_pollution' ? 7 : 4}
                      opacity={selectedRouteKey === 'lower_pollution' ? 0.98 : 0.55}
                      dashArray={selectedRouteKey === 'lower_pollution' ? null : '4, 6'}
                      eventHandlers={{
                        click: () => setSelectedRouteKey('lower_pollution')
                      }}
                    >
                      <Popup>
                        <div style={{ padding: '4px', minWidth: '180px' }}>
                          <strong style={{ color: '#16a34a' }}>🌱 Lower Pollution Route</strong>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Distance: <strong>{roadRouteData.lowerPollutionRoute.distanceText}</strong>
                          </div>
                          <div style={{ fontSize: '12px' }}>
                            Est. Travel Time: <strong>{roadRouteData.lowerPollutionRoute.durationText}</strong>
                          </div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Pollution Level: <strong style={{ color: roadRouteData.lowerPollutionRoute.pollution.color }}>
                              AQI {roadRouteData.lowerPollutionRoute.pollution.avgAQI} ({roadRouteData.lowerPollutionRoute.pollution.label})
                            </strong>
                          </div>
                          {roadRouteData.lowerPollutionRoute.reductionPct > 0 && (
                            <div style={{ fontSize: '11px', color: '#15803d', fontWeight: 700, marginTop: '3px' }}>
                              ~{roadRouteData.lowerPollutionRoute.reductionPct}% lower estimated exposure
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Polyline>
                  )}
                </>
              )}

              {/* CITY MARKERS */}
              {showAir && validCities.map(city => (
                <Marker
                  key={`city-${city.id || city._id || city.name}`}
                  position={[Number(city.lat), Number(city.lng)]}
                  icon={createAqiIcon(city.aqi || 0, city.name)}
                >
                  <Popup>
                    <div style={{ minWidth: '180px', padding: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--gray-900)' }}>{city.name}</strong>
                        <span className={`badge badge-${getStatusFromAQI(city.aqi || 0).className}`} style={{ fontSize: '10px' }}>
                          {getStatusFromAQI(city.aqi || 0).label}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '8px' }}>
                        {city.state} · Temp {city.temp || 28}°C
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', textAlign: 'center', background: 'var(--gray-50)', padding: '6px', borderRadius: '6px' }}>
                        <div>
                          <div style={{ fontSize: '9px', color: 'var(--gray-400)' }}>AIR AQI</div>
                          <div style={{ fontWeight: 800, color: getStatusFromAQI(city.aqi || 0).color, fontSize: '14px' }}>{city.aqi || 0}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '9px', color: 'var(--gray-400)' }}>WATER WQI</div>
                          <div style={{ fontWeight: 800, color: getStatusFromWQI(city.waterWQI || 50).color, fontSize: '14px' }}>{city.waterWQI || 50}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                        <Link to={`/city/${city.name}`} className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center', padding: '3px 0' }}>
                          Full City Report →
                        </Link>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* WATER BODY MARKERS */}
              {showWater && (WATER_BODIES || []).filter(w => w && Number.isFinite(Number(w.lat)) && Number.isFinite(Number(w.lng))).map(w => (
                <CircleMarker
                  key={`water-${w.id || w.name}`}
                  center={[Number(w.lat), Number(w.lng)]}
                  radius={8}
                  pathOptions={{
                    color: '#0284c7',
                    fillColor: getStatusFromWQI(w.wqi || 50).color,
                    fillOpacity: 0.85,
                    weight: 2
                  }}
                >
                  <Popup>
                    <div style={{ padding: '4px' }}>
                      <strong style={{ color: '#0284c7' }}>💧 {w.name}</strong>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>{w.state} · {w.type}</div>
                      <div style={{ marginTop: '4px', fontSize: '12px' }}>
                        WQI: <strong>{w.wqi}</strong> ({getStatusFromWQI(w.wqi || 50).label})
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--gray-600)', marginTop: '2px' }}>
                        Main Issue: {w.mainPollutant}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--gray-500)', marginTop: '2px' }}>
                        pH: {w.pH} · BOD: {w.bod} mg/L
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}

              {/* End of environmental markers */}

              {/* ACTIVE ALERTS MARKERS */}
              {showAlerts && (alerts || []).filter(a => a && a.active && Number.isFinite(Number(a.lat)) && Number.isFinite(Number(a.lng))).map(alert => (
                <Marker
                  key={`alert-${alert.id || alert._id || Math.random()}`}
                  position={[Number(alert.lat), Number(alert.lng)]}
                  icon={createAlertIcon(alert.severity)}
                >
                  <Popup>
                    <div style={{ maxWidth: '220px', padding: '4px' }}>
                      <span className="badge" style={{ background: '#fee2e2', color: '#dc2626', fontSize: '10px' }}>
                        ⚠️ {alert.severity} Alert · {alert.type}
                      </span>
                      <h4 style={{ fontSize: '13px', margin: '4px 0 2px', color: 'var(--gray-900)' }}>{alert.title}</h4>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '4px' }}>📍 {alert.location}</div>
                      <p style={{ fontSize: '11px', color: 'var(--gray-700)', lineHeight: 1.4, margin: 0 }}>
                        {alert.message}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* CITIZEN REPORTS PINS */}
              {showReports && (citizenReports || []).filter(report => report && Number.isFinite(Number(report.lat)) && Number.isFinite(Number(report.lng))).map(report => (
                <Marker
                  key={`rep-${report.id || report._id || Math.random()}`}
                  position={[Number(report.lat), Number(report.lng)]}
                  icon={createReportIcon(report.category)}
                >
                  <Popup>
                    <div style={{ maxWidth: '240px', padding: '4px' }}>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '3px' }}>
                        <span className="badge badge-moderate" style={{ fontSize: '9px' }}>
                          📢 Citizen Log: {report.category}
                        </span>
                        <span className="badge" style={{ fontSize: '9px', background: '#fef3c7', color: '#b45309' }}>
                          {report.status}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '13px', margin: '2px 0', color: 'var(--gray-900)' }}>{report.title}</h4>
                      <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '4px' }}>
                        📍 {report.locationName}, {report.city}
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--gray-600)', lineHeight: 1.4, margin: '0 0 6px' }}>
                        {report.description}
                      </p>
                      <div style={{ fontSize: '10px', color: 'var(--gray-400)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Reported: {report.date}</span>
                        <span>👍 {report.upvotes || 0} verifications</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Map Legend Overlay */}
            <div className="map-floating-legend">
              <div style={{ fontWeight: 800, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' }}>
                Map Legend
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16a34a' }}></span>
                  <span>Good AQI (0-50)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ca8a04' }}></span>
                  <span>Moderate (51-100)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea580c' }}></span>
                  <span>Poor / Unhealthy (101-200)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626' }}></span>
                  <span>Hazardous (200+)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid #e2e8f0', paddingTop: '3px' }}>
                  <span style={{ color: '#16a34a', fontWeight: 800 }}>━━</span>
                  <span>Eco-Safe Route</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#dc2626', fontWeight: 800 }}>--</span>
                  <span>Polluted Highway</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .map-page-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: var(--space-4);
          align-items: start;
        }
        .safe-route-sidebar {
          max-height: 750px;
          overflow-y: auto;
        }
        .map-view-card {
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-md);
        }
        .filter-pill {
          padding: 5px 12px;
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 600;
          background: white;
          border: 1.5px solid var(--gray-200);
          color: var(--gray-600);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .filter-pill.active {
          background: var(--primary-600);
          border-color: var(--primary-600);
          color: white;
        }
        .map-floating-legend {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          padding: 10px 14px;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--gray-200);
          z-index: 1000;
          pointer-events: auto;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
        }
        @media (max-width: 960px) {
          .map-page-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
