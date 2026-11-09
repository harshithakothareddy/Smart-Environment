import React, { useState } from 'react';
import { RESOURCES } from '../data/mockData';

const CATS = ['All', 'Air', 'Water', 'Policy', 'Education'];

const RESOURCE_CONTENT = {
  1: {
    intro: 'The Air Quality Index (AQI) is a number used to communicate how polluted the air currently is or how polluted it is forecast to become.',
    tips: ['Check AQI before outdoor activities', 'Keep windows closed during high AQI days', 'Use HEPA filters indoors', 'Wear N95/N99 masks outdoors in polluted areas'],
    scale: [
      { range: '0-50',   label: 'Good',           action: 'Air quality is satisfactory. No restrictions needed.' },
      { range: '51-100', label: 'Moderate',        action: 'Acceptable quality. Unusually sensitive people may experience minor symptoms.' },
      { range: '101-150',label: 'Unhealthy (Sensitive)', action: 'Members of sensitive groups may experience health effects.' },
      { range: '151-200',label: 'Unhealthy',       action: 'Everyone may experience health effects; sensitive groups more serious effects.' },
      { range: '201-300',label: 'Very Unhealthy',  action: 'Health alert: everyone may experience more serious health effects.' },
      { range: '301+',   label: 'Hazardous',       action: 'Emergency conditions. Avoid all outdoor activity.' },
    ]
  }
};

export default function Resources() {
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = RESOURCES.filter(r => category === 'All' || r.category === category);

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ paddingTop: 'var(--space-6)' }}>
          <h1>📚 Environmental Resources</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>Guides, research, and education to help you understand India's environment</p>
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', margin: 'var(--space-4) 0' }}>
          {CATS.map(cat => (
            <button key={cat} className={`filter-pill ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
          ))}
        </div>

        <div className="grid-3">
          {filtered.map(resource => (
            <div key={resource.id} className="resource-card card" onClick={() => setExpanded(expanded === resource.id ? null : resource.id)}>
              <div className="card-body">
                <div className="resource-icon-row">
                  <span style={{ fontSize: '36px' }}>{resource.icon}</span>
                  <span className="badge badge-moderate" style={{ fontSize: '10px' }}>{resource.category}</span>
                </div>
                <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, marginTop: 'var(--space-3)', lineHeight: 1.4 }}>{resource.title}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginTop: 'var(--space-2)', lineHeight: 1.6 }}>{resource.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>📖 {resource.readTime} read</span>
                  <button className="btn btn-outline btn-sm">{expanded === resource.id ? '▲ Collapse' : '▼ Expand'}</button>
                </div>

                {expanded === resource.id && resource.id === 1 && (
                  <div className="animate-fade-in" style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--gray-100)', paddingTop: 'var(--space-4)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-4)' }}>{RESOURCE_CONTENT[1].intro}</p>
                    <h4 style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)' }}>AQI Scale</h4>
                    {RESOURCE_CONTENT[1].scale.map(s => (
                      <div key={s.range} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-2)', borderRadius: 'var(--radius-md)', marginBottom: 4, fontSize: 'var(--text-xs)' }}>
                        <span style={{ fontWeight: 700, width: 70, flexShrink: 0 }}>{s.range}</span>
                        <span style={{ fontWeight: 600, color: 'var(--gray-700)', width: 100, flexShrink: 0 }}>{s.label}</span>
                        <span style={{ color: 'var(--gray-500)', flex: 1 }}>{s.action}</span>
                      </div>
                    ))}
                    <h4 style={{ fontSize: 'var(--text-sm)', margin: 'var(--space-4) 0 var(--space-3)' }}>Practical Tips</h4>
                    <ul style={{ paddingLeft: 'var(--space-5)' }}>
                      {RESOURCE_CONTENT[1].tips.map((t, i) => (
                        <li key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', marginBottom: 'var(--space-2)', lineHeight: 1.5 }}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {expanded === resource.id && resource.id !== 1 && (
                  <div className="animate-fade-in" style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--gray-100)', paddingTop: 'var(--space-4)' }}>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.7 }}>
                      This resource covers comprehensive information about {resource.title.toLowerCase()}.
                      Connect a real content management system or educational database to display full resource content.
                      This section would contain detailed guides, infographics, data tables, and references.
                    </p>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-4)' }}>📥 Download Guide (Demo)</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Glossary Section */}
        <div className="section">
          <h2 className="section-title">Environmental Glossary</h2>
          <div className="grid-2" style={{ marginTop: 'var(--space-4)' }}>
            {[
              { term: 'AQI', def: 'Air Quality Index — a standardized measure of outdoor air pollution, typically ranging 0–500.' },
              { term: 'PM2.5', def: 'Fine particulate matter with diameter ≤2.5 μm. Can penetrate deep into the lungs.' },
              { term: 'PM10', def: 'Coarse particulate matter with diameter ≤10 μm. Can irritate the respiratory system.' },
              { term: 'BOD', def: 'Biochemical Oxygen Demand — measures organic pollution in water bodies.' },
              { term: 'WQI', def: 'Water Quality Index — a combined score rating the overall quality of a water body.' },
              { term: 'SQI', def: 'Soil Quality Index — a composite measure of soil health and contamination levels.' },
              { term: 'VOC', def: 'Volatile Organic Compounds — gases emitted from certain solids or liquids that can be harmful.' },
              { term: 'Heavy Metals', def: 'Elements like Lead, Mercury, and Cadmium that are toxic even in small concentrations.' },
            ].map(g => (
              <div key={g.term} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-4)', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-100)', boxShadow: 'var(--shadow-xs)' }}>
                <code style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', fontWeight: 700, flexShrink: 0, height: 'fit-content' }}>{g.term}</code>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.5 }}>{g.def}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data Sources */}
        <div className="section">
          <div className="card card-body">
            <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>📡 Data Sources</h2>
            <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
              In a production deployment, EcoPulse India can integrate data from the following authoritative sources:
            </p>
            <div className="grid-2">
              {[
                { name: 'CPCB (Central Pollution Control Board)', url: 'https://cpcb.nic.in', type: 'Air & Water' },
                { name: 'SAFAR (System of Air Quality and Weather Forecasting)', url: 'https://safar.tropmet.res.in', type: 'Air Quality' },
                { name: 'National Water Quality Monitoring Programme (NWMP)', url: '#', type: 'Water Quality' },
                { name: 'NAMP (National Ambient Air Quality Monitoring)', url: '#', type: 'Air Quality' },
                { name: 'IMD (India Meteorological Department)', url: 'https://mausam.imd.gov.in', type: 'Weather' },
                { name: 'ICAR (Indian Council of Agricultural Research)', url: 'https://icar.org.in', type: 'Soil Quality' },
              ].map(s => (
                <div key={s.name} style={{ padding: 'var(--space-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', display: 'flex', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: '20px' }}>🏛️</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--gray-800)' }}>{s.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--gray-400)', marginTop: 2 }}>{s.type}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="demo-banner" style={{ marginTop: 'var(--space-4)' }}>
              <span>ℹ️</span>
              <span>EcoPulse India is not officially affiliated with any government body. All current data is demo/sample data.</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .resource-card { cursor: pointer; transition: all var(--transition-base); }
        .resource-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
        .resource-icon-row { display: flex; justify-content: space-between; align-items: flex-start; }
        .filter-pill {
          padding: 5px 14px; border-radius: var(--radius-full); font-size: var(--text-xs); font-weight: 600;
          background: white; border: 1.5px solid var(--gray-200); color: var(--gray-600); transition: all var(--transition-fast);
        }
        .filter-pill.active { background: var(--primary-600); border-color: var(--primary-600); color: white; }
      `}</style>
    </div>
  );
}
