import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiShoppingCart, FiTag } from 'react-icons/fi';
import { useAdmin } from '../context/AdminContext';

const useCountdown = (secondsInit) => {
  const [secs, setSecs] = useState(secondsInit);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
};

const DealCard = ({ product, addToCart, idx }) => {
  const baseSeconds = 3600 * (2 + (idx % 10)) + 600 * (idx % 5);
  const countdown = useCountdown(baseSeconds);
  const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  const oos = product.stock === 0;

  const [added, setAdded] = useState(false);
  const handleAdd = () => {
    if (oos) return;
    addToCart({ ...product, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    window.dispatchEvent(new CustomEvent('cartNotification', {
      detail: { message: `${product.name} added to cart`, type: 'success' }
    }));
  };

  return (
    <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid rgba(229,62,62,0.1)', display: 'flex', flexDirection: 'column', opacity: oos ? 0.7 : 1 }}>
      {/* Image */}
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: oos ? 'grayscale(40%)' : 'none', transition: 'transform .4s' }} />
        {oos
          ? <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#e53e3e', color: 'white', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.1em', padding: '6px 16px', borderRadius: 99, textTransform: 'uppercase' }}>Out of Stock</span>
          </div>
          : <div style={{ position: 'absolute', top: 12, right: 12, background: 'linear-gradient(135deg,#e53e3e,#c53030)', color: 'white', fontSize: '0.72rem', fontWeight: 800, padding: '4px 10px', borderRadius: 99, boxShadow: '0 2px 8px rgba(229,62,62,0.4)' }}>
            SAVE {discount}%
          </div>
        }
      </div>

      {/* Content */}
      <div style={{ padding: '1rem 1.1rem 1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#e53e3e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{product.category}</div>
        <Link to={`/product/${product.id}`} style={{ fontWeight: 700, color: '#1a202c', textDecoration: 'none', fontSize: '0.95rem', lineHeight: 1.3 }}>{product.name}</Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e53e3e' }}>£{product.price.toFixed(2)}</span>
          <span style={{ fontSize: '0.85rem', color: '#a0aec0', textDecoration: 'line-through' }}>£{product.oldPrice.toFixed(2)}</span>
          <span style={{ background: '#FFF5F5', color: '#c53030', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 6 }}>–{discount}%</span>
        </div>

        {/* Countdown */}
        {!oos && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#FFF5F5', borderRadius: 8, padding: '0.4rem 0.625rem', marginTop: '0.25rem' }}>
            <FiClock size={13} color="#c53030" />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#c53030', fontFamily: 'monospace' }}>Ends in {countdown}</span>
          </div>
        )}

        {/* Stock */}
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: oos ? '#e53e3e' : product.stock <= 5 ? '#d69e2e' : '#38a169' }}>
          {oos ? '● Out of Stock' : product.stock <= 5 ? `● Only ${product.stock} left!` : '● In Stock'}
        </span>

        {/* Add to Cart */}
        <button onClick={handleAdd} disabled={oos} style={{ marginTop: 'auto', paddingTop: '0.75rem', width: '100%', padding: '0.7rem', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: '0.875rem', cursor: oos ? 'not-allowed' : 'pointer', background: oos ? '#e2e8f0' : added ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#e53e3e,#c53030)', color: oos ? '#a0aec0' : 'white', transition: 'all .3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: oos ? 'none' : '0 4px 14px rgba(229,62,62,0.3)' }}>
          <FiShoppingCart size={15} />
          {oos ? 'Out of Stock' : added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default function DealsPage({ addToCart }) {
  const { products } = useAdmin();

  // All products with a discount (oldPrice set and higher than price)
  const deals = useMemo(() =>
    products.filter(p => p.oldPrice && p.oldPrice > p.price)
      .sort((a, b) => {
        const da = Math.round(((a.oldPrice - a.price) / a.oldPrice) * 100);
        const db = Math.round(((b.oldPrice - b.price) / b.oldPrice) * 100);
        return db - da; // biggest discount first
      }),
    [products]
  );

  return (
    <div style={{ background: '#f8f7f4', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#1a202c,#2d3748)', padding: '3rem 1.25rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(229,62,62,0.15)', border: '1px solid rgba(229,62,62,0.3)', padding: '0.375rem 1rem', borderRadius: 99, marginBottom: '1rem' }}>
          <FiTag size={13} color="#f87171" />
          <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Limited Time Offers</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: 'white', margin: '0 0 0.5rem' }}>🔥 Weekly Hot Deals</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', maxWidth: 480, margin: '0 auto' }}>
          {deals.length} discounted products — grab them before they sell out
        </p>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2rem 1.25rem' }}>
        {deals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: 20 }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏷️</div>
            <h3 style={{ color: '#718096' }}>No deals right now</h3>
            <p style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Admin hasn't set any discounted products yet.</p>
            <Link to="/shop" style={{ marginTop: '1rem', display: 'inline-block', color: '#e53e3e', fontWeight: 600 }}>Browse all products →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {deals.map((product, idx) => (
              <DealCard key={product.id} product={product} addToCart={addToCart} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}