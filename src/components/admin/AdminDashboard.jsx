import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    FiDollarSign, FiShoppingBag, FiTruck, FiPackage, FiAlertTriangle,
    FiUsers, FiCheckCircle, FiXCircle, FiPlus, FiEdit2, FiTrash2,
    FiRefreshCw, FiStar, FiTrendingUp, FiActivity, FiX, FiCheck,
    FiArrowUp, FiArrowDown, FiZap,
} from 'react-icons/fi';

// ── helpers ──────────────────────────────────────────────────────────────────
const STATUS_CFG = {
    delivered: { label: 'Delivered', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    processing: { label: 'Processing', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    out_for_delivery: { label: 'Out for Delivery', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};
const STATUS_OPTS = ['processing', 'out_for_delivery', 'delivered', 'cancelled'];
const DELIVERY_OPTS = ['Standard', 'Express', 'Same Day'];
const CATEGORIES = ['Pantry', 'Condiments', 'Dairy', 'Bakery', 'Meat', 'Seafood', 'Drinks', 'Snacks', 'Breakfast', 'Frozen'];

const BLANK_ORDER = {
    customer: '', email: '', address: '', delivery: 'Standard',
    status: 'processing', items: 1, total: 0,
    date: new Date().toISOString().split('T')[0],
};
const BLANK_PRODUCT = { name: '', price: '', oldPrice: '', category: 'Pantry', stock: '', image: '', rating: '4.5', featured: false };

const inputSx = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: 10, padding: '0.6rem 0.875rem', color: '#f1f5f9',
    fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit',
};
const selSx = { ...inputSx, background: '#1e2a3a' };

// ── sub-components ────────────────────────────────────────────────────────────
const Kpi = ({ icon: Icon, label, value, sub, color, bg, trend }) => (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem 1.4rem', display: 'flex', alignItems: 'flex-start', gap: '0.875rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ width: 44, height: 44, background: bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={20} color={color} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
            <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
            {sub && <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.3rem' }}>{sub}</div>}
        </div>
        {trend != null && (
            <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.68rem', fontWeight: 700, color: trend >= 0 ? '#22c55e' : '#ef4444' }}>
                {trend >= 0 ? <FiArrowUp size={11} /> : <FiArrowDown size={11} />}{Math.abs(trend)}%
            </div>
        )}
    </div>
);

const Badge = ({ status }) => {
    const c = STATUS_CFG[status] || {};
    return <span style={{ background: c.bg, color: c.color, padding: '2px 9px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{c.label}</span>;
};

// Mini bar chart using divs
const MiniBar = ({ data, color }) => {
    const max = Math.max(...data.map(d => d.v), 1);
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
            {data.map((d, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: '100%', background: color, borderRadius: '3px 3px 0 0', height: `${(d.v / max) * 44}px`, minHeight: 2, opacity: 0.85, transition: 'height .3s' }} />
                    <span style={{ fontSize: '0.55rem', color: '#475569' }}>{d.l}</span>
                </div>
            ))}
        </div>
    );
};

// Section card wrapper
const Card = ({ title, badge, action, children, style = {} }) => (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden', ...style }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f1f5f9' }}>{title}</span>
                {badge && <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '1px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700 }}>{badge}</span>}
            </div>
            {action}
        </div>
        <div style={{ padding: '0.875rem' }}>{children}</div>
    </div>
);

// Modal wrapper
const Modal = ({ title, subtitle, onClose, children, maxWidth = 500 }) => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem' }}>
        <div style={{ background: '#1a2537', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '1.75rem', width: '100%', maxWidth, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.55)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f1f5f9' }}>{title}</div>
                    {subtitle && <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{subtitle}</div>}
                </div>
                <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '0.45rem', color: '#94a3b8', cursor: 'pointer' }}><FiX size={17} /></button>
            </div>
            {children}
        </div>
    </div>
);

const Field = ({ label, children }) => (
    <div style={{ marginBottom: '0.875rem' }}>
        <label style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
        {children}
    </div>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
    const {
        stats, orders, products,
        addOrder, updateOrder, deleteOrder, updateOrderStatus,
        addProduct, updateProduct, deleteProduct, toggleFeatured,
    } = useAdmin();

    // modals
    const [modal, setModal] = useState(null); // 'order-add'|'order-edit'|'product-add'|'product-edit'|'order-delete'|'product-delete'
    const [oForm, setOForm] = useState(BLANK_ORDER);
    const [pForm, setPForm] = useState(BLANK_PRODUCT);
    const [editOId, setEditOId] = useState(null);
    const [editPId, setEditPId] = useState(null);
    const [delOId, setDelOId] = useState(null);
    const [delPId, setDelPId] = useState(null);

    const so = (k, v) => setOForm(f => ({ ...f, [k]: v }));
    const sp = (k, v) => setPForm(f => ({ ...f, [k]: v }));

    // Derived data
    const recentOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6), [orders]);
    const lowStock = useMemo(() => products.filter(p => p.stock >= 0 && p.stock <= 5), [products]);
    const topProducts = useMemo(() => [...products].sort((a, b) => b.rating - a.rating).slice(0, 5), [products]);

    // Revenue last 7 days (simulated from orders)
    const revenueChart = useMemo(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(); d.setDate(d.getDate() - 6 + i);
            return { l: d.toLocaleDateString('en-GB', { weekday: 'narrow' }), date: d.toISOString().split('T')[0], v: 0 };
        });
        orders.forEach(o => {
            const day = days.find(d => d.date === o.date);
            if (day && o.status !== 'cancelled') day.v += o.total;
        });
        return days;
    }, [orders]);

    // Order actions
    const openAddOrder = () => { setOForm({ ...BLANK_ORDER, date: new Date().toISOString().split('T')[0] }); setEditOId(null); setModal('order-add'); };
    const openEditOrder = o => { setOForm({ ...o }); setEditOId(o.id); setModal('order-edit'); };
    const saveOrder = () => {
        const data = { ...oForm, items: parseInt(oForm.items) || 1, total: parseFloat(oForm.total) || 0 };
        if (editOId) updateOrder(editOId, data); else addOrder(data);
        setModal(null);
    };

    // Product actions
    const openAddProduct = () => { setPForm(BLANK_PRODUCT); setEditPId(null); setModal('product-add'); };
    const openEditProduct = p => { setPForm({ ...p, price: String(p.price), oldPrice: String(p.oldPrice ?? ''), stock: String(p.stock) }); setEditPId(p.id); setModal('product-edit'); };
    const saveProduct = () => {
        const data = { ...pForm, price: parseFloat(pForm.price) || 0, oldPrice: pForm.oldPrice ? parseFloat(pForm.oldPrice) : null, stock: parseInt(pForm.stock) || 0, rating: parseFloat(pForm.rating) || 4.5 };
        if (editPId) updateProduct(editPId, data); else addProduct(data);
        setModal(null);
    };
    const confirmDeleteOrder = id => { setDelOId(id); setModal('order-delete'); };
    const confirmDeleteProduct = id => { setDelPId(id); setModal('product-delete'); };

    const btnPrimary = { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: 9, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(239,68,68,0.3)' };
    const btnSave = { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 14px rgba(239,68,68,0.35)' };
    const btnCancel = { padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 500 };

    return (
        <div style={{ fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* ── KPI Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(190px,1fr))', gap: '0.875rem' }}>
                <Kpi icon={FiDollarSign} label="Total Revenue" value={`£${stats.totalRevenue.toFixed(2)}`} sub="All time, excl. cancelled" color="#22c55e" bg="rgba(34,197,94,0.15)" trend={8} />
                <Kpi icon={FiShoppingBag} label="Total Orders" value={stats.totalOrders} sub={`${stats.pendingOrders} pending`} color="#3b82f6" bg="rgba(59,130,246,0.15)" trend={3} />
                <Kpi icon={FiTruck} label="Out for Delivery" value={stats.outForDelivery} sub="In transit" color="#f59e0b" bg="rgba(245,158,11,0.15)" />
                <Kpi icon={FiCheckCircle} label="Delivered" value={stats.deliveredOrders} sub="Completed orders" color="#22c55e" bg="rgba(34,197,94,0.15)" />
                <Kpi icon={FiPackage} label="Products" value={stats.totalProducts} sub={`${stats.outOfStockProducts} out of stock`} color="#8b5cf6" bg="rgba(139,92,246,0.15)" />
                <Kpi icon={FiAlertTriangle} label="Low Stock" value={stats.lowStockProducts} sub="Need restocking" color="#f59e0b" bg="rgba(245,158,11,0.15)" />
                <Kpi icon={FiUsers} label="Customers" value={stats.totalCustomers} sub="Unique buyers" color="#06b6d4" bg="rgba(6,182,212,0.15)" trend={5} />
                <Kpi icon={FiXCircle} label="Cancelled" value={stats.cancelledOrders} sub="Lost orders" color="#ef4444" bg="rgba(239,68,68,0.15)" trend={-2} />
            </div>

            {/* ── Revenue Chart + Quick Actions ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem' }}>
                <Card title="Revenue — Last 7 Days" badge={`£${revenueChart.reduce((s, d) => s + d.v, 0).toFixed(2)}`}>
                    <MiniBar data={revenueChart} color="rgba(239,68,68,0.75)" />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Peak Day', value: '£' + Math.max(...revenueChart.map(d => d.v)).toFixed(2), color: '#22c55e' },
                            { label: 'Avg/Day', value: '£' + (revenueChart.reduce((s, d) => s + d.v, 0) / 7).toFixed(2), color: '#3b82f6' },
                            { label: 'Orders', value: orders.filter(o => o.status !== 'cancelled').length, color: '#a5b4fc' },
                        ].map(({ label, value, color }) => (
                            <div key={label}>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color }}>{value}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Quick Actions">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                        {[
                            { label: 'New Order', icon: FiPlus, color: '#ef4444', bg: 'rgba(239,68,68,0.15)', action: openAddOrder },
                            { label: 'New Product', icon: FiZap, color: '#6366f1', bg: 'rgba(99,102,241,0.15)', action: openAddProduct },
                            { label: 'Low Stock', icon: FiAlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', badge: stats.lowStockProducts || null },
                            { label: 'Pending', icon: FiActivity, color: '#3b82f6', bg: 'rgba(59,130,246,0.15)', badge: stats.pendingOrders || null },
                        ].map(({ label, icon: Icon, color, bg, action, badge: b }) => (
                            <button key={label} onClick={action} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem',
                                padding: '0.7rem 0.875rem', borderRadius: 11,
                                background: bg, border: `1px solid ${color}30`,
                                cursor: action ? 'pointer' : 'default', width: '100%', textAlign: 'left',
                                transition: 'opacity .15s',
                            }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={15} color={color} />
                                </div>
                                <span style={{ flex: 1, fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{label}</span>
                                {b != null && <span style={{ background: color, color: 'white', borderRadius: 99, fontSize: '0.65rem', fontWeight: 800, padding: '1px 7px' }}>{b}</span>}
                            </button>
                        ))}
                    </div>
                </Card>
            </div>

            {/* ── Recent Orders (with CRUD) ── */}
            <Card
                title="Recent Orders"
                badge={`${orders.length} total`}
                action={<button onClick={openAddOrder} style={btnPrimary}><FiPlus size={14} /> New Order</button>}
            >
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                                {['Order ID', 'Customer', 'Date', 'Total', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.6rem 0.875rem', textAlign: 'left', fontSize: '0.68rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(o => (
                                <tr key={o.id}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '0.75rem 0.875rem', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700 }}>{o.id}</td>
                                    <td style={{ padding: '0.75rem 0.875rem' }}>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>{o.customer}</div>
                                        <div style={{ color: '#475569', fontSize: '0.7rem' }}>{o.email}</div>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.875rem', color: '#64748b', fontSize: '0.78rem' }}>{o.date}</td>
                                    <td style={{ padding: '0.75rem 0.875rem', color: '#f1f5f9', fontWeight: 700 }}>£{Number(o.total).toFixed(2)}</td>
                                    <td style={{ padding: '0.75rem 0.875rem' }}>
                                        <select
                                            value={o.status}
                                            onChange={e => updateOrderStatus(o.id, e.target.value)}
                                            style={{ background: STATUS_CFG[o.status]?.bg, color: STATUS_CFG[o.status]?.color, border: `1px solid ${STATUS_CFG[o.status]?.color}50`, borderRadius: 8, padding: '3px 8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                                        >
                                            {STATUS_OPTS.map(s => <option key={s} value={s} style={{ background: '#1e2a3a', color: '#f1f5f9' }}>{STATUS_CFG[s].label}</option>)}
                                        </select>
                                    </td>
                                    <td style={{ padding: '0.75rem 0.875rem' }}>
                                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                                            <button onClick={() => openEditOrder(o)} title="Edit" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd', borderRadius: 7, padding: '0.3rem 0.5rem', cursor: 'pointer' }}><FiEdit2 size={12} /></button>
                                            <button onClick={() => confirmDeleteOrder(o.id)} title="Delete" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 7, padding: '0.3rem 0.5rem', cursor: 'pointer' }}><FiTrash2 size={12} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentOrders.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: '#475569' }}>No orders yet.</div>}
                </div>
            </Card>

            {/* ── Products & Stock Alerts ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}>

                {/* Top Products with CRUD */}
                <Card
                    title="Top Rated Products"
                    badge={`${products.length} total`}
                    action={<button onClick={openAddProduct} style={btnPrimary}><FiPlus size={14} /> Add Product</button>}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {topProducts.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.5rem', borderRadius: 10, transition: 'background .15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 9, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                        <span style={{ color: '#fbbf24' }}>★</span> {p.rating} &nbsp;·&nbsp;
                                        <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', padding: '0 5px', borderRadius: 4 }}>{p.category}</span>
                                    </div>
                                </div>
                                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.85rem', minWidth: 50, textAlign: 'right' }}>£{Number(p.price).toFixed(2)}</div>
                                <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                                    <button onClick={() => toggleFeatured(p.id)} title={p.featured ? 'Unfeature' : 'Feature'} style={{ background: p.featured ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 7, padding: '0.3rem 0.45rem', cursor: 'pointer', color: p.featured ? '#fbbf24' : '#475569' }}><FiStar size={12} /></button>
                                    <button onClick={() => openEditProduct(p)} title="Edit" style={{ background: 'rgba(59,130,246,0.15)', border: 'none', borderRadius: 7, padding: '0.3rem 0.45rem', cursor: 'pointer', color: '#93c5fd' }}><FiEdit2 size={12} /></button>
                                    <button onClick={() => confirmDeleteProduct(p.id)} title="Delete" style={{ background: 'rgba(239,68,68,0.12)', border: 'none', borderRadius: 7, padding: '0.3rem 0.45rem', cursor: 'pointer', color: '#fca5a5' }}><FiTrash2 size={12} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Stock Alerts with quick restock */}
                <Card title="⚠️ Stock Alerts" badge={lowStock.length || null}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {lowStock.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#475569', fontSize: '0.85rem' }}>✅ All products well-stocked</div>
                        ) : lowStock.map(p => (
                            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem', borderRadius: 10, background: p.stock === 0 ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)', border: `1px solid ${p.stock === 0 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                                <img src={p.image} alt={p.name} style={{ width: 34, height: 34, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }} onError={e => e.target.style.display = 'none'} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.68rem', color: p.stock === 0 ? '#f87171' : '#fbbf24' }}>
                                        {p.stock === 0 ? '⛔ Out of stock' : `⚠ Only ${p.stock} left`}
                                    </div>
                                </div>
                                {/* Quick restock +10 */}
                                <button
                                    onClick={() => updateProduct(p.id, { stock: p.stock + 10 })}
                                    title="Quick restock +10"
                                    style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#86efac', borderRadius: 7, padding: '0.3rem 0.5rem', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, whiteSpace: 'nowrap' }}
                                >
                                    +10
                                </button>
                                <button onClick={() => openEditProduct(p)} title="Edit stock" style={{ background: 'rgba(59,130,246,0.15)', border: 'none', borderRadius: 7, padding: '0.3rem 0.45rem', cursor: 'pointer', color: '#93c5fd' }}><FiEdit2 size={12} /></button>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* ══════════════════════════════════════════════════════════
                MODALS
            ══════════════════════════════════════════════════════════ */}

            {/* ── Add/Edit Order ── */}
            {(modal === 'order-add' || modal === 'order-edit') && (
                <Modal title={editOId ? `Edit Order — ${editOId}` : 'New Order'} subtitle={editOId ? 'Update details below' : 'Fill in the order info'} onClose={() => setModal(null)}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.875rem' }}>
                        <div style={{ gridColumn: '1/-1' }}><Field label="Customer Name"><input value={oForm.customer} onChange={e => so('customer', e.target.value)} placeholder="Alice Johnson" style={inputSx} /></Field></div>
                        <div style={{ gridColumn: '1/-1' }}><Field label="Email"><input type="email" value={oForm.email} onChange={e => so('email', e.target.value)} placeholder="customer@example.com" style={inputSx} /></Field></div>
                        <div style={{ gridColumn: '1/-1' }}><Field label="Delivery Address"><input value={oForm.address} onChange={e => so('address', e.target.value)} placeholder="12 Oak St, London" style={inputSx} /></Field></div>
                        <Field label="Date"><input type="date" value={oForm.date} onChange={e => so('date', e.target.value)} style={inputSx} /></Field>
                        <Field label="Delivery Type"><select value={oForm.delivery} onChange={e => so('delivery', e.target.value)} style={selSx}>{DELIVERY_OPTS.map(d => <option key={d}>{d}</option>)}</select></Field>
                        <Field label="Items"><input type="number" min="1" value={oForm.items} onChange={e => so('items', e.target.value)} style={inputSx} /></Field>
                        <Field label="Total (£)"><input type="number" min="0" step="0.01" value={oForm.total} onChange={e => so('total', e.target.value)} style={inputSx} /></Field>
                        <div style={{ gridColumn: '1/-1' }}>
                            <Field label="Status">
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {STATUS_OPTS.map(s => (
                                        <button key={s} type="button" onClick={() => so('status', s)} style={{ padding: '0.4rem 0.75rem', borderRadius: 99, cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, border: '1.5px solid', background: oForm.status === s ? STATUS_CFG[s].bg : 'transparent', borderColor: oForm.status === s ? STATUS_CFG[s].color : 'rgba(255,255,255,0.1)', color: oForm.status === s ? STATUS_CFG[s].color : '#64748b' }}>
                                            {STATUS_CFG[s].label}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                        <button onClick={() => setModal(null)} style={btnCancel}>Cancel</button>
                        <button onClick={saveOrder} style={btnSave}><FiCheck size={14} />{editOId ? 'Save Changes' : 'Create Order'}</button>
                    </div>
                </Modal>
            )}

            {/* ── Add/Edit Product ── */}
            {(modal === 'product-add' || modal === 'product-edit') && (
                <Modal title={editPId ? 'Edit Product' : 'Add Product'} subtitle={editPId ? 'Update product details' : 'Add a new product to the store'} onClose={() => setModal(null)}>
                    <Field label="Product Name"><input value={pForm.name} onChange={e => sp('name', e.target.value)} placeholder="e.g. Organic Apples" style={inputSx} /></Field>
                    <Field label="Image URL"><input value={pForm.image} onChange={e => sp('image', e.target.value)} placeholder="https://..." style={inputSx} /></Field>
                    {pForm.image && <img src={pForm.image} alt="preview" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 10, marginBottom: '0.875rem' }} onError={e => e.target.style.display = 'none'} />}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.875rem' }}>
                        <Field label="Price (£)"><input type="number" step="0.01" value={pForm.price} onChange={e => sp('price', e.target.value)} placeholder="1.99" style={inputSx} /></Field>
                        <Field label="Old Price (£)"><input type="number" step="0.01" value={pForm.oldPrice} onChange={e => sp('oldPrice', e.target.value)} placeholder="2.49" style={inputSx} /></Field>
                        <Field label="Stock"><input type="number" value={pForm.stock} onChange={e => sp('stock', e.target.value)} placeholder="10" style={inputSx} /></Field>
                        <Field label="Rating (0–5)"><input type="number" step="0.1" max="5" value={pForm.rating} onChange={e => sp('rating', e.target.value)} placeholder="4.5" style={inputSx} /></Field>
                    </div>
                    <Field label="Category"><select value={pForm.category} onChange={e => sp('category', e.target.value)} style={selSx}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1.25rem' }}>
                        <input type="checkbox" checked={pForm.featured} onChange={e => sp('featured', e.target.checked)} style={{ width: 15, height: 15, accentColor: '#ef4444' }} />
                        <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>Show on Featured / Homepage</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setModal(null)} style={btnCancel}>Cancel</button>
                        <button onClick={saveProduct} style={btnSave}><FiCheck size={14} />{editPId ? 'Save Changes' : 'Add Product'}</button>
                    </div>
                </Modal>
            )}

            {/* ── Confirm Delete Order ── */}
            {modal === 'order-delete' && (
                <Modal title="Delete Order?" onClose={() => setModal(null)} maxWidth={360}>
                    <div style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><FiTrash2 size={24} color="#ef4444" /></div>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 0.25rem' }}>Order <code style={{ color: '#a5b4fc' }}>{delOId}</code></p>
                        <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '1.5rem' }}>This cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button onClick={() => setModal(null)} style={btnCancel}>Cancel</button>
                            <button onClick={() => { deleteOrder(delOId); setModal(null); }} style={btnSave}><FiTrash2 size={13} />Delete</button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ── Confirm Delete Product ── */}
            {modal === 'product-delete' && (
                <Modal title="Delete Product?" onClose={() => setModal(null)} maxWidth={360}>
                    <div style={{ textAlign: 'center', paddingBottom: '0.5rem' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}><FiTrash2 size={24} color="#ef4444" /></div>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 0.25rem' }}>
                            {products.find(p => p.id === delPId)?.name || 'This product'}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '1.5rem' }}>This cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button onClick={() => setModal(null)} style={btnCancel}>Cancel</button>
                            <button onClick={() => { deleteProduct(delPId); setModal(null); }} style={btnSave}><FiTrash2 size={13} />Delete</button>
                        </div>
                    </div>
                </Modal>
            )}

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');`}</style>
        </div>
    );
}
