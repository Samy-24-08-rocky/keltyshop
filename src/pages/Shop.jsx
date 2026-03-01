import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiFilter, FiGrid, FiList, FiStar, FiAward, FiZap } from 'react-icons/fi';
import { useAdmin } from '../context/AdminContext';
import { useUserData } from '../context/UserDataContext';

// ── Zone / Aisle configuration ──────────────────────────────────────────────
const AISLES = [
  { id: 'all', label: 'All Products', icon: '🛒', cats: null },
  { id: 'pantry', label: 'Pantry & Dry', icon: '🥫', cats: ['Pantry'] },
  { id: 'dairy', label: 'Dairy & Eggs', icon: '🥛', cats: ['Dairy'] },
  { id: 'meat', label: 'Meat & Fish', icon: '🥩', cats: ['Meat', 'Seafood'] },
  { id: 'bakery', label: 'Bakery', icon: '🍞', cats: ['Bakery'] },
  { id: 'beverages', label: 'Beverages', icon: '🥤', cats: ['Drinks'] },
  { id: 'snacks', label: 'Snacks', icon: '🍿', cats: ['Snacks'] },
  { id: 'condiments', label: 'Condiments', icon: '🫙', cats: ['Condiments'] },
  { id: 'frozen', label: 'Frozen', icon: '🧊', cats: ['Frozen'] },
  { id: 'breakfast', label: 'Breakfast', icon: '🥣', cats: ['Breakfast'] },
];

const SORT_OPTIONS = [
  { value: 'golden', label: '⭐ Golden Zone' },
  { value: 'featured', label: 'Featured First' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'priceLow', label: 'Price: Low → High' },
  { value: 'priceHigh', label: 'Price: High → Low' },
  { value: 'name', label: 'A → Z' },
  { value: 'discount', label: 'Best Discount' },
];

// Golden zone: high-margin, featured, eye-level items = featured + high rating
const goldenScore = (p) => {
  let score = 0;
  // Absolute parity with AdminMerchandising.jsx
  if (p.merchandisingSlot === 'golden') return 500;
  if (p.merchandisingSlot === 'hotspot') return 400;
  if (p.merchandisingSlot === 'impulse') return 300;

  if (p.featured) score += 40;
  if (p.rating >= 4.7) score += 30;
  if (p.oldPrice && p.oldPrice > p.price) score += 20;
  if (p.stock > 0 && p.stock <= 5) score += 10;
  return score;
};

const Stars = ({ rating }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} style={{ width: 13, height: 13 }} viewBox="0 0 20 20" fill={i <= Math.round(rating) ? '#f6ad55' : '#e2e8f0'}>
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ))}
    <span style={{ fontSize: '0.7rem', color: '#718096', marginLeft: 3 }}>{rating}</span>
  </div>
);

const ShelfBadge = ({ p }) => {
  if (p.merchandisingSlot === 'golden' || (p.featured && p.rating >= 4.8)) {
    return (
      <div style={{
        position: 'absolute', top: 10, left: 10, zIndex: 3,
        background: 'linear-gradient(135deg,#f6ad55,#ed8936)',
        color: 'white', fontSize: '0.58rem', fontWeight: 800,
        padding: '3px 8px', borderRadius: 99, letterSpacing: '0.06em',
        textTransform: 'uppercase', boxShadow: '0 3px 10px rgba(246,173,85,0.5)',
        display: 'flex', alignItems: 'center', gap: 3,
      }}>
        <FiAward size={9} /> {p.merchandisingSlot === 'golden' ? 'Premium Placement' : 'Golden Zone'}
      </div>
    );
  }
  if (p.featured) {
    return (
      <div style={{
        position: 'absolute', top: 10, left: 10, zIndex: 3,
        background: 'linear-gradient(135deg,#9f7aea,#805ad5)',
        color: 'white', fontSize: '0.58rem', fontWeight: 800,
        padding: '3px 8px', borderRadius: 99, letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        <FiStar size={9} style={{ display: 'inline', marginRight: 2 }} /> Featured
      </div>
    );
  }
  if (p.stock > 0 && p.stock <= 5) {
    return (
      <div style={{
        position: 'absolute', top: 10, left: 10, zIndex: 3,
        background: 'linear-gradient(135deg,#d69e2e,#c05621)',
        color: 'white', fontSize: '0.58rem', fontWeight: 800,
        padding: '3px 8px', borderRadius: 99, letterSpacing: '0.06em',
        textTransform: 'uppercase',
      }}>
        <FiZap size={9} style={{ display: 'inline', marginRight: 2 }} /> Low Stock
      </div>
    );
  }
  return null;
};

const Shop = ({ addToCart }) => {
  const { products: allProducts, settings } = useAdmin();
  const { toggleWishlist, isWishlisted } = useUserData();
  const m = settings?.merchandising ?? {};
  const [aisle, setAisle] = useState('all');
  const [sort, setSort] = useState(m.goldenZoneEnabled ? 'golden' : 'featured');
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notify = (msg, type = 'success') => {
    const n = { id: Date.now(), msg, type };
    setNotifications(prev => [...prev, n]);
    setTimeout(() => setNotifications(prev => prev.filter(x => x.id !== n.id)), 2500);
  };

  const currentAisle = AISLES.find(a => a.id === aisle);

  const products = useMemo(() => {
    let list = currentAisle?.cats
      ? allProducts.filter(p => currentAisle.cats.some(c => p.category?.toLowerCase() === c.toLowerCase()))
      : allProducts;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
    }
    if (inStockOnly) list = list.filter(p => p.stock > 0);

    switch (sort) {
      case 'golden': return [...list].sort((a, b) => goldenScore(b) - goldenScore(a));
      case 'featured': return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      case 'rating': return [...list].sort((a, b) => b.rating - a.rating);
      case 'priceLow': return [...list].sort((a, b) => a.price - b.price);
      case 'priceHigh': return [...list].sort((a, b) => b.price - a.price);
      case 'name': return [...list].sort((a, b) => a.name?.localeCompare(b.name));
      case 'discount': return [...list].sort((a, b) => {
        const da = a.oldPrice ? ((a.oldPrice - a.price) / a.oldPrice) : 0;
        const db = b.oldPrice ? ((b.oldPrice - b.price) / b.oldPrice) : 0;
        return db - da;
      });
      default: return list;
    }
  }, [allProducts, aisle, sort, search, inStockOnly, currentAisle]);

  const handleAdd = (p) => {
    if (p.stock === 0) return;
    addToCart({ ...p, quantity: 1 });
    notify(`${p.name} added to cart 🛒`);
  };

  const handleWish = (p) => {
    const was = isWishlisted(p.id);
    toggleWishlist(p);
    notify(was ? 'Removed from wishlist' : `${p.name} wishlisted ❤️`, was ? 'info' : 'success');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', paddingBottom: '5rem' }}>

      {/* Toast */}
      <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.map(n => (
          <div key={n.id} style={{
            background: n.type === 'success' ? '#065f46' : '#1e3a5f',
            color: 'white', padding: '0.6rem 1.25rem', borderRadius: 10,
            fontSize: '0.85rem', fontWeight: 600,
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
            animation: 'fadeInUp .25s ease',
          }}>
            {n.msg}
          </div>
        ))}
      </div>

      {/* ── Hero / Decompression zone ─────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 60%,#0f3460 100%)',
        padding: '3.5rem 1.5rem 4.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(229,62,62,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(229,62,62,0.15)', border: '1px solid rgba(229,62,62,0.3)', color: '#fc8181', padding: '0.35rem 1rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, marginBottom: '1.25rem', letterSpacing: '0.04em' }}>
            🛒 Full Product Catalogue
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem,5vw,3.25rem)', fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: '0.75rem' }}>
            Shop Our <span style={{ background: 'linear-gradient(135deg,#f6ad55,#e53e3e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Full Range</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', maxWidth: 520, margin: '0 auto 2rem' }}>
            Browse by aisle, sort by what matters to you, and find your favourites with ease.
          </p>
          {/* Search bar */}
          <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products, categories…"
              style={{
                width: '100%', padding: '0.875rem 1.25rem 0.875rem 3rem',
                borderRadius: 14, border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
                color: 'white', fontSize: '0.95rem', outline: 'none',
              }}
            />
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Aisle Navigation / Section Mapping ───────────────────────────── */}
      {m.smartAislesEnabled && (
        <div style={{ background: 'white', borderBottom: '1px solid #f0eeeb', position: 'sticky', top: 64, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem' }}>
            <div style={{ display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', gap: '0.25rem', padding: '0.625rem 0' }}>
              {AISLES.map(a => (
                <button
                  key={a.id}
                  onClick={() => setAisle(a.id)}
                  style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.5rem 1rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.82rem', transition: 'all .2s',
                    background: aisle === a.id ? 'linear-gradient(135deg,#e53e3e,#c53030)' : 'transparent',
                    color: aisle === a.id ? 'white' : '#718096',
                    boxShadow: aisle === a.id ? '0 4px 12px rgba(229,62,62,0.35)' : 'none',
                  }}
                >
                  <span>{a.icon}</span> {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.25rem 1.25rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', background: 'white', padding: '0.875rem 1.25rem', borderRadius: 14, border: '1px solid #f0eeeb', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
          {/* Result count + filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#718096' }}>
              <strong style={{ color: '#1a202c' }}>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
              {currentAisle?.label !== 'All Products' && (
                <span> in <strong style={{ color: '#e53e3e' }}>{currentAisle?.label}</strong></span>
              )}
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'pointer', fontSize: '0.82rem', color: '#718096', fontWeight: 500 }}>
              <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)}
                style={{ accentColor: '#e53e3e', width: 15, height: 15 }} />
              In Stock Only
            </label>
          </div>
          {/* Sort + View */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FiFilter size={14} style={{ color: '#718096' }} />
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                style={{ border: '1px solid #e2e8f0', borderRadius: 9, padding: '0.4rem 0.75rem', fontSize: '0.82rem', outline: 'none', background: 'white', color: '#1a202c', cursor: 'pointer' }}
              >
                {SORT_OPTIONS.filter(o => o.value !== 'golden' || m.goldenZoneEnabled).map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            {/* View toggle */}
            <div style={{ display: 'flex', borderRadius: 9, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              {[['grid', <FiGrid size={15} />], ['list', <FiList size={15} />]].map(([v, icon]) => (
                <button key={v} onClick={() => setView(v)} style={{
                  width: 34, height: 34, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: view === v ? 'linear-gradient(135deg,#e53e3e,#c53030)' : 'white',
                  color: view === v ? 'white' : '#718096',
                  transition: 'all .2s',
                }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Grid ─────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1rem', background: 'white', borderRadius: 20, border: '1px solid #f0eeeb' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontWeight: 700, color: '#1a202c' }}>No products found</h3>
            <p style={{ color: '#718096', marginTop: '0.5rem' }}>Try a different aisle or search term.</p>
            <button onClick={() => { setAisle('all'); setSearch(''); setInStockOnly(false); }}
              style={{ marginTop: '1.25rem', background: 'linear-gradient(135deg,#e53e3e,#c53030)', color: 'white', border: 'none', borderRadius: 12, padding: '0.625rem 1.5rem', fontWeight: 600, cursor: 'pointer' }}>
              Clear Filters
            </button>
          </div>
        ) : view === 'grid' ? (
          <GridView products={products} onAdd={handleAdd} onWish={handleWish} isWishlisted={isWishlisted} />
        ) : (
          <ListView products={products} onAdd={handleAdd} onWish={handleWish} isWishlisted={isWishlisted} />
        )}
      </div>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
};

// ── Grid View ────────────────────────────────────────────────────────────────
const GridView = ({ products, onAdd, onWish, isWishlisted }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.125rem' }}>
    {products.map(p => {
      const oos = p.stock === 0;
      const low = p.stock > 0 && p.stock <= 5;
      const wished = isWishlisted(p.id);
      const discount = p.oldPrice && p.oldPrice > p.price
        ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
      const isGolden = p.featured && p.rating >= 4.8;

      return (
        <div key={p.id} style={{
          background: 'white',
          borderRadius: 18, overflow: 'hidden',
          border: isGolden ? '2px solid rgba(246,173,85,0.4)' : '1px solid #f0eeeb',
          boxShadow: isGolden ? '0 4px 20px rgba(246,173,85,0.15)' : '0 2px 10px rgba(0,0,0,0.05)',
          display: 'flex', flexDirection: 'column',
          opacity: oos ? 0.75 : 1,
          transition: 'all .25s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.11)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = isGolden ? '0 4px 20px rgba(246,173,85,0.15)' : '0 2px 10px rgba(0,0,0,0.05)'; }}
        >
          {/* Image */}
          <div style={{ position: 'relative', height: 185, overflow: 'hidden', background: '#f7f7f7' }}>
            <Link to={`/product/${p.id}`}>
              <img src={p.image} alt={p.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .45s', filter: oos ? 'grayscale(35%)' : 'none' }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                onMouseLeave={e => e.target.style.transform = 'none'}
              />
            </Link>
            {oos && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ background: '#e53e3e', color: 'white', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 99, textTransform: 'uppercase' }}>Out of Stock</span>
              </div>
            )}
            {discount > 0 && !oos && (
              <div style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg,#e53e3e,#c53030)', color: 'white', fontWeight: 800, fontSize: '0.65rem', padding: '3px 8px', borderRadius: 99 }}>
                -{discount}%
              </div>
            )}
            <ShelfBadge p={p} />
            {/* Wishlist */}
            <button onClick={() => onWish(p)} style={{
              position: 'absolute', bottom: 10, right: 10, width: 30, height: 30,
              borderRadius: 8, border: 'none',
              background: wished ? '#e53e3e' : 'rgba(255,255,255,0.92)',
              color: wished ? 'white' : '#718096',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transition: 'all .2s',
            }}>
              <FiHeart size={13} fill={wished ? 'white' : 'none'} />
            </button>
          </div>

          {/* Info */}
          <div style={{ padding: '0.875rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#e53e3e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{p.category}</div>
            <Link to={`/product/${p.id}`} style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a202c', textDecoration: 'none', lineHeight: 1.3 }}>
              {p.name}
            </Link>
            <Stars rating={p.rating || 4.5} />
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: oos ? '#e53e3e' : low ? '#d69e2e' : '#38a169' }}>
              {oos ? '● Out of Stock' : low ? `● Only ${p.stock} left!` : '● In Stock'}
            </span>
            {/* Price + cart */}
            <div style={{ marginTop: 'auto', paddingTop: '0.625rem', borderTop: '1px solid #f5f5f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a202c' }}>£{p.price.toFixed(2)}</span>
                {p.oldPrice && <span style={{ fontSize: '0.75rem', color: '#a0aec0', textDecoration: 'line-through', marginLeft: 3 }}>£{p.oldPrice.toFixed(2)}</span>}
              </div>
              <button onClick={() => onAdd(p)} disabled={oos} style={{
                width: 34, height: 34, borderRadius: 10, border: 'none',
                background: oos ? '#e2e8f0' : 'linear-gradient(135deg,#e53e3e,#c53030)',
                color: oos ? '#a0aec0' : 'white',
                cursor: oos ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: oos ? 'none' : '0 4px 12px rgba(229,62,62,0.35)',
                flexShrink: 0, transition: 'all .2s',
              }}
                onMouseEnter={e => { if (!oos) e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <FiShoppingCart size={14} />
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// ── List View ────────────────────────────────────────────────────────────────
const ListView = ({ products, onAdd, onWish, isWishlisted }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    {products.map(p => {
      const oos = p.stock === 0;
      const low = p.stock > 0 && p.stock <= 5;
      const wished = isWishlisted(p.id);
      const discount = p.oldPrice && p.oldPrice > p.price
        ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
      const isGolden = p.featured && p.rating >= 4.8;

      return (
        <div key={p.id} style={{
          background: 'white', borderRadius: 16,
          border: isGolden ? '2px solid rgba(246,173,85,0.4)' : '1px solid #f0eeeb',
          display: 'flex', alignItems: 'center', gap: '1rem',
          padding: '0.875rem 1.125rem',
          opacity: oos ? 0.75 : 1,
          transition: 'all .25s',
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
        }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.05)'; }}
        >
          {/* Image */}
          <Link to={`/product/${p.id}`} style={{ flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: 12, overflow: 'hidden', background: '#f7f7f7' }}>
              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: oos ? 'grayscale(35%)' : 'none' }} />
            </div>
          </Link>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#e53e3e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{p.category}</span>
              {isGolden && <span style={{ fontSize: '0.58rem', background: 'linear-gradient(135deg,#f6ad55,#ed8936)', color: 'white', fontWeight: 800, padding: '1px 7px', borderRadius: 99 }}>⭐ Golden Zone</span>}
              {p.featured && !isGolden && <span style={{ fontSize: '0.58rem', background: '#9f7aea', color: 'white', fontWeight: 800, padding: '1px 7px', borderRadius: 99 }}>Featured</span>}
            </div>
            <Link to={`/product/${p.id}`} style={{ fontWeight: 700, fontSize: '0.92rem', color: '#1a202c', textDecoration: 'none', display: 'block', marginTop: 2 }}>
              {p.name}
            </Link>
            <Stars rating={p.rating || 4.5} />
          </div>
          {/* Stock + Price + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: oos ? '#e53e3e' : low ? '#d69e2e' : '#38a169', display: 'none', '@media(minWidth:600px)': { display: 'block' } }}>
              {oos ? 'Out of Stock' : low ? `Only ${p.stock} left` : 'In Stock'}
            </span>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1a202c' }}>£{p.price.toFixed(2)}</div>
              {p.oldPrice && <div style={{ fontSize: '0.75rem', color: '#a0aec0', textDecoration: 'line-through' }}>£{p.oldPrice.toFixed(2)}</div>}
              {discount > 0 && <div style={{ fontSize: '0.62rem', color: '#e53e3e', fontWeight: 700 }}>-{discount}% off</div>}
            </div>
            <button onClick={() => onWish(p)} style={{
              width: 34, height: 34, borderRadius: 9, border: `1px solid ${wished ? '#e53e3e' : '#e2e8f0'}`,
              background: wished ? 'rgba(229,62,62,0.08)' : 'white',
              color: wished ? '#e53e3e' : '#718096', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FiHeart size={14} fill={wished ? '#e53e3e' : 'none'} />
            </button>
            <button onClick={() => onAdd(p)} disabled={oos} style={{
              height: 36, padding: '0 1rem', borderRadius: 10, border: 'none', flexShrink: 0,
              background: oos ? '#e2e8f0' : 'linear-gradient(135deg,#e53e3e,#c53030)',
              color: oos ? '#a0aec0' : 'white',
              cursor: oos ? 'not-allowed' : 'pointer',
              fontWeight: 600, fontSize: '0.82rem',
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              boxShadow: oos ? 'none' : '0 4px 12px rgba(229,62,62,0.3)',
            }}>
              <FiShoppingCart size={13} /> Add
            </button>
          </div>
        </div>
      );
    })}
  </div>
);

export default Shop;