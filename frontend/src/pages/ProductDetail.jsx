import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../data/mockData';
import { useApp } from '../context/AppContext';

const PRODUCT_ICONS = {
  'air-monitor': '📡', 'air-purifier': '💨', 'water-monitor': '🔬',
  'water-filter': '🚰', 'soil-kit': '🌱', 'indoor-sensor': '📊',
  'eco-mask': '😷', 'earplug': '🎧', 'desktop-monitor': '🖥️', 'plant-kit': '🪴',
};

const CATEGORY_COLORS = {
  'Air Quality Monitors': '#dbeafe', 'Air Purifiers': '#e0f2fe',
  'Water Quality Monitors': '#cffafe', 'Water Filters': '#dcfce7',
  'Soil Testing Kits': '#fef9c3', 'Indoor Environment Sensors': '#f3e8ff',
  'Pollution Protection': '#fee2e2', 'Environmental Accessories': '#fce7f3',
};

function Stars({ rating, large }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={large ? 18 : 12} height={large ? 18 : 12} viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{ fontSize: large ? 'var(--text-sm)' : '11px', color: 'var(--gray-500)', marginLeft: '4px' }}>
        {rating} ({(Math.random() * 500 + 100).toFixed(0)} reviews)
      </span>
    </div>
  );
}

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist } = useApp();
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const product = PRODUCTS.find(p => p.id === Number(productId));
  const related = PRODUCTS.filter(p => p.id !== Number(productId) && p.category === product?.category).slice(0, 3);

  if (!product) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ textAlign: 'center', paddingTop: '80px' }}>
          <div style={{ fontSize: 64 }}>📦</div>
          <h2 style={{ marginTop: 'var(--space-4)' }}>Product Not Found</h2>
          <button className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-4)' }} onClick={() => navigate('/shop')}>Back to Shop</button>
        </div>
      </div>
    );
  }

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const bg = CATEGORY_COLORS[product.category] || '#f1f5f9';
  const isWished = wishlist.some(p => p.id === product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ paddingTop: 'var(--space-6)', marginBottom: 'var(--space-5)', display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--gray-500)', flexWrap: 'wrap' }}>
          <a href="/shop" style={{ color: 'var(--primary-600)' }}>Shop</a>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span style={{ color: 'var(--gray-800)' }}>{product.name}</span>
        </div>

        <div className="product-detail-layout">
          {/* Image */}
          <div style={{ background: bg, borderRadius: 'var(--radius-2xl)', height: 360, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {product.badge && (
              <div style={{ position: 'absolute', top: 'var(--space-4)', left: 'var(--space-4)', background: 'var(--primary-600)', color: 'white', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
                {product.badge}
              </div>
            )}
            <span style={{ fontSize: '100px' }}>{PRODUCT_ICONS[product.image] || '📦'}</span>
          </div>

          {/* Details */}
          <div>
            <div style={{ fontSize: '11px', color: 'var(--gray-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
              {product.category}
            </div>
            <h1 style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-3)' }}>{product.name}</h1>
            <Stars rating={product.rating} large />

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', margin: 'var(--space-4) 0' }}>
              <span style={{ fontSize: '40px', fontWeight: 900, color: 'var(--gray-900)', fontFamily: 'var(--font-display)' }}>₹{product.price.toLocaleString('en-IN')}</span>
              <span style={{ fontSize: 'var(--text-lg)', color: 'var(--gray-400)', textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
              <span style={{ background: 'var(--status-good-bg)', color: 'var(--status-good)', fontWeight: 700, padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: 'var(--text-sm)' }}>
                {discount}% off
              </span>
            </div>

            <div style={{ padding: 'var(--space-4)', background: product.inStock ? 'var(--status-good-bg)' : 'var(--gray-100)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span style={{ fontWeight: 700, color: product.inStock ? 'var(--status-good)' : 'var(--gray-400)', fontSize: 'var(--text-sm)' }}>
                {product.inStock ? '✅ In Stock — Ready to ship' : '❌ Out of Stock'}
              </span>
            </div>

            <p style={{ color: 'var(--gray-600)', lineHeight: 1.7, marginBottom: 'var(--space-5)' }}>{product.description}</p>

            {/* Qty + Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <button style={{ width: 40, height: 40, fontWeight: 700, fontSize: '18px', color: 'var(--gray-600)' }} onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
                <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 700 }}>{qty}</span>
                <button style={{ width: 40, height: 40, fontWeight: 700, fontSize: '18px', color: 'var(--gray-600)' }} onClick={() => setQty(q => q + 1)} aria-label="Increase quantity">+</button>
              </div>
              <button
                className={`btn btn-lg ${addedToCart ? 'btn-success' : 'btn-primary'}`}
                style={{ flex: 1 }}
                onClick={handleAddToCart}
                disabled={!product.inStock}
                aria-label={`Add ${qty} ${product.name} to cart`}
              >
                {addedToCart ? '✅ Added to Cart!' : '🛒 Add to Cart'}
              </button>
              <button
                className={`btn btn-lg btn-outline`}
                style={{ borderColor: isWished ? '#ef4444' : 'var(--primary-500)', color: isWished ? '#ef4444' : 'var(--primary-600)' }}
                onClick={() => toggleWishlist(product)}
                aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isWished ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Features */}
            <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'var(--gray-50)', borderRadius: 'var(--radius-xl)' }}>
              <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-sm)' }}>Key Features</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {[
                  'High accuracy sensor technology',
                  'Easy-to-read display with color indicators',
                  'Mobile app connectivity (WiFi/Bluetooth)',
                  '1-year manufacturer warranty',
                  'ISI certified & safety tested',
                ].map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 'var(--space-2)', fontSize: 'var(--text-sm)', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--status-good)', flexShrink: 0 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="section">
            <h2 className="section-title">Related Products</h2>
            <div className="grid-3" style={{ marginTop: 'var(--space-4)' }}>
              {related.map(p => (
                <div key={p.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/shop/product/${p.id}`)}>
                  <div style={{ height: 140, background: CATEGORY_COLORS[p.category] || '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>
                    {PRODUCT_ICONS[p.image] || '📦'}
                  </div>
                  <div className="card-body">
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-1)' }}>{p.name}</div>
                    <div style={{ fontWeight: 800, color: 'var(--primary-600)', fontFamily: 'var(--font-display)' }}>₹{p.price.toLocaleString('en-IN')}</div>
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-3)', width: '100%' }} onClick={e => { e.stopPropagation(); addToCart(p); }}>
                      + Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .product-detail-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-8);
          align-items: start;
        }
        @media (max-width: 768px) {
          .product-detail-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
