import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiMenu, FiX, FiShoppingCart, FiUser, FiSearch,
  FiLogOut, FiHeart, FiUserPlus, FiShoppingBag, FiShield,
  FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleCart, cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && !e.target.closest('.mobile-menu') && !e.target.closest('.menu-btn')) setIsMenuOpen(false);
      if (isUserMenuOpen && !e.target.closest('.user-menu')) setIsUserMenuOpen(false);
      if (isSearchOpen && !e.target.closest('.search-box')) setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMenuOpen, isUserMenuOpen, isSearchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: 'Categories', path: '/categories' },
    { label: 'Deals', path: '/deals' },
    { label: 'About', path: '/about' },
  ];

  const userMenuItems = [
    { icon: <FiUser />, label: 'My Profile', path: '/profile' },
    { icon: <FiShoppingBag />, label: 'My Orders', path: '/orders' },
    { icon: <FiHeart />, label: 'Wishlist', path: '/wishlist' },
    {
      icon: <FiLogOut />, label: 'Sign Out',
      action: async () => { await logout(); setIsUserMenuOpen(false); navigate('/'); }
    },
  ];

  const userInitial = user ? (user.displayName || user.email || 'U')[0].toUpperCase() : null;
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .navbar-root {
          font-family: 'Inter', sans-serif;
          position: sticky;
          top: 0;
          z-index: 1000;
          transition: all 0.3s ease;
        }
        .navbar-root.scrolled {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 1px 32px rgba(0,0,0,0.10);
        }
        .navbar-root.top {
          background: #ffffff;
          box-shadow: 0 1px 0 #f1f1f1;
        }

        /* Top accent strip */
        .navbar-accent {
          height: 3px;
          background: linear-gradient(90deg, #ef4444 0%, #f97316 50%, #ef4444 100%);
          background-size: 200% auto;
          animation: shiftGrad 4s linear infinite;
        }
        @keyframes shiftGrad {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        .navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        /* Logo */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          flex-shrink: 0;
        }
        .nav-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(239,68,68,0.35);
          flex-shrink: 0;
        }
        .nav-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .nav-logo-name {
          font-size: 1rem;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.3px;
        }
        .nav-logo-name span { color: #ef4444; }
        .nav-logo-sub {
          font-size: 0.6rem;
          font-weight: 500;
          color: #9ca3af;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-top: 1px;
        }

        /* Nav Links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
          justify-content: center;
        }
        .nav-link {
          position: relative;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: #4b5563;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: 60%;
          height: 2px;
          background: linear-gradient(90deg,#ef4444,#f97316);
          border-radius: 2px;
          transition: transform 0.25s ease;
        }
        .nav-link:hover { color: #ef4444; background: #fef2f2; }
        .nav-link:hover::after { transform: translateX(-50%) scaleX(1); }
        .nav-link.active { color: #ef4444; font-weight: 600; background: #fff1f2; }
        .nav-link.active::after { transform: translateX(-50%) scaleX(1); }

        /* Search */
        .search-wrap { position: relative; }
        .search-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: none;
          background: #f3f4f6;
          color: #6b7280;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .search-btn:hover { background: #fee2e2; color: #ef4444; }
        .search-expand {
          position: absolute;
          right: 0; top: 50%;
          transform: translateY(-50%);
          width: 280px;
          display: flex;
          align-items: center;
          background: white;
          border: 1.5px solid #ef4444;
          border-radius: 99px;
          box-shadow: 0 4px 20px rgba(239,68,68,0.15);
          overflow: hidden;
          animation: expandSearch 0.2s ease;
        }
        @keyframes expandSearch {
          from { width: 36px; opacity: 0; }
          to { width: 280px; opacity: 1; }
        }
        .search-expand input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0.5rem 0.75rem 0.5rem 1rem;
          font-size: 0.85rem;
          color: #111827;
          background: transparent;
          font-family: 'Inter', sans-serif;
        }
        .search-expand button {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 0.5rem 0.875rem;
          cursor: pointer;
          display: flex; align-items: center;
          border-radius: 0 99px 99px 0;
        }

        /* Icon actions */
        .nav-actions { display: flex; align-items: center; gap: 0.375rem; flex-shrink: 0; }
        .icon-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: none;
          background: #f3f4f6;
          color: #6b7280;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, color 0.2s, transform 0.15s;
          position: relative;
          font-size: 1rem;
        }
        .icon-btn:hover { background: #fee2e2; color: #ef4444; transform: translateY(-1px); }
        .icon-btn.admin:hover { background: #f0f4ff; color: #4f46e5; }
        .cart-badge {
          position: absolute;
          top: -2px; right: -2px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          font-size: 0.6rem; font-weight: 700;
          min-width: 18px; height: 18px;
          border-radius: 99px;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid white;
          padding: 0 3px;
        }

        /* Avatar */
        .avatar-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 2.5px solid #fecaca;
          cursor: pointer;
          background: none;
          padding: 0;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.15s;
        }
        .avatar-btn:hover { border-color: #ef4444; transform: translateY(-1px); }
        .avatar-inner {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 0.8rem; font-weight: 700;
          border-radius: 50%;
        }

        /* Auth buttons */
        .btn-signin {
          display: flex; align-items: center; gap: 0.375rem;
          padding: 0.4rem 0.875rem;
          border-radius: 99px;
          font-size: 0.8rem; font-weight: 600;
          color: #374151;
          text-decoration: none;
          background: #f3f4f6;
          border: 1.5px solid #e5e7eb;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .btn-signin:hover { background: #fff1f2; color: #ef4444; border-color: #fecaca; }
        .btn-register {
          display: flex; align-items: center; gap: 0.375rem;
          padding: 0.4rem 1rem;
          border-radius: 99px;
          font-size: 0.8rem; font-weight: 600;
          color: white;
          text-decoration: none;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          box-shadow: 0 2px 10px rgba(239,68,68,0.35);
          transition: all 0.2s;
          white-space: nowrap;
          border: none;
        }
        .btn-register:hover { background: linear-gradient(135deg, #dc2626, #b91c1c); transform: translateY(-1px); box-shadow: 0 4px 14px rgba(239,68,68,0.45); }

        /* Dropdown */
        .user-dropdown {
          position: absolute;
          right: 0; top: calc(100% + 10px);
          width: 220px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.14);
          border: 1px solid #f3f4f6;
          overflow: hidden;
          animation: dropIn 0.18s ease;
          z-index: 100;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .dropdown-header {
          padding: 0.875rem 1rem;
          display: flex; align-items: center; gap: 0.625rem;
          background: linear-gradient(135deg, #fff1f2, #fff);
          border-bottom: 1px solid #f3f4f6;
        }
        .dropdown-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
        }
        .dropdown-item {
          display: flex; align-items: center; gap: 0.625rem;
          padding: 0.6rem 1rem;
          font-size: 0.85rem; font-weight: 500;
          color: #374151;
          text-decoration: none;
          cursor: pointer;
          background: none; border: none; width: 100%; text-align: left;
          transition: background 0.15s, color 0.15s;
        }
        .dropdown-item:hover { background: #fff1f2; color: #ef4444; }
        .dropdown-item.danger:hover { background: #fff1f2; color: #ef4444; }
        .dropdown-item svg { flex-shrink: 0; }

        /* Divider in dropdown */
        .dropdown-divider { height: 1px; background: #f3f4f6; margin: 0.25rem 0; }

        /* Mobile hamburger */
        .hamburger {
          display: none;
          width: 36px; height: 36px;
          border-radius: 8px;
          border: 1.5px solid #e5e7eb;
          background: white;
          color: #374151;
          align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .hamburger:hover { background: #fff1f2; color: #ef4444; border-color: #fecaca; }

        /* Mobile drawer */
        .mobile-drawer {
          background: white;
          border-top: 1px solid #f3f4f6;
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mobile-drawer-inner { padding: 1rem 1.25rem 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .mobile-link {
          display: flex; align-items: center;
          padding: 0.75rem 0.875rem;
          border-radius: 10px;
          font-size: 0.9rem; font-weight: 500;
          color: #374151; text-decoration: none;
          transition: background 0.15s, color 0.15s;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          min-height: 44px;
        }
        .mobile-link:hover, .mobile-link.active { background: #fff1f2; color: #ef4444; }
        .mobile-search {
          display: flex; align-items: center;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 0.5rem 0.75rem;
          margin-bottom: 0.5rem;
          gap: 0.5rem;
        }
        .mobile-search input {
          flex: 1; border: none; background: transparent;
          outline: none; font-size: 0.875rem; color: #111827;
          font-family: 'Inter', sans-serif;
        }
        .mobile-divider { height: 1px; background: #f3f4f6; margin: 0.5rem 0; }
        .mobile-admin-link {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.6rem 0.875rem;
          border-radius: 10px;
          font-size: 0.85rem; font-weight: 500;
          color: #6366f1; text-decoration: none;
          background: #eef2ff;
          transition: background 0.15s;
        }
        .mobile-admin-link:hover { background: #e0e7ff; }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .search-wrap { display: none; }
          .btn-signin, .btn-register { display: none !important; }
          .icon-btn.admin { display: none; }
          .hamburger { display: flex; }
        }

        /* Ensure all interactive elements have no tap highlight on mobile */
        @media (hover: none) and (pointer: coarse) {
          .icon-btn, .avatar-btn, .search-btn, .nav-link, .dropdown-item {
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
          }
          .icon-btn:hover, .avatar-btn:hover {
            transform: none;
          }
        }

        @media (max-width: 500px) {
          .navbar-inner { padding: 0 0.875rem; gap: 0.5rem; }
          .nav-logo-name { font-size: 0.85rem; }
          .nav-logo-sub { display: none; }
          .nav-logo-icon { width: 32px; height: 32px; font-size: 16px; }
          .icon-btn, .avatar-btn, .hamburger { width: 32px; height: 32px; }
          .nav-actions { gap: 0.25rem; }
        }
      `}</style>

      <nav className={`navbar-root ${isScrolled ? 'scrolled' : 'top'}`}>
        {/* Animated top accent */}
        <div className="navbar-accent" />

        <div className="navbar-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon">🛒</div>
            <div className="nav-logo-text">
              <span className="nav-logo-name">Kelty's <span>Mini Market</span></span>
              <span className="nav-logo-sub">Fresh &amp; Fast Delivery</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="nav-links">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`nav-link${isActive(item.path) ? ' active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="nav-actions">
            {/* Search */}
            <div className="search-wrap search-box">
              {isSearchOpen ? (
                <form className="search-expand" onSubmit={handleSearch}>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit"><FiSearch size={14} /></button>
                </form>
              ) : (
                <button className="search-btn" onClick={() => setIsSearchOpen(true)} aria-label="Search">
                  <FiSearch size={16} />
                </button>
              )}
            </div>

            {/* Admin icon */}
            <Link to="/admin/login" className="icon-btn admin" title="Admin Panel" aria-label="Admin Panel">
              <FiShield size={17} />
            </Link>

            {/* User area */}
            <div className="user-menu" style={{ position: 'relative' }}>
              {user ? (
                <button className="avatar-btn" onClick={() => setIsUserMenuOpen(o => !o)}>
                  {user.photoURL
                    ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div className="avatar-inner">{userInitial}</div>
                  }
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Link to="/login" className="btn-signin">
                    <FiUser size={13} /> Sign In
                  </Link>
                  <Link to="/register" className="btn-register">
                    <FiUserPlus size={13} /> Register
                  </Link>
                </div>
              )}

              {isUserMenuOpen && user && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {user.photoURL
                        ? <img src={user.photoURL} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        : userInitial
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.displayName || 'My Account'}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '0.375rem 0' }}>
                    {userMenuItems.map((item, i) => (
                      item.action ? (
                        <React.Fragment key={i}>
                          {i === userMenuItems.length - 1 && <div className="dropdown-divider" />}
                          <button onClick={item.action} className={`dropdown-item${i === userMenuItems.length - 1 ? ' danger' : ''}`}>
                            {item.icon} {item.label}
                          </button>
                        </React.Fragment>
                      ) : (
                        <Link key={i} to={item.path} className="dropdown-item" onClick={() => setIsUserMenuOpen(false)}>
                          {item.icon} {item.label}
                        </Link>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="icon-btn" aria-label="Go to cart" style={{ marginLeft: '0.125rem' }}>
              <FiShoppingCart size={17} />
              {cartCount > 0 && <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>}
            </Link>

            {/* Hamburger */}
            <button className="hamburger menu-btn" onClick={() => setIsMenuOpen(o => !o)} aria-label="Menu">
              {isMenuOpen ? <FiX size={18} /> : <FiMenu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMenuOpen && (
          <div className="mobile-drawer mobile-menu">
            <div className="mobile-drawer-inner">
              {/* Mobile search */}
              <form className="mobile-search" onSubmit={handleSearch}>
                <FiSearch size={15} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {/* Nav links */}
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`mobile-link${isActive(item.path) ? ' active' : ''}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="mobile-divider" />

              {/* Cart link in mobile */}
              <Link to="/cart" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                <FiShoppingCart size={15} style={{ marginRight: '0.5rem' }} /> My Cart {cartCount > 0 && `(${cartCount})`}
              </Link>

              {/* Auth + Admin */}
              {!user && (
                <>
                  <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                    <FiUser size={15} style={{ marginRight: '0.5rem' }} /> Sign In
                  </Link>
                  <Link to="/register" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                    <FiUserPlus size={15} style={{ marginRight: '0.5rem' }} /> Create Account
                  </Link>
                  <div className="mobile-divider" />
                </>
              )}
              {user && (
                <>
                  {userMenuItems.map((item, i) => (
                    item.action ? (
                      <button key={i} onClick={() => { item.action(); setIsMenuOpen(false); }} className="mobile-link" style={{ border: 'none', background: 'none', textAlign: 'left', width: '100%', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                        <span style={{ marginRight: '0.5rem' }}>{item.icon}</span> {item.label}
                      </button>
                    ) : (
                      <Link key={i} to={item.path} className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                        <span style={{ marginRight: '0.5rem' }}>{item.icon}</span> {item.label}
                      </Link>
                    )
                  ))}
                  <div className="mobile-divider" />
                </>
              )}
              <Link to="/admin/login" className="mobile-admin-link" onClick={() => setIsMenuOpen(false)}>
                <FiShield size={15} /> Admin Panel
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;