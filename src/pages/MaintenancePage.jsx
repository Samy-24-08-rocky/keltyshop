import React from 'react';
import { FiClock, FiTool, FiInstagram, FiTwitter, FiFacebook, FiMail } from 'react-icons/fi';

export default function MaintenancePage() {
    return (
        <div style={{
            minHeight: '100vh',
            background: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: "'Inter', sans-serif",
            color: '#f1f5f9',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorations */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-15%', left: '-5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

            <div style={{ maxWidth: 600, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
                {/* Icon Animation */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{
                        width: 100, height: 100, background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)',
                        borderRadius: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)', position: 'relative'
                    }}>
                        <FiTool size={44} color="#ef4444" style={{ animation: 'bob 3s ease-in-out infinite' }} />
                        <div style={{ position: 'absolute', top: -10, right: -10, background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>OFFLINE</div>
                    </div>
                </div>

                <h1 style={{ fontSize: '2.75rem', fontWeight: 900, marginBottom: '1rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Store Under Maintenance
                </h1>

                <p style={{ fontSize: '1.1rem', color: '#94a3b8', lineHeight: 1.7, marginBottom: '2.5rem' }}>
                    We're currently making some internal improvements to serve you better.
                    Kelty's Mini Market will be back online shortly with a fresh stock and updated deals!
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', borderRadius: 20 }}>
                        <FiClock size={24} color="#ef4444" style={{ marginBottom: '0.75rem' }} />
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Expected Back</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Less than 2 hours</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', borderRadius: 20 }}>
                        <FiMail size={24} color="#6366f1" style={{ marginBottom: '0.75rem' }} />
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>Contact Us</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>support@kelty.com</div>
                    </div>
                </div>

                {/* Socials */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                    {[FiInstagram, FiTwitter, FiFacebook].map((Icon, i) => (
                        <a key={i} href="#" style={{ color: '#475569', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                            <Icon size={24} />
                        </a>
                    ))}
                </div>

                <div style={{ marginTop: '4rem', fontSize: '0.8rem', color: '#334155' }}>
                    &copy; 2026 Kelty's Mini Market. All rights reserved.
                </div>
            </div>

            <style>{`
                @keyframes bob {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(10deg); }
                }
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            `}</style>
        </div>
    );
}
