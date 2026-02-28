import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUserData } from '../context/UserDataContext';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';

export default function Wishlist({ addToCart }) {
  const { user } = useAuth();
  const { wishlist, removeFromWishlist } = useUserData();

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontFamily: "'Inter',sans-serif" }}>
        <FiHeart size={52} color="#fecaca" />
        <h2 style={{ color: '#64748b', fontWeight: 600 }}>Sign in to view your wishlist</h2>
        <Link to="/login" style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
      </div>
    );
  }

  const handleAddToCart = (item) => {
    if (addToCart) addToCart({ ...item, quantity: 1 });
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: "'Inter',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap')`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiHeart style={{ color: '#ef4444' }} /> My Wishlist
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            {wishlist.length === 0 ? 'No saved items yet' : `${wishlist.length} item${wishlist.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>
        {wishlist.length > 0 && (
          <button
            onClick={() => wishlist.forEach(item => handleAddToCart(item))}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
            <FiShoppingCart size={16} /> Add All to Cart
          </button>
        )}
      </div>

      {wishlist.length === 0 ? (
        /* ── Empty state ── */
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'white', borderRadius: 24, border: '2px dashed #fecaca' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(239,68,68,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <FiHeart size={36} color="#fca5a5" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b', margin: '0 0 0.5rem' }}>Your wishlist is empty</h3>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Browse products and click the ❤️ to save items for later.</p>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 700, boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
            Browse Products <FiArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1.25rem' }}>
          {wishlist.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: 18, border: '1px solid #f1f5f9', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', transition: 'box-shadow .2s, transform .2s' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}>

              {/* Remove button */}
              <div style={{ position: 'relative' }}>
                <img src={item.image} alt={item.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                <button onClick={() => removeFromWishlist(item.id)}
                  style={{ position: 'absolute', top: 10, right: 10, width: 34, height: 34, background: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; }}>
                  <FiTrash2 size={15} color="#ef4444" />
                </button>
                <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(239,68,68,0.9)', borderRadius: 99, padding: '2px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'white' }}>
                  ❤ Saved
                </div>
                {item.stock === 0 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ background: 'rgba(239,68,68,0.9)', color: 'white', padding: '4px 12px', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700 }}>Out of Stock</span>
                  </div>
                )}
              </div>

              <div style={{ padding: '1rem' }}>
                {item.category && (
                  <span style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600 }}>{item.category}</span>
                )}
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '0.5rem 0 0.25rem', lineHeight: 1.3 }}>{item.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>£{item.price?.toFixed(2)}</span>
                  {item.oldPrice && (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', textDecoration: 'line-through' }}>£{item.oldPrice?.toFixed(2)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.stock === 0}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem', background: item.stock === 0 ? '#f1f5f9' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: item.stock === 0 ? '#94a3b8' : 'white', border: 'none', borderRadius: 10, cursor: item.stock === 0 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all .2s', boxShadow: item.stock !== 0 ? '0 2px 8px rgba(239,68,68,0.25)' : 'none' }}>
                  <FiShoppingCart size={15} />
                  {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}