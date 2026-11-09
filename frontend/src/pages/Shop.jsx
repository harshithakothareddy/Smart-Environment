import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRODUCTS, getStatusFromAQI } from '../data/mockData';
import { useApp } from '../context/AppContext';

const CATEGORIES = ['All', 'Air Quality Monitors', 'Air Purifiers', 'Water Quality Monitors', 'Water Filters', 'Soil Testing Kits', 'Indoor Environment Sensors', 'Pollution Protection', 'Environmental Accessories'];

const PRODUCT_ICONS = {
  'air-monitor': '📡',
  'air-purifier': '💨',
  'water-monitor': '🔬',
  'water-filter': '🚰',
  'soil-kit': '🌱',
  'indoor-sensor': '📊',
  'eco-mask': '😷',
  'earplug': '🎧',
  'desktop-monitor': '🖥️',
  'plant-kit': '🪴',
};

const CATEGORY_COLORS = {
  'Air Quality Monitors': '#dbeafe',
  'Air Purifiers': '#e0f2fe',
  'Water Quality Monitors': '#cffafe',
  'Water Filters': '#dcfce7',
  'Soil Testing Kits': '#fef9c3',
  'Indoor Environment Sensors': '#f3e8ff',
  'Pollution Protection': '#fee2e2',
  'Environmental Accessories': '#fce7f3',
};

function Stars({ rating }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{ fontSize: '11px', color: 'var(--gray-500)', marginLeft: '4px' }}>{rating} ({(Math.random() * 500 + 100).toFixed(0)})</span>
    </div>
  );
}

function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const navigate = useNavigate();
  const isWished = wishlist.some(p => p.id === product.id);
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const bg = CATEGORY_COLORS[product.category] || '#f1f5f9';

  return (
    <div className="product-card">
      {product.badge && <div className="product-badge">{product.badge}</div>}
      <button
        className={`wishlist-btn ${isWished ? 'wished' : ''}`}
        onClick={() => toggleWishlist(product)}
        aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={isWished ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
      <div
        className="product-image"
        style={{ background: bg, cursor: 'pointer' }}
        onClick={() => navigate(`/shop/product/${product.id}`)}
        role="button"
        tabIndex={0}
        aria-label={`View ${product.name} details`}
        onKeyDown={e => e.key === 'Enter' && navigate(`/shop/product/${product.id}`)}
      >
        <span style={{ fontSize: '60px' }}>{PRODUCT_ICONS[product.image] || '📦'}</span>
      </div>
      <div className="product-card-body">
        <div style={{ fontSize: '10px', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          {product.category}
        </div>
        <h3
          className="product-name"
          onClick={() => navigate(`/shop/product/${product.id}`)}
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </h3>
        <p className="product-desc">{product.description}</p>
        <Stars rating={product.rating} />
        <div className="product-price-row">
          <div>
            <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
            <span className="product-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
            <span className="product-discount">{discount}% off</span>
          </div>
          {!product.inStock && <span className="out-of-stock-badge">Out of Stock</span>}
        </div>
        <div className="product-actions">
          <button
            className="btn btn-primary btn-sm"
            style={{ flex: 1 }}
            onClick={() => addToCart(product)}
            disabled={!product.inStock}
            aria-label={`Add ${product.name} to cart`}
          >
            {product.inStock ? '+ Add to Cart' : 'Out of Stock'}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/shop/product/${product.id}`)}
            aria-label={`View ${product.name} details`}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [priceMax, setPriceMax] = useState(20000);
  const [sortBy, setSortBy] = useState('Featured');
  const [showFilters, setShowFilters] = useState(false);
  const { cart, cartCount, cartTotal } = useApp();
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    let d = PRODUCTS;
    if (activeCategory !== 'All') d = d.filter(p => p.category === activeCategory);
    if (search) d = d.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
    d = d.filter(p => p.price <= priceMax);
    if (sortBy === 'Price: Low to High') d = [...d].sort((a,b) => a.price - b.price);
    if (sortBy === 'Price: High to Low') d = [...d].sort((a,b) => b.price - a.price);
    if (sortBy === 'Rating')             d = [...d].sort((a,b) => b.rating - a.rating);
    return d;
  }, [activeCategory, search, priceMax, sortBy]);

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div className="shop-header">
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)' }}>🛒 Shop Environmental Solutions</h1>
            <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>Products to help monitor and improve your environment</p>
          </div>
          {cartCount > 0 && (
            <button className="btn btn-primary" onClick={() => navigate('/shop/cart')}>
              🛒 Cart ({cartCount}) · ₹{cartTotal.toLocaleString('en-IN')}
            </button>
          )}
        </div>

        {/* Search & Sort */}
        <div className="shop-search-row">
          <div className="input-group" style={{ flex: 1, maxWidth: '400px' }}>
            <svg className="input-icon input-icon-left" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input className="input with-icon-left" type="search" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} aria-label="Search products"/>
          </div>
          <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: 'auto', fontSize: 'var(--text-sm)' }} aria-label="Sort by">
            {['Featured', 'Price: Low to High', 'Price: High to Low', 'Rating'].map(o => <option key={o}>{o}</option>)}
          </select>
          <button className="btn btn-secondary btn-sm hide-desktop" onClick={() => setShowFilters(v => !v)}>
            ⚙️ Filters {showFilters ? '▲' : '▼'}
          </button>
        </div>

        <div className="shop-layout">
          {/* Sidebar Filters (desktop) / Bottom Sheet (mobile) */}
          <aside className={`shop-filters hide-mobile`} aria-label="Product filters">
            <div className="filter-section">
              <h4 className="filter-title">Category</h4>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`filter-category-btn ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  aria-pressed={activeCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="filter-section">
              <h4 className="filter-title">Max Price: ₹{priceMax.toLocaleString('en-IN')}</h4>
              <input
                type="range"
                min={500}
                max={20000}
                step={500}
                value={priceMax}
                onChange={e => setPriceMax(Number(e.target.value))}
                style={{ width: '100%' }}
                aria-label={`Maximum price: ${priceMax}`}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gray-400)' }}>
                <span>₹500</span><span>₹20,000</span>
              </div>
            </div>
          </aside>

          {/* Mobile Filter Sheet */}
          {showFilters && (
            <div className="shop-filter-sheet hide-desktop animate-slide-up">
              <div className="filter-section">
                <h4 className="filter-title">Category</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`filter-pill ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div className="filter-section">
                <h4 className="filter-title">Max Price: ₹{priceMax.toLocaleString('en-IN')}</h4>
                <input type="range" min={500} max={20000} step={500} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} style={{ width: '100%' }}/>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <main>
            {/* Category chips (mobile) */}
            <div className="category-chips-row hide-desktop">
              {CATEGORIES.map(cat => (
                <button key={cat} className={`filter-pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {cat}
                </button>
              ))}
            </div>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)', marginBottom: 'var(--space-4)' }}>
              Showing <strong>{filtered.length}</strong> products
            </p>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term.</p>
                <button className="btn btn-secondary" onClick={() => { setActiveCategory('All'); setSearch(''); setPriceMax(20000); }}>Clear Filters</button>
              </div>
            ) : (
              <div className="products-grid">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </main>
        </div>
      </div>

      <style>{`
        .shop-header { display: flex; align-items: flex-start; justify-content: space-between; padding: var(--space-6) 0 var(--space-4); gap: var(--space-4); flex-wrap: wrap; }
        .shop-search-row { display: flex; gap: var(--space-3); align-items: center; flex-wrap: wrap; margin-bottom: var(--space-4); }
        .shop-layout { display: grid; grid-template-columns: 220px 1fr; gap: var(--space-6); align-items: start; }
        .shop-filters { background: white; border-radius: var(--radius-xl); border: 1px solid var(--gray-100); padding: var(--space-5); position: sticky; top: calc(var(--nav-height) + var(--space-4)); box-shadow: var(--shadow-sm); }
        .shop-filter-sheet { background: white; border-radius: var(--radius-xl); border: 1px solid var(--gray-100); padding: var(--space-5); margin-bottom: var(--space-4); }
        .filter-section { margin-bottom: var(--space-5); }
        .filter-title { font-size: var(--text-sm); font-weight: 700; color: var(--gray-700); margin-bottom: var(--space-3); text-transform: uppercase; letter-spacing: 0.05em; }
        .filter-category-btn {
          display: block;
          width: 100%;
          text-align: left;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          font-size: var(--text-sm);
          color: var(--gray-600);
          transition: all var(--transition-fast);
          margin-bottom: 2px;
          font-weight: 500;
        }
        .filter-category-btn:hover { background: var(--primary-50); color: var(--primary-600); }
        .filter-category-btn.active { background: var(--primary-100); color: var(--primary-700); font-weight: 600; }
        .category-chips-row { display: flex; overflow-x: auto; gap: var(--space-2); padding-bottom: var(--space-3); scrollbar-width: none; -ms-overflow-style: none; }
        .category-chips-row::-webkit-scrollbar { display: none; }
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--space-4); }
        .product-card {
          background: white;
          border-radius: var(--radius-xl);
          border: 1px solid var(--gray-100);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          position: relative;
          transition: all var(--transition-base);
        }
        .product-card:hover { box-shadow: var(--shadow-xl); transform: translateY(-4px); }
        .product-badge {
          position: absolute;
          top: var(--space-3);
          left: var(--space-3);
          z-index: 1;
          background: var(--primary-600);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
        }
        .wishlist-btn {
          position: absolute;
          top: var(--space-3);
          right: var(--space-3);
          z-index: 1;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          box-shadow: var(--shadow-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gray-400);
          transition: all var(--transition-fast);
          border: 1px solid var(--gray-100);
        }
        .wishlist-btn:hover, .wishlist-btn.wished { color: #ef4444; }
        .product-image {
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-card-body { padding: var(--space-4); }
        .product-name { font-size: var(--text-sm); font-weight: 700; color: var(--gray-800); margin-bottom: var(--space-1); line-height: 1.4; }
        .product-desc { font-size: var(--text-xs); color: var(--gray-500); margin-bottom: var(--space-3); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .product-price-row { display: flex; align-items: center; justify-content: space-between; margin: var(--space-3) 0; }
        .product-price { font-size: var(--text-lg); font-weight: 800; color: var(--gray-900); font-family: var(--font-display); }
        .product-original-price { font-size: var(--text-xs); color: var(--gray-400); text-decoration: line-through; margin-left: var(--space-2); }
        .product-discount { font-size: var(--text-xs); color: var(--status-good); font-weight: 700; margin-left: var(--space-1); }
        .out-of-stock-badge { font-size: 10px; background: var(--gray-100); color: var(--gray-500); padding: 3px 8px; border-radius: var(--radius-full); font-weight: 600; }
        .product-actions { display: flex; gap: var(--space-2); }
        .empty-state { text-align: center; padding: var(--space-16) var(--space-8); color: var(--gray-500); }
        .empty-icon { font-size: 48px; margin-bottom: var(--space-4); }
        .empty-state h3 { color: var(--gray-700); margin-bottom: var(--space-2); }
        @media (max-width: 768px) {
          .shop-layout { grid-template-columns: 1fr; }
          .products-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
