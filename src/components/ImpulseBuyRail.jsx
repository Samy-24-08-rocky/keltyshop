import React, { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useAdmin } from '../context/AdminContext';

// Categories most likely to be impulse buys at checkout
const IMPULSE_CATS = ['Snacks', 'Drinks', 'Condiments', 'Bakery'];

const ImpulseBuyRail = ({ addToCart, cartItems = [] }) => {
    const { products: allProducts } = useAdmin();
    const scrollRef = useRef(null);

    const cartIds = useMemo(() => new Set(cartItems.map(i => i.id)), [cartItems]);

    const impulseProducts = useMemo(() =>
        allProducts
            .filter(p => IMPULSE_CATS.includes(p.category) && p.stock > 0 && !cartIds.has(p.id))
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 10),
        [allProducts, cartIds]
    );

    if (!impulseProducts.length) return null;

    const scroll = (dir) => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
        }
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: 20,
            padding: '1.5rem',
            marginTop: '1.75rem',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>⚡</span>
                        <span style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem' }}>Add a Little Extra?</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                        Popular pick-ups near checkout
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.375rem' }}>
                    {[FiChevronLeft, FiChevronRight].map((Icon, i) => (
                        <button
                            key={i}
                            onClick={() => scroll(i === 0 ? -1 : 1)}
                            style={{
                                width: 30, height: 30, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                                background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all .2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,62,62,0.3)'; e.currentTarget.style.borderColor = 'rgba(229,62,62,0.5)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                        >
                            <Icon size={14} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Horizontal scroll rail */}
            <div
                ref={scrollRef}
                style={{
                    display: 'flex',
                    gap: '0.75rem',
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    paddingBottom: 4,
                }}
            >
                {impulseProducts.map(p => (
                    <div key={p.id} style={{
                        flexShrink: 0,
                        width: 148,
                        background: 'rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 14,
                        overflow: 'hidden',
                        transition: 'all .25s',
                        cursor: 'pointer',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(229,62,62,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                    >
                        <Link to={`/product/${p.id}`}>
                            <div style={{ height: 90, overflow: 'hidden' }}>
                                <img src={p.image} alt={p.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
                                    onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
                                    onMouseLeave={e => e.target.style.transform = 'none'}
                                />
                            </div>
                        </Link>
                        <div style={{ padding: '0.55rem 0.625rem 0.625rem' }}>
                            <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(246,173,85,0.9)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>
                                {p.category}
                            </div>
                            <div style={{ fontWeight: 600, fontSize: '0.78rem', color: 'white', lineHeight: 1.3, marginBottom: '0.5rem' }}>
                                {p.name.length > 22 ? p.name.slice(0, 22) + '…' : p.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f6ad55' }}>£{p.price.toFixed(2)}</span>
                                <button
                                    onClick={() => {
                                        addToCart({ ...p, quantity: 1 });
                                        window.dispatchEvent(new CustomEvent('cartNotification', {
                                            detail: { message: `${p.name} added`, type: 'success' }
                                        }));
                                    }}
                                    style={{
                                        width: 26, height: 26, borderRadius: 7, border: 'none',
                                        background: 'linear-gradient(135deg,#e53e3e,#c53030)',
                                        color: 'white', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 3px 10px rgba(229,62,62,0.5)',
                                        flexShrink: 0,
                                    }}
                                >
                                    <FiShoppingCart size={11} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ImpulseBuyRail;
