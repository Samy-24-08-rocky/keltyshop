import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';

// ── Google Icon SVG ──────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const inputStyle = (hasError) => ({
  width: '100%', boxSizing: 'border-box',
  padding: '0.8rem 1rem 0.8rem 2.75rem',
  border: `1.5px solid ${hasError ? '#f87171' : '#e2e8f0'}`,
  borderRadius: '12px', fontSize: '0.9rem',
  outline: 'none', transition: 'border-color .2s, box-shadow .2s',
  background: 'white', color: '#1e293b',
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [resetMode, setResetMode] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const friendlyError = (code) => {
    const map = {
      'auth/invalid-credential': 'Incorrect email or password.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many attempts. Try again later.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
      'auth/network-request-failed': 'Network error. Check your connection.',
      'auth/unauthorized-domain': 'This domain is not authorized for Google Sign-in. Please add it in your Firebase Console.',
      'auth/operation-not-allowed': 'Google Sign-in is not enabled in your Firebase Project.',
    };
    return map[code] || `Error: ${code || 'Something went wrong. Please try again.'}`;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await resetPassword(email);
      setInfo('✅ Reset link sent! Check your email inbox.');
      setResetMode(false);
    } catch (err) {
      setError(friendlyError(err.code));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fef2f2 0%, #fff 60%, #fef2f2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Inter',sans-serif" }}>
      {/* Decorative blobs */}
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-15%', left: '-10%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(239,68,68,0.35)' }}>
              <span style={{ color: 'white', fontSize: '1.2rem' }}>🛒</span>
            </div>
            <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '1.1rem' }}>Kelty's Mini Market</span>
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.375rem' }}>
            {resetMode ? 'Reset your password' : 'Welcome back!'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            {resetMode ? 'Enter your email and we\'ll send a reset link' : 'Sign in to continue shopping'}
          </p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 48px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid rgba(0,0,0,0.05)' }}>
          {/* Alerts */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.85rem' }}>
              <FiAlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}
          {info && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#15803d', fontSize: '0.85rem' }}>
              {info}
            </div>
          )}

          {/* Google Sign-In */}
          {!resetMode && (
            <>
              <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.8rem', border: '1.5px solid #e2e8f0', borderRadius: 12, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', transition: 'all .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
                <GoogleIcon /> Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>or sign in with email</span>
                <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={resetMode ? handleReset : handleEmailLogin}>
            {/* Email */}
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Email address</label>
              <FiMail size={16} style={{ position: 'absolute', left: 14, top: 'calc(50% + 10px)', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle(false)}
                onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
            </div>

            {/* Password (hidden in reset mode) */}
            {!resetMode && (
              <div style={{ marginBottom: '0.5rem', position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Password</label>
                <FiLock size={16} style={{ position: 'absolute', left: 14, top: 'calc(50% + 10px)', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ ...inputStyle(false), paddingRight: '2.75rem' }}
                  onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: 'calc(50% + 10px)', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                  {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            )}

            {/* Forgot password link */}
            {!resetMode && (
              <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                <button type="button" onClick={() => { setResetMode(true); setError(''); setInfo(''); }} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 500 }}>
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', background: loading ? 'rgba(239,68,68,0.6)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 16px rgba(239,68,68,0.35)', transition: 'all .2s', marginBottom: '1rem' }}>
              {loading ? 'Please wait…' : resetMode ? 'Send Reset Link' : 'Sign In'}
            </button>

            {resetMode && (
              <button type="button" onClick={() => { setResetMode(false); setError(''); }} style={{ width: '100%', padding: '0.75rem', background: 'transparent', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: 12, cursor: 'pointer', fontWeight: 500, fontSize: '0.875rem' }}>
                ← Back to Sign In
              </button>
            )}
          </form>
        </div>

        {/* Footer links */}
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#ef4444', fontWeight: 600, textDecoration: 'none' }}>Create one free</Link>
        </p>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); input::placeholder{color:#cbd5e1}`}</style>
    </div>
  );
}