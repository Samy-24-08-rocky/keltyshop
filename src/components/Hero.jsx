import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiStar } from 'react-icons/fi';

const TRUST = [
  { icon: '🚚', label: 'Free delivery over £30' },
  { icon: '🌿', label: 'Fresh, local produce' },
  { icon: '🔒', label: 'Secure checkout' },
  { icon: '↩️', label: 'Easy returns' },
  { icon: '⭐', label: '4.9 / 5 customer rating' },
];

const Hero = () => (
  <section className="hero">
    <div className="container" style={{ width: '100%', paddingTop: '5rem', paddingBottom: '3rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem', alignItems: 'center' }}
        className="hero-grid">

        {/* Left: text */}
        <div className="hero-content">
          <div className="hero-badge">
            🛒 &nbsp;Now delivering same day in Kelty!
          </div>

          <h1 className="hero-title">
            Your Neighbourhood<br />
            <span>Fresh Market</span><br />
            <span style={{ fontSize: '0.65em', WebkitTextFillColor: 'rgba(255,255,255,0.9)', color: 'rgba(255,255,255,0.9)' }}>
              Brought to Your Door
            </span>
          </h1>

          <p className="hero-sub">
            Premium groceries, local produce, and everyday essentials — handpicked
            and delivered fresh to your doorstep in as little as 2 hours.
          </p>

          <div className="hero-cta-row">
            <Link to="/shop" className="btn-primary">
              Shop Now <FiArrowRight />
            </Link>
            <Link to="/about" className="btn-outline">
              Learn More
            </Link>
          </div>

          <div className="hero-stats">
            {[
              { value: '30K+', label: 'Happy Customers' },
              { value: '500+', label: 'Fresh Products' },
              { value: '2hrs', label: 'Avg Delivery' },
              { value: '4.9★', label: 'App Rating' },
            ].map(s => (
              <div key={s.label}>
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: floating card (hidden on mobile) */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
          className="hero-visual">
          <div style={{
            width: '100%', maxWidth: 380, position: 'relative',
            background: 'url(https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80) center/cover',
            borderRadius: 28, height: 420, overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)' }} />
            {/* Floating mini card */}
            <div className="hero-float-card" style={{ position: 'absolute', bottom: 24, left: 16, right: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'url(https://images.unsplash.com/photo-1544025162-d76694265947?w=100&q=80) center/cover', flexShrink: 0 }} />
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>Premium Beef Steak</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>Just added to 8 carts</div>
                </div>
                <div style={{ marginLeft: 'auto', color: '#f6ad55', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>£8.99</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Trust strip */}
    <div className="trust-strip" style={{ width: '100%' }}>
      {TRUST.map(t => (
        <div className="trust-item" key={t.label}>
          <div className="trust-icon">{t.icon}</div>
          <span>{t.label}</span>
        </div>
      ))}
    </div>

    <style>{`
      @media (min-width: 900px) {
        .hero-grid { grid-template-columns: 1fr 1fr !important; }
        .hero-visual { display: flex !important; }
      }
      @media (max-width: 899px) {
        .hero-visual { display: none !important; }
      }
    `}</style>
  </section>
);

export default Hero;