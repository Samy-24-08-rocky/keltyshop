import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import {
    FiShoppingBag, FiChevronDown, FiPackage, FiTruck,
    FiCheckCircle, FiXCircle, FiClock, FiCheck, FiAlertCircle
} from 'react-icons/fi';

const STATUS = {
    processing: { label: 'Processing', icon: FiClock, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
    confirmed: { label: 'Confirmed ✓', icon: FiCheck, color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)' },
    out_for_delivery: { label: 'Out for Delivery', icon: FiTruck, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)' },
    delivered: { label: 'Delivered', icon: FiCheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
    cancelled: { label: 'Cancelled', icon: FiXCircle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
};

const Badge = ({ status }) => {
    const s = STATUS[status] || STATUS.processing;
    const Icon = s.icon;
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '4px 12px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600 }}>
            <Icon size={13} /> {s.label}
        </span>
    );
};

const OrderCard = ({ order, onCancel }) => {
    const [open, setOpen] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);

    const itemCount = order.items || (order.products ? order.products.reduce((s, i) => s + (i.qty || 1), 0) : 0);
    const isHighlighted = ['confirmed', 'out_for_delivery', 'delivered'].includes(order.status);
    // Only 'processing' orders can be cancelled (before shop confirms)
    const canCancel = order.status === 'processing';

    return (
        <>
            <div style={{ background: 'white', borderRadius: 16, border: `1px solid ${isHighlighted ? 'rgba(99,102,241,0.2)' : '#f1f5f9'}`, boxShadow: isHighlighted ? '0 4px 20px rgba(99,102,241,0.1)' : '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', transition: 'box-shadow .2s' }}>

                {/* Status banners */}
                {order.status === 'confirmed' && (
                    <div style={{ background: 'linear-gradient(90deg,#6366f1,#4f46e5)', padding: '0.625rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <FiAlertCircle size={15} color="white" />
                        <span style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600 }}>
                            🎉 Order Confirmed by Shop!
                            {order.deliveryTime && <> · Delivery: <strong>{order.deliveryTime}</strong>{order.estimatedDelivery ? ` on ${order.estimatedDelivery}` : ''}</>}
                        </span>
                    </div>
                )}
                {order.status === 'out_for_delivery' && (
                    <div style={{ background: 'linear-gradient(90deg,#3b82f6,#2563eb)', padding: '0.625rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <FiTruck size={15} color="white" />
                        <span style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600 }}>
                            🚚 Your order is on its way!
                            {order.deliveryTime && <> · Expected: <strong>{order.deliveryTime}</strong>{order.estimatedDelivery ? ` on ${order.estimatedDelivery}` : ''}</>}
                        </span>
                    </div>
                )}
                {order.status === 'delivered' && (
                    <div style={{ background: 'linear-gradient(90deg,#22c55e,#16a34a)', padding: '0.625rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <FiCheckCircle size={15} color="white" />
                        <span style={{ color: 'white', fontSize: '0.82rem', fontWeight: 600 }}>✅ Delivered — Thank you for shopping with us!</span>
                    </div>
                )}

                {/* Header */}
                <div style={{ padding: '1.25rem 1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }} onClick={() => setOpen(o => !o)}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                        <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>{order.id}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <FiClock size={12} /> {order.date}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', flex: 2 }}>
                        <Badge status={order.status} />
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 80 }}>
                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1rem' }}>£{Number(order.total).toFixed(2)}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{itemCount} item{itemCount !== 1 ? 's' : ''}</div>
                    </div>
                    {/* Cancel — only for processing orders */}
                    {canCancel && (
                        <button onClick={e => { e.stopPropagation(); setConfirmCancel(true); }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.4rem 0.875rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                            <FiXCircle size={13} /> Cancel Order
                        </button>
                    )}
                    <FiChevronDown size={18} color="#94a3b8" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .25s', flexShrink: 0 }} />
                </div>

                {/* Expanded */}
                {open && (
                    <div style={{ borderTop: '1px solid #f1f5f9', background: '#fafbfc' }}>
                        {(order.deliveryTime || order.estimatedDelivery) && (
                            <div style={{ padding: '1rem 1.5rem', background: 'rgba(99,102,241,0.05)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>📦 Delivery Details (from shop)</div>
                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    {order.deliveryTime && <div><div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Time Slot</div><div style={{ fontWeight: 700, color: '#4338ca' }}>{order.deliveryTime}</div></div>}
                                    {order.estimatedDelivery && <div><div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Expected Date</div><div style={{ fontWeight: 700, color: '#4338ca' }}>{order.estimatedDelivery}</div></div>}
                                    {order.address && <div><div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Deliver to</div><div style={{ fontWeight: 600, color: '#374151', fontSize: '0.85rem' }}>{order.address}</div></div>}
                                </div>
                            </div>
                        )}
                        <div style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Items Ordered</div>
                            {order.products && order.products.length > 0 ? order.products.map((p, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#374151' }}>
                                    <span>{p.name} × {p.qty}</span>
                                    <span style={{ fontWeight: 600 }}>£{(p.price * p.qty).toFixed(2)}</span>
                                </div>
                            )) : (
                                <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{itemCount} item{itemCount !== 1 ? 's' : ''} in this order.</p>
                            )}
                        </div>
                        <div style={{ padding: '1rem 1.5rem', background: 'white', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ maxWidth: 260, marginLeft: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#1e293b', fontSize: '0.95rem', borderTop: '2px solid #f1f5f9', paddingTop: '0.5rem' }}>
                                    <span>Total</span><span>£{Number(order.total).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel Confirmation Modal */}
            {confirmCancel && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
                    <div style={{ background: 'white', borderRadius: 20, padding: '2rem', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <FiXCircle size={28} color="#ef4444" />
                        </div>
                        <h3 style={{ fontWeight: 800, color: '#1e293b', margin: '0 0 0.5rem' }}>Cancel Order?</h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Order <strong>{order.id}</strong></p>
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '1.5rem' }}>This cannot be undone. The shop will be notified.</p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button onClick={() => setConfirmCancel(false)} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid #e2e8f0', background: 'transparent', color: '#64748b', cursor: 'pointer', fontWeight: 500 }}>Keep Order</button>
                            <button onClick={() => { onCancel(order.id); setConfirmCancel(false); }} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 12px rgba(239,68,68,0.3)' }}>Yes, Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default function OrdersPage() {
    const { user } = useAuth();
    const { orders: adminOrders, updateOrderStatus } = useAdmin();
    const [filter, setFilter] = useState('all');

    const handleCancel = (orderId) => updateOrderStatus(orderId, 'cancelled');

    if (!user) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontFamily: "'Inter',sans-serif" }}>
                <FiShoppingBag size={52} color="#cbd5e1" />
                <h2 style={{ color: '#64748b', fontWeight: 600 }}>Sign in to view your orders</h2>
                <Link to="/login" style={{ padding: '0.75rem 2rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', borderRadius: 12, textDecoration: 'none', fontWeight: 600 }}>Sign In</Link>
            </div>
        );
    }

    // Filter orders for this customer only
    const myOrders = adminOrders.filter(o =>
        (o.email || '').toLowerCase() === (user.email || '').toLowerCase()
    );
    const filtered = filter === 'all' ? myOrders : myOrders.filter(o => o.status === filter);

    const stats = {
        total: myOrders.length,
        processing: myOrders.filter(o => o.status === 'processing').length,
        confirmed: myOrders.filter(o => o.status === 'confirmed').length,
        delivered: myOrders.filter(o => o.status === 'delivered').length,
        spent: myOrders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + Number(o.total), 0),
    };

    return (
        <div style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.5rem', fontFamily: "'Inter',sans-serif" }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                    <FiShoppingBag style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: '#ef4444' }} />My Orders
                </h1>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>Track and manage all your orders</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total Orders', value: stats.total, color: '#6366f1' },
                    { label: 'Processing', value: stats.processing, color: '#f59e0b' },
                    { label: 'Confirmed', value: stats.confirmed, color: '#6366f1' },
                    { label: 'Delivered', value: stats.delivered, color: '#22c55e' },
                    { label: 'Total Spent', value: `£${stats.spent.toFixed(2)}`, color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'white', border: '1px solid #f1f5f9', borderRadius: 14, padding: '1rem 1.25rem', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
                        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                {['all', 'processing', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'].map(f => {
                    const active = filter === f;
                    const cfg = STATUS[f] || { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' };
                    const label = f === 'all' ? 'All Orders' : STATUS[f]?.label || f;
                    return (
                        <button key={f} onClick={() => setFilter(f)} style={{ padding: '0.45rem 1rem', borderRadius: 99, border: `1px solid ${active ? cfg.color : '#e2e8f0'}`, background: active ? cfg.bg : 'white', color: active ? cfg.color : '#64748b', cursor: 'pointer', fontWeight: active ? 700 : 500, fontSize: '0.8rem', transition: 'all .15s' }}>
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* Orders list */}
            {myOrders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: 20, border: '1px solid #f1f5f9' }}>
                    <FiPackage size={52} color="#e2e8f0" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: '#94a3b8', fontWeight: 600, marginBottom: '0.5rem' }}>No orders yet</h3>
                    <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Once you place an order, it appears here with live status updates from the shop.</p>
                    <Link to="/shop" style={{ color: '#ef4444', fontWeight: 600, textDecoration: 'none', padding: '0.75rem 1.75rem', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px solid rgba(239,68,68,0.15)' }}>Start Shopping →</Link>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No orders found for this filter.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filtered.map(order => <OrderCard key={order.id} order={order} onCancel={handleCancel} />)}
                </div>
            )}
        </div>
    );
}
