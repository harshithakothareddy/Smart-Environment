import React, { useState } from 'react';
import { NEWS, ALERTS } from '../data/mockData';

const CATEGORIES = ['All', 'Air', 'Water', 'Climate', 'Waste', 'Environment', 'Policy', 'Research'];
const NEWS_ICONS = { Air: '🌬️', Water: '💧', Climate: '🌍', Waste: '♻️', Policy: '⚖️', Research: '🔬', Environment: '🌿' };

export default function News() {
  const [activeTab, setActiveTab]     = useState('News');
  const [category, setCategory]       = useState('All');
  const [search, setSearch]           = useState('');

  const filtered = NEWS.filter(n =>
    (category === 'All' || n.category === category) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="page-wrapper">
      <div className="container">
        <div style={{ paddingTop: 'var(--space-6)' }}>
          <h1>📰 News &amp; Rankings</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>Environmental news and updates from across India</p>
          <div className="demo-banner" role="note" style={{ marginTop: 'var(--space-3)' }}>
            <span>⚠️</span>
            <span>Demo Mode — These are sample news articles, not real news. Connect a real news API for live articles.</span>
          </div>
        </div>

        {/* Main Tabs */}
        <div className="tabs" style={{ maxWidth: 360, margin: 'var(--space-4) 0' }}>
          {['News', 'Alerts', 'Reports'].map(t => (
            <button key={t} className={`tab-btn ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>

        {activeTab === 'News' && (
          <>
            {/* Category Chips */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              {CATEGORIES.map(cat => (
                <button key={cat} className={`filter-pill ${category === cat ? 'active' : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
              ))}
            </div>

            {/* Search */}
            <div className="input-group" style={{ maxWidth: 380, marginBottom: 'var(--space-4)' }}>
              <svg className="input-icon input-icon-left" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="input with-icon-left" type="search" placeholder="Search news..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search news"/>
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state"><div style={{ fontSize: 48 }}>📰</div><h3>No articles found</h3><p>Try a different search or category.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {filtered.map(n => (
                  <article key={n.id} className="news-article-card card">
                    <div className="card-body" style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                      <div className="news-icon-box">
                        <span style={{ fontSize: '28px' }}>{NEWS_ICONS[n.category] || '📰'}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)', alignItems: 'center' }}>
                          <span className="badge badge-moderate" style={{ fontSize: '10px' }}>{n.category}</span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>{n.date}</span>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>📍 {n.location}</span>
                        </div>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, lineHeight: 1.4, marginBottom: 'var(--space-2)' }}>{n.title}</h3>
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', lineHeight: 1.6 }}>{n.description}</p>
                        <button className="btn btn-ghost btn-sm" style={{ marginTop: 'var(--space-3)', color: 'var(--primary-600)', paddingLeft: 0 }}>Read More →</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'Alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {ALERTS.map(alert => {
              const colorMap = { Critical: 'var(--status-hazardous)', High: 'var(--status-unhealthy)', Medium: 'var(--status-poor)', Low: 'var(--status-moderate)' };
              const bgMap    = { Critical: 'var(--status-hazardous-bg)', High: 'var(--status-unhealthy-bg)', Medium: 'var(--status-poor-bg)', Low: 'var(--status-moderate-bg)' };
              const color = colorMap[alert.severity];
              const bg    = bgMap[alert.severity];
              return (
                <div key={alert.id} className="card card-body" style={{ borderLeft: `4px solid ${color}` }}>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '28px' }}>{alert.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-1)' }}>
                        <span className="badge" style={{ background: bg, color, border: `1px solid ${color}` }}>{alert.severity}</span>
                        <span className="badge badge-moderate">{alert.type}</span>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>📍 {alert.location}</span>
                      </div>
                      <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--gray-800)' }}>{alert.title}</h3>
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)', marginTop: 'var(--space-1)' }}>{alert.message}</p>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 'var(--space-2)' }}>
                        {new Date(alert.time).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'Reports' && (
          <div className="grid-2">
            {[
              { title: 'India Air Quality Annual Report 2025', type: 'PDF', size: '4.2 MB', icon: '📋', category: 'Air' },
              { title: 'National Water Quality Assessment Q2 2026', type: 'PDF', size: '2.8 MB', icon: '💧', category: 'Water' },
              { title: 'Land Degradation & Contamination Study', type: 'PDF', size: '6.1 MB', icon: '🌱', category: 'Land' },
              { title: 'State-wise Pollution Index Report 2026', type: 'PDF', size: '3.5 MB', icon: '📊', category: 'Overall' },
            ].map((r, i) => (
              <div key={i} className="card card-body">
                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '36px' }}>{r.icon}</span>
                  <div>
                    <span className="badge badge-moderate" style={{ marginBottom: 'var(--space-2)', fontSize: '10px' }}>{r.category}</span>
                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, lineHeight: 1.4 }}>{r.title}</h4>
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginTop: 4 }}>{r.type} · {r.size} · Sample Document</p>
                    <button className="btn btn-outline btn-sm" style={{ marginTop: 'var(--space-3)' }}>⬇ Download</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .news-article-card { transition: box-shadow var(--transition-base); }
        .news-article-card:hover { box-shadow: var(--shadow-lg); }
        .news-icon-box { width: 64px; height: 64px; background: var(--gray-50); border-radius: var(--radius-xl); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
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
        .filter-pill.active { background: var(--primary-600); border-color: var(--primary-600); color: white; }
        .empty-state { text-align: center; padding: var(--space-16); color: var(--gray-500); }
        .empty-state h3 { color: var(--gray-700); margin: var(--space-3) 0 var(--space-2); }
      `}</style>
    </div>
  );
}
