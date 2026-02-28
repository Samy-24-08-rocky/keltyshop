import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    FiSearch, FiTrash2, FiPrinter, FiCheckCircle, FiXCircle,
    FiPlus, FiMinus, FiShoppingCart, FiZap, FiUser,
    FiBarChart2, FiRefreshCw, FiAlertCircle, FiCreditCard,
    FiDollarSign, FiSmartphone, FiX
} from 'react-icons/fi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `£${Number(n).toFixed(2)}`;
const generateReceiptId = () => `POS-${Date.now().toString(36).toUpperCase()}`;

// ─── Payment methods ──────────────────────────────────────────────────────────
const PAY_METHODS = [
    { id: 'cash', label: 'Cash', icon: FiDollarSign },
    { id: 'card', label: 'Card', icon: FiCreditCard },
    { id: 'mobile', label: 'Mobile', icon: FiSmartphone },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
.pos-wrap { display:flex; gap:1rem; height:100%; font-family:'Inter',sans-serif; min-height:0; }

/* ── Left panel – scanner + product search ── */
.pos-left { flex:1; display:flex; flex-direction:column; gap:0.875rem; min-width:0; }
.pos-right { width:340px; min-width:300px; display:flex; flex-direction:column; gap:0.875rem; }

/* ── Cards ── */
.pos-card {
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.07);
    border-radius:14px;
    padding:1rem;
}

/* ── Scanner input box ── */
.pos-scanner-wrap { position:relative; }
.pos-scanner-input {
    width:100%; padding:0.8rem 1rem 0.8rem 2.8rem;
    background:rgba(16,185,129,0.08); border:2px solid rgba(16,185,129,0.35);
    border-radius:10px; color:#f1f5f9; font-size:1rem; font-family:inherit;
    outline:none; transition:border-color .2s;
}
.pos-scanner-input:focus { border-color:#10b981; }
.pos-scanner-input::placeholder { color:#475569; }
.pos-scanner-icon { position:absolute; left:0.8rem; top:50%; transform:translateY(-50%); color:#10b981; pointer-events:none; }

/* ── Product grid ── */
.pos-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:0.6rem; overflow-y:auto; max-height:340px; }
.pos-grid-item {
    background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
    border-radius:10px; padding:0.65rem; cursor:pointer; transition:all .15s ease;
    display:flex; flex-direction:column; gap:0.3rem; position:relative;
}
.pos-grid-item:hover { background:rgba(16,185,129,0.12); border-color:rgba(16,185,129,0.4); transform:translateY(-1px); }
.pos-grid-item.oos { opacity:0.45; cursor:not-allowed; pointer-events:none; }
.pos-grid-img { width:100%; aspect-ratio:1; object-fit:cover; border-radius:7px; background:#1e2a3a; }
.pos-grid-name { font-size:0.72rem; color:#e2e8f0; font-weight:600; line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.pos-grid-price { font-size:0.78rem; color:#10b981; font-weight:700; }
.pos-grid-stock { font-size:0.62rem; color:#64748b; }
.pos-oos-tag { position:absolute; top:4px; right:4px; background:#ef4444; color:#fff; font-size:0.55rem; padding:1px 5px; border-radius:4px; font-weight:700; }

/* ── Cart line items ── */
.pos-cart { flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:0.45rem; min-height:0; }
.pos-cart-row {
    display:flex; align-items:center; gap:0.5rem;
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06);
    border-radius:9px; padding:0.5rem 0.7rem;
}
.pos-cart-name { flex:1; font-size:0.78rem; color:#e2e8f0; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.pos-qty-btn { background:rgba(255,255,255,0.08); border:none; border-radius:5px; width:22px; height:22px; color:#cbd5e1; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.75rem; }
.pos-qty-btn:hover { background:rgba(16,185,129,0.25); color:#10b981; }
.pos-qty-num { font-size:0.78rem; color:#f1f5f9; font-weight:600; min-width:18px; text-align:center; }
.pos-item-total { font-size:0.78rem; color:#10b981; font-weight:700; min-width:44px; text-align:right; }
.pos-remove-btn { background:transparent; border:none; color:#475569; cursor:pointer; display:flex; padding:2px; }
.pos-remove-btn:hover { color:#ef4444; }

/* ── Totals ── */
.pos-total-row { display:flex; justify-content:space-between; align-items:center; }
.pos-total-label { font-size:0.78rem; color:#64748b; }
.pos-total-val { font-size:0.78rem; color:#94a3b8; font-weight:500; }
.pos-grand-label { font-size:0.95rem; color:#f1f5f9; font-weight:700; }
.pos-grand-val { font-size:1rem; color:#10b981; font-weight:800; }

/* ── Payment buttons ── */
.pos-pay-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.5rem; }
.pos-pay-btn {
    display:flex; flex-direction:column; align-items:center; gap:0.25rem;
    padding:0.6rem; border-radius:9px; border:1.5px solid rgba(255,255,255,0.1);
    background:rgba(255,255,255,0.04); color:#94a3b8; cursor:pointer; font-size:0.7rem;
    font-family:inherit; font-weight:600; text-transform:uppercase; letter-spacing:.05em;
    transition:all .15s;
}
.pos-pay-btn.selected { border-color:#10b981; background:rgba(16,185,129,0.15); color:#10b981; }
.pos-pay-btn:hover:not(.selected) { background:rgba(255,255,255,0.08); }

/* ── Cash input ── */
.pos-cash-input {
    width:100%; padding:0.6rem 0.875rem; background:rgba(255,255,255,0.06);
    border:1.5px solid rgba(255,255,255,0.12); border-radius:9px;
    color:#f1f5f9; font-size:0.9rem; font-family:inherit; outline:none; transition:border-color .2s;
}
.pos-cash-input:focus { border-color:#10b981; }

/* ── Charge button ── */
.pos-charge-btn {
    width:100%; padding:0.8rem; background:linear-gradient(135deg,#10b981,#059669);
    border:none; border-radius:10px; color:white; font-size:0.95rem; font-weight:700;
    font-family:inherit; cursor:pointer; transition:opacity .2s; display:flex;
    align-items:center; justify-content:center; gap:0.5rem;
}
.pos-charge-btn:disabled { opacity:0.4; cursor:not-allowed; }
.pos-charge-btn:hover:not(:disabled) { opacity:0.9; }

/* ── Clear button ── */
.pos-clear-btn {
    width:100%; padding:0.55rem; background:transparent;
    border:1px solid rgba(239,68,68,0.3); border-radius:8px; color:#f87171;
    font-size:0.78rem; font-weight:600; font-family:inherit; cursor:pointer; transition:all .15s;
}
.pos-clear-btn:hover { background:rgba(239,68,68,0.1); }

/* ── Customer input ── */
.pos-customer-input {
    width:100%; padding:0.55rem 0.875rem; background:rgba(255,255,255,0.05);
    border:1px solid rgba(255,255,255,0.1); border-radius:8px;
    color:#f1f5f9; font-size:0.82rem; font-family:inherit; outline:none;
}
.pos-customer-input:focus { border-color:rgba(99,102,241,0.5); }

/* ── Alert flash ── */
.pos-alert {
    padding:0.6rem 0.875rem; border-radius:8px; font-size:0.8rem; font-weight:600;
    display:flex; align-items:center; gap:0.5rem; animation:posSlideIn .2s ease;
}
.pos-alert.success { background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.35); color:#10b981; }
.pos-alert.error   { background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3); color:#f87171; }
@keyframes posSlideIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

/* ── Receipt modal ── */
.pos-modal-backdrop {
    position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:999;
    display:flex; align-items:center; justify-content:center; padding:1rem;
    animation:posSlideIn .15s ease;
}
.pos-modal {
    background:#fff; border-radius:12px; padding:1.5rem; max-width:360px; width:100%;
    color:#111; font-family:'Courier New',monospace; max-height:90vh; overflow-y:auto;
}
.pos-receipt-title { text-align:center; font-size:1.1rem; font-weight:700; margin-bottom:0.25rem; }
.pos-receipt-sub   { text-align:center; font-size:0.72rem; color:#555; margin-bottom:1rem; }
.pos-receipt-divider { border:none; border-top:1.5px dashed #ccc; margin:0.75rem 0; }
.pos-receipt-row { display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:0.2rem; }
.pos-receipt-total { display:flex; justify-content:space-between; font-size:0.9rem; font-weight:700; margin-top:0.2rem; }
.pos-receipt-footer { text-align:center; font-size:0.7rem; color:#777; margin-top:1rem; }

/* ── Session stats ── */
.pos-stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; }
.pos-stat-item { background:rgba(255,255,255,0.04); border-radius:9px; padding:0.65rem 0.875rem; }
.pos-stat-label { font-size:0.65rem; color:#64748b; text-transform:uppercase; letter-spacing:.05em; }
.pos-stat-val   { font-size:1rem; color:#10b981; font-weight:700; margin-top:0.1rem; }

/* ── Responsive ── */
@media(max-width:900px){
    .pos-wrap { flex-direction:column; }
    .pos-right { width:100%; min-width:0; }
    .pos-grid { max-height:220px; }
}
`;

// ─── Receipt modal ────────────────────────────────────────────────────────────
function Receipt({ receipt, settings, onClose }) {
    const handlePrint = () => window.print();
    const tax = receipt.subtotal * ((settings?.taxRate || 0) / 100);

    return (
        <div className="pos-modal-backdrop" onClick={onClose}>
            <div className="pos-modal" onClick={e => e.stopPropagation()}>
                <div className="pos-receipt-title">{settings?.storeName || "Kelty's Mini Market"}</div>
                <div className="pos-receipt-sub">{settings?.tagline || 'Fresh Groceries, Delivered Fast'}</div>
                <div className="pos-receipt-sub">Receipt #{receipt.id} &nbsp;|&nbsp; {new Date(receipt.ts).toLocaleString()}</div>
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
                    <button onClick={handlePrint} style={{ flex: 1, padding: '0.6rem', background: '#111', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}>
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

// ─── Main POS component ───────────────────────────────────────────────────────
export default function AdminPOS() {
    const { products, settings, updateProduct, addOrder } = useAdmin();

    // Cart
    const [cart, setCart] = useState([]);
    // Scanner / search
    const [scanInput, setScanInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    // Payment
    const [payMethod, setPayMethod] = useState('cash');
    const [cashGiven, setCashGiven] = useState('');
    // Customer
    const [customer, setCustomer] = useState('');
    // UI
    const [alert, setAlert] = useState(null);       // { type, msg }
    const [receipt, setReceipt] = useState(null);
    const [processing, setProcessing] = useState(false);
    // Session stats
    const [session, setSession] = useState({ transactions: 0, revenue: 0, items: 0 });

    const scanRef = useRef(null);
    const alertTimer = useRef(null);

    // Auto-focus scanner on mount
    useEffect(() => { scanRef.current?.focus(); }, []);

    const showAlert = useCallback((type, msg) => {
        setAlert({ type, msg });
        clearTimeout(alertTimer.current);
        alertTimer.current = setTimeout(() => setAlert(null), 3000);
    }, []);

    // Computed values
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const taxAmt = subtotal * ((settings?.taxRate || 0) / 100);
    const total = subtotal + taxAmt;
    const change = payMethod === 'cash' && cashGiven ? parseFloat(cashGiven) - total : 0;

    // Find product by barcode OR name match
    const findProduct = useCallback((query) => {
        const q = query.trim().toLowerCase();
        if (!q) return null;
        // Exact barcode match first
        let p = products.find(pr => pr.barcode && pr.barcode.toLowerCase() === q);
        // Fallback: exact id match
        if (!p) p = products.find(pr => String(pr.id) === q);
        // Fallback: starts-with name
        if (!p) p = products.find(pr => pr.name.toLowerCase().startsWith(q));
        return p || null;
    }, [products]);

    const addToCart = useCallback((product) => {
        if (!product) return;
        if (product.stock === 0) { showAlert('error', `${product.name} is out of stock`); return; }

        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                if (existing.quantity >= product.stock) {
                    showAlert('error', `Only ${product.stock} in stock`);
                    return prev;
                }
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        showAlert('success', `✓ ${product.name} added`);
    }, [showAlert]);

    // Barcode / scan submit (on Enter)
    const handleScanSubmit = useCallback((e) => {
        if (e.key !== 'Enter') return;
        const product = findProduct(scanInput);
        if (product) {
            addToCart(product);
        } else {
            showAlert('error', `Product not found: "${scanInput}"`);
        }
        setScanInput('');
    }, [scanInput, findProduct, addToCart, showAlert]);

    const adjustQty = (id, delta) => {
        setCart(prev => prev.map(i => {
            if (i.id !== id) return i;
            const next = i.quantity + delta;
            if (next < 1) return i;
            if (next > i.stock) { showAlert('error', `Only ${i.stock} in stock`); return i; }
            return { ...i, quantity: next };
        }));
    };

    const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
    const clearCart = () => { setCart([]); setCashGiven(''); setCustomer(''); };

    // Charge / complete sale
    const handleCharge = async () => {
        if (cart.length === 0) { showAlert('error', 'Cart is empty'); return; }
        if (payMethod === 'cash') {
            const given = parseFloat(cashGiven);
            if (!cashGiven || isNaN(given) || given < total) {
                showAlert('error', `Cash given must be ≥ ${fmt(total)}`);
                return;
            }
        }

        setProcessing(true);
        try {
            // Deduct stock from each product
            for (const item of cart) {
                await updateProduct(item.id, { stock: Math.max(0, item.stock - item.quantity) });
            }

            // Create order record
            const orderData = {
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
            };
            await addOrder(orderData);

            // Build receipt
            const rec = {
                id: generateReceiptId(),
                ts: Date.now(),
                items: cart,
                subtotal,
                total,
                customer: customer || 'Walk-in Customer',
                payMethod,
                cashGiven: parseFloat(cashGiven) || 0,
            };
            setReceipt(rec);

            // Update session stats
            setSession(s => ({
                transactions: s.transactions + 1,
                revenue: s.revenue + total,
                items: s.items + cart.reduce((a, i) => a + i.quantity, 0),
            }));

            clearCart();
        } catch (err) {
            showAlert('error', 'Transaction failed: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    // Filtered product list for the grid
    const filteredProducts = searchQuery
        ? products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.barcode && p.barcode.includes(searchQuery)) ||
            (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : products;

    return (
        <>
            <style>{CSS}</style>

            {receipt && (
                <Receipt receipt={receipt} settings={settings} onClose={() => setReceipt(null)} />
            )}

            <div className="pos-wrap">

                {/* ── LEFT: Scanner + Product search ── */}
                <div className="pos-left">

                    {/* Session stats */}
                    <div className="pos-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <FiBarChart2 size={15} color="#10b981" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Session Stats</span>
                        </div>
                        <div className="pos-stat-grid">
                            <div className="pos-stat-item">
                                <div className="pos-stat-label">Transactions</div>
                                <div className="pos-stat-val">{session.transactions}</div>
                            </div>
                            <div className="pos-stat-item">
                                <div className="pos-stat-label">Revenue</div>
                                <div className="pos-stat-val">{fmt(session.revenue)}</div>
                            </div>
                            <div className="pos-stat-item">
                                <div className="pos-stat-label">Items Sold</div>
                                <div className="pos-stat-val">{session.items}</div>
                            </div>
                            <div className="pos-stat-item">
                                <div className="pos-stat-label">Avg Sale</div>
                                <div className="pos-stat-val">{session.transactions ? fmt(session.revenue / session.transactions) : '£0.00'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Alert bar */}
                    {alert && (
                        <div className={`pos-alert ${alert.type}`}>
                            {alert.type === 'success' ? <FiCheckCircle size={15} /> : <FiAlertCircle size={15} />}
                            {alert.msg}
                        </div>
                    )}

                    {/* Barcode scanner */}
                    <div className="pos-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <FiZap size={15} color="#10b981" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Barcode Scanner</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#475569' }}>Press Enter after scan</span>
                        </div>
                        <div className="pos-scanner-wrap">
                            <FiZap className="pos-scanner-icon" size={16} />
                            <input
                                ref={scanRef}
                                className="pos-scanner-input"
                                value={scanInput}
                                onChange={e => setScanInput(e.target.value)}
                                onKeyDown={handleScanSubmit}
                                placeholder="Scan barcode or type product ID / name…"
                                id="pos-scan-input"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* Product search grid */}
                    <div className="pos-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <FiSearch size={15} color="#94a3b8" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Products</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#475569' }}>{filteredProducts.length} shown</span>
                        </div>
                        <input
                            className="pos-customer-input"
                            style={{ marginBottom: '0.7rem' }}
                            placeholder="Filter by name, category, barcode…"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            id="pos-search-input"
                        />
                        <div className="pos-grid">
                            {filteredProducts.map(p => (
                                <div
                                    key={p.id}
                                    className={`pos-grid-item${p.stock === 0 ? ' oos' : ''}`}
                                    onClick={() => addToCart(p)}
                                    title={p.barcode ? `Barcode: ${p.barcode}` : p.name}
                                >
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

                {/* ── RIGHT: Cart + Payment ── */}
                <div className="pos-right">

                    {/* Customer */}
                    <div className="pos-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <FiUser size={14} color="#94a3b8" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Customer</span>
                        </div>
                        <input
                            className="pos-customer-input"
                            placeholder="Walk-in Customer (optional)"
                            value={customer}
                            onChange={e => setCustomer(e.target.value)}
                            id="pos-customer-input"
                        />
                    </div>

                    {/* Cart */}
                    <div className="pos-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <FiShoppingCart size={15} color="#10b981" />
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.07em' }}>Cart</span>
                            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', background: cart.length ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)', color: cart.length ? '#10b981' : '#475569', borderRadius: 99, padding: '1px 8px', fontWeight: 700 }}>
                                {cart.reduce((a, i) => a + i.quantity, 0)} items
                            </span>
                        </div>

                        <div className="pos-cart">
                            {cart.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#334155', padding: '2rem 0', fontSize: '0.82rem' }}>
                                    <FiShoppingCart size={28} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                                    <br />Scan or click a product
                                </div>
                            ) : cart.map(item => (
                                <div key={item.id} className="pos-cart-row">
                                    <div className="pos-cart-name" title={item.name}>{item.name}</div>
                                    <button className="pos-qty-btn" onClick={() => adjustQty(item.id, -1)}><FiMinus size={10} /></button>
                                    <span className="pos-qty-num">{item.quantity}</span>
                                    <button className="pos-qty-btn" onClick={() => adjustQty(item.id, 1)}><FiPlus size={10} /></button>
                                    <span className="pos-item-total">{fmt(item.price * item.quantity)}</span>
                                    <button className="pos-remove-btn" onClick={() => removeItem(item.id)}><FiX size={13} /></button>
                                </div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '0.75rem 0' }} />

                        {/* Totals */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
                            <div className="pos-total-row">
                                <span className="pos-total-label">Subtotal</span>
                                <span className="pos-total-val">{fmt(subtotal)}</span>
                            </div>
                            {settings?.taxRate > 0 && (
                                <div className="pos-total-row">
                                    <span className="pos-total-label">Tax ({settings.taxRate}%)</span>
                                    <span className="pos-total-val">{fmt(taxAmt)}</span>
                                </div>
                            )}
                            <div className="pos-total-row" style={{ marginTop: '0.2rem' }}>
                                <span className="pos-grand-label">Total</span>
                                <span className="pos-grand-val">{fmt(total)}</span>
                            </div>
                        </div>

                        {/* Payment method */}
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: '0.4rem' }}>Payment Method</div>
                        <div className="pos-pay-row" style={{ marginBottom: '0.6rem' }}>
                            {PAY_METHODS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    className={`pos-pay-btn${payMethod === id ? ' selected' : ''}`}
                                    onClick={() => setPayMethod(id)}
                                >
                                    <Icon size={16} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Cash given */}
                        {payMethod === 'cash' && (
                            <div style={{ marginBottom: '0.6rem' }}>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '0.3rem' }}>Cash Given</div>
                                <input
                                    type="number"
                                    className="pos-cash-input"
                                    placeholder={`Min: ${fmt(total)}`}
                                    value={cashGiven}
                                    onChange={e => setCashGiven(e.target.value)}
                                    min={0}
                                    step="0.01"
                                    id="pos-cash-input"
                                />
                                {cashGiven && parseFloat(cashGiven) >= total && (
                                    <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '0.25rem', fontWeight: 600 }}>
                                        Change: {fmt(change)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Charge button */}
                        <button
                            className="pos-charge-btn"
                            onClick={handleCharge}
                            disabled={cart.length === 0 || processing}
                            id="pos-charge-btn"
                        >
                            {processing ? <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FiCheckCircle size={16} />}
                            {processing ? 'Processing…' : `Charge ${fmt(total)}`}
                        </button>

                        {/* Clear */}
                        {cart.length > 0 && (
                            <button className="pos-clear-btn" style={{ marginTop: '0.5rem' }} onClick={clearCart} id="pos-clear-btn">
                                🗑️ Clear Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </>
    );
}
