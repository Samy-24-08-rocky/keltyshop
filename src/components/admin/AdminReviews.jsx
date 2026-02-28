import React, { useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiCheckCircle, FiXCircle, FiTrash2, FiStar, FiMessageSquare, FiUser } from 'react-icons/fi';

const iconBtn = (color = '#64748b') => ({
    display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
    padding: '0.45rem 0.875rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)', color, cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
    transition: 'all .15s',
});

const Stars = ({ n }) => (
    <div style={{ display: 'flex', gap: 2 }}>
        {[1, 2, 3, 4, 5].map(i => (
            <span key={i} style={{ color: i <= n ? '#f59e0b' : '#334155', fontSize: '1rem' }}>★</span>
        ))}
    </div>
);

export default function AdminReviews() {
    const { testimonials, updateTestimonial, deleteTestimonial } = useAdmin();

    const pending = useMemo(() => testimonials.filter(t => !t.isApproved), [testimonials]);
    const approved = useMemo(() => testimonials.filter(t => t.isApproved), [testimonials]);

    return (
        <div style={{ fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div>
                <h2 style={{ margin: 0, color: '#f1f5f9', fontWeight: 800, fontSize: '1.25rem' }}>Customer Reviews</h2>
                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Approve and manage testimonials before they appear on the Storefront</p>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, padding: '1.25rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#60a5fa', lineHeight: 1 }}>{pending.length}</div>
                    <div style={{ fontSize: '0.8rem', color: '#93c5fd', fontWeight: 600, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Awaiting Approval</div>
                </div>
                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '1.25rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#4ade80', lineHeight: 1 }}>{approved.length}</div>
                    <div style={{ fontSize: '0.8rem', color: '#86efac', fontWeight: 600, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live on Storefront</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '1.25rem' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{testimonials.length}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Reviews</div>
                </div>
            </div>

            {/* Pending Reviews */}
            {pending.length > 0 && (
                <div style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiMessageSquare color="#60a5fa" />
                        <h3 style={{ margin: 0, color: '#bfdbfe', fontWeight: 700, fontSize: '0.95rem' }}>Needs Approval ({pending.length})</h3>
                    </div>
                    {pending.map(t => (
                        <div key={t.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px,1fr) auto', gap: '1rem', padding: '1.25rem', borderBottom: '1px solid rgba(59,130,246,0.1)', background: 'rgba(15,23,42,0.3)' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                    <img src={t.image} alt="" style={{ width: 36, height: 36, borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
                                    <div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f1f5f9' }}>{t.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{t.role} · {t.date}</div>
                                    </div>
                                    <div style={{ marginLeft: '1rem' }}><Stars n={t.rating} /></div>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(255,255,255,0.04)', padding: '0.875rem', borderRadius: 8, fontStyle: 'italic' }}>
                                    "{t.text}"
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                                <button onClick={() => updateTestimonial(t.id, { isApproved: true })} style={{ ...iconBtn('#4ade80'), background: 'rgba(34,197,94,0.15)', borderColor: 'transparent' }}>
                                    <FiCheckCircle /> Approve
                                </button>
                                <button onClick={() => deleteTestimonial(t.id)} style={{ ...iconBtn('#f87171') }}>
                                    <FiTrash2 /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Approved Reviews */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FiStar color="#fbbf24" />
                    <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>Live Testimonials ({approved.length})</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)' }}>
                    {approved.length === 0 && <div style={{ padding: '2rem', color: '#64748b', textAlign: 'center', gridColumn: '1 / -1' }}>No approved reviews yet.</div>}
                    {approved.map(t => (
                        <div key={t.id} style={{ padding: '1.25rem', background: '#0f172a', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#94a3b8,#64748b)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={t.image} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} onError={e => e.target.style.display = 'none'} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e2e8f0' }}>{t.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{t.date}</div>
                                    </div>
                                </div>
                                <button onClick={() => updateTestimonial(t.id, { isApproved: false })} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}>
                                    Hide
                                </button>
                            </div>
                            <Stars n={t.rating} />
                            <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>"{t.text}"</div>
                            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px dashed rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => deleteTestimonial(t.id)} style={{ ...iconBtn('#ef4444'), padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
                                    <FiTrash2 size={12} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
