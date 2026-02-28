import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';
import { FiUser, FiMail, FiSave, FiLogOut, FiShoppingBag, FiHeart, FiCheckCircle } from 'react-icons/fi';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontFamily: "'Inter',sans-serif" }}>
        <FiUser size={48} color="#cbd5e1" />
        <p style={{ fontSize: '1.1rem', color: '#64748b' }}>Please sign in to view your profile.</p>
        <Link to="/login" style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
      </div>
    );
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return setError('Name cannot be empty.');
    setSaving(true); setError('');
    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to update profile. Please try again.');
    } finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const initial = (user.displayName || user.email || 'U')[0].toUpperCase();
  const isGoogle = user.providerData?.[0]?.providerId === 'google.com';

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: "'Inter',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap')`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'linear-gradient(135deg,#fef2f2,#fff)', borderRadius: 20, border: '1px solid #fecaca' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 800, color: 'white', flexShrink: 0, boxShadow: '0 4px 16px rgba(239,68,68,0.35)' }}>
          {user.photoURL ? <img src={user.photoURL} alt="avatar" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }} /> : initial}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            {user.displayName || 'My Account'}
          </h1>
          <p style={{ margin: '0 0 0.5rem', color: '#64748b', fontSize: '0.875rem' }}>{user.email}</p>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ background: isGoogle ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)', color: isGoogle ? '#3b82f6' : '#ef4444', padding: '2px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600 }}>
              {isGoogle ? '🔵 Google Account' : '📧 Email Account'}
            </span>
            <span style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', padding: '2px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600 }}>✅ Verified</span>
          </div>
        </div>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', flexShrink: 0 }}>
          <FiLogOut size={15} /> Sign Out
        </button>
      </div>

      {/* Edit profile card */}
      <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.07)', border: '1px solid #f1f5f9', padding: '1.75rem', marginBottom: '1.25rem' }}>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiUser size={18} color="#ef4444" /> Profile Details
        </h2>

        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#15803d', fontSize: '0.85rem' }}>
            <FiCheckCircle size={16} /> Profile updated successfully!
          </div>
        )}
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.85rem' }}>{error}</div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
              <FiUser size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />Display Name
            </label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name"
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: '0.9rem', outline: 'none', color: '#1e293b' }}
              onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>
              <FiMail size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />Email Address
            </label>
            <input value={user.email} disabled
              style={{ width: '100%', boxSizing: 'border-box', padding: '0.8rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: '0.9rem', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.375rem 0 0' }}>Email cannot be changed here{isGoogle ? ' (managed by Google)' : ''}.</p>
          </div>

          <button type="submit" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', background: saving ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.875rem', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>
            <FiSave size={16} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {[
          { icon: FiShoppingBag, label: 'My Orders', sub: 'Track your deliveries', to: '/orders', color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
          { icon: FiHeart, label: 'Wishlist', sub: 'Saved for later', to: '/wishlist', color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
        ].map(({ icon: Icon, label, sub, to, color, bg }) => (
          <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', background: 'white', borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', textDecoration: 'none', transition: 'box-shadow .2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.1)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'}>
            <div style={{ width: 44, height: 44, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={20} color={color} />
            </div>
            <div>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{label}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{sub}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}