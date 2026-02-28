import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiFacebook, FiTwitter, FiInstagram, FiLinkedin,
  FiPhone, FiMail, FiMapPin, FiArrowUp,
  FiTruck, FiShield, FiClock, FiStar,
} from 'react-icons/fi';

const quickLinks = [
  { name: 'About Us', path: '/about' },
  { name: 'Shop', path: '/shop' },
  { name: 'Categories', path: '/categories' },
  { name: 'Weekly Deals', path: '/deals' },
  { name: 'Contact Us', path: '/contact' },
];

const customerServiceLinks = [
  { name: 'My Account', path: '/profile' },
  { name: 'Order Tracking', path: '/orders' },
  { name: 'Wishlist', path: '/wishlist' },
  { name: 'Delivery Information', path: '/delivery-info' },
  { name: 'Returns Policy', path: '/returns' },
  { name: 'FAQs', path: '/faqs' },
];

const policyLinks = [
  { name: 'Privacy Policy', path: '/privacy' },
  { name: 'Terms of Service', path: '/terms' },
  { name: 'Sitemap', path: '/sitemap' },
  { name: 'Cookie Policy', path: '/cookies' },
];

const socials = [
  { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook', color: '#1877f2' },
  { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter', color: '#1da1f2' },
  { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram', color: '#e1306c' },
  { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: '#0077b5' },
];

const perks = [
  { icon: FiTruck, title: 'Free Delivery', sub: 'On orders over £30' },
  { icon: FiShield, title: 'Secure Payments', sub: 'SSL encrypted checkout' },
  { icon: FiClock, title: 'Fresh Daily', sub: 'Delivered within 24h' },
  { icon: FiStar, title: 'Quality Guarantee', sub: '100% satisfaction' },
];

export default function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .footer-root { font-family: 'Inter', sans-serif; }
        .footer-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color .2s, padding-left .2s;
          display: inline-block;
        }
        .footer-link:hover { color: #f87171; padding-left: 4px; }
        .social-btn {
          width: 42px; height: 42px;
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: #cbd5e1;
          cursor: pointer;
          transition: all .25s;
          text-decoration: none;
        }
        .social-btn:hover { transform: translateY(-3px); border-color: transparent; color: white; }
        .perk-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex; align-items: center; gap: 0.875rem;
          transition: background .25s, transform .25s;
        }
        .perk-card:hover { background: rgba(255,255,255,0.07); transform: translateY(-2px); }
        .scroll-top {
          position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 50;
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border: none; cursor: pointer; color: white;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(239,68,68,0.45);
          transition: transform .2s, box-shadow .2s;
        }
        .scroll-top:hover { transform: translateY(-4px); box-shadow: 0 8px 28px rgba(239,68,68,0.5); }
        .col-title {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #ef4444;
          margin-bottom: 1.25rem;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1.2fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 500px) {
          .footer-grid { grid-template-columns: 1fr; }
          .scroll-top {
            bottom: 4.5rem; /* prevent overlap with checkout pay button */
            right: 1rem;
            width: 40px; height: 40px;
          }
        }
      `}</style>

      {/* Scroll-to-top */}
      <button className="scroll-top" onClick={scrollToTop} aria-label="Back to top">
        <FiArrowUp size={20} />
      </button>

      <footer className="footer-root" style={{
        background: 'linear-gradient(160deg, #0f0f18 0%, #12121f 40%, #0d1117 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -160, left: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%)', pointerEvents: 'none', transform: 'translateX(-50%)' }} />

        {/* Perks strip */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1.75rem 0' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
            {perks.map(({ icon: Icon, title, sub }) => (
              <div key={title} className="perk-card">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,rgba(239,68,68,0.2),rgba(220,38,38,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={18} color="#f87171" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'white' }}>{title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3.5rem 1.5rem 2.5rem', position: 'relative', zIndex: 1 }}>
          <div className="footer-grid">

            {/* ── Brand column ── */}
            <div>
              {/* Logo */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.1rem' }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(239,68,68,0.45)', flexShrink: 0 }}>
                  <span style={{ color: 'white', fontWeight: 900, fontSize: '1.1rem' }}>K</span>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(135deg,#ffffff,#f87171)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Kelty's Mini Market
                </span>
              </div>

              <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.8, marginBottom: '1.5rem', maxWidth: 280 }}>
                Bringing quality goods to your neighbourhood since 1995. Your trusted local market — fresh products, big savings, fast delivery.
              </p>

              {/* Socials */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div className="col-title">Follow Us</div>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  {socials.map(({ icon: Icon, href, label, color }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      className="social-btn" aria-label={label}
                      onMouseEnter={e => e.currentTarget.style.background = color}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
                      <Icon size={17} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Contact pills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  { icon: FiMapPin, text: 'Main Street Kelty, KY4 0AW' },
                  { icon: FiPhone, text: '+44 555 123 4567', href: 'tel:+44555123456' },
                  { icon: FiMail, text: 'info@keltysmarket.com', href: 'mailto:info@keltysmarket.com' },
                ].map(({ icon: Icon, text, href }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(239,68,68,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={13} color="#f87171" />
                    </div>
                    {href
                      ? <a href={href} style={{ color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.target.style.color = '#f87171'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>{text}</a>
                      : <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{text}</span>
                    }
                  </div>
                ))}
              </div>
            </div>

            {/* ── Quick Links ── */}
            <div>
              <div className="col-title">Quick Links</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {quickLinks.map(link => (
                  <li key={link.name}>
                    <Link to={link.path} className="footer-link">
                      <span style={{ color: 'rgba(239,68,68,0.6)', marginRight: '0.4rem', fontSize: '0.7rem' }}>▶</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Customer Service ── */}
            <div>
              <div className="col-title">Customer Service</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {customerServiceLinks.map(link => (
                  <li key={link.name}>
                    <Link to={link.path} className="footer-link">
                      <span style={{ color: 'rgba(239,68,68,0.6)', marginRight: '0.4rem', fontSize: '0.7rem' }}>▶</span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Business Hours ── */}
            <div>
              <div className="col-title">Opening Hours</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  { day: 'Mon – Fri', hours: '7:00am – 9:00pm', open: true },
                  { day: 'Saturday', hours: '8:00am – 8:00pm', open: true },
                  { day: 'Sunday', hours: '9:00am – 6:00pm', open: true },
                  { day: 'Bank Holidays', hours: '10:00am – 4:00pm', open: false },
                ].map(({ day, hours, open }) => (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{day}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: open ? '#4ade80' : '#f87171' }}>{hours}</span>
                  </div>
                ))}
              </div>

              {/* Live status badge */}
              <div style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 99, padding: '0.4rem 0.875rem' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
                <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 700 }}>Open Now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }} />

        {/* Bottom bar */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: '#475569', fontSize: '0.8rem', margin: 0 }}>
            © {new Date().getFullYear()} <span style={{ color: '#94a3b8', fontWeight: 600 }}>Kelty's Mini Market</span>. All rights reserved. Made with ❤️ in Scotland.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
            {policyLinks.map(link => (
              <Link key={link.name} to={link.path} style={{ color: '#475569', fontSize: '0.78rem', textDecoration: 'none', transition: 'color .2s' }}
                onMouseEnter={e => e.target.style.color = '#f87171'}
                onMouseLeave={e => e.target.style.color = '#475569'}>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}