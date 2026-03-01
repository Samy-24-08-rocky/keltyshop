import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiZap } from 'react-icons/fi';
import { useAdmin } from '../context/AdminContext';

// Define complementary pairings by category
const CROSS_SELL_MAP = {
    Pantry: ['Condiments', 'Dairy', 'Bakery'],
    Condiments: ['Pantry', 'Meat', 'Snacks'],
    Dairy: ['Bakery', 'Breakfast', 'Pantry'],
    Meat: ['Condiments', 'Pantry'],
    Seafood: ['Condiments', 'Pantry'],
    Bakery: ['Dairy', 'Condiments'],
    Snacks: ['Drinks', 'Condiments'],
    Drinks: ['Snacks', 'Bakery'],
    Breakfast: ['Dairy', 'Drinks'],
    Frozen: ['Condiments', 'Drinks'],
};

const CrossMerchandising = ({ product, addToCart }) => {
    const { products: allProducts } = useAdmin();

    const suggestions = useMemo(() => {
        const related = CROSS_SELL_MAP[product?.category] || [];
        return allProducts
            .filter(p =>
                p.id !== product?.id &&
                p.stock > 0 &&
                related.includes(p.category)
            )
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 4);
    }, [allProducts, product]);

    if (!suggestions.length) return null;

    return (
        <div style={{
            marginTop: '3rem',
            background: 'linear-gradient(135deg, #fff9f0, #fff5ea)',
            border: '1px solid rgba(246,173,85,0.3)',
            borderRadius: 20,
            padding: '1.75rem',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'linear-gradient(135deg,#f6ad55,#ed8936)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <FiZap size={18} color="white" />
                </div>
                <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: '#1a202c' }}>
                        Pairs Great With
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#718096', marginTop: 1 }}>
                        Customers who bought this also got
                    </div>
                </div>
            </div>

            {/* Products */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                gap: '0.875rem',
            }}>
                {suggestions.map(p => {
                    const discount = p.oldPrice && p.oldPrice > p.price
                        ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;

                    return (
                        <div key={p.id} style={{
                            background: 'white',
                            borderRadius: 14,
                            border: '1px solid #f0eeeb',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            transition: 'all .25s',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                            }}
                        >
                            <div style={{ position: 'relative', height: 110, overflow: 'hidden' }}>
                                <Link to={`/product/${p.id}`}>
                                    <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
                                        onMouseEnter={e => e.target.style.transform = 'scale(1.07)'}
                                        onMouseLeave={e => e.target.style.transform = 'none'}
                                    />
                                </Link>
                                {discount > 0 && (
                                    <div style={{ position: 'absolute', top: 7, right: 7, background: 'linear-gradient(135deg,#e53e3e,#c53030)', color: 'white', fontSize: '0.62rem', fontWeight: 800, padding: '2px 7px', borderRadius: 99 }}>
                                        -{discount}%
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '0.625rem 0.75rem 0.75rem', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#f6ad55', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                    {p.category}
                                </div>
                                <Link to={`/product/${p.id}`} style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a202c', textDecoration: 'none', lineHeight: 1.3 }}>
                                    {p.name}
                                </Link>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f5f5f5', gap: '0.375rem' }}>
                                    <div>
                                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1a202c' }}>£{p.price.toFixed(2)}</span>
                                        {p.oldPrice && <span style={{ fontSize: '0.72rem', color: '#a0aec0', textDecoration: 'line-through', marginLeft: 3 }}>£{p.oldPrice.toFixed(2)}</span>}
                                    </div>
                                    <button
                                        onClick={() => addToCart({ ...p, quantity: 1 })}
                                        style={{
                                            width: 30, height: 30, borderRadius: 9, border: 'none',
                                            background: 'linear-gradient(135deg,#f6ad55,#ed8936)',
                                            color: 'white', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: '0 3px 10px rgba(246,173,85,0.4)',
                                            flexShrink: 0,
                                            transition: 'all .2s',
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                    >
                                        <FiShoppingCart size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CrossMerchandising;
