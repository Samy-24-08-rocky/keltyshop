import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    FiSearch, FiChevronDown, FiPlus, FiEdit2, FiTrash2,
    FiX, FiCheck, FiAlertTriangle, FiUser, FiMail,
    FiMapPin, FiTruck, FiPackage, FiDollarSign, FiCalendar,
    FiClock, FiBell
} from 'react-icons/fi';

const STATUS_OPTIONS = ['processing', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];

const STATUS_CONFIG = {
    processing: { label: 'Processing', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    confirmed: { label: 'Confirmed', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
    out_for_delivery: { label: 'Out for Delivery', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    delivered: { label: 'Delivered', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
    cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

const Badge = ({ status }) => {
    const c = STATUS_CONFIG[status] || STATUS_CONFIG.processing;
    return <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 99, fontSize: '0.73rem', fontWeight: 600 }}>{c.label}</span>;
};

const BLANK_ORDER = {
    customer: '', email: '', address: '', phone: '',
    status: 'processing', items: 1, total: 0,
    date: new Date().toISOString().split('T')[0],
    deliveryTime: '', estimatedDelivery: '',
};

const Field = ({ label, icon: Icon, children }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {Icon && <Icon size={12} />} {label}
        </label>
        {children}
    </div>
);

const inputSx = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0.65rem 0.875rem',
    color: '#f1f5f9', fontSize: '0.875rem', outline: 'none',
    fontFamily: 'inherit',
};

export default function AdminOrders() {
    const { orders, updateOrderStatus, addOrder, updateOrder, deleteOrder } = useAdmin();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [expanded, setExpanded] = useState(null);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(BLANK_ORDER);
    const [editId, setEditId] = useState(null);
    const [confirm, setConfirm] = useState(null);

    // Confirm-order modal
    const [confirmModal, setConfirmModal] = useState(null); // order object
    const [deliveryTime, setDeliveryTime] = useState('');
    const [estimatedDate, setEstimatedDate] = useState('');

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const filtered = orders.filter(o => {
        const matchFilter = filter === 'all' || o.status === filter;
        const matchSearch = o.id.toLowerCase().includes(search.toLowerCase())
            || (o.customer || '').toLowerCase().includes(search.toLowerCase())
            || (o.email || '').toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const openAdd = () => {
        setForm({ ...BLANK_ORDER, date: new Date().toISOString().split('T')[0] });
        setEditId(null);
        setModal('form');
    };

    const openEdit = (o) => {
        setForm({ ...o });
        setEditId(o.id);
        setModal('form');
    };

    const handleSave = () => {
        const data = { ...form, items: parseInt(form.items) || 1, total: parseFloat(form.total) || 0 };
        if (editId) updateOrder(editId, data);
        else addOrder(data);
        setModal(null);
    };

    // Confirm order → set status to 'confirmed' + save delivery time
    const openConfirmOrder = (o) => {
        setConfirmModal(o);
        setDeliveryTime('');
        setEstimatedDate('');
    };

    const handleConfirmOrder = () => {
        if (!confirmModal) return;
        updateOrder(confirmModal.id, {
            status: 'confirmed',
            deliveryTime: deliveryTime || 'To be advised',
            estimatedDelivery: estimatedDate || '',
            confirmedAt: new Date().toISOString(),
        });
        setConfirmModal(null);
    };

    return (
        <div>
            {/* ── Toolbar ── */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <FiSearch size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search by ID, customer or email…"
                        style={{ ...inputSx, paddingLeft: '2.25rem' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {['all', ...STATUS_OPTIONS].map(s => (
                        <button key={s} onClick={() => setFilter(s)} style={{
                            padding: '0.45rem 0.875rem', borderRadius: 99, border: '1px solid', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, transition: 'all .15s',
                            background: filter === s ? (STATUS_CONFIG[s]?.bg || 'rgba(248,250,252,0.12)') : 'transparent',
                            borderColor: filter === s ? (STATUS_CONFIG[s]?.color || 'rgba(255,255,255,0.2)') : 'rgba(255,255,255,0.1)',
                            color: filter === s ? (STATUS_CONFIG[s]?.color || '#f1f5f9') : '#64748b',
                        }}>
                            {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s}
                        </button>
                    ))}
                </div>

                <button onClick={openAdd} style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.6rem 1.1rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white',
                    fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 4px 12px rgba(239,68,68,0.3)', flexShrink: 0,
                }}>
                    <FiPlus size={15} /> New Order
                </button>
            </div>

            <div style={{ color: '#475569', fontSize: '0.78rem', marginBottom: '0.75rem' }}>
                Showing {filtered.length} of {orders.length} orders
            </div>

            {/* ── Order Cards ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filtered.map(o => (
                    <div key={o.id} style={{
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 14, overflow: 'hidden', transition: 'border-color .2s',
                    }}>
                        {/* Header row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 1.25rem', cursor: 'pointer', flexWrap: 'wrap' }}
                            onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                            <div style={{ flex: 1, minWidth: 110 }}>
                                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.875rem' }}>{o.id}</div>
                                <div style={{ color: '#64748b', fontSize: '0.72rem' }}>{o.date}</div>
                            </div>
                            <div style={{ flex: 2, minWidth: 150 }}>
                                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>{o.customer}</div>
                                <div style={{ color: '#475569', fontSize: '0.72rem' }}>{o.email}</div>
                            </div>
                            <div style={{ minWidth: 90, textAlign: 'right' }}>
                                <div style={{ fontWeight: 700, color: '#f1f5f9' }}>£{Number(o.total).toFixed(2)}</div>
                                <div style={{ color: '#475569', fontSize: '0.72rem' }}>{o.items} item{o.items !== 1 ? 's' : ''}</div>
                            </div>
                            <Badge status={o.status} />

                            {/* Confirm shortcut — only for new/processing orders */}
                            {o.status === 'processing' && (
                                <button
                                    onClick={e => { e.stopPropagation(); openConfirmOrder(o); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                        padding: '0.4rem 0.875rem', borderRadius: 8, border: 'none', cursor: 'pointer',
                                        background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white',
                                        fontWeight: 600, fontSize: '0.75rem', boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
                                    }}
                                >
                                    <FiCheck size={12} /> Confirm Order
                                </button>
                            )}

                            <div style={{ display: 'flex', gap: '0.4rem' }} onClick={e => e.stopPropagation()}>
                                <button onClick={() => openEdit(o)} title="Edit" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd', borderRadius: 8, padding: '0.35rem 0.55rem', cursor: 'pointer' }}>
                                    <FiEdit2 size={13} />
                                </button>
                                <button onClick={() => setConfirm(o.id)} title="Delete" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5', borderRadius: 8, padding: '0.35rem 0.55rem', cursor: 'pointer' }}>
                                    <FiTrash2 size={13} />
                                </button>
                            </div>

                            <FiChevronDown size={15} color="#475569" style={{ transform: expanded === o.id ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
                        </div>

                        {/* Expanded detail */}
                        {expanded === o.id && (
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.25rem', background: 'rgba(0,0,0,0.15)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Customer Email</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{o.email || '—'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Phone</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{o.phone || '—'}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Delivery Address</div>
                                        <div style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{o.address || '—'}</div>
                                    </div>
                                    {o.deliveryTime && (
                                        <div>
                                            <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Delivery Time / Date</div>
                                            <div style={{ color: '#818cf8', fontSize: '0.85rem', fontWeight: 600 }}>
                                                {o.deliveryTime}{o.estimatedDelivery ? ` · ${o.estimatedDelivery}` : ''}
                                            </div>
                                        </div>
                                    )}
                                    {/* Products list */}
                                    {o.products && o.products.length > 0 && (
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <div style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Items Ordered</div>
                                            {o.products.map((p, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1', fontSize: '0.82rem', padding: '0.3rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <span>{p.name} × {p.qty}</span>
                                                    <span>£{(p.price * p.qty).toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Quick status update */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Change status:</span>
                                    {STATUS_OPTIONS.filter(s => s !== o.status).map(s => (
                                        <button key={s} onClick={() => updateOrderStatus(o.id, s)} style={{
                                            padding: '0.35rem 0.75rem', borderRadius: 99,
                                            border: `1px solid ${STATUS_CONFIG[s].color}`,
                                            background: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].color,
                                            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                                        }}>
                                            → {STATUS_CONFIG[s].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>No orders found.</div>
                )}
            </div>

            {/* ── Confirm Order Modal ── */}
            {confirmModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: '#1a2537', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1.5rem' }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <FiBell size={22} color="#818cf8" />
                            </div>
                            <div>
                                <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.05rem' }}>Confirm Order — {confirmModal.id}</div>
                                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Customer: <span style={{ color: '#a5b4fc' }}>{confirmModal.customer}</span></div>
                            </div>
                            <button onClick={() => setConfirmModal(null)} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '0.5rem', color: '#94a3b8', cursor: 'pointer' }}>
                                <FiX size={16} />
                            </button>
                        </div>

                        {/* Delivery time input */}
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '1.25rem', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
                            <Field label="Delivery Time Slot" icon={FiClock}>
                                <input
                                    value={deliveryTime}
                                    onChange={e => setDeliveryTime(e.target.value)}
                                    placeholder="e.g. 2:00 PM – 5:00 PM  or  Morning slot"
                                    style={inputSx}
                                />
                            </Field>
                            <Field label="Estimated Delivery Date" icon={FiCalendar}>
                                <input
                                    type="date"
                                    value={estimatedDate}
                                    onChange={e => setEstimatedDate(e.target.value)}
                                    style={inputSx}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </Field>
                            <p style={{ color: '#475569', fontSize: '0.75rem', margin: '0.5rem 0 0' }}>
                                ℹ️ This info will appear on the customer's <strong style={{ color: '#94a3b8' }}>My Orders</strong> page immediately.
                            </p>
                        </div>

                        {/* Items summary */}
                        <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '0.875rem 1.1rem', marginBottom: '1.5rem', fontSize: '0.82rem', color: '#a5b4fc' }}>
                            💬 Confirming will notify the customer their order is accepted and will be delivered within the time you set above.
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setConfirmModal(null)} style={{ padding: '0.7rem 1.25rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 500 }}>
                                Cancel
                            </button>
                            <button onClick={handleConfirmOrder} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}>
                                <FiCheck size={15} /> Confirm & Notify Customer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirm Modal ── */}
            {confirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2rem', maxWidth: 360, width: '90%', textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                            <FiAlertTriangle size={26} color="#ef4444" />
                        </div>
                        <h3 style={{ color: '#f1f5f9', margin: '0 0 0.5rem', fontWeight: 700 }}>Delete Order?</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                            Order <code style={{ color: '#a5b4fc' }}>{confirm}</code>
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '1.5rem' }}>This cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button onClick={() => setConfirm(null)} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                            <button onClick={() => { deleteOrder(confirm); setConfirm(null); setExpanded(null); }} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add / Edit Order Modal ── */}
            {modal === 'form' && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: '#1a2537', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 540, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: '1.05rem' }}>
                                    {editId ? `Edit Order — ${editId}` : 'New Order'}
                                </h3>
                                <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.78rem' }}>
                                    {editId ? 'Update order details below' : 'Fill in the order details'}
                                </p>
                            </div>
                            <button onClick={() => setModal(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '0.5rem', color: '#94a3b8', cursor: 'pointer' }}>
                                <FiX size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 0.875rem' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Field label="Customer Name" icon={FiUser}>
                                    <input value={form.customer} onChange={e => set('customer', e.target.value)} placeholder="e.g. Alice Johnson" style={inputSx} />
                                </Field>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Field label="Email" icon={FiMail}>
                                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="customer@example.com" style={inputSx} />
                                </Field>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Field label="Delivery Address" icon={FiMapPin}>
                                    <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="12 Oak St, London" style={inputSx} />
                                </Field>
                            </div>
                            <Field label="Order Date" icon={FiCalendar}>
                                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={inputSx} />
                            </Field>
                            <Field label="No. of Items" icon={FiPackage}>
                                <input type="number" min="1" value={form.items} onChange={e => set('items', e.target.value)} placeholder="1" style={inputSx} />
                            </Field>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Field label="Order Total (£)" icon={FiDollarSign}>
                                    <input type="number" min="0" step="0.01" value={form.total} onChange={e => set('total', e.target.value)} placeholder="0.00" style={inputSx} />
                                </Field>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Field label="Status">
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {STATUS_OPTIONS.map(s => (
                                            <button key={s} type="button" onClick={() => set('status', s)} style={{
                                                padding: '0.45rem 0.875rem', borderRadius: 99, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, border: '1.5px solid',
                                                background: form.status === s ? STATUS_CONFIG[s].bg : 'transparent',
                                                borderColor: form.status === s ? STATUS_CONFIG[s].color : 'rgba(255,255,255,0.1)',
                                                color: form.status === s ? STATUS_CONFIG[s].color : '#64748b',
                                            }}>
                                                {STATUS_CONFIG[s].label}
                                            </button>
                                        ))}
                                    </div>
                                </Field>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                            <button onClick={() => setModal(null)} style={{ padding: '0.7rem 1.25rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', cursor: 'pointer', fontWeight: 700, boxShadow: '0 4px 14px rgba(239,68,68,0.35)' }}>
                                <FiCheck size={15} /> {editId ? 'Save Changes' : 'Create Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
