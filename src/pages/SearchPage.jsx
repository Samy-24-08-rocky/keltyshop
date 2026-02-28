import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiArrowLeft, FiX } from 'react-icons/fi';
import { useAdmin } from '../context/AdminContext';
import { useUserData } from '../context/UserDataContext';

const Stars = ({ rating }) => (
    <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
            <svg key={i} style={{ width: 13, height: 13 }} viewBox="0 0 20 20" fill={i <= Math.round(rating) ? '#f6ad55' : '#e2e8f0'}>
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
        ))}
    </div>
);

export default function SearchPage({ addToCart }) {
    const [params] = useSearchParams();
    const query = params.get('q') || '';
    const { products } = useAdmin();
    const { toggleWishlist, isWishlisted } = useUserData();

    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return products.filter(p =>
            (p.name || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.description || '').toLowerCase().includes(q)
        );
    }, [products, query]);

    const handleAdd = (product) => {
        if (product.stock === 0) return;
        addToCart({ ...product, quantity: 1 });
        window.dispatchEvent(new CustomEvent('cartNotification', {
            detail: { message: `${product.name} added to cart 🛒`, type: 'success' }
        }));
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem', minHeight: '70vh', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#e53e3e', fontWeight: 600, textDecoration: 'none', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    <FiArrowLeft size={14} /> Back to Shop
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FiSearch size={22} color="#e53e3e" />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a202c', margin: 0 }}>
                        {query ? `Results for "${query}"` : 'Search Products'}
                    </h1>
                </div>
                {query && (
                    <p style={{ color: '#718096', fontSize: '0.875rem', marginTop: '0.375rem' }}>
                        {results.length} product{results.length !== 1 ? 's' : ''} found
                    </p>
                )}
            </div>

            {/* No query */}
            {!query && (
                <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
                    <FiSearch size={52} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                    <p style={{ color: '#a0aec0', fontSize: '1rem' }}>Type something in the search bar above to find products.</p>
                </div>
            )}

            {/* No results */}
            {query && results.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: 20, border: '1px solid #f1f5f9' }}>
                    <FiX size={48} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: '#718096', fontWeight: 600, marginBottom: '0.5rem' }}>No products found for "{query}"</h3>
                    <p style={{ color: '#a0aec0', fontSize: '0.875rem', marginBottom: '1.25rem' }}>Try a different name or category</p>
                    <Link to="/shop" style={{ color: '#e53e3e', fontWeight: 600, textDecoration: 'none', padding: '0.625rem 1.5rem', background: 'rgba(229,62,62,0.06)', borderRadius: 10, border: '1px solid rgba(229,62,62,0.15)' }}>
                        Browse all products
                    </Link>
                </div>
            )}

            {/* Results grid */}
            {results.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
                    {results.map(product => {
                        const oos = product.stock === 0;
                        const low = product.stock > 0 && product.stock <= 5;
                        const wished = isWishlisted(product.id);
                        const discount = product.oldPrice && product.oldPrice > product.price
                            ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

                        // Highlight query in name
                        const highlightName = (name) => {
                            const idx = name.toLowerCase().indexOf(query.toLowerCase());
                            if (idx === -1) return name;
                            return (
                                <>
                                    {name.slice(0, idx)}
                                    <mark style={{ background: '#FFF5F5', color: '#c53030', borderRadius: 3, padding: '0 2px' }}>{name.slice(idx, idx + query.length)}</mark>
                                    {name.slice(idx + query.length)}
                                </>
                            );
                        };

                        return (
                            <div key={product.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f0eeeb', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', overflow: 'hidden', opacity: oos ? 0.72 : 1, filter: oos ? 'grayscale(30%)' : 'none', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ position: 'relative', height: 170, overflow: 'hidden', background: '#f7f7f7' }}>
                                    <Link to={`/product/${product.id}`}>
                                        <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </Link>
                                    {oos && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ background: '#e53e3e', color: 'white', fontWeight: 800, fontSize: '0.7rem', letterSpacing: '0.1em', padding: '4px 12px', borderRadius: 99, textTransform: 'uppercase' }}>Out of Stock</span>
                                        </div>
                                    )}
                                    {discount > 0 && !oos && (
                                        <div style={{ position: 'absolute', top: 8, right: 8, background: 'linear-gradient(135deg,#e53e3e,#c53030)', color: 'white', fontWeight: 800, fontSize: '0.65rem', padding: '3px 8px', borderRadius: 99 }}>–{discount}%</div>
                                    )}
                                </div>
                                <div style={{ padding: '0.75rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#e53e3e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{product.category}</div>
                                    <Link to={`/product/${product.id}`} style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1a202c', textDecoration: 'none', lineHeight: 1.3 }}>{highlightName(product.name)}</Link>
                                    <Stars rating={product.rating || 4.5} />
                                    <span style={{ fontSize: '0.68rem', fontWeight: 600, color: oos ? '#e53e3e' : low ? '#d69e2e' : '#38a169' }}>
                                        {oos ? '● Out of Stock' : low ? `● Only ${product.stock} left!` : '● In Stock'}
                                    </span>
                                    <div style={{ marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div>
                                            <span style={{ fontWeight: 800, color: '#1a202c', fontSize: '1.05rem' }}>£{product.price.toFixed(2)}</span>
                                            {product.oldPrice && <span style={{ fontSize: '0.75rem', color: '#a0aec0', textDecoration: 'line-through', marginLeft: '0.25rem' }}>£{product.oldPrice.toFixed(2)}</span>}
                                        </div>
                                        <button onClick={() => handleAdd(product)} disabled={oos}
                                            style={{ width: 34, height: 34, borderRadius: 9, border: 'none', background: oos ? '#e2e8f0' : 'linear-gradient(135deg,#e53e3e,#c53030)', color: oos ? '#a0aec0' : 'white', cursor: oos ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: oos ? 'none' : '0 3px 10px rgba(229,62,62,0.35)' }}>
                                            <FiShoppingCart size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
