import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    FiSearch, FiTrash2, FiPrinter, FiCheckCircle, FiXCircle,
    FiPlus, FiMinus, FiShoppingCart, FiZap, FiUser,
    FiBarChart2, FiRefreshCw, FiAlertCircle, FiCreditCard,
    FiDollarSign, FiSmartphone, FiX, FiPackage, FiTruck,
    FiClock, FiCheck, FiEye, FiChevronDown, FiChevronUp,
    FiMonitor, FiGlobe, FiFilter
} from 'react-icons/fi';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `£${Number(n || 0).toFixed(2)}`;
const generateReceiptId = () => `POS-${Date.now().toString(36).toUpperCase()}`;

const STATUS_META = {
    processing: { label: 'Processing', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    out_for_delivery: { label: 'Out for Delivery', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    delivered: { label: 'Delivered', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    cancelled: { label: 'Cancelled', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

const PAY_METHODS = [
    { id: 'cash', label: 'Cash', icon: FiDollarSign },
    { id: 'card', label: 'Card', icon: FiCreditCard },
    { id: 'mobile', label: 'Mobile', icon: FiSmartphone },
];

// ─── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
/* ── Tab bar ── */
.pos-tabs { display:flex; gap:0.5rem; margin-bottom:1rem; }
.pos-tab {
    display:flex; align-items:center; gap:0.5rem;
    padding:0.6rem 1.25rem; border-radius:10px; border:1.5px solid rgba(255,255,255,0.1);
    background:rgba(255,255,255,0.04); color:#64748b; cursor:pointer;
    font-size:0.82rem; font-weight:600; font-family:inherit; transition:all .18s;
    white-space:nowrap;
}
.pos-tab.active { border-color:#10b981; background:rgba(16,185,129,0.12); color:#10b981; }
.pos-tab:hover:not(.active) { background:rgba(255,255,255,0.07); color:#cbd5e1; }
.pos-tab-badge {
    background:#ef4444; color:#fff; border-radius:99px;
    font-size:0.65rem; font-weight:700; padding:1px 6px; min-width:18px; text-align:center;
}

/* ── POS layout ── */
.pos-wrap { display:flex; gap:1rem; height:100%; font-family:'Inter',sans-serif; min-height:0; }
.pos-left  { flex:1; display:flex; flex-direction:column; gap:0.875rem; min-width:0; }
.pos-right { width:340px; min-width:300px; display:flex; flex-direction:column; gap:0.875rem; }

/* ── Cards ── */
.pos-card {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
    border-radius:14px; padding:1rem;
}

/* ── Scanner ── */
.pos-scanner-wrap { position:relative; }
.pos-scanner-input {
    width:100%; padding:0.8rem 1rem 0.8rem 2.8rem;
    background:rgba(16,185,129,0.08); border:2px solid rgba(16,185,129,0.35);
    border-radius:10px; color:#f1f5f9; font-size:1rem; font-family:inherit; outline:none; transition:border-color .2s;
}
.pos-scanner-input:focus { border-color:#10b981; }
.pos-scanner-input::placeholder { color:#475569; }
.pos-scanner-icon { position:absolute; left:0.8rem; top:50%; transform:translateY(-50%); color:#10b981; pointer-events:none; }

/* ── Product grid ── */
.pos-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:0.6rem; overflow-y:auto; max-height:300px; }
.pos-grid-item {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
    border-radius:10px; padding:0.65rem; cursor:pointer; transition:all .15s ease;
    display:flex; flex-direction:column; gap:0.3rem; position:relative;
}
.pos-grid-item:hover { background:rgba(16,185,129,0.12); border-color:rgba(16,185,129,0.4); transform:translateY(-1px); }
.pos-grid-item.oos  { opacity:0.4; cursor:not-allowed; pointer-events:none; }
.pos-grid-img   { width:100%; aspect-ratio:1; object-fit:cover; border-radius:7px; background:#1e2a3a; }
.pos-grid-name  { font-size:0.7rem; color:#e2e8f0; font-weight:600; line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.pos-grid-price { font-size:0.76rem; color:#10b981; font-weight:700; }
.pos-grid-stock { font-size:0.6rem; color:#64748b; }
.pos-oos-tag { position:absolute; top:4px; right:4px; background:#ef4444; color:#fff; font-size:0.55rem; padding:1px 5px; border-radius:4px; font-weight:700; }

/* ── Cart ── */
.pos-cart { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:0.4rem; min-height:0; }
.pos-cart-row {
    display:flex; align-items:center; gap:0.5rem;
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
    border-radius:9px; padding:0.45rem 0.65rem;
}
.pos-cart-name  { flex:1; font-size:0.76rem; color:#e2e8f0; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pos-qty-btn    { background:rgba(255,255,255,0.08); border:none; border-radius:5px; width:20px; height:20px; color:#cbd5e1; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.72rem; }
.pos-qty-btn:hover { background:rgba(16,185,129,0.25); color:#10b981; }
.pos-qty-num    { font-size:0.76rem; color:#f1f5f9; font-weight:600; min-width:18px; text-align:center; }
.pos-item-total { font-size:0.76rem; color:#10b981; font-weight:700; min-width:42px; text-align:right; }
.pos-remove-btn { background:transparent; border:none; color:#475569; cursor:pointer; display:flex; padding:2px; }
.pos-remove-btn:hover { color:#ef4444; }

/* ── Totals ── */
.pos-total-row { display:flex; justify-content:space-between; align-items:center; }
.pos-total-label { font-size:0.76rem; color:#64748b; }
.pos-total-val   { font-size:0.76rem; color:#94a3b8; font-weight:500; }
.pos-grand-label { font-size:0.92rem; color:#f1f5f9; font-weight:700; }
.pos-grand-val   { font-size:0.95rem; color:#10b981; font-weight:800; }

/* ── Payment ── */
.pos-pay-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.5rem; }
.pos-pay-btn {
    display:flex; flex-direction:column; align-items:center; gap:0.25rem;
    padding:0.55rem; border-radius:9px; border:1.5px solid rgba(255,255,255,0.1);
    background:rgba(255,255,255,0.04); color:#94a3b8; cursor:pointer; font-size:0.68rem;
    font-family:inherit; font-weight:600; text-transform:uppercase; letter-spacing:.04em; transition:all .15s;
}
.pos-pay-btn.selected { border-color:#10b981; background:rgba(16,185,129,0.15); color:#10b981; }
.pos-pay-btn:hover:not(.selected) { background:rgba(255,255,255,0.08); }

/* ── Inputs ── */
.pos-cash-input, .pos-customer-input {
    width:100%; padding:0.55rem 0.875rem;
    background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,255,255,0.1);
    border-radius:9px; color:#f1f5f9; font-size:0.85rem; font-family:inherit; outline:none; transition:border-color .2s;
}
.pos-cash-input:focus, .pos-customer-input:focus { border-color:#10b981; }

/* ── Charge / Clear buttons ── */
.pos-charge-btn {
    width:100%; padding:0.75rem; background:linear-gradient(135deg,#10b981,#059669);
    border:none; border-radius:10px; color:white; font-size:0.9rem; font-weight:700;
    font-family:inherit; cursor:pointer; transition:opacity .2s;
    display:flex; align-items:center; justify-content:center; gap:0.5rem;
}
.pos-charge-btn:disabled { opacity:0.4; cursor:not-allowed; }
.pos-charge-btn:hover:not(:disabled) { opacity:0.9; }
.pos-clear-btn {
    width:100%; padding:0.5rem; background:transparent;
    border:1px solid rgba(239,68,68,0.3); border-radius:8px; color:#f87171;
    font-size:0.75rem; font-weight:600; font-family:inherit; cursor:pointer; transition:all .15s;
}
.pos-clear-btn:hover { background:rgba(239,68,68,0.1); }

/* ── Alert ── */
.pos-alert {
    padding:0.55rem 0.875rem; border-radius:8px; font-size:0.78rem; font-weight:600;
    display:flex; align-items:center; gap:0.5rem; animation:posSlideIn .2s ease; flex-shrink:0;
}
.pos-alert.success { background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.35); color:#10b981; }
.pos-alert.error   { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3);   color:#f87171; }
@keyframes posSlideIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }

/* ── Session stats ── */
.pos-stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; }
.pos-stat-item { background:rgba(255,255,255,0.04); border-radius:9px; padding:0.6rem 0.875rem; }
.pos-stat-label { font-size:0.62rem; color:#64748b; text-transform:uppercase; letter-spacing:.05em; }
.pos-stat-val   { font-size:0.95rem; color:#10b981; font-weight:700; margin-top:0.1rem; }

/* ── Online Orders list ── */
.ord-list { display:flex; flex-direction:column; gap:0.6rem; overflow-y:auto; flex:1; min-height:0; }
.ord-card {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08);
    border-radius:12px; overflow:hidden; transition:border-color .15s;
}
.ord-card:hover { border-color:rgba(255,255,255,0.14); }
.ord-card.expanded { border-color:rgba(16,185,129,0.3); }

.ord-header {
    display:flex; align-items:center; gap:0.75rem;
    padding:0.75rem 1rem; cursor:pointer;
}
.ord-id   { font-size:0.78rem; font-weight:700; color:#e2e8f0; min-width:70px; }
.ord-customer { flex:1; font-size:0.78rem; color:#94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ord-total    { font-size:0.82rem; font-weight:700; color:#10b981; white-space:nowrap; }
.ord-status-pill {
    padding:2px 9px; border-radius:99px; font-size:0.65rem; font-weight:700;
    white-space:nowrap; flex-shrink:0;
}
.ord-source-pill {
    padding:2px 7px; border-radius:6px; font-size:0.6rem; font-weight:700;
    white-space:nowrap; flex-shrink:0;
}

.ord-body { padding:0 1rem 0.75rem; border-top:1px solid rgba(255,255,255,0.06); }
.ord-body-row { display:flex; justify-content:space-between; font-size:0.75rem; color:#94a3b8; margin-bottom:0.25rem; }
.ord-body-row span:last-child { color:#e2e8f0; font-weight:500; }
.ord-items-list { margin:0.5rem 0; }
.ord-item-row { display:flex; justify-content:space-between; font-size:0.73rem; color:#64748b; padding:0.2rem 0; border-bottom:1px solid rgba(255,255,255,0.04); }
.ord-item-row:last-child { border-bottom:none; }

/* ── Status action buttons ── */
.ord-actions { display:flex; gap:0.4rem; margin-top:0.6rem; flex-wrap:wrap; }
.ord-act-btn {
    padding:0.4rem 0.75rem; border-radius:7px; font-size:0.7rem; font-weight:600;
    cursor:pointer; border:1.5px solid; font-family:inherit; transition:all .15s; white-space:nowrap;
}

/* ── Online orders filter bar ── */
.ord-filter-bar { display:flex; gap:0.4rem; flex-wrap:wrap; margin-bottom:0.75rem; }
.ord-filter-btn {
    padding:0.3rem 0.75rem; border-radius:99px; font-size:0.7rem; font-weight:600;
    cursor:pointer; border:1.5px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.04);
    color:#64748b; font-family:inherit; transition:all .15s; white-space:nowrap;
}
.ord-filter-btn.active { border-color:#10b981; background:rgba(16,185,129,0.12); color:#10b981; }

/* ── Receipt modal ── */
.pos-modal-backdrop {
    position:fixed; inset:0; background:rgba(0,0,0,0.72); z-index:999;
    display:flex; align-items:center; justify-content:center; padding:1rem;
    animation:posSlideIn .15s ease;
}
.pos-modal {
    background:#fff; border-radius:12px; padding:1.5rem; max-width:360px; width:100%;
    color:#111; font-family:'Courier New',monospace; max-height:90vh; overflow-y:auto;
}
.pos-receipt-title   { text-align:center; font-size:1.1rem; font-weight:700; margin-bottom:0.2rem; }
.pos-receipt-sub     { text-align:center; font-size:0.72rem; color:#555; margin-bottom:0.5rem; }
.pos-receipt-divider { border:none; border-top:1.5px dashed #ccc; margin:0.65rem 0; }
.pos-receipt-row     { display:flex; justify-content:space-between; font-size:0.76rem; margin-bottom:0.2rem; }
.pos-receipt-total   { display:flex; justify-content:space-between; font-size:0.88rem; font-weight:700; margin-top:0.2rem; }
.pos-receipt-footer  { text-align:center; font-size:0.68rem; color:#777; margin-top:0.75rem; }

/* ── Responsive ── */
@media(max-width:900px){
    .pos-wrap  { flex-direction:column; }
    .pos-right { width:100%; min-width:0; }
    .pos-grid  { max-height:200px; }
}
@keyframes spin { to { transform:rotate(360deg) } }
`;

// ─── Receipt Modal ──────────────────────────────────────────────────────────────
function Receipt({ receipt, settings, onClose }) {
    const tax = receipt.subtotal * ((settings?.taxRate || 0) / 100);
    return (
        <div className="pos-modal-backdrop" onClick={onClose}>
            <div className="pos-modal" onClick={e => e.stopPropagation()}>
                <div className="pos-receipt-title">{settings?.storeName || "Kelty's Mini Market"}</div>
                <div className="pos-receipt-sub">{settings?.tagline}</div>
                <div className="pos-receipt-sub">Receipt #{receipt.id} | {new Date(receipt.ts).toLocaleString()}</div>
                {receipt.customer && <div className="pos-receipt-sub">Customer: {receipt.customer}</div>}
                <hr className="pos-receipt-divider" />
                {receipt.items.map((item, i) => (
                    <div key={i} className="pos-receipt-row">
                        <span>{item.name} × {item.quantity}</span>
                        <span>{fmt(item.price * item.quantity)}</span>
                    </div>
                ))}
                <hr className="pos-receipt-divider" />
                <div className="pos-receipt-row"><span>Subtotal</span><span>{fmt(receipt.subtotal)}</span></div>
                {tax > 0 && <div className="pos-receipt-row"><span>Tax ({settings?.taxRate}%)</span><span>{fmt(tax)}</span></div>}
                <div className="pos-receipt-total"><span>TOTAL</span><span>{fmt(receipt.total)}</span></div>
                {receipt.payMethod === 'cash' && receipt.cashGiven > 0 && (
                    <>
                        <div className="pos-receipt-row"><span>Cash Given</span><span>{fmt(receipt.cashGiven)}</span></div>
                        <div className="pos-receipt-row"><span>Change</span><span>{fmt(receipt.cashGiven - receipt.total)}</span></div>
                    </>
                )}
                <div className="pos-receipt-row" style={{ marginTop: '0.4rem' }}>
                    <span>Payment</span><span style={{ textTransform: 'capitalize' }}>{receipt.payMethod}</span>
                </div>
                <hr className="pos-receipt-divider" />
                <div className="pos-receipt-footer">Thank you for shopping with us! 🛒</div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button onClick={() => window.print()} style={{ flex: 1, padding: '0.6rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                        🖨️ Print
                    </button>
                    <button onClick={onClose} style={{ flex: 1, padding: '0.6rem', background: '#e5e7eb', color: '#111', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Online Order Card ──────────────────────────────────────────────────────────
function OnlineOrderCard({ order, onStatusChange, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const [updating, setUpdating] = useState(false);
    const meta = STATUS_META[order.status] || STATUS_META.processing;

    const cartItems = order.cartItems || [];

    const handleStatus = async (newStatus) => {
        setUpdating(true);
        await onStatusChange(order.id, newStatus);
        setUpdating(false);
    };

    const nextActions = {
        processing: [{ status: 'out_for_delivery', label: '🚚 Mark Out for Delivery', color: '#3b82f6' }, { status: 'delivered', label: '✅ Mark Delivered', color: '#10b981' }, { status: 'cancelled', label: '❌ Cancel', color: '#ef4444' }],
        out_for_delivery: [{ status: 'delivered', label: '✅ Mark Delivered', color: '#10b981' }, { status: 'cancelled', label: '❌ Cancel', color: '#ef4444' }],
        delivered: [],
        cancelled: [],
    };
    const actions = nextActions[order.status] || [];

    const isOnline = !order.source || order.source !== 'POS';
    const isPOS = order.source === 'POS';

    return (
        <div className={`ord-card${expanded ? ' expanded' : ''}`}>
            <div className="ord-header" onClick={() => setExpanded(e => !e)}>
                <div>
                    <div className="ord-id">{order.id}</div>
                    <div style={{ fontSize: '0.65rem', color: '#475569', marginTop: '1px' }}>
                        {order.date}
                    </div>
                </div>
                <div className="ord-customer" title={order.customer}>{order.customer}</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                    <div className="ord-total">{fmt(order.total)}</div>
                    <span
                        className="ord-status-pill"
                        style={{ color: meta.color, background: meta.bg }}
                    >{meta.label}</span>
                </div>
                <span
                    className="ord-source-pill"
                    style={{
                        background: isPOS ? 'rgba(99,102,241,0.15)' : 'rgba(14,165,233,0.15)',
                        color: isPOS ? '#a5b4fc' : '#38bdf8',
                    }}
                >{isPOS ? '🏪 POS' : '🌐 Online'}</span>
                {expanded ? <FiChevronUp size={14} color="#475569" /> : <FiChevronDown size={14} color="#475569" />}
            </div>

            {expanded && (
                <div className="ord-body">
                    <div className="ord-body-row"><span>Email</span><span>{order.email || '—'}</span></div>
                    <div className="ord-body-row"><span>Delivery</span><span>{order.delivery || '—'}</span></div>
                    <div className="ord-body-row"><span>Address</span><span>{order.address || '—'}</span></div>
                    {order.payMethod && <div className="ord-body-row"><span>Payment</span><span style={{ textTransform: 'capitalize' }}>{order.payMethod}</span></div>}

                    {cartItems.length > 0 && (
                        <>
                            <div style={{ fontSize: '0.68rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '.06em', margin: '0.5rem 0 0.25rem' }}>Items</div>
                            <div className="ord-items-list">
                                {cartItems.map((item, i) => (
                                    <div key={i} className="ord-item-row">
                                        <span>{item.name}</span>
                                        <span>×{item.quantity} — {fmt(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                    {cartItems.length === 0 && (
                        <div style={{ fontSize: '0.73rem', color: '#475569', margin: '0.4rem 0' }}>
                            {order.items} item(s) ordered
                        </div>
                    )}

                    {actions.length > 0 && (
                        <div className="ord-actions">
                            {actions.map(a => (
                                <button
                                    key={a.status}
                                    className="ord-act-btn"
                                    disabled={updating}
                                    onClick={() => handleStatus(a.status)}
                                    style={{
                                        borderColor: a.color + '55',
                                        background: a.color + '18',
                                        color: a.color,
                                        opacity: updating ? 0.6 : 1,
                                    }}
                                >
                                    {updating ? '…' : a.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Walk-in Sale Panel (Left side) ────────────────────────────────────────────
function WalkinPanel({ session, setSession, showAlert, settings, products, updateProduct, addOrder }) {
    const [cart, setCart] = useState([]);
    const [scanInput, setScanInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [payMethod, setPayMethod] = useState('cash');
    const [cashGiven, setCashGiven] = useState('');
    const [customer, setCustomer] = useState('');
    const [processing, setProcessing] = useState(false);
    const [receipt, setReceipt] = useState(null);
    const [selectedCat, setSelectedCat] = useState('All');
    const scanRef = useRef(null);

    useEffect(() => { scanRef.current?.focus(); }, []);

    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const taxAmt = subtotal * ((settings?.taxRate || 0) / 100);
    const total = subtotal + taxAmt;
    const change = payMethod === 'cash' && cashGiven ? parseFloat(cashGiven) - total : 0;

    const findProduct = useCallback((q) => {
        if (!q) return null;
        const ql = q.trim().toLowerCase();
        return (
            products.find(p => p.barcode && p.barcode.toLowerCase() === ql) ||
            products.find(p => String(p.id) === ql) ||
            products.find(p => (p.name || '').toLowerCase().startsWith(ql))
        );
    }, [products]);

    const addToCart = useCallback((product) => {
        if (!product) return;
        if (product.stock === 0) { showAlert('error', `${product.name} is out of stock`); return; }
        setCart(prev => {
            const ex = prev.find(i => i.id === product.id);
            if (ex) {
                if (ex.quantity >= product.stock) { showAlert('error', `Only ${product.stock} in stock`); return prev; }
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        showAlert('success', `✓ ${product.name} added`);
    }, [showAlert]);

    const handleScanKey = useCallback((e) => {
        if (e.key !== 'Enter') return;
        const p = findProduct(scanInput);
        if (p) addToCart(p);
        else showAlert('error', `Not found: "${scanInput}"`);
        setScanInput('');
    }, [scanInput, findProduct, addToCart, showAlert]);

    const adjustQty = (id, delta) => setCart(prev => prev.map(i => {
        if (i.id !== id) return i;
        const next = i.quantity + delta;
        if (next < 1) return i;
        if (next > i.stock) { showAlert('error', `Only ${i.stock} in stock`); return i; }
        return { ...i, quantity: next };
    }));

    const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
    const clearCart = () => { setCart([]); setCashGiven(''); setCustomer(''); };

    const handleCharge = async () => {
        if (cart.length === 0) { showAlert('error', 'Cart is empty'); return; }
        if (payMethod === 'cash') {
            const given = parseFloat(cashGiven);
            if (!cashGiven || isNaN(given) || given < total) { showAlert('error', `Cash given must be ≥ ${fmt(total)}`); return; }
        }
        setProcessing(true);
        try {
            for (const item of cart) {
                await updateProduct(item.id, { stock: Math.max(0, item.stock - item.quantity) });
            }
            await addOrder({
                customer: customer || 'Walk-in Customer',
                email: 'pos@kelty.com',
                date: new Date().toISOString().slice(0, 10),
                items: cart.length,
                total,
                status: 'delivered',
                delivery: 'In-Store POS',
                address: 'In-Store',
                payMethod,
                source: 'POS',
                cartItems: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
            });
            setReceipt({ id: generateReceiptId(), ts: Date.now(), items: cart, subtotal, total, customer: customer || 'Walk-in Customer', payMethod, cashGiven: parseFloat(cashGiven) || 0 });
            setSession(s => ({
                transactions: s.transactions + 1,
                revenue: s.revenue + total,
                items: s.items + cart.reduce((a, i) => a + i.quantity, 0),
            }));
            clearCart();
        } catch (err) {
            showAlert('error', 'Transaction failed: ' + err.message);
        } finally { setProcessing(false); }
    };

    const filtered = useMemo(() => {
        let res = products;
        if (selectedCat !== 'All') {
            res = res.filter(p => p.category === selectedCat);
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            res = res.filter(p =>
                (p.name || '').toLowerCase().includes(q) ||
                (p.barcode && p.barcode.includes(q)) ||
                (p.category || '').toLowerCase().includes(q)
            );
        }
        return res;
    }, [products, selectedCat, searchQuery]);

    const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category).filter(Boolean))], [products]);

    return (
        <>
            {receipt && <Receipt receipt={receipt} settings={settings} onClose={() => setReceipt(null)} />}
            <div className="pos-wrap">
                {/* ── Left ── */}
                <div className="pos-left">
                    {/* Stats */}
                    <div className="pos-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                            <FiBarChart2 size={14} color="#10b981" />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Session Stats</span>
                        </div>
                        <div className="pos-stat-grid">
                            <div className="pos-stat-item"><div className="pos-stat-label">Transactions</div><div className="pos-stat-val">{session.transactions}</div></div>
                            <div className="pos-stat-item"><div className="pos-stat-label">Revenue</div><div className="pos-stat-val">{fmt(session.revenue)}</div></div>
                            <div className="pos-stat-item"><div className="pos-stat-label">Items Sold</div><div className="pos-stat-val">{session.items}</div></div>
                            <div className="pos-stat-item"><div className="pos-stat-label">Avg Sale</div><div className="pos-stat-val">{session.transactions ? fmt(session.revenue / session.transactions) : '£0.00'}</div></div>
                        </div>
                    </div>

                    {/* Barcode */}
                    <div className="pos-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                            <FiZap size={14} color="#10b981" />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Barcode Scanner</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#475569' }}>Press Enter after scan</span>
                        </div>
                        <div className="pos-scanner-wrap">
                            <FiZap className="pos-scanner-icon" size={16} />
                            <input ref={scanRef} className="pos-scanner-input" value={scanInput}
                                onChange={e => setScanInput(e.target.value)} onKeyDown={handleScanKey}
                                placeholder="Scan barcode or type product ID / name…"
                                id="pos-scan-input" autoComplete="off" />
                        </div>
                    </div>

                    {/* Product grid */}
                    <div className="pos-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                            <FiSearch size={14} color="#94a3b8" />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Products</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.62rem', color: '#475569' }}>{filtered.length} shown</span>
                        </div>
                        <input className="pos-customer-input" style={{ marginBottom: '0.6rem' }}
                            placeholder="Filter by name, category, barcode…"
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} id="pos-product-search" />

                        {/* Categories bar */}
                        <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.65rem', marginBottom: '0.2rem', whiteSpace: 'nowrap', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCat(cat)}
                                    style={{
                                        padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                                        background: selectedCat === cat ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                                        color: selectedCat === cat ? '#10b981' : '#64748b',
                                        border: `1px solid ${selectedCat === cat ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
                                        transition: 'all .15s'
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="pos-grid">
                            {filtered.map(p => (
                                <div key={p.id} className={`pos-grid-item${p.stock === 0 ? ' oos' : ''}`}
                                    onClick={() => addToCart(p)} title={p.barcode ? `Barcode: ${p.barcode}` : p.name}>
                                    {p.stock === 0 && <span className="pos-oos-tag">OOS</span>}
                                    <img className="pos-grid-img" src={p.image} alt={p.name} loading="lazy" onError={e => e.target.style.display = 'none'} />
                                    <div className="pos-grid-name">{p.name}</div>
                                    <div className="pos-grid-price">{fmt(p.price)}</div>
                                    <div className="pos-grid-stock">Stock: {p.stock}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right: Cart + Payment ── */}
                <div className="pos-right">
                    {/* Customer */}
                    <div className="pos-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <FiUser size={13} color="#94a3b8" />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Customer</span>
                        </div>
                        <input className="pos-customer-input" placeholder="Walk-in Customer (optional)"
                            value={customer} onChange={e => setCustomer(e.target.value)} id="pos-customer-input" />
                    </div>

                    {/* Cart */}
                    <div className="pos-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                            <FiShoppingCart size={14} color="#10b981" />
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Cart</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.62rem', background: cart.length ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', color: cart.length ? '#10b981' : '#475569', borderRadius: 99, padding: '1px 7px', fontWeight: 700 }}>
                                {cart.reduce((a, i) => a + i.quantity, 0)} items
                            </span>
                        </div>

                        <div className="pos-cart">
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#334155', padding: '1.5rem 0', fontSize: '0.78rem' }}>
                                    <FiShoppingCart size={24} style={{ marginBottom: '0.4rem', opacity: 0.4, display: 'block', margin: '0 auto 0.4rem' }} />
                                    Scan or click a product to add
                                </div>
                            ) : cart.map(item => (
                                <div key={item.id} className="pos-cart-row">
                                    <div className="pos-cart-name" title={item.name}>{item.name}</div>
                                    <button className="pos-qty-btn" onClick={() => adjustQty(item.id, -1)}><FiMinus size={9} /></button>
                                    <span className="pos-qty-num">{item.quantity}</span>
                                    <button className="pos-qty-btn" onClick={() => adjustQty(item.id, 1)}><FiPlus size={9} /></button>
                                    <span className="pos-item-total">{fmt(item.price * item.quantity)}</span>
                                    <button className="pos-remove-btn" onClick={() => removeItem(item.id)}><FiX size={12} /></button>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '0.65rem 0' }} />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.65rem' }}>
                            <div className="pos-total-row"><span className="pos-total-label">Subtotal</span><span className="pos-total-val">{fmt(subtotal)}</span></div>
                            {settings?.taxRate > 0 && (
                                <div className="pos-total-row"><span className="pos-total-label">Tax ({settings.taxRate}%)</span><span className="pos-total-val">{fmt(taxAmt)}</span></div>
                            )}
                            <div className="pos-total-row" style={{ marginTop: '0.15rem' }}>
                                <span className="pos-grand-label">Total</span>
                                <span className="pos-grand-val">{fmt(total)}</span>
                            </div>
                        </div>

                        <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '0.35rem' }}>Payment Method</div>
                        <div className="pos-pay-row" style={{ marginBottom: '0.55rem' }}>
                            {PAY_METHODS.map(({ id, label, icon: Icon }) => (
                                <button key={id} className={`pos-pay-btn${payMethod === id ? ' selected' : ''}`} onClick={() => setPayMethod(id)}>
                                    <Icon size={15} />{label}
                                </button>
                            ))}
                        </div>

                        {payMethod === 'cash' && (
                            <div style={{ marginBottom: '0.55rem' }}>
                                <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.25rem' }}>Cash Given</div>
                                <input type="number" className="pos-cash-input" placeholder={`Min: ${fmt(total)}`}
                                    value={cashGiven} onChange={e => setCashGiven(e.target.value)}
                                    min={0} step="0.01" id="pos-cash-input" />
                                {cashGiven && parseFloat(cashGiven) >= total && (
                                    <div style={{ fontSize: '0.73rem', color: '#10b981', marginTop: '0.2rem', fontWeight: 600 }}>Change: {fmt(change)}</div>
                                )}
                            </div>
                        )}

                        <button className="pos-charge-btn" onClick={handleCharge} disabled={cart.length === 0 || processing} id="pos-charge-btn">
                            {processing ? <FiRefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <FiCheckCircle size={15} />}
                            {processing ? 'Processing…' : `Charge ${fmt(total)}`}
                        </button>
                        {cart.length > 0 && (
                            <button className="pos-clear-btn" style={{ marginTop: '0.45rem' }} onClick={clearCart} id="pos-clear-btn">🗑️ Clear Cart</button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Online Orders Panel ────────────────────────────────────────────────────────
function OnlineOrdersPanel({ orders, updateOrderStatus, deleteOrder, showAlert }) {
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const FILTERS = [
        { id: 'all', label: 'All Orders' },
        { id: 'processing', label: '⏳ Processing' },
        { id: 'out_for_delivery', label: '🚚 Out for Delivery' },
        { id: 'delivered', label: '✅ Delivered' },
        { id: 'cancelled', label: '❌ Cancelled' },
    ];

    const handleStatusChange = async (id, status) => {
        await updateOrderStatus(id, status);
        showAlert('success', `Order ${id} → ${STATUS_META[status]?.label}`);
    };

    const visible = orders
        .filter(o => !o._deleted)
        .filter(o => filter === 'all' || o.status === filter)
        .filter(o =>
            !search ||
            o.id?.toLowerCase().includes(search.toLowerCase()) ||
            o.customer?.toLowerCase().includes(search.toLowerCase()) ||
            o.email?.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const pendingCount = orders.filter(o => !o._deleted && o.status === 'processing').length;
    const outCount = orders.filter(o => !o._deleted && o.status === 'out_for_delivery').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', minHeight: 0 }}>
            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.5rem' }}>
                {[
                    { label: 'Total', val: orders.filter(o => !o._deleted).length, color: '#94a3b8' },
                    { label: 'Processing', val: pendingCount, color: '#f59e0b' },
                    { label: 'Out Delivery', val: outCount, color: '#3b82f6' },
                    { label: 'Delivered', val: orders.filter(o => !o._deleted && o.status === 'delivered').length, color: '#10b981' },
                ].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '0.65rem 0.875rem' }}>
                        <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.label}</div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: s.color, marginTop: '0.1rem' }}>{s.val}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div style={{ position: 'relative' }}>
                <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search by order ID, customer name, email…"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '0.6rem 0.875rem 0.6rem 2.2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: '0.82rem', fontFamily: 'inherit', outline: 'none' }}
                    id="pos-order-search"
                />
            </div>

            {/* Filter tabs */}
            <div className="ord-filter-bar">
                {FILTERS.map(f => (
                    <button key={f.id} className={`ord-filter-btn${filter === f.id ? ' active' : ''}`} onClick={() => setFilter(f.id)}>
                        {f.label}
                        {f.id === 'processing' && pendingCount > 0 && (
                            <span style={{ marginLeft: 4, background: '#f59e0b', color: '#000', borderRadius: 99, fontSize: '0.6rem', fontWeight: 700, padding: '0 5px' }}>{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Order list */}
            <div className="ord-list">
                {visible.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#334155', padding: '3rem 0', fontSize: '0.82rem' }}>
                        <FiPackage size={28} style={{ marginBottom: '0.5rem', opacity: 0.4, display: 'block', margin: '0 auto 0.5rem' }} />
                        No orders found
                    </div>
                ) : visible.map(order => (
                    <OnlineOrderCard
                        key={order.id}
                        order={order}
                        onStatusChange={handleStatusChange}
                        onDelete={deleteOrder}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Main POS Component ─────────────────────────────────────────────────────────
export default function AdminPOS() {
    const { products, settings, updateProduct, addOrder, orders, updateOrderStatus, deleteOrder } = useAdmin();
    const [tab, setTab] = useState('walkin');
    const [alert, setAlert] = useState(null);
    const [session, setSession] = useState({ transactions: 0, revenue: 0, items: 0 });
    const alertTimer = useRef(null);

    const showAlert = useCallback((type, msg) => {
        setAlert({ type, msg });
        clearTimeout(alertTimer.current);
        alertTimer.current = setTimeout(() => setAlert(null), 3000);
    }, []);

    const pendingOnline = orders.filter(o => !o._deleted && o.status === 'processing').length;

    return (
        <>
            <style>{CSS}</style>

            {/* Tab bar */}
            <div className="pos-tabs">
                <button className={`pos-tab${tab === 'walkin' ? ' active' : ''}`} onClick={() => setTab('walkin')}>
                    <FiMonitor size={15} /> Walk-in Sale
                </button>
                <button className={`pos-tab${tab === 'online' ? ' active' : ''}`} onClick={() => setTab('online')}>
                    <FiGlobe size={15} /> Online Orders
                    {pendingOnline > 0 && <span className="pos-tab-badge">{pendingOnline}</span>}
                </button>
            </div>

            {/* Alert bar (shared) */}
            {alert && (
                <div className={`pos-alert ${alert.type}`} style={{ marginBottom: '0.75rem' }}>
                    {alert.type === 'success' ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
                    {alert.msg}
                </div>
            )}

            {/* Content */}
            <div style={{ flex: 1, minHeight: 0, height: '100%' }}>
                {tab === 'walkin' ? (
                    <WalkinPanel
                        session={session}
                        setSession={setSession}
                        showAlert={showAlert}
                        settings={settings}
                        products={products}
                        updateProduct={updateProduct}
                        addOrder={addOrder}
                    />
                ) : (
                    <OnlineOrdersPanel
                        orders={orders}
                        updateOrderStatus={updateOrderStatus}
                        deleteOrder={deleteOrder}
                        showAlert={showAlert}
                    />
                )}
            </div>
        </>
    );
}
