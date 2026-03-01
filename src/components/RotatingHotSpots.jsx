import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiZap, FiTag, FiTrendingUp } from 'react-icons/fi';
import { useAdmin } from '../context/AdminContext';

const SPOTS = [
    {
        key: 'weeklySpecial',
        label: 'Weekly Special',
        icon: <FiTag size={16} />,
        color: 'linear-gradient(135deg,#e53e3e,#c53030)',
        bg: 'linear-gradient(135deg,rgba(229,62,62,0.08),rgba(229,62,62,0.03))',
        border: 'rgba(229,62,62,0.2)',
        filter: (products) => {
            const manuals = products.filter(p => p.merchandisingSlot === 'hotspot' && p.stock > 0);
            const others = products.filter(p => p.oldPrice && p.oldPrice > p.price && p.stock > 0 && p.merchandisingSlot !== 'hotspot')
                .sort((a, b) => {
                    const da = ((a.oldPrice - a.price) / a.oldPrice);
                    const db = ((b.oldPrice - b.price) / b.oldPrice);
                    return db - da;
                });
            return [...manuals, ...others].slice(0, 3);
        }
    },
    {
        key: 'newArrivals',
        label: 'New Arrivals',
        icon: <FiZap size={16} />,
        color: 'linear-gradient(135deg,#9f7aea,#805ad5)',
        bg: 'linear-gradient(135deg,rgba(159,122,234,0.08),rgba(159,122,234,0.03))',
        border: 'rgba(159,122,234,0.2)',
        filter: (products) => products.filter(p => p.stock > 0 && p.featured)
            .slice(0, 3),
    },
    {
        key: 'topRated',
        label: 'Top Rated',
        icon: <FiTrendingUp size={16} />,
        color: 'linear-gradient(135deg,#38a169,#276749)',
        bg: 'linear-gradient(135deg,rgba(56,161,105,0.08),rgba(56,161,105,0.03))',
        border: 'rgba(56,161,105,0.2)',
        filter: (products) => products.filter(p => p.stock > 0 && p.rating >= 4.7)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3),
    },
];

const RotatingHotSpots = ({ addToCart }) => {
    const { products: allProducts } = useAdmin();
    const [activeSpot, setActiveSpot] = useState(0);
    const intervalRef = useRef(null);

    // Auto-rotate
    useEffect(() => {
        intervalRef.current = setInterval(() => {
            setActiveSpot(prev => (prev + 1) % SPOTS.length);
        }, 5000);
        return () => clearInterval(intervalRef.current);
    }, []);

    const spot = SPOTS[activeSpot];
    const products = spot.filter(allProducts);

    if (!products.length) return null;

    return (
        <section style={{ padding: '4rem 0', background: 'var(--bg)' }}>
            <div className="container">
                {/* Header */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.75rem' }}>
                    <div>
                        <div className="section-tag">Endcap Highlights</div>
                        <h2 className="section-title">Hot Spots This Week</h2>
                        <p className="section-sub">Rotating specials hand-picked for you</p>
                    </div>
                    <Link to="/deals" className="view-all-link">
                        All deals <FiArrowRight />
                    </Link>
                </div>

                {/* Tab switcher */}
                <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    {SPOTS.map((s, i) => (
                        <button
                            key={s.key}
                            onClick={() => {
                                setActiveSpot(i);
                                clearInterval(intervalRef.current);
                                intervalRef.current = setInterval(() => {
                                    setActiveSpot(prev => (prev + 1) % SPOTS.length);
                                }, 5000);
                            }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '0.4rem',
                                padding: '0.5rem 1rem', borderRadius: 10, border: 'none',
                                cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem',
                                background: activeSpot === i ? s.color : 'white',
                                color: activeSpot === i ? 'white' : '#718096',
                                boxShadow: activeSpot === i ? '0 4px 14px rgba(0,0,0,0.18)' : '0 1px 4px rgba(0,0,0,0.07)',
                                transition: 'all .25s',
                                border: activeSpot !== i ? '1px solid #f0eeeb' : 'none',
                            }}
                        >
                            {s.icon} {s.label}
                        </button>
                    ))}
                </div>

                {/* Products */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                    gap: '1.25rem',
                    animation: 'fadeIn .35s ease',
                }}>
                    {products.map(p => {
                        const discount = p.oldPrice && p.oldPrice > p.price
                            ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

                        return (
                            <div key={p.id} style={{
                                background: spot.bg,
                                border: `1px solid ${spot.border}`,
                                borderRadius: 18,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.875rem',
                                transition: 'all .25s',
                                cursor: 'pointer',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                {/* Image */}
                                <Link to={`/product/${p.id}`} style={{ flexShrink: 0 }}>
                                    <div style={{ width: 80, height: 80, borderRadius: 12, overflow: 'hidden', background: 'white' }}>
                                        <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </Link>
                                {/* Info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3, color: '#718096' }}>
                                        {p.category}
                                    </div>
                                    <Link to={`/product/${p.id}`} style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a202c', textDecoration: 'none', display: 'block', lineHeight: 1.3 }}>
                                        {p.name}
                                    </Link>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1a202c' }}>£{p.price.toFixed(2)}</span>
                                        {p.oldPrice && <span style={{ fontSize: '0.78rem', color: '#a0aec0', textDecoration: 'line-through' }}>£{p.oldPrice.toFixed(2)}</span>}
                                        {discount > 0 && (
                                            <span style={{ background: spot.color, color: 'white', fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: 99 }}>
                                                -{discount}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {/* Add to cart */}
                                <button
                                    onClick={() => {
                                        addToCart({ ...p, quantity: 1 });
                                        window.dispatchEvent(new CustomEvent('cartNotification', {
                                            detail: { message: `${p.name} added`, type: 'success' }
                                        }));
                                    }}
                                    style={{
                                        width: 36, height: 36, borderRadius: 10, border: 'none',
                                        background: spot.color,
                                        color: 'white', cursor: 'pointer', flexShrink: 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                        transition: 'all .2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.12)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
      `}</style>
        </section>
    );
};

export default RotatingHotSpots;
