import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye, FiArrowRight } from 'react-icons/fi';
import ProductQuickView from './ProductQuickView';
import { useAdmin } from '../context/AdminContext';
import { useUserData } from '../context/UserDataContext';

const Stars = ({ rating }) => (
  <div className="product-stars">
    {[1, 2, 3, 4, 5].map(i => (
      <svg key={i} style={{ width: 14, height: 14 }} viewBox="0 0 20 20" fill={i <= Math.round(rating) ? '#f6ad55' : '#e2e8f0'}>
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ))}
    <span style={{ fontSize: '0.72rem', color: '#718096', marginLeft: 4 }}>{rating}</span>
  </div>
);

const FeaturedProducts = ({ addToCart, expanded = false }) => {
  const [quantities, setQuantities] = useState({});
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const { products: allProducts, settings } = useAdmin();
  const { toggleWishlist, isWishlisted } = useUserData();

  const setQty = (id, delta) =>
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) + delta) }));

  const handleAdd = (product) => {
    const qty = quantities[product.id] || 1;
    addToCart({ ...product, quantity: qty });
    window.dispatchEvent(new CustomEvent('cartNotification', {
      detail: { message: `${qty} × ${product.name} added`, type: 'success' }
    }));
  };

  const handleWishlist = (product) => {
    const was = isWishlisted(product.id);
    toggleWishlist(product);
    window.dispatchEvent(new CustomEvent('cartNotification', {
      detail: { message: was ? `Removed from wishlist` : `${product.name} wishlisted ❤️`, type: was ? 'info' : 'success' }
    }));
  };

  const goldenScore = (p) => {
    let score = 0;
    if (p.merchandisingSlot === 'golden') return 500;
    if (p.merchandisingSlot === 'hotspot') return 400;

    if (p.featured) score += 40;
    if (p.rating >= 4.7) score += 30;
    if (p.oldPrice && p.oldPrice > p.price) score += 20;
    if (p.stock > 0 && p.stock <= 5) score += 10;
    return score;
  };

  const featuredCount = settings?.featuredProductsCount ?? 8;
  const m = settings?.merchandising ?? {};

  const products = expanded
    ? allProducts
    : [...allProducts]
      .filter(p => p.featured)
      .sort((a, b) => m.goldenZoneEnabled ? goldenScore(b) - goldenScore(a) : 0)
      .slice(0, featuredCount);

  return (
    <>
      <section className="products-section">
        <div className="container">
          {/* Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <div className="section-tag">Handpicked</div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-sub">Top picks fresh in from our suppliers today</p>
            </div>
            {!expanded && (
              <Link to="/shop" className="view-all-link">
                All products <FiArrowRight />
              </Link>
            )}
          </div>

          {/* Grid */}
          <div className="grid-prods">
            {products.map(product => {
              const qty = quantities[product.id] || 1;
              const discount = product.oldPrice
                ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                : 0;
              const wished = isWishlisted(product.id);
              const outOfStock = product.stock === 0;

              return (
                <div key={product.id} className="product-card" style={outOfStock ? { opacity: 0.72, filter: 'grayscale(35%)' } : {}}>
                  {/* Image */}
                  <div className="product-img-wrap">
                    <Link to={`/product/${product.id}`} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=800&q=80'; }}
                        />
                      ) : (
                        <div style={{ color: '#cbd5e0', padding: '1rem' }}><FiAlertCircle size={32} /></div>
                      )}
                    </Link>

                    {/* Out of Stock overlay on image */}
                    {outOfStock && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2,
                      }}>
                        <span style={{
                          background: '#e53e3e',
                          color: 'white',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          letterSpacing: '0.1em',
                          padding: '6px 16px',
                          borderRadius: 99,
                          textTransform: 'uppercase',
                          boxShadow: '0 4px 14px rgba(229,62,62,0.5)',
                        }}>Out of Stock</span>
                      </div>
                    )}

                    {discount > 0 && !outOfStock && (
                      <div className="product-badge">–{discount}%</div>
                    )}

                    {/* Action buttons — hidden when OOS */}
                    {!outOfStock && (
                      <div className="product-actions">
                        <button
                          className={`product-action-btn${wished ? ' active' : ''}`}
                          onClick={() => handleWishlist(product)}
                          aria-label="Wishlist"
                        >
                          <FiHeart size={15} fill={wished ? 'white' : 'none'} />
                        </button>
                        <button
                          className="product-action-btn"
                          onClick={() => { setQuickViewProduct(product); setShowQuickView(true); }}
                          aria-label="Quick view"
                        >
                          <FiEye size={15} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="product-info">
                    <div className="product-cat">{product.category}</div>
                    <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
                    <Stars rating={product.rating} />

                    <div>
                      {outOfStock ? (
                        <span className="stock-badge stock-out">● Out of Stock</span>
                      ) : product.stock <= 5 ? (
                        <span className="stock-badge stock-low">● Only {product.stock} left!</span>
                      ) : (
                        <span className="stock-badge stock-in">● In Stock</span>
                      )}
                    </div>

                    {/* Price + Cart */}
                    <div className="product-price-row">
                      <div>
                        <span className="product-price">£{product.price.toFixed(2)}</span>
                        {product.oldPrice && (
                          <span className="product-old-price">£{product.oldPrice.toFixed(2)}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div className="qty-stepper">
                          <button className="qty-btn" onClick={() => setQty(product.id, -1)} disabled={outOfStock}>−</button>
                          <span className="qty-value">{qty}</span>
                          <button className="qty-btn" onClick={() => setQty(product.id, 1)} disabled={outOfStock || qty >= product.stock}>+</button>
                        </div>
                        <button
                          className="cart-btn"
                          onClick={() => handleAdd(product)}
                          disabled={outOfStock}
                          aria-label="Add to cart"
                          title={outOfStock ? 'Out of Stock' : 'Add to cart'}
                          style={outOfStock ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                        >
                          <FiShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {products.length === 0 && (
            <p style={{ textAlign: 'center', color: '#718096', padding: '4rem 0' }}>No products available right now.</p>
          )}
        </div>
      </section>

      {showQuickView && quickViewProduct && (
        <ProductQuickView
          product={quickViewProduct}
          isOpen={showQuickView}
          onClose={() => setShowQuickView(false)}
          addToCart={addToCart}
        />
      )}
    </>
  );
};

export default FeaturedProducts;