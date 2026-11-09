import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { CITIES, getStatusFromAQI, getStatusFromWQI } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { fetchLiveTelemetry, getRealWaterQualityForLocation, getWeatherInfo } from '../utils/realTelemetry';

/* ─── AQI colour helpers ─── */
function aqiColor(aqi) {
  if (aqi <= 50)  return '#22c55e';
  if (aqi <= 100) return '#eab308';
  if (aqi <= 150) return '#f97316';
  if (aqi <= 200) return '#ef4444';
  if (aqi <= 300) return '#7c3aed';
  return '#7f1d1d';
}
function aqiBg(aqi) {
  if (aqi <= 50)  return '#f0fdf4';
  if (aqi <= 100) return '#fefce8';
  if (aqi <= 150) return '#fff7ed';
  if (aqi <= 200) return '#fef2f2';
  if (aqi <= 300) return '#f5f3ff';
  return '#fef2f2';
}

/* ─── Fallback hourly (diurnal variation) ─── */
function buildFallbackHourly(baseAqi, baseTemp, baseWind, baseHumidity) {
  const aqiP  = [0.85,0.80,0.78,0.80,0.88,1.05,1.20,1.30,1.25,1.10,1.00,0.95,0.90,0.88,0.90,0.95,1.10,1.25,1.30,1.20,1.10,1.00,0.92,0.87];
  const tempP = [-4,-4.5,-5,-4.5,-3,-1,1,3,5,6,7,7.5,7,6,5,4,3,2,0,-1,-2,-3,-3.5,-4];
  const windP = [0.6,0.5,0.5,0.55,0.65,0.8,1.0,1.2,1.3,1.3,1.2,1.1,1.0,0.9,0.9,0.95,1.0,1.05,1.0,0.9,0.8,0.75,0.7,0.65];
  const icons = [0,0,0,0,1,1,2,2,2,1,1,1,2,2,3,2,1,1,2,2,3,2,1,0];
  const now = new Date();
  return Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now); d.setHours(now.getHours() + i, 0, 0, 0);
    const h = d.getHours();
    const wi = getWeatherInfo(icons[h]);
    // Build 12-hour AM/PM label
    const period = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    const timeLabel = i === 0 ? `▶ Now (${h12} ${period})` : `${h12} ${period}`;
    return {
      timeLabel,
      aqi: Math.max(20, Math.round(baseAqi * aqiP[h])),
      temp: Math.round(baseTemp + tempP[h]),
      wind: Math.max(2, Math.round(baseWind * windP[h])),
      humidity: Math.min(98, Math.max(30, baseHumidity + (i % 3 === 0 ? 5 : -3))),
      weatherIcon: wi.icon, weatherLabel: wi.label,
    };
  });
}

/* ─── Fallback 7-day ─── */
function buildFallbackDaily(baseAqi, baseTemp, baseWind, baseHumidity) {
  const aqiM = [1, 0.95, 1.05, 1.10, 0.90, 0.85, 0.95];
  const codes = [2,1,0,61,2,1,3];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    const wi = getWeatherInfo(codes[i]);
    return {
      day: i === 0 ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short' }),
      dateStr: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      aqi: Math.max(20, Math.round(baseAqi * aqiM[i])),
      weatherIcon: wi.icon, weatherLabel: wi.label,
      tempMax: Math.round(baseTemp + 5 + (i % 2 === 0 ? 2 : 0)),
      tempMin: Math.round(baseTemp - 3 - (i % 3 === 0 ? 1 : 0)),
      windMax: Math.max(4, Math.round(baseWind * (1 + i * 0.05))),
      humidityMean: Math.min(95, Math.round(baseHumidity + (i % 2 === 0 ? 4 : -2))),
    };
  });
}

/* ─── Health advice matrix ─── */
function getHealthAdvice(aqi, wqi) {
  const airLevel =
    aqi <= 50  ? { level: 'Good',      icon: '✅', color: '#16a34a', bg: '#f0fdf4',
      air: ['Ideal for all outdoor activities', 'Safe for children and elderly', 'No restrictions needed'],
      outdoor: ['Running / Cycling ✅', 'Sports & exercise ✅', 'Morning walks ✅'] }
  : aqi <= 100 ? { level: 'Moderate',  icon: '😐', color: '#ca8a04', bg: '#fefce8',
      air: ['Acceptable for most people', 'Sensitive groups may feel mild effects', 'Limit intense outdoor exertion'],
      outdoor: ['Light walks ✅', 'Avoid heavy exercise ⚠️', 'Wear mask if sensitive ⚠️'] }
  : aqi <= 150 ? { level: 'Poor',      icon: '😷', color: '#ea580c', bg: '#fff7ed',
      air: ['Unhealthy for sensitive groups', 'Children & elderly should stay indoors', 'Wear N95 mask outdoors'],
      outdoor: ['Brief outdoor trips only ⚠️', 'No outdoor exercise 🚫', 'Keep windows closed 🚫'] }
  : aqi <= 200 ? { level: 'Unhealthy', icon: '🚫', color: '#dc2626', bg: '#fef2f2',
      air: ['Everyone may experience effects', 'Avoid all outdoor exertion', 'Use air purifier indoors'],
      outdoor: ['Stay indoors 🚫', 'No outdoor activity 🚫', 'Emergency mask needed 🚨'] }
               : { level: 'Hazardous', icon: '🚨', color: '#7c3aed', bg: '#f5f3ff',
      air: ['Emergency health risk', 'Entire population affected', 'Evacuate if possible'],
      outdoor: ['DO NOT go outside 🚨', 'Seal windows & doors 🚨', 'Call emergency services 🚨'] };

  const waterLevel =
    wqi >= 90 ? { level: 'Excellent', icon: '💧', color: '#0ea5e9', advice: 'Safe for drinking and recreation', safe: true }
  : wqi >= 70 ? { level: 'Good',      icon: '🌊', color: '#22c55e', advice: 'Safe for most uses, filter for drinking', safe: true }
  : wqi >= 50 ? { level: 'Fair',      icon: '⚠️',  color: '#eab308', advice: 'Boil before drinking. Safe for bathing', safe: false }
  : wqi >= 30 ? { level: 'Poor',      icon: '❌',  color: '#f97316', advice: 'Do not drink. Avoid skin contact', safe: false }
               : { level: 'Hazardous', icon: '☠️', color: '#dc2626', advice: 'Seriously polluted. Avoid all contact', safe: false };

  return { airLevel, waterLevel };
}

export default function CityDetail() {
  const { cityName } = useParams();
  const [searchParams] = useSearchParams();
  const { selectedCity } = useApp();
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  const city = CITIES.find(c => c.name.toLowerCase() === cityName?.toLowerCase()) || CITIES[14];
  const fromLocation = searchParams.get('from') || (selectedCity?._searchedLocation && selectedCity?.name?.toLowerCase() === cityName?.toLowerCase() ? selectedCity._searchedLocation : null);
  const fromState = searchParams.get('state') || selectedCity?._searchedState;
  const fromType  = searchParams.get('type')  || selectedCity?._searchedType;
  const displayTitle = fromLocation || city.name;

  const lat = parseFloat(searchParams.get('lat')) || city.lat;
  const lng = parseFloat(searchParams.get('lng')) || city.lng;
  const waterBasin = getRealWaterQualityForLocation(lat, lng);

  // Clear any stale cache for this location so data is always fresh
  const clearLocalCache = () => {
    const roundedLat = parseFloat(lat).toFixed(3);
    const roundedLng = parseFloat(lng).toFixed(3);
    localStorage.removeItem(`telemetry_${roundedLat}_${roundedLng}`);
  };

  const loadData = (force = false) => {
    if (force) clearLocalCache();
    setLoading(true);
    setLiveData(null);
    fetchLiveTelemetry(lat, lng, city).then(res => {
      if (res) setLiveData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData(true); // always bust cache on page load for fresh real data
  }, [lat, lng, cityName]);

  /* resolved values */
  const aqi      = liveData?.aqi      ?? city.aqi      ?? 100;
  const pm25     = liveData?.pm25     ?? city.pm25     ?? 30;
  const pm10     = liveData?.pm10     ?? city.pm10     ?? 60;
  const no2      = liveData?.no2      ?? city.no2      ?? 20;
  const so2      = liveData?.so2      ?? city.so2      ?? 10;
  const o3       = liveData?.o3       ?? city.o3       ?? 40;
  const co       = liveData?.co       ?? city.co       ?? 0.9;
  const temp     = liveData?.temp     ?? city.temp     ?? 28;
  const humidity = liveData?.humidity ?? city.humidity ?? 60;
  const wind     = liveData?.wind     ?? city.wind     ?? 12;

  const airStatus   = getStatusFromAQI(aqi);
  const waterStatus = getStatusFromWQI(waterBasin.wqi);
  const { airLevel, waterLevel } = getHealthAdvice(aqi, waterBasin.wqi);

  const hourly = (liveData?.hourlyCombined?.length > 0) ? liveData.hourlyCombined : buildFallbackHourly(aqi, temp, wind, humidity);
  const daily  = (liveData?.dailyCombined?.length  > 0) ? liveData.dailyCombined  : buildFallbackDaily(aqi, temp, wind, humidity);

  const scrollHourly = dir => { if (scrollRef.current) scrollRef.current.scrollLeft += dir * 260; };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ paddingBottom: 'var(--space-8)' }}>

        {/* ── Breadcrumb ── */}
        <div style={{ paddingTop: 'var(--space-6)', marginBottom: 'var(--space-3)', display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--gray-500)' }}>
          <Link to="/" style={{ color: 'var(--primary-600)' }}>Home</Link>
          <span>/</span>
          <Link to="/rankings" style={{ color: 'var(--primary-600)' }}>Rankings</Link>
          <span>/</span>
          <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{displayTitle}</span>
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* ── HERO BANNER ── */}
        {/* ══════════════════════════════════════════════ */}
        <div style={{ background: `linear-gradient(135deg, ${aqiColor(aqi)}18 0%, ${aqiColor(aqi)}05 100%)`, border: `1.5px solid ${aqiColor(aqi)}33`, borderRadius: 20, padding: '24px 28px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: title + status */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900 }}>📍 {displayTitle}</h1>
              {liveData && <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:99, background:'#f0fdf4', border:'1px solid #bbf7d0', fontSize:11, fontWeight:700, color:'#15803d' }}><span style={{ width:7,height:7,borderRadius:'50%',background:'#16a34a',display:'inline-block',animation:'livePulse 2s infinite'}} />Live CPCB Telemetry</span>}
              {loading && <span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, background:'#fef9c3', color:'#92400e', border:'1px solid #fde68a' }}>⏳ Fetching…</span>}
            </div>
            <div style={{ fontSize:13, color:'var(--gray-500)' }}>
              {fromState || city.state} · Central Pollution Control Board
              {' '}· Updated {liveData?.lastUpdated || new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}
            </div>
          </div>
          {/* Right: weather pills */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[
              { e:'🌡️', v:`${temp}°C`,    label:'Temperature' },
              { e:'💨', v:`${wind} km/h`, label:'Wind Speed' },
              { e:'💧', v:`${humidity}%`, label:'Humidity' },
              ...(liveData?.weatherInfo ? [{ e: liveData.weatherInfo.icon, v: liveData.weatherInfo.label, label:'Conditions' }] : []),
            ].map(p => (
              <div key={p.v} style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 14px', background:'white', border:'1px solid var(--gray-200)', borderRadius:12, boxShadow:'var(--shadow-xs)', minWidth:70 }}>
                <span style={{ fontSize:20 }}>{p.e}</span>
                <span style={{ fontWeight:800, fontSize:14, color:'var(--gray-900)', marginTop:2 }}>{p.v}</span>
                <span style={{ fontSize:10, color:'var(--gray-400)' }}>{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* ── ROW 1: AQI + WQI Overview ── */}
        {/* ══════════════════════════════════════════════ */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }} className="cd-two-col">

          {/* AIR QUALITY CARD */}
          <div style={{ background:'white', border:`2px solid ${aqiColor(aqi)}33`, borderRadius:18, padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <span style={{ fontSize:22 }}>💨</span>
              <div>
                <div style={{ fontWeight:800, fontSize:16 }}>Air Quality</div>
                <div style={{ fontSize:11, color:'var(--gray-400)' }}>Indian NAQI · CPCB Standard</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:16, marginBottom:16 }}>
              <div style={{ fontSize:72, fontWeight:900, color:aqiColor(aqi), fontFamily:'var(--font-display)', lineHeight:1 }}>{aqi}</div>
              <div style={{ paddingBottom:8 }}>
                <div style={{ display:'inline-block', padding:'4px 16px', background:aqiColor(aqi), color:'white', borderRadius:99, fontWeight:700, fontSize:15 }}>{airStatus.label}</div>
                <div style={{ fontSize:12, color:'var(--gray-500)', marginTop:6 }}>Main: <strong>{liveData?.mainPollutant || city.mainPollutant || 'PM2.5'}</strong></div>
              </div>
            </div>
            {/* Pollutant mini pills */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { l:'PM2.5', v:`${pm25} μg/m³`, c: pm25 > 35 ? '#ef4444' : '#22c55e' },
                { l:'PM10',  v:`${pm10} μg/m³`, c: pm10 > 100 ? '#ef4444' : '#22c55e' },
                { l:'NO₂',   v:`${no2} μg/m³`,  c:'var(--gray-700)' },
                { l:'O₃',    v:`${o3} μg/m³`,   c:'var(--gray-700)' },
                { l:'SO₂',   v:`${so2} μg/m³`,  c:'var(--gray-700)' },
                { l:'CO',    v:`${co} mg/m³`,   c:'var(--gray-700)' },
              ].map(m => (
                <div key={m.l} style={{ background:'var(--gray-50)', borderRadius:10, padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'var(--gray-500)', fontWeight:600 }}>{m.l}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:m.c }}>{m.v}</span>
                </div>
              ))}
            </div>
            {liveData?.whoMultiple && (
              <div style={{ marginTop:12, padding:'6px 12px', background:'#fef2f2', borderRadius:8, fontSize:11, color:'#dc2626', fontWeight:700, textAlign:'center' }}>
                ⚠️ PM2.5 is {liveData.whoMultiple}× the WHO annual guideline (5 μg/m³)
              </div>
            )}
          </div>

          {/* WATER QUALITY CARD */}
          <div style={{ background:'white', border:'2px solid #bae6fd', borderRadius:18, padding:24 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <span style={{ fontSize:22 }}>🌊</span>
              <div>
                <div style={{ fontWeight:800, fontSize:16 }}>Water Quality</div>
                <div style={{ fontSize:11, color:'var(--gray-400)' }}>CPCB NWMP · {waterBasin.river} Basin</div>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:16, marginBottom:16 }}>
              <div style={{ fontSize:72, fontWeight:900, color:waterStatus.color, fontFamily:'var(--font-display)', lineHeight:1 }}>{waterBasin.wqi}</div>
              <div style={{ paddingBottom:8 }}>
                <div style={{ display:'inline-block', padding:'4px 16px', background:waterStatus.color, color:'white', borderRadius:99, fontWeight:700, fontSize:15 }}>{waterStatus.label}</div>
                <div style={{ fontSize:11, color:'var(--gray-500)', marginTop:6 }}>{waterBasin.name}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { l:'pH',       v:`${waterBasin.pH}`,             c: (waterBasin.pH >= 6.5 && waterBasin.pH <= 8.5) ? '#22c55e' : '#ef4444' },
                { l:'DO',       v:`${waterBasin.do} mg/L`,        c: waterBasin.do >= 5 ? '#22c55e' : '#ef4444' },
                { l:'BOD',      v:`${waterBasin.bod} mg/L`,       c: waterBasin.bod <= 3 ? '#22c55e' : '#ef4444' },
                { l:'COD',      v:`${waterBasin.cod} mg/L`,       c:'var(--gray-700)' },
                { l:'Turbidity',v:`${waterBasin.turbidity} NTU`,  c:'var(--gray-700)' },
                { l:'Nitrate',  v:`${waterBasin.nitrate} mg/L`,   c:'var(--gray-700)' },
              ].map(m => (
                <div key={m.l} style={{ background:'var(--gray-50)', borderRadius:10, padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:11, color:'var(--gray-500)', fontWeight:600 }}>{m.l}</span>
                  <span style={{ fontSize:13, fontWeight:800, color:m.c }}>{m.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* ── HEALTH ADVICE SECTION ── */}
        {/* ══════════════════════════════════════════════ */}
        <div style={{ background:airLevel.bg, border:`1.5px solid ${airLevel.color}44`, borderRadius:18, padding:24, marginBottom:20 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <span style={{ fontSize:28 }}>{airLevel.icon}</span>
            <div>
              <div style={{ fontWeight:900, fontSize:18, color:airLevel.color }}>Health Advisory — {airLevel.level} Air Quality</div>
              <div style={{ fontSize:12, color:'var(--gray-500)', marginTop:2 }}>Personalised advice based on current CPCB readings for {displayTitle}</div>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }} className="cd-three-col">

            {/* Air advice */}
            <div style={{ background:'white', borderRadius:14, padding:16 }}>
              <div style={{ fontWeight:700, fontSize:13, color:'var(--gray-700)', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                💨 Air Quality Advice
              </div>
              {airLevel.air.map((a,i) => (
                <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 }}>
                  <span style={{ color:airLevel.color, fontWeight:700, fontSize:14 }}>•</span>
                  <span style={{ fontSize:13, color:'var(--gray-700)', lineHeight:1.5 }}>{a}</span>
                </div>
              ))}
            </div>

            {/* Outdoor activity */}
            <div style={{ background:'white', borderRadius:14, padding:16 }}>
              <div style={{ fontWeight:700, fontSize:13, color:'var(--gray-700)', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                🏃 Outdoor Activity
              </div>
              {airLevel.outdoor.map((a,i) => (
                <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 }}>
                  <span style={{ fontWeight:700, fontSize:14, color:airLevel.color }}>•</span>
                  <span style={{ fontSize:13, color:'var(--gray-700)', lineHeight:1.5 }}>{a}</span>
                </div>
              ))}
            </div>

            {/* Water safety */}
            <div style={{ background:'white', borderRadius:14, padding:16 }}>
              <div style={{ fontWeight:700, fontSize:13, color:'var(--gray-700)', marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                🌊 Water Safety
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
                <span style={{ fontSize:22 }}>{waterLevel.icon}</span>
                <span style={{ fontWeight:700, color:waterLevel.color, fontSize:14 }}>{waterLevel.level}</span>
              </div>
              <div style={{ fontSize:13, color:'var(--gray-700)', lineHeight:1.6 }}>{waterLevel.advice}</div>
              <div style={{ marginTop:10, padding:'6px 12px', background: waterLevel.safe ? '#f0fdf4' : '#fef2f2', borderRadius:8, fontSize:12, fontWeight:700, color: waterLevel.safe ? '#15803d' : '#dc2626' }}>
                {waterLevel.safe ? '✅ Safe for consumption (filter/boil)' : '🚫 Not safe for drinking'}
              </div>
            </div>

          </div>
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* ── HOURLY FORECAST ── */}
        {/* ══════════════════════════════════════════════ */}
        <div className="card" style={{ marginBottom:20, overflow:'hidden' }}>
          <div style={{ padding:'16px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:'var(--gray-900)', display:'flex', alignItems:'center', gap:8 }}>
                ⏱️ Hourly Forecast
                {liveData && <span style={{ fontSize:10, padding:'2px 8px', background:'#dcfce7', color:'#15803d', borderRadius:99, fontWeight:700 }}>● Live</span>}
                {loading && <span style={{ fontSize:10, padding:'2px 8px', background:'#fef9c3', color:'#92400e', borderRadius:99, fontWeight:600 }}>Updating…</span>}
              </div>
              <div style={{ fontSize:11, color:'var(--gray-400)', marginTop:2 }}>{displayTitle} · NAQI &amp; Weather · Next 24 Hours</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button onClick={() => scrollHourly(-1)} style={{ width:32,height:32,border:'1.5px solid var(--gray-200)',borderRadius:8,cursor:'pointer',background:'white',fontWeight:700,fontSize:16,display:'flex',alignItems:'center',justifyContent:'center' }}>‹</button>
              <button onClick={() => scrollHourly(1)}  style={{ width:32,height:32,border:'1.5px solid var(--gray-200)',borderRadius:8,cursor:'pointer',background:'white',fontWeight:700,fontSize:16,display:'flex',alignItems:'center',justifyContent:'center' }}>›</button>
            </div>
          </div>

          <div ref={scrollRef} style={{ overflowX:'auto', padding:'12px 20px 16px', scrollBehavior:'smooth' }}>
            <div style={{ display:'flex', gap:6, minWidth:'max-content' }}>
              {hourly.map((h, i) => (
                <div key={i} style={{
                  display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                  minWidth:72, padding:'10px 4px 12px',
                  borderRadius:14,
                  background: i === 0 ? aqiBg(h.aqi) : 'white',
                  border: i === 0 ? `2px solid ${aqiColor(h.aqi)}55` : '1.5px solid var(--gray-100)',
                  boxShadow: i === 0 ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
                }}>
                  <div style={{ fontSize:11, fontWeight: i===0 ? 800 : 500, color: i===0 ? aqiColor(h.aqi) : 'var(--gray-400)' }}>{h.timeLabel}</div>
                  <div style={{ padding:'4px 0', width:52, textAlign:'center', borderRadius:99, background:aqiColor(h.aqi), color:'white', fontWeight:900, fontSize:15, fontFamily:'var(--font-display)', boxShadow:`0 2px 8px ${aqiColor(h.aqi)}55` }}>{h.aqi}</div>
                  <div style={{ fontSize:22 }}>{h.weatherIcon}</div>
                  <div style={{ fontWeight:700, fontSize:14, color:'var(--gray-800)' }}>{h.temp}°</div>
                  <div style={{ fontSize:11, color:'var(--gray-500)', display:'flex', alignItems:'center', gap:2 }}>💨 {h.wind}</div>
                  <div style={{ fontSize:11, color:'#3b82f6', display:'flex', alignItems:'center', gap:2 }}>💧 {h.humidity}%</div>
                </div>
              ))}
            </div>
          </div>

          {/* AQI legend */}
          <div style={{ display:'flex', gap:10, padding:'0 20px 14px', flexWrap:'wrap', borderTop:'1px solid var(--gray-50)', paddingTop:10 }}>
            {[['Good ≤50','#22c55e'],['Moderate ≤100','#eab308'],['Poor ≤150','#f97316'],['Unhealthy ≤200','#ef4444'],['Severe ≤300','#7c3aed']].map(([l,c]) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:4, fontSize:10, color:'var(--gray-500)' }}>
                <span style={{ width:10,height:10,borderRadius:3,background:c,display:'inline-block' }} />{l}
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* ── 7-DAY FORECAST ── */}
        {/* ══════════════════════════════════════════════ */}
        <div className="card" style={{ marginBottom:20 }}>
          <div style={{ padding:'16px 20px 12px' }}>
            <div style={{ fontWeight:800, fontSize:16, color:'var(--gray-900)' }}>📅 7-Day Forecast</div>
            <div style={{ fontSize:11, color:'var(--gray-400)', marginTop:2 }}>{displayTitle} · Daily NAQI &amp; Weather Outlook</div>
          </div>
          <div style={{ padding:'0 20px 20px' }}>
            {/* header */}
            <div style={{ display:'grid', gridTemplateColumns:'90px 64px 40px 90px 100px 90px', gap:8, padding:'6px 0 8px', borderBottom:'1.5px solid var(--gray-100)', marginBottom:2 }}>
              {['Day','AQI','Sky','Temp','Wind','Humidity'].map(h => (
                <div key={h} style={{ fontSize:10, fontWeight:700, color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</div>
              ))}
            </div>
            {daily.map((d,i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'90px 64px 40px 90px 100px 90px', gap:8, padding:'10px 0', borderBottom: i<daily.length-1?'1px solid var(--gray-50)':'none', alignItems:'center', background: i===0?`${aqiColor(d.aqi)}08`:'transparent', borderRadius:8 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color: i===0 ? aqiColor(d.aqi) : 'var(--gray-800)' }}>{d.day}</div>
                  <div style={{ fontSize:10, color:'var(--gray-400)' }}>{d.dateStr}</div>
                </div>
                <div style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', padding:'4px 0', width:58, borderRadius:99, background:aqiColor(d.aqi), color:'white', fontWeight:900, fontSize:15, fontFamily:'var(--font-display)' }}>{d.aqi}</div>
                <div style={{ fontSize:22, textAlign:'center' }}>{d.weatherIcon}</div>
                <div style={{ fontSize:13 }}>
                  <span style={{ fontWeight:700, color:'#ef4444' }}>{d.tempMax}°</span>
                  <span style={{ color:'var(--gray-300)', margin:'0 3px' }}>/</span>
                  <span style={{ color:'#3b82f6' }}>{d.tempMin}°</span>
                </div>
                <div style={{ fontSize:12, color:'var(--gray-600)', display:'flex', alignItems:'center', gap:3 }}>💨 {d.windMax} km/h</div>
                <div style={{ fontSize:12, color:'#3b82f6', display:'flex', alignItems:'center', gap:3 }}>💧 {d.humidityMean}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* ── 24H AQI TREND CHART ── */}
        {/* ══════════════════════════════════════════════ */}
        <div className="card card-body" style={{ marginBottom:20 }}>
          <div style={{ fontWeight:800, fontSize:16, marginBottom:4 }}>📈 Air Quality Trend — Next 24 Hours</div>
          <div style={{ fontSize:11, color:'var(--gray-400)', marginBottom:16 }}>{displayTitle} · Hourly NAQI Projection</div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={hourly.map(h => ({ hour:h.timeLabel, aqi:h.aqi }))} margin={{ bottom: 30 }}>
              <defs>
                <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={airStatus.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={airStatus.color} stopOpacity={0}/>
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
              <YAxis tick={{ fontSize:10, fill:'var(--gray-400)' }} tickLine={false} axisLine={false}/>
              <Tooltip
                contentStyle={{ border:'1px solid var(--gray-200)', borderRadius:10, fontSize:12 }}
                formatter={v => [v, 'NAQI']}
                labelStyle={{ fontWeight: 700, color: 'var(--gray-700)' }}
              />
              <ReferenceLine
                x={hourly[0]?.timeLabel}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
              <Area type="monotone" dataKey="aqi" stroke={airStatus.color} fill="url(#aqiGrad)" strokeWidth={2.5} dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ══════════════════════════════════════════════ */}
        {/* ── DETAILED WATER QUALITY ── */}
        {/* ══════════════════════════════════════════════ */}
        <div style={{ background:'#f0f9ff', border:'1.5px solid #bae6fd', borderRadius:18, padding:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <span style={{ fontSize:24 }}>🌊</span>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:'#0c4a6e' }}>Water Quality Details</div>
              <div style={{ fontSize:11, color:'#0369a1' }}>CPCB National Water Quality Monitoring Programme · {waterBasin.name}</div>
            </div>
            <span style={{ marginLeft:'auto', display:'inline-block', padding:'4px 14px', background:waterStatus.color, color:'white', borderRadius:99, fontWeight:700, fontSize:13 }}>{waterStatus.label}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:12 }}>
            {[
              { l:'WQI',         v:waterBasin.wqi,       u:'/100',  c:waterStatus.color,  note:waterStatus.label },
              { l:'pH Level',    v:waterBasin.pH,        u:'pH',    c:(waterBasin.pH>=6.5&&waterBasin.pH<=8.5)?'#22c55e':'#ef4444', note:'Ideal 6.5–8.5' },
              { l:'Dissolved O₂',v:waterBasin.do,        u:'mg/L',  c:waterBasin.do>=5?'#22c55e':'#ef4444', note:'>4.0 required' },
              { l:'BOD',         v:waterBasin.bod,       u:'mg/L',  c:waterBasin.bod<=3?'#22c55e':'#ef4444', note:'<3.0 clean' },
              { l:'COD',         v:waterBasin.cod,       u:'mg/L',  c:'var(--gray-700)', note:'Organic load' },
              { l:'Turbidity',   v:waterBasin.turbidity, u:'NTU',   c:'var(--gray-700)', note:'Water clarity' },
              { l:'Nitrate',     v:waterBasin.nitrate,   u:'mg/L',  c:'var(--gray-700)', note:'Agricultural runoff' },
            ].map(m => (
              <div key={m.l} style={{ background:'white', borderRadius:12, padding:'14px 16px', textAlign:'center', border:'1px solid #e0f2fe' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'#0369a1', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>{m.l}</div>
                <div style={{ fontSize:26, fontWeight:900, color:m.c, fontFamily:'var(--font-display)', lineHeight:1.2 }}>{m.v}</div>
                <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>{m.u}</div>
                {m.note && <div style={{ fontSize:10, fontWeight:600, color:'#64748b', marginTop:4 }}>{m.note}</div>}
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes livePulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .cd-two-col   { grid-template-columns:1fr 1fr; }
        .cd-three-col { grid-template-columns:repeat(3,1fr); }
        @media(max-width:768px){
          .cd-two-col   { grid-template-columns:1fr !important; }
          .cd-three-col { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
}
