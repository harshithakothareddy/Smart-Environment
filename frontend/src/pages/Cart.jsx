import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { PRODUCTS } from '../data/mockData';

export default function Cart() {
  const { cart, removeFromCart, updateCartQty, cartTotal, addToCart } = useApp();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', address: '', phone: '', city: '', pincode: '' });
  const [formError, setFormError] = useState('');

  const tax = Math.round(cartTotal * 0.18);
  const delivery = cartTotal > 1999 ? 0 : 99;
  const grandTotal = cartTotal + tax + delivery;

  const related = PRODUCTS.filter(p => !cart.some(c => c.id === p.id)).slice(0, 4);

  const handleCheckout = () => {
    if (!form.name || !form.email || !form.address || !form.phone) {
      setFormError('Please fill all required fields.');
      return;
    }
    setFormError('');
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div style={{ maxWidth: 500, margin: '60px auto', textAlign: 'center' }}>
            <div style={{ fontSize: 72 }}>✅</div>
            <h2 style={{ marginTop: 'var(--space-4)' }}>Order Simulation Complete!</h2>
            <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-3)', lineHeight: 1.6 }}>
              This is a <strong>prototype checkout</strong>. No real payment was processed and no actual order was placed.
              In a production environment, this would connect to a real payment gateway.
            </p>
            <div className="card card-body" style={{ marginTop: 'var(--space-6)', textAlign: 'left', background: 'var(--green-50)' }}>
              <h4 style={{ color: 'var(--status-good)' }}>Order Summary (Demo)</h4>
              {cart.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 'var(--text-sm)', borderBottom: '1px solid var(--green-100)' }}>
                  <span>{p.name} ×{p.qty}</span>
                  <span style={{ fontWeight: 700 }}>₹{(p.price * p.qty).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 'var(--space-3)', fontWeight: 800, fontSize: 'var(--text-lg)' }}>
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-6)' }} onClick={() => navigate('/shop')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page-wrapper">
        <div className="container">
          <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center' }}>
            <div style={{ fontSize: 72 }}>🛒</div>
            <h2 style={{ marginTop: 'var(--space-4)' }}>Your Cart is Empty</h2>
            <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>Add some environmental products to get started.</p>
            <button className="btn btn-primary btn-lg" style={{ marginTop: 'var(--space-6)' }} onClick={() => navigate('/shop')}>
              Browse Products
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container">
        <h1 style={{ paddingTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>🛒 Your Cart ({cart.length} item{cart.length !== 1 ? 's' : ''})</h1>

        <div className="cart-layout">
          {/* Items */}
          <div>
            <div className="card">
              <div className="card-body">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-image">
                      <span style={{ fontSize: '32px' }}>📦</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: 'var(--gray-800)', marginBottom: 4 }}>{item.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-2)' }}>{item.category}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        {/* Qty Controls */}
                        <div className="qty-control">
                          <button className="qty-btn" onClick={() => updateCartQty(item.id, item.qty - 1)} aria-label="Decrease quantity">−</button>
                          <span className="qty-value">{item.qty}</span>
                          <button className="qty-btn" onClick={() => updateCartQty(item.id, item.qty + 1)} aria-label="Increase quantity">+</button>
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={() => removeFromCart(item.id)} style={{ color: 'var(--status-unhealthy)', fontSize: 'var(--text-xs)' }}>
                          Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 'var(--text-lg)', color: 'var(--gray-900)', fontFamily: 'var(--font-display)' }}>
                        ₹{(item.price * item.qty).toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }}>₹{item.price.toLocaleString('en-IN')} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Related */}
            {related.length > 0 && (
              <div style={{ marginTop: 'var(--space-6)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>You might also like</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
                  {related.map(p => (
                    <div key={p.id} className="card" style={{ padding: 'var(--space-3)', textAlign: 'center', cursor: 'pointer' }} onClick={() => addToCart(p)}>
                      <div style={{ fontSize: '36px', marginBottom: 'var(--space-2)' }}>📦</div>
                      <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--gray-800)', marginBottom: 4 }}>{p.name}</div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--primary-600)' }}>₹{p.price.toLocaleString('en-IN')}</div>
                      <button className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-2)', width: '100%' }}>+ Add</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary + Checkout Form */}
          <div>
            {/* Summary */}
            <div className="card card-body" style={{ marginBottom: 'var(--space-4)' }}>
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Order Summary</h3>
              <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
              <div className="summary-row"><span>GST (18%)</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
              <div className="summary-row">
                <span>Delivery</span>
                <span style={{ color: delivery === 0 ? 'var(--status-good)' : 'inherit' }}>
                  {delivery === 0 ? 'FREE' : `₹${delivery}`}
                </span>
              </div>
              {delivery !== 0 && (
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', marginBottom: 'var(--space-2)' }}>
                  Add ₹{(2000 - cartTotal).toLocaleString('en-IN')} more for free delivery
                </div>
              )}
              <div className="summary-divider"/>
              <div className="summary-row summary-total">
                <span>Grand Total</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="card card-body">
              <h3 style={{ marginBottom: 'var(--space-4)' }}>Shipping Details</h3>
              {formError && <div className="demo-banner" style={{ background: 'var(--status-unhealthy-bg)', borderColor: 'var(--status-unhealthy)' }}><span>⚠️</span>{formError}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <input className="input" placeholder="Full Name*" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} aria-label="Full name" aria-required="true"/>
                <input className="input" type="email" placeholder="Email Address*" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} aria-label="Email" aria-required="true"/>
                <input className="input" type="tel" placeholder="Phone Number*" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} aria-label="Phone number" aria-required="true"/>
                <input className="input" placeholder="Address*" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} aria-label="Address" aria-required="true"/>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                  <input className="input" placeholder="City" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} aria-label="City"/>
                  <input className="input" placeholder="PIN Code" value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} aria-label="PIN code"/>
                </div>
              </div>
              <div className="demo-banner" style={{ marginTop: 'var(--space-4)' }}>
                <span>ℹ️</span>
                <span>This is a prototype checkout. No real payment will be processed.</span>
              </div>
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 'var(--space-4)' }} onClick={handleCheckout}>
                Place Order (Demo) — ₹{grandTotal.toLocaleString('en-IN')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: var(--space-6); align-items: start; }
        .cart-item { display: flex; gap: var(--space-4); padding: var(--space-4) 0; border-bottom: 1px solid var(--gray-100); }
        .cart-item:last-child { border-bottom: none; }
        .cart-item-image { width: 80px; height: 80px; background: var(--gray-50); border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .qty-control { display: flex; align-items: center; border: 1.5px solid var(--gray-200); border-radius: var(--radius-full); overflow: hidden; }
        .qty-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: var(--gray-600); transition: background var(--transition-fast); }
        .qty-btn:hover { background: var(--gray-100); }
        .qty-value { padding: 0 var(--space-3); font-weight: 700; font-size: var(--text-sm); color: var(--gray-800); min-width: 36px; text-align: center; }
        .summary-row { display: flex; justify-content: space-between; font-size: var(--text-sm); color: var(--gray-600); padding: var(--space-2) 0; }
        .summary-divider { height: 1px; background: var(--gray-100); margin: var(--space-3) 0; }
        .summary-total { font-weight: 800; font-size: var(--text-lg); color: var(--gray-900); }
        @media (max-width: 900px) {
          .cart-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
