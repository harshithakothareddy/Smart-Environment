import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ALL_INDIAN_STATES, CITIES } from '../data/mockData';
import { searchIndiaLocations, searchNominatimIndia, findNearestStation, formatLocationBreadcrumb } from '../utils/indiaGeoSearch';

const POLLUTION_CATEGORIES = [
  {
    type: 'Air',
    icon: '🌬️',
    title: 'Air Pollution',
    subtitle: 'Smog, crop stubble burning, factory chimney fumes, construction dust, toxic stench',
    color: '#3b82f6',
    bg: '#eff6ff',
    examples: ['Open Garbage / Stubble Burning', 'Industrial Chimney Dark Smoke', 'Excessive Vehicle / Truck Exhaust', 'Unchecked Construction Fugitive Dust', 'Chemical / Rotten Egg Odor']
  },
  {
    type: 'Water',
    icon: '💧',
    title: 'Water Contamination',
    subtitle: 'Industrial discharge, sewage overflow, foam on water bodies, colored toxic runoff',
    color: '#0284c7',
    bg: '#f0f9ff',
    examples: ['Chemical Effluent Discharge', 'Toxic White Foam / Froth', 'Sewage Leak into Fresh Water', 'Dead Aquatic Life / Fish Kill', 'Severe Turbidity / Oil Slick']
  }
];

const SEVERITY_LEVELS = [
  { level: 'Low', label: 'Low Concern', desc: 'Mild odor or localized minor dust', color: '#16a34a', bg: '#dcfce7' },
  { level: 'Moderate', label: 'Moderate', desc: 'Affecting nearby passersby and visibility', color: '#ca8a04', bg: '#fef9c3' },
  { level: 'High', label: 'High Alert', desc: 'Respiratory distress, widespread eye burn, toxic contact', color: '#ea580c', bg: '#ffedd5' },
  { level: 'Critical', label: 'Critical Emergency', desc: 'Active toxic spill, massive fire, immediate health hazard', color: '#dc2626', bg: '#fee2e2' }
];

export default function ReportPollution() {
  const { citizenReports, addCitizenReport, upvoteReport } = useApp();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('feed'); // 'form' or 'feed'
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [category, setCategory] = useState('Air');
  const [selectedCityName, setSelectedCityName] = useState('Delhi');
  const [locationName, setLocationName] = useState('');
  const [severity, setSeverity] = useState('High');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [evidenceName, setEvidenceName] = useState('');
  const [submittedId, setSubmittedId] = useState(null);
  const [formError, setFormError] = useState('');

  // Location search state
  const [locQuery, setLocQuery] = useState('');
  const [locResults, setLocResults] = useState([]);
  const [locLoading, setLocLoading] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [resolvedLat, setResolvedLat] = useState(null);
  const [resolvedLng, setResolvedLng] = useState(null);
  const [resolvedState, setResolvedState] = useState('');
  const [resolvedDistrict, setResolvedDistrict] = useState('');
  const [resolvedType, setResolvedType] = useState('');
  const locDebounceRef = useRef(null);
  const locDropdownRef = useRef(null);
  const { citiesData } = useApp();

  // Close loc dropdown on outside click
  useEffect(() => {
    const h = (e) => { if (locDropdownRef.current && !locDropdownRef.current.contains(e.target)) setLocOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Debounced live search for location
  useEffect(() => {
    const q = locQuery.trim();
    if (q.length < 2) { setLocResults([]); setLocLoading(false); return; }
    if (locDebounceRef.current) clearTimeout(locDebounceRef.current);
    locDebounceRef.current = setTimeout(async () => {
      setLocLoading(true);
      try {
        const local = searchIndiaLocations(q, 5);
        const live = await searchNominatimIndia(q, 6);
        const localNames = new Set(local.map(r => r.name.toLowerCase()));
        const filtered = live.filter(r => !localNames.has(r.name.toLowerCase()));
        setLocResults([...local, ...filtered]);
      } catch { setLocResults([]); } finally { setLocLoading(false); }
    }, 350);
    return () => { if (locDebounceRef.current) clearTimeout(locDebounceRef.current); };
  }, [locQuery]);

  const handleSelectLoc = (loc) => {
    setLocQuery(loc.name);
    setResolvedState(loc.state || '');
    setResolvedDistrict(loc.district || '');
    setResolvedType(loc.type || 'Area');
    setResolvedLat(loc.lat);
    setResolvedLng(loc.lng);
    setLocOpen(false);
    // Also update city name to nearest monitoring station
    const { city: nearest } = findNearestStation(loc.lat, loc.lng, citiesData || CITIES);
    if (nearest) setSelectedCityName(nearest.name);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locQuery.trim()) {
      setFormError('Please fill out all required fields marked with *');
      return;
    }

    const selectedCity = CITIES.find(c => c.name === selectedCityName) || CITIES[0];
    const reportData = {
      category,
      title: title.trim(),
      description: description.trim(),
      locationName: locQuery.trim(),
      city: selectedCity.name,
      state: resolvedState || selectedCity.state,
      district: resolvedDistrict || '',
      lat: resolvedLat ?? (selectedCity.lat + (Math.random() - 0.5) * 0.05),
      lng: resolvedLng ?? (selectedCity.lng + (Math.random() - 0.5) * 0.05),
      severity,
      reporterName: isAnonymous ? 'Anonymous Citizen' : (reporterName.trim() || 'Concerned Resident'),
      evidenceType: evidenceName ? 'Photo / Document Attached' : 'Citizen Witness Log'
    };

    const created = addCitizenReport(reportData);
    setSubmittedId(created.id);
    setFormError('');
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocQuery('');
    setResolvedState('');
    setResolvedDistrict('');
    setResolvedType('');
    setResolvedLat(null);
    setResolvedLng(null);
    setSubmittedId(null);
    setEvidenceName('');
    setActiveView('feed');
  };

  // Filtered reports
  const filteredReports = citizenReports.filter(r => {
    if (r.category === 'Land') return false; // Land category removed
    const matchCat = filterCategory === 'All' || r.category === filterCategory;
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchSearch = searchTerm === '' ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ paddingTop: 'var(--space-6)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="badge badge-good" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📢 Citizen Environmental Vigilance
              </span>
            </div>
            <h1 style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-3xl)' }}>
              Report Air &amp; Water Pollution
            </h1>
            <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)', maxWidth: '750px' }}>
              Empowering citizens across India to document and report pollution hazards. Submissions feed into real-time monitoring maps, safe-route hazard alerts, and government action logs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              className={`btn ${activeView === 'feed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setActiveView('feed'); setSubmittedId(null); }}
            >
              📋 View Citizen Feed ({citizenReports.length})
            </button>
            <button
              className={`btn ${activeView === 'form' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveView('form')}
            >
              ✍️ Submit Incident
            </button>
          </div>
        </div>

        {/* Global Impact Quick Bar */}
        <div className="card card-body" style={{ marginTop: 'var(--space-5)', background: 'linear-gradient(135deg, #1e293b, #0f172a)', color: 'white' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#38bdf8', fontFamily: 'var(--font-display)' }}>
                {citizenReports.length}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Total Active Reports</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#4ade80', fontFamily: 'var(--font-display)' }}>
                {citizenReports.filter(r => r.status === 'Verified' || r.status === 'Action Taken').length}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Verified Incidents</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#facc15', fontFamily: 'var(--font-display)' }}>
                {citizenReports.filter(r => r.status === 'Investigating').length}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Under Investigation</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 900, color: '#f87171', fontFamily: 'var(--font-display)' }}>
                {citizenReports.reduce((sum, r) => sum + (r.upvotes || 0), 0)}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Community Verifications</div>
            </div>
          </div>
        </div>

        {/* SUBMISSION SUCCESS MODAL / BANNER */}
        {submittedId && (
          <div className="card card-body animate-fade-in" style={{ marginTop: 'var(--space-5)', background: 'var(--status-good-bg)', border: '2px solid var(--status-good)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ fontSize: '42px' }}>🎉</div>
              <div style={{ flex: 1 }}>
                <h3 style={{ color: 'var(--status-good)', margin: 0 }}>Pollution Incident Successfully Logged!</h3>
                <p style={{ color: 'var(--gray-700)', marginTop: '4px', fontSize: 'var(--text-sm)' }}>
                  Tracking Reference: <strong>{submittedId}</strong>. Your report has been pinned onto the India Pollution Map and routed to the environmental authority queue.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)' }}>
                  <button className="btn btn-primary btn-sm" onClick={resetForm}>
                    Back to Incident Feed
                  </button>
                  <Link to="/map" className="btn btn-outline btn-sm">
                    🗺️ View Incident on India Map
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: SUBMIT NEW REPORT FORM */}
        {activeView === 'form' && !submittedId && (
          <div style={{ marginTop: 'var(--space-6)', maxWidth: '850px', marginInline: 'auto' }}>
            <div className="card card-body" style={{ padding: 'var(--space-6)' }}>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-1)' }}>File an Environmental Incident Report</h2>
              <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-5)' }}>
                Please provide accurate information. Verified reports trigger route hazards on the India Safe Route Navigator and notify regional pollution boards.
              </p>

              {formError && (
                <div className="demo-banner" style={{ background: 'var(--status-unhealthy-bg)', borderColor: 'var(--status-unhealthy)', color: 'var(--status-unhealthy)', marginBottom: 'var(--space-4)' }}>
                  <span>⚠️</span> {formError}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {/* 1. Category Selection */}
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--gray-800)' }}>
                    1. Select Pollution Domain *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
                    {POLLUTION_CATEGORIES.map(cat => {
                      const isSelected = category === cat.type;
                      return (
                        <div
                          key={cat.type}
                          onClick={() => setCategory(cat.type)}
                          style={{
                            border: `2px solid ${isSelected ? cat.color : 'var(--gray-200)'}`,
                            background: isSelected ? cat.bg : 'white',
                            borderRadius: 'var(--radius-xl)',
                            padding: 'var(--space-4)',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            boxShadow: isSelected ? 'var(--shadow-md)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                            <span style={{ fontSize: '24px' }}>{cat.icon}</span>
                            <span style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: isSelected ? cat.color : 'var(--gray-800)' }}>
                              {cat.title}
                            </span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--gray-500)', lineHeight: 1.4 }}>
                            {cat.subtitle}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Location Details — Live Search */}
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--gray-800)' }}>
                    2. Incident Location *
                  </label>
                  <div ref={locDropdownRef} style={{ position: 'relative' }}>
                    {/* Search input */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-lg)',
                      padding: '10px 12px', background: 'white',
                      boxShadow: locOpen ? '0 0 0 3px var(--primary-100)' : 'none',
                      borderColor: locOpen ? 'var(--primary-400)' : 'var(--gray-200)',
                      transition: 'all 0.15s'
                    }}>
                      {locLoading ? (
                        <div style={{ width: 14, height: 14, border: '2px solid var(--gray-200)', borderTopColor: 'var(--primary-500)', borderRadius: '50%', animation: 'rp-spin 0.6s linear infinite', flexShrink: 0 }} />
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                      )}
                      <input
                        id="report-location-input"
                        type="text"
                        placeholder="Search any area, village, town, district in India..."
                        value={locQuery}
                        onChange={(e) => { setLocQuery(e.target.value); setLocOpen(true); setResolvedState(''); setResolvedDistrict(''); }}
                        onFocus={() => setLocOpen(true)}
                        style={{ flex: 1, border: 'none', outline: 'none', fontSize: '13px', fontFamily: 'var(--font-body)', color: 'var(--gray-800)', background: 'transparent' }}
                        autoComplete="off"
                      />
                      {locQuery && <button type="button" onClick={() => { setLocQuery(''); setResolvedState(''); setResolvedDistrict(''); setLocResults([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 14 }}>✕</button>}
                      <span style={{ fontSize: 18 }}>📍</span>
                    </div>

                    {/* Resolved location chip */}
                    {resolvedState && (
                      <div style={{
                        marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'var(--primary-50)', border: '1.5px solid var(--primary-200)',
                        borderRadius: 'var(--radius-full)', padding: '4px 12px', fontSize: 12
                      }}>
                        <span style={{ fontSize: 14 }}>✅</span>
                        <span style={{ fontWeight: 700, color: 'var(--primary-700)' }}>{locQuery}</span>
                        {resolvedDistrict && <><span style={{ color: 'var(--gray-300)' }}>›</span><span style={{ color: 'var(--gray-600)' }}>{resolvedDistrict}</span></>}
                        <span style={{ color: 'var(--gray-300)' }}>›</span>
                        <span style={{ color: 'var(--gray-700)', fontWeight: 600 }}>{resolvedState}</span>
                        {resolvedType && <span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', borderRadius: 99, padding: '1px 7px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{resolvedType}</span>}
                      </div>
                    )}

                    {/* Dropdown results */}
                    {locOpen && locQuery.trim().length >= 2 && (
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
                        background: 'white', border: '1px solid var(--gray-200)',
                        borderRadius: 'var(--radius-xl)', boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
                        zIndex: 9999, overflow: 'hidden', maxHeight: 300, overflowY: 'auto'
                      }}>
                        {locResults.length === 0 && !locLoading && (
                          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 13 }}>
                            No results found. Try a different spelling.
                          </div>
                        )}
                        {locResults.map((loc, i) => (
                          <button
                            key={`rp-loc-${i}`}
                            type="button"
                            onClick={() => handleSelectLoc(loc)}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                              padding: '10px 14px', border: 'none', background: 'none',
                              cursor: 'pointer', textAlign: 'left', borderBottom: '1px solid var(--gray-50)',
                              transition: 'background 0.1s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-50)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                            <span style={{ fontSize: 16 }}>{loc.type === 'Village' ? '🌾' : loc.type === 'City' ? '🏙️' : loc.type === 'District' ? '📍' : loc.type === 'State' ? '🗺️' : '🏘️'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--gray-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{loc.name}</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{loc.type}</span>
                                {loc.district && <><span style={{ color: 'var(--gray-300)', fontSize: 10 }}>›</span><span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)' }}>{loc.district}</span></>}
                                <span style={{ color: 'var(--gray-300)', fontSize: 10 }}>›</span>
                                <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>{loc.state}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6 }}>
                    🔍 Type any area, village, town or district. District &amp; State will auto-fill from maps.
                  </p>
                </div>

                {/* 3. Severity Level */}
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--gray-800)' }}>
                    3. Perceived Severity Level *
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 'var(--space-2)' }}>
                    {SEVERITY_LEVELS.map(sev => {
                      const isSelected = severity === sev.level;
                      return (
                        <div
                          key={sev.level}
                          onClick={() => setSeverity(sev.level)}
                          style={{
                            border: `2px solid ${isSelected ? sev.color : 'var(--gray-200)'}`,
                            background: isSelected ? sev.bg : 'white',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-3)',
                            cursor: 'pointer',
                            textAlign: 'center',
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: sev.color }}>
                            {sev.label}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px' }}>
                            {sev.desc}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Issue Description */}
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)', color: 'var(--gray-800)' }}>
                    4. Incident Details &amp; Observation *
                  </label>
                  <div style={{ marginBottom: 'var(--space-3)' }}>
                    <input
                      className="input"
                      placeholder="Summary Headline (e.g., Toxic black chemical effluent pouring into storm drain)"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="Describe what you observed: odor, color of smoke or water, approximate scale, duration, nearby communities impacted, source if known..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      style={{ resize: 'vertical' }}
                      required
                    />
                  </div>
                </div>

                {/* 5. Photo / Evidence upload simulation */}
                <div style={{ border: '2px dashed var(--gray-200)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', textAlign: 'center', background: 'var(--gray-50)' }}>
                  <div style={{ fontSize: '28px', marginBottom: 'var(--space-1)' }}>📸</div>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--gray-700)' }}>
                    Attach Evidence Photos or Video (Optional)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--gray-500)', marginTop: '2px', marginBottom: 'var(--space-3)' }}>
                    Geo-tagged photos significantly accelerate verification by environmental officers.
                  </div>
                  <div style={{ display: 'inline-flex', gap: 'var(--space-2)' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setEvidenceName('IMG_GeoTagged_Pollution_Site.jpg')}
                    >
                      📎 {evidenceName ? `Selected: ${evidenceName}` : 'Simulate Photo Upload'}
                    </button>
                    {evidenceName && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--status-unhealthy)' }}
                        onClick={() => setEvidenceName('')}
                      >
                        ✕ Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* 6. Reporter Identity */}
                <div style={{ padding: 'var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--gray-800)' }}>
                      Reporter Contact
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={e => setIsAnonymous(e.target.checked)}
                      />
                      <span>Report Anonymously</span>
                    </label>
                  </div>
                  {!isAnonymous && (
                    <input
                      className="input"
                      placeholder="Your Name / Organization (e.g., Priya Verma / Resident Welfare Association)"
                      value={reporterName}
                      onChange={e => setReporterName(e.target.value)}
                    />
                  )}
                </div>

                {/* Submit button */}
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setActiveView('feed')}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg">
                    🚀 Submit Pollution Incident
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIEW: CITIZEN INCIDENT FEED */}
        {activeView === 'feed' && (
          <div style={{ marginTop: 'var(--space-6)' }}>
            {/* Filter bar */}
            <div className="card card-body" style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {/* Search */}
                <div className="input-group" style={{ maxWidth: '320px', flex: 1 }}>
                  <svg className="input-icon input-icon-left" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    className="input with-icon-left"
                    placeholder="Search incidents, cities, landmarks..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Category Pills */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {['All', 'Air', 'Water'].map(cat => (
                    <button
                      key={cat}
                      className={`filter-pill ${filterCategory === cat ? 'active' : ''}`}
                      onClick={() => setFilterCategory(cat)}
                    >
                      {cat === 'Air' ? '🌬️ Air' : cat === 'Water' ? '💧 Water' : 'All Categories'}
                    </button>
                  ))}
                </div>

                {/* Status Pills */}
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {['All', 'Pending', 'Verified', 'Investigating', 'Action Taken'].map(st => (
                    <button
                      key={st}
                      className={`filter-pill ${filterStatus === st ? 'active' : ''}`}
                      onClick={() => setFilterStatus(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reports List */}
            {filteredReports.length === 0 ? (
              <div className="card card-body" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                <div style={{ fontSize: '48px', marginBottom: 'var(--space-2)' }}>🔍</div>
                <h3>No Citizen Incidents Found</h3>
                <p style={{ color: 'var(--gray-500)', fontSize: 'var(--text-sm)', marginTop: '4px' }}>
                  No reports matching your search or category filter. Be the first to file one!
                </p>
                <button className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => setActiveView('form')}>
                  + Submit New Incident
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-4)' }}>
                {filteredReports.map(rep => {
                  const catData = POLLUTION_CATEGORIES.find(c => c.type === rep.category) || POLLUTION_CATEGORIES[0];
                  const sevData = SEVERITY_LEVELS.find(s => s.level === rep.severity) || SEVERITY_LEVELS[1];
                  const statusColors = {
                    Pending: { bg: '#fef3c7', text: '#b45309' },
                    Verified: { bg: '#e0f2fe', text: '#0369a1' },
                    Investigating: { bg: '#ffedd5', text: '#c2410c' },
                    'Action Taken': { bg: '#dcfce7', text: '#15803d' },
                    Resolved: { bg: '#dcfce7', text: '#15803d' }
                  };
                  const curStatus = statusColors[rep.status] || { bg: '#f1f5f9', text: '#475569' };

                  return (
                    <div
                      key={rep.id}
                      className="card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        borderTop: `4px solid ${catData.color}`,
                        transition: 'transform var(--transition-base), box-shadow var(--transition-base)'
                      }}
                    >
                      <div className="card-body">
                        {/* Meta badges */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                            <span className="badge" style={{ background: catData.bg, color: catData.color, fontWeight: 700, fontSize: '11px' }}>
                              {catData.icon} {rep.category}
                            </span>
                            <span className="badge" style={{ background: sevData.bg, color: sevData.color, fontSize: '10px' }}>
                              {rep.severity}
                            </span>
                          </div>
                          <span
                            className="badge"
                            style={{ background: curStatus.bg, color: curStatus.text, fontWeight: 700, fontSize: '11px' }}
                          >
                            ● {rep.status}
                          </span>
                        </div>

                        {/* Title & Location */}
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, lineHeight: 1.4, color: 'var(--gray-900)', marginBottom: 'var(--space-1)' }}>
                          {rep.title}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-3)' }}>
                          <span>📍</span>
                          <strong style={{ color: 'var(--gray-700)' }}>{rep.locationName}</strong>
                          <span>· {rep.city}, {rep.state}</span>
                        </div>

                        {/* Description */}
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                          {rep.description}
                        </p>

                        {/* Official Action Note if present */}
                        {rep.actionNote && (
                          <div style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: '11px', color: 'var(--gray-600)', borderLeft: '3px solid var(--primary-500)', marginBottom: 'var(--space-3)' }}>
                            <strong>Official Update:</strong> {rep.actionNote}
                          </div>
                        )}
                      </div>

                      {/* Card Footer: Upvote + Reporter */}
                      <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--gray-50)', borderBottomLeftRadius: 'var(--radius-xl)', borderBottomRightRadius: 'var(--radius-xl)' }}>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                          By <strong>{rep.reporterName}</strong> · {rep.date}
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                          <button
                            className="btn btn-sm"
                            style={{
                              background: rep.userUpvoted ? 'var(--primary-600)' : 'white',
                              color: rep.userUpvoted ? 'white' : 'var(--gray-700)',
                              border: '1px solid var(--gray-200)',
                              fontSize: '11px',
                              padding: '4px 10px'
                            }}
                            onClick={() => upvoteReport(rep.id)}
                            title="Confirm you have observed or experienced this incident"
                          >
                            👍 Verified ({rep.upvotes || 0})
                          </button>
                          <Link
                            to={`/map?lat=${rep.lat}&lng=${rep.lng}`}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '11px', padding: '4px 10px' }}
                            title="View on India Map"
                          >
                            🗺️ Map
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .filter-pill {
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: var(--text-xs);
          font-weight: 600;
          background: white;
          border: 1.5px solid var(--gray-200);
          color: var(--gray-600);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .filter-pill:hover, .filter-pill.active {
          background: var(--primary-600);
          border-color: var(--primary-600);
          color: white;
        }
        @keyframes rp-spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
