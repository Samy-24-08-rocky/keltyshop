import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff, FiCheckCircle } from 'react-icons/fi';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const inputStyle = { width: '100%', boxSizing: 'border-box', padding: '0.8rem 1rem 0.8rem 2.75rem', border: '1.5px solid #e2e8f0', borderRadius: 12, fontSize: '0.9rem', outline: 'none', transition: 'border-color .2s, box-shadow .2s', background: 'white', color: '#1e293b' };

const passwordStrength = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const { settings } = useAdmin();
  const navigate = useNavigate();

  if (settings.allowNewRegistrations === false) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fef2f2 0%,#fff 60%,#fef2f2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Inter',sans-serif" }}>
        <div style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: 'rgba(239,68,68,0.1)', borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
            <FiLock size={32} color="#ef4444" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>Registration Closed</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            New customer registrations are temporarily disabled. Please contact our support if you're a returning customer having issues logging in.
          </p>
          <Link to="/" style={{ color: '#ef4444', fontWeight: 700, textDecoration: 'none' }}>Return to Home</Link>
        </div>
      </div>
    );
  }

  const pwStrength = passwordStrength(password);

  const friendlyError = (code) => {
    const map = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
      'auth/network-request-failed': 'Network error. Check your connection.',
    };
    return map[code] || 'Registration failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Please enter your full name.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      await register(email, password, name.trim());
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fef2f2 0%,#fff 60%,#fef2f2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ position: 'fixed', top: '-15%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(239,68,68,0.08) 0%,transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', marginBottom: '1.25rem' }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(239,68,68,0.35)' }}>
              <span style={{ color: 'white', fontSize: '1.2rem' }}>🛒</span>
            </div>
            <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '1.1rem' }}>Kelty's Mini Market</span>
          </Link>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>Create your account</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Join for exclusive deals and fast delivery</p>
        </div>

        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 48px rgba(0,0,0,0.1)', padding: '2rem', border: '1px solid rgba(0,0,0,0.05)' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#dc2626', fontSize: '0.85rem' }}>
              <FiAlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          {/* Google */}
          <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '0.8rem', border: '1.5px solid #e2e8f0', borderRadius: 12, background: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: '#1e293b', transition: 'all .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', marginBottom: '1.25rem' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}>
            <GoogleIcon /> Sign up with Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>or register with email</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Full Name</label>
              <FiUser size={16} style={{ position: 'absolute', left: 14, top: 'calc(50% + 10px)', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Email Address</label>
              <FiMail size={16} style={{ position: 'absolute', left: 14, top: 'calc(50% + 10px)', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '0.5rem', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Password</label>
              <FiLock size={16} style={{ position: 'absolute', left: 14, top: 'calc(50% + 10px)', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required style={{ ...inputStyle, paddingRight: '2.75rem' }}
                onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
              <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: 'calc(50% + 10px)', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                {showPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {/* Password strength meter */}
            {password && (
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '0.3rem' }}>
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= pwStrength ? strengthColor[pwStrength] : '#e2e8f0', transition: 'background .3s' }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', color: strengthColor[pwStrength], fontWeight: 600 }}>{strengthLabel[pwStrength]}</span>
              </div>
            )}

            {/* Confirm password */}
            <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem' }}>Confirm Password</label>
              <FiLock size={16} style={{ position: 'absolute', left: 14, top: 'calc(50% + 10px)', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required style={{ ...inputStyle, borderColor: confirm && confirm !== password ? '#f87171' : '#e2e8f0' }}
                onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = confirm && confirm !== password ? '#f87171' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
              {confirm && confirm === password && (
                <FiCheckCircle size={16} style={{ position: 'absolute', right: 12, top: 'calc(50% + 10px)', transform: 'translateY(-50%)', color: '#22c55e' }} />
              )}
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.875rem', background: loading ? 'rgba(239,68,68,0.6)' : 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.95rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 16px rgba(239,68,68,0.35)', transition: 'all .2s' }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#ef4444', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.72rem', marginTop: '0.75rem' }}>
          By creating an account you agree to our{' '}
          <span style={{ color: '#64748b', cursor: 'pointer' }}>Terms of Service</span> and{' '}
          <span style={{ color: '#64748b', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); input::placeholder{color:#cbd5e1}`}</style>
    </div>
  );
}