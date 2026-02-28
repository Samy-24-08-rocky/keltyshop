import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import { useAdmin } from '../context/AdminContext';
import { useUserData } from '../context/UserDataContext';

const Stars = ({ rating }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} style={{ width: 18, height: 18 }} viewBox="0 0 20 20" fill={i <= Math.round(rating) ? '#f6ad55' : '#e2e8f0'}>
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ))}
    <span style={{ fontSize: '0.82rem', color: '#718096', marginLeft: 4 }}>{rating}</span>
  </div>
);

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const { products } = useAdmin();
  const { toggleWishlist, isWishlisted } = useUserData();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Find real product from AdminContext
  const product = products.find(p => String(p.id) === String(id));

  if (!product) {
    return (
      <div className="py-10" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <FiAlertCircle size={48} color="#e53e3e" />
        <h2 style={{ fontWeight: 700, color: '#1a202c' }}>Product not found</h2>
        <Link to="/shop" style={{ color: '#e53e3e', fontWeight: 600, textDecoration: 'none' }}>← Back to Shop</Link>
      </div>
    );
  }

  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;
  const wished = isWishlisted(product.id);

  const handleAddToCart = () => {
    if (outOfStock) return;
    addToCart({ ...product, quantity });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    window.dispatchEvent(new CustomEvent('cartNotification', {
      detail: { message: `${quantity} × ${product.name} added to cart`, type: 'success' }
    }));
  };

  const handleWishlist = () => {
    toggleWishlist(product);
    window.dispatchEvent(new CustomEvent('cartNotification', {
      detail: {
        message: wished ? 'Removed from wishlist' : `${product.name} wishlisted ❤️`,
        type: wished ? 'info' : 'success'
      }
    }));
  };

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center text-red-600 hover:text-red-800 mb-6">
          <FiArrowLeft className="mr-2" /> Back to Shop
        </Link>

        <div className="lg:grid lg:grid-cols-2 lg:gap-16">
          {/* Product Image */}
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', background: '#f7f7f7', aspectRatio: '1', position: 'relative' }}>
              <img
                src={product.image}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: outOfStock ? 'grayscale(40%)' : 'none', transition: 'filter .3s' }}
              />
              {/* Out of Stock overlay */}
              {outOfStock && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    background: '#e53e3e', color: 'white', fontWeight: 800,
                    fontSize: '1rem', letterSpacing: '0.12em', padding: '10px 28px',
                    borderRadius: 99, textTransform: 'uppercase',
                    boxShadow: '0 4px 20px rgba(229,62,62,0.5)',
                  }}>Out of Stock</span>
                </div>
              )}
              {/* Discount badge */}
              {discount > 0 && !outOfStock && (
                <div style={{ position: 'absolute', top: 16, right: 16, background: 'linear-gradient(135deg,#e53e3e,#c53030)', color: 'white', fontWeight: 800, fontSize: '0.8rem', padding: '5px 12px', borderRadius: 99 }}>
                  –{discount}%
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div style={{ paddingTop: '0.5rem' }}>
            <span style={{ color: '#e53e3e', fontWeight: 600, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{product.category}</span>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#1a202c', marginTop: '0.4rem', lineHeight: 1.25 }}>{product.name}</h1>

            {/* Rating */}
            <div style={{ marginTop: '0.875rem' }}>
              <Stars rating={product.rating || 4.5} />
            </div>

            {/* Price */}
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: '#1a202c' }}>£{product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <span style={{ fontSize: '1.1rem', color: '#a0aec0', textDecoration: 'line-through' }}>£{product.oldPrice.toFixed(2)}</span>
              )}
            </div>

            {/* Stock status */}
            <div style={{ marginTop: '0.75rem' }}>
              {outOfStock ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(239,68,68,0.1)', color: '#e53e3e', border: '1px solid rgba(239,68,68,0.25)', padding: '5px 14px', borderRadius: 99, fontSize: '0.82rem', fontWeight: 700 }}>
                  <FiAlertCircle size={14} /> Out of Stock — Currently unavailable
                </span>
              ) : lowStock ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(214,158,46,0.1)', color: '#c05621', border: '1px solid rgba(214,158,46,0.3)', padding: '5px 14px', borderRadius: 99, fontSize: '0.82rem', fontWeight: 700 }}>
                  ⚡ Only {product.stock} left — order soon!
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(56,161,105,0.1)', color: '#276749', border: '1px solid rgba(56,161,105,0.25)', padding: '5px 14px', borderRadius: 99, fontSize: '0.82rem', fontWeight: 700 }}>
                  ✓ In Stock ({product.stock} available)
                </span>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {/* Qty stepper */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={outOfStock}
                  style={{ width: 40, height: 44, background: 'transparent', border: 'none', cursor: outOfStock ? 'not-allowed' : 'pointer', fontSize: '1.2rem', color: '#718096', fontWeight: 700 }}
                >−</button>
                <span style={{ minWidth: 40, textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={outOfStock || quantity >= product.stock}
                  style={{ width: 40, height: 44, background: 'transparent', border: 'none', cursor: (outOfStock || quantity >= product.stock) ? 'not-allowed' : 'pointer', fontSize: '1.2rem', color: '#718096', fontWeight: 700 }}
                >+</button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={outOfStock}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: outOfStock ? '#e2e8f0' : (added ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'linear-gradient(135deg,#e53e3e,#c53030)'),
                  color: outOfStock ? '#a0aec0' : 'white',
                  border: 'none', borderRadius: 14, padding: '0.875rem 1.5rem',
                  fontWeight: 700, fontSize: '1rem', cursor: outOfStock ? 'not-allowed' : 'pointer',
                  transition: 'all .3s', boxShadow: outOfStock ? 'none' : '0 4px 16px rgba(229,62,62,0.35)',
                  minWidth: 180,
                }}
              >
                <FiShoppingCart size={18} />
                {outOfStock ? 'Out of Stock' : added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                style={{
                  width: 48, height: 48, border: wished ? '2px solid #e53e3e' : '1.5px solid #e2e8f0',
                  borderRadius: 14, background: wished ? 'rgba(229,62,62,0.08)' : 'white',
                  color: wished ? '#e53e3e' : '#718096', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all .2s', flexShrink: 0,
                }}
              >
                <FiHeart size={20} fill={wished ? '#e53e3e' : 'none'} />
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <p style={{ marginTop: '1.75rem', color: '#4a5568', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {product.description}
              </p>
            )}

            {/* Meta pills */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
              {[
                { label: `Category: ${product.category}` },
                ...(product.stock > 0 ? [{ label: `${product.stock} units in stock` }] : []),
              ].map(({ label }) => (
                <span key={label} style={{ background: '#f7f7f5', border: '1px solid #e2e8f0', color: '#718096', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 500 }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;