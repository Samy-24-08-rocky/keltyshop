import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart, FiEye, FiFilter } from 'react-icons/fi';
import { useAdmin } from '../context/AdminContext';
import { useUserData } from '../context/UserDataContext';

// Map URL param → product category names in AdminContext
const CATEGORY_MAP = {
  '1': { name: 'Condiments & Sauces', match: ['Condiments'], description: 'Ketchup, mayo, sauces and dressings', image: 'https://images.unsplash.com/photo-1528751512423-745a86dca50a?auto=format&fit=crop&w=800&q=80' },
  '2': { name: 'Dairy & Eggs', match: ['Dairy'], description: 'Farm-fresh dairy products and organic eggs', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80' },
  '3': { name: 'Meat & Seafood', match: ['Meat', 'Seafood'], description: 'Premium quality meats and sustainably sourced seafood', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
  '4': { name: 'Bakery', match: ['Bakery'], description: 'Freshly baked bread, pastries, and cakes', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
  '5': { name: 'Beverages', match: ['Drinks'], description: 'Refreshing drinks, juices, and more', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80' },
  '6': { name: 'Snacks', match: ['Snacks'], description: 'Delicious snacks for every craving', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=800&q=80' },
  '7': { name: 'Pantry Staples', match: ['Pantry'], description: 'Everyday essentials stocked for your kitchen', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=800&q=80' },
  '8': { name: 'Frozen Foods', match: ['Frozen'], description: 'Ready meals and frozen essentials', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
  '9': { name: 'Breakfast', match: ['Breakfast'], description: 'Start your day right', image: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=800&q=80' },
};

const Stars = ({ rating }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} style={{ width: 14, height: 14 }} viewBox="0 0 20 20" fill={i <= Math.round(rating) ? '#f6ad55' : '#e2e8f0'}>
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ))}
  </div>
);

export default function CategoryDetailPage({ addToCart }) {
  const { id } = useParams();
  const { products: allProducts } = useAdmin();
  const { toggleWishlist, isWishlisted } = useUserData();
  const [sort, setSort] = useState('featured');
  const [notifications, setNotifications] = useState([]);

  const category = CATEGORY_MAP[id] || { name: 'All Products', match: null, description: 'Browse our full selection', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80' };

  const products = useMemo(() => {
    let list = category.match
      ? allProducts.filter(p => category.match.some(m => p.category?.toLowerCase() === m.toLowerCase()))
      : allProducts;

    switch (sort) {
      case 'priceLow': return [...list].sort((a, b) => a.price - b.price);
      case 'priceHigh': return [...list].sort((a, b) => b.price - a.price);
      case 'rating': return [...list].sort((a, b) => b.rating - a.rating);
      case 'name': return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default: return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [allProducts, id, sort, category.match]);

  const notify = (msg, type = 'success') => {
    const n = { id: Date.now(), msg, type };
    setNotifications(p => [...p, n]);
    setTimeout(() => setNotifications(p => p.filter(x => x.id !== n.id)), 2500);
  };

  const handleAdd = (product) => {
    if (product.stock === 0) return;
    addToCart({ ...product, quantity: 1 });
    notify(`${product.name} added to cart 🛒`);
  };

  const handleWish = (product) => {
    const was = isWishlisted(product.id);
    toggleWishlist(product);
    notify(was ? 'Removed from wishlist' : `${product.name} wishlisted ❤️`, was ? 'info' : 'success');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', paddingBottom: '4rem' }}>
      {/* Toast notifications */}
      <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {notifications.map(n => (
          <div key={n.id} style={{ background: n.type === 'success' ? '#065f46' : '#1e3a5f', color: 'white', padding: '0.6rem 1.25rem', borderRadius: 10, fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.22)', animation: 'fadeIn .2s ease' }}>
            {n.msg}
          </div>
        ))}
      </div>

      {/* Hero banner */}
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <img src={category.image} alt={category.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: '1rem' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 800, margin: 0 }}>{category.name}</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem', fontSize: '0.95rem' }}>{category.description}</p>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.5rem 1.25rem' }}>
        {/* Breadcrumb */}
        <Link to="/categories" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#e53e3e', fontWeight: 600, textDecoration: 'none', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
          <FiArrowLeft size={15} /> Back to Categories
        </Link>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ color: '#718096', fontSize: '0.875rem' }}>
            Showing <strong style={{ color: '#1a202c' }}>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <FiFilter size={14} style={{ color: '#718096' }} />
            <span style={{ fontSize: '0.82rem', color: '#718096' }}>Sort:</span>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '0.4rem 0.75rem', fontSize: '0.82rem', outline: 'none', background: 'white', color: '#1a202c', cursor: 'pointer' }}>
              <option value="featured">Featured</option>
              <option value="priceLow">Price: Low → High</option>
              <option value="priceHigh">Price: High → Low</option>
              <option value="rating">Top Rated</option>
              <option value="name">A → Z</option>
            </select>
          </div>
        </div>

        {products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
            <h3 style={{ color: '#718096', fontWeight: 600 }}>No products in this category yet</h3>
            <Link to="/shop" style={{ marginTop: '1rem', display: 'inline-block', color: '#e53e3e', fontWeight: 600 }}>Browse all products →</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {products.map(product => {
              const oos = product.stock === 0;
              const low = product.stock > 0 && product.stock <= 5;
              const wished = isWishlisted(product.id);
              const discount = product.oldPrice && product.oldPrice > product.price
                ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

              return (
                <div key={product.id} style={{ background: 'white', borderRadius: 16, border: '1px solid #f0eeeb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', opacity: oos ? 0.72 : 1, filter: oos ? 'grayscale(30%)' : 'none', transition: 'all .25s', display: 'flex', flexDirection: 'column' }}>
                  {/* Image */}
                  <div style={{ position: 'relative', height: 180, overflow: 'hidden', background: '#f7f7f7' }}>
                    <Link to={`/product/${product.id}`}>
                      <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }} />
                    </Link>
                    {/* Out of stock overlay */}
                    {oos && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ background: '#e53e3e', color: 'white', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.1em', padding: '5px 14px', borderRadius: 99, textTransform: 'uppercase' }}>Out of Stock</span>
                      </div>
                    )}
                    {discount > 0 && !oos && (
                      <div style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg,#e53e3e,#c53030)', color: 'white', fontWeight: 800, fontSize: '0.68rem', padding: '3px 9px', borderRadius: 99 }}>–{discount}%</div>
                    )}
                    {/* Wishlist button */}
                    <button onClick={() => handleWish(product)} style={{ position: 'absolute', top: 10, left: 10, width: 32, height: 32, borderRadius: 9, border: 'none', background: wished ? '#e53e3e' : 'white', color: wished ? 'white' : '#718096', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                      <FiHeart size={14} fill={wished ? 'white' : 'none'} />
                    </button>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '0.875rem 1rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#e53e3e', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{product.category}</div>
                    <Link to={`/product/${product.id}`} style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1a202c', textDecoration: 'none', lineHeight: 1.3 }}>{product.name}</Link>
                    <Stars rating={product.rating || 4.5} />

                    {/* Stock badge */}
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: oos ? '#e53e3e' : low ? '#d69e2e' : '#38a169' }}>
                      {oos ? '● Out of Stock' : low ? `● Only ${product.stock} left!` : '● In Stock'}
                    </span>

                    {/* Price + cart */}
                    <div style={{ marginTop: 'auto', paddingTop: '0.625rem', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1a202c' }}>£{product.price.toFixed(2)}</span>
                        {product.oldPrice && <span style={{ fontSize: '0.78rem', color: '#a0aec0', textDecoration: 'line-through', marginLeft: '0.3rem' }}>£{product.oldPrice.toFixed(2)}</span>}
                      </div>
                      <button onClick={() => handleAdd(product)} disabled={oos} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: oos ? '#e2e8f0' : 'linear-gradient(135deg,#e53e3e,#c53030)', color: oos ? '#a0aec0' : 'white', cursor: oos ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: oos ? 'none' : '0 4px 12px rgba(229,62,62,0.35)', flexShrink: 0 }}>
                        <FiShoppingCart size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}