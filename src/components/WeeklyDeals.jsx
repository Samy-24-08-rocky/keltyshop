import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiArrowRight, FiClock } from 'react-icons/fi';

const DEALS = [
  {
    id: 1, name: 'Premium Beef Steak', price: 8.99, oldPrice: 11.99, discount: 25,
    endMs: Date.now() + 2 * 3600_000 + 45 * 60_000,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    tag: '🥩 Best Seller',
  },
  {
    id: 2, name: 'Organic Bananas (kg)', price: 0.69, oldPrice: 0.99, discount: 30,
    endMs: Date.now() + 1 * 3600_000 + 30 * 60_000,
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&q=80',
    tag: '🌿 Organic',
  },
  {
    id: 3, name: 'Fresh Salmon Fillet', price: 10.99, oldPrice: 14.99, discount: 27,
    endMs: Date.now() + 5 * 3600_000 + 20 * 60_000,
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&q=80',
    tag: '🐟 Wild Caught',
  },
];

const useCountdown = (endMs) => {
  const calc = () => {
    const diff = Math.max(0, endMs - Date.now());
    const h = String(Math.floor(diff / 3600_000)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600_000) / 60_000)).padStart(2, '0');
    const s = String(Math.floor((diff % 60_000) / 1000)).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [endMs]);
  return time;
};

const DealCard = ({ deal, addToCart }) => {
  const time = useCountdown(deal.endMs);
  return (
    <div className="deal-card">
      <div className="deal-img">
        <img src={deal.image} alt={deal.name} loading="lazy" />
        <div className="deal-discount-badge">–{deal.discount}% OFF</div>
        <div style={{
          position: 'absolute', top: 12, left: 12,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          color: 'white', fontSize: '0.72rem', fontWeight: 700,
          padding: '3px 10px', borderRadius: '99px',
        }}>{deal.tag}</div>
      </div>
      <div className="deal-info">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="deal-name">{deal.name}</div>
            <div className="deal-price-row">
              <span className="deal-price">£{deal.price.toFixed(2)}</span>
              <span className="deal-old-price">£{deal.oldPrice.toFixed(2)}</span>
            </div>
          </div>
          <button
            className="deal-add-btn"
            onClick={() => addToCart({ ...deal, quantity: 1 })}
            aria-label="Add to cart"
          >
            <FiShoppingCart size={18} />
          </button>
        </div>
        <div className="deal-timer">
          <FiClock size={13} />
          <span>Ends in</span>
          <span className="deal-timer-digits">{time}</span>
        </div>
      </div>
    </div>
  );
};

const WeeklyDeals = ({ addToCart }) => (
  <section className="deals-section">
    <div className="container">
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <div className="section-tag" style={{ background: 'rgba(246,173,85,0.15)', borderColor: 'rgba(246,173,85,0.35)', color: '#f6ad55' }}>
            🔥 Limited Time
          </div>
          <h2 className="section-title" style={{ color: 'white' }}>Weekly Hot Deals</h2>
          <p className="section-sub" style={{ color: 'rgba(255,255,255,0.5)' }}>Flash prices — grab them before they're gone</p>
        </div>
        <Link to="/deals" className="view-all-link" style={{ color: '#f6ad55' }}>
          All deals <FiArrowRight />
        </Link>
      </div>

      <div className="grid-deals">
        {DEALS.map(deal => (
          <DealCard key={deal.id} deal={deal} addToCart={addToCart} />
        ))}
      </div>
    </div>
  </section>
);

export default WeeklyDeals;