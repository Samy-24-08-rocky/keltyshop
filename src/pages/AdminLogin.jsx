import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { FiMail, FiLock, FiAlertCircle, FiShoppingBag, FiEye, FiEyeOff } from 'react-icons/fi';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { adminLogin } = useAdmin();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        await new Promise(r => setTimeout(r, 600)); // simulate async
        const ok = adminLogin(email, password);
        setLoading(false);
        if (ok) {
            navigate('/admin');
        } else {
            setError('Invalid email or password. Please try again.');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: "'Inter', sans-serif",
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none'
            }}>
                <div style={{
                    position: 'absolute', top: '-20%', right: '-10%',
                    width: '600px', height: '600px',
                    background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />
                <div style={{
                    position: 'absolute', bottom: '-20%', left: '-10%',
                    width: '500px', height: '500px',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
                    borderRadius: '50%',
                }} />
            </div>

            <div style={{
                width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1,
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '72px', height: '72px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        borderRadius: '20px',
                        boxShadow: '0 8px 32px rgba(239,68,68,0.4)',
                        marginBottom: '1rem',
                    }}>
                        <FiShoppingBag size={34} color="white" />
                    </div>
                    <h1 style={{ color: '#f8fafc', fontSize: '1.75rem', fontWeight: '700', margin: '0 0 0.25rem' }}>
                        Admin Portal
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                        Kelty's Mini Market — Control Centre
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    backdropFilter: 'blur(16px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '2.5rem',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
                }}>
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                borderRadius: '12px', padding: '0.875rem 1rem',
                                marginBottom: '1.5rem', color: '#fca5a5', fontSize: '0.875rem',
                            }}>
                                <FiAlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Email */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FiMail size={16} style={{
                                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                    color: '#64748b',
                                }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    required
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: 'rgba(255,255,255,0.07)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '12px',
                                        padding: '0.875rem 1rem 0.875rem 2.75rem',
                                        color: '#f1f5f9', fontSize: '0.9rem',
                                        outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.6)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <FiLock size={16} style={{
                                    position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                                    color: '#64748b',
                                }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{
                                        width: '100%', boxSizing: 'border-box',
                                        background: 'rgba(255,255,255,0.07)',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        borderRadius: '12px',
                                        padding: '0.875rem 2.75rem 0.875rem 2.75rem',
                                        color: '#f1f5f9', fontSize: '0.9rem',
                                        outline: 'none', transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'rgba(239,68,68,0.6)'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    style={{
                                        position: 'absolute', right: '12px', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none',
                                        color: '#64748b', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center',
                                        padding: '4px', borderRadius: '4px',
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                                    onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                background: loading
                                    ? 'rgba(239,68,68,0.5)'
                                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                                color: 'white', fontWeight: '600', fontSize: '0.95rem',
                                padding: '0.9rem', borderRadius: '12px', border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(239,68,68,0.4)',
                                transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '16px', height: '16px',
                                        border: '2px solid rgba(255,255,255,0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                    Signing in…
                                </>
                            ) : 'Sign In to Admin Panel'}
                        </button>
                    </form>


                </div>

                <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.8rem', marginTop: '1.5rem' }}>
                    <a href="/" style={{ color: '#64748b', textDecoration: 'none' }}>← Back to store</a>
                </p>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #475569; }
      `}</style>
        </div>
    );
};

export default AdminLogin;
