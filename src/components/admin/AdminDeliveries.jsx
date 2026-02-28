import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiTruck, FiClock, FiCheckCircle, FiMapPin, FiPackage } from 'react-icons/fi';

const DELIVERY_STAGES = ['processing', 'out_for_delivery', 'delivered'];

const TrackBar = ({ status }) => {
    const idx = DELIVERY_STAGES.indexOf(status);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '0.75rem 0' }}>
            {DELIVERY_STAGES.map((s, i) => {
                const done = i <= idx && status !== 'cancelled';
                const labels = { processing: 'Processing', out_for_delivery: 'In Transit', delivered: 'Delivered' };
                return (
                    <React.Fragment key={s}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'linear-gradient(135deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.08)', border: done ? 'none' : '2px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .3s' }}>
                                {done && <FiCheckCircle size={14} color="white" />}
                            </div>
                            <span style={{ fontSize: '0.64rem', color: done ? '#86efac' : '#475569', whiteSpace: 'nowrap' }}>{labels[s]}</span>
                        </div>
                        {i < DELIVERY_STAGES.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: i < idx && status !== 'cancelled' ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.08)', margin: '0 4px 18px', transition: 'all .3s' }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default function AdminDeliveries() {
    const { orders, updateOrderStatus } = useAdmin();

    const active = orders.filter(o => o.status !== 'cancelled');
    const counts = {
        processing: active.filter(o => o.status === 'processing').length,
        out_for_delivery: active.filter(o => o.status === 'out_for_delivery').length,
        delivered: active.filter(o => o.status === 'delivered').length,
    };

    return (
        <div>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Preparing', count: counts.processing, icon: FiPackage, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                    { label: 'In Transit', count: counts.out_for_delivery, icon: FiTruck, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
                    { label: 'Delivered', count: counts.delivered, icon: FiCheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
                ].map(c => (
                    <div key={c.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 44, height: 44, background: c.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <c.icon size={22} color={c.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{c.count}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.2rem' }}>{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delivery cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(340px,1fr))', gap: '1rem' }}>
                {active.map(o => (
                    <div key={o.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <div>
                                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.875rem' }}>{o.id}</div>
                                <div style={{ color: '#e2e8f0', fontSize: '0.82rem', marginTop: '0.2rem' }}>{o.customer}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.06)', padding: '4px 10px', borderRadius: 99, fontSize: '0.72rem', color: '#94a3b8' }}>
                                <FiClock size={11} /> {o.date}
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
                            <FiMapPin size={13} color="#ef4444" />
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{o.address}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600 }}>{o.delivery}</span>
                            <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem' }}>{o.items} items · £{o.total.toFixed(2)}</span>
                        </div>

                        <TrackBar status={o.status} />

                        {/* Action buttons */}
                        {o.status === 'processing' && (
                            <button onClick={() => updateOrderStatus(o.id, 'out_for_delivery')} style={{ width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid rgba(59,130,246,0.4)', background: 'rgba(59,130,246,0.12)', color: '#93c5fd', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                🚚 Mark as Out for Delivery
                            </button>
                        )}
                        {o.status === 'out_for_delivery' && (
                            <button onClick={() => updateOrderStatus(o.id, 'delivered')} style={{ width: '100%', padding: '0.6rem', borderRadius: 10, border: '1px solid rgba(34,197,94,0.4)', background: 'rgba(34,197,94,0.12)', color: '#86efac', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', marginTop: '0.5rem' }}>
                                ✅ Mark as Delivered
                            </button>
                        )}
                        {o.status === 'delivered' && (
                            <div style={{ textAlign: 'center', color: '#22c55e', fontWeight: 600, fontSize: '0.8rem', marginTop: '0.5rem' }}>✅ Successfully Delivered</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
