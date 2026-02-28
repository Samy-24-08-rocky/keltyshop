import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    FiPackage, FiAlertTriangle, FiXCircle, FiCheckCircle,
    FiSearch, FiEdit2, FiRefreshCw, FiTrendingDown, FiFilter
} from 'react-icons/fi';

// Stock status thresholds
const stockStatus = (s) => {
    if (s === 0) return { label: 'Out of Stock', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: FiXCircle, dot: '#ef4444' };
    if (s <= 5) return { label: 'Low Stock', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: FiAlertTriangle, dot: '#f59e0b' };
    if (s <= 15) return { label: 'Medium', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', icon: FiTrendingDown, dot: '#3b82f6' };
    return { label: 'In Stock', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', icon: FiCheckCircle, dot: '#22c55e' };
};

const StockBar = ({ stock, max }) => {
    const pct = Math.min((stock / Math.max(max, 1)) * 100, 100);
    const s = stockStatus(stock);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 120 }}>
            <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: s.dot, borderRadius: 99, transition: 'width .4s' }} />
            </div>
            <span style={{ fontSize: '0.72rem', color: s.color, fontWeight: 700, minWidth: 24, textAlign: 'right' }}>{stock}</span>
        </div>
    );
};

const inputSx = {
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0.6rem 0.875rem', color: '#f1f5f9',
    fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit',
};

export default function AdminStock() {
    const { products, updateProduct } = useAdmin();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');    // all | out | low | medium | ok
    const [editId, setEditId] = useState(null);
    const [newStock, setNewStock] = useState('');

    const filtered = useMemo(() => {
        return products.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.category.toLowerCase().includes(search.toLowerCase());
            const s = p.stock;
            const matchFilter =
                filter === 'all' ? true :
                    filter === 'out' ? s === 0 :
                        filter === 'low' ? (s > 0 && s <= 5) :
                            filter === 'medium' ? (s > 5 && s <= 15) :
                                filter === 'ok' ? s > 15 : true;
            return matchSearch && matchFilter;
        }).sort((a, b) => a.stock - b.stock); // lowest stock first
    }, [products, search, filter]);

    const maxStock = Math.max(...products.map(p => p.stock), 1);

    // Summary counts
    const summary = useMemo(() => ({
        out: products.filter(p => p.stock === 0).length,
        low: products.filter(p => p.stock > 0 && p.stock <= 5).length,
        medium: products.filter(p => p.stock > 5 && p.stock <= 15).length,
        ok: products.filter(p => p.stock > 15).length,
        total: products.length,
    }), [products]);

    const handleUpdateStock = (id) => {
        const val = parseInt(newStock);
        if (isNaN(val) || val < 0) return;
        updateProduct(id, { stock: val });
        setEditId(null);
        setNewStock('');
    };

    return (
        <div>
            {/* ── KPI summary cards ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Products', value: summary.total, color: '#6366f1', bg: 'rgba(99,102,241,0.12)', icon: FiPackage, filter: 'all' },
                    { label: 'Out of Stock', value: summary.out, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: FiXCircle, filter: 'out' },
                    { label: 'Low Stock (≤5)', value: summary.low, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: FiAlertTriangle, filter: 'low' },
                    { label: 'Medium (6–15)', value: summary.medium, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: FiTrendingDown, filter: 'medium' },
                    { label: 'In Stock (>15)', value: summary.ok, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: FiCheckCircle, filter: 'ok' },
                ].map(k => {
                    const Icon = k.icon;
                    const active = filter === k.filter;
                    return (
                        <div
                            key={k.label}
                            onClick={() => setFilter(k.filter)}
                            style={{
                                cursor: 'pointer',
                                background: active ? k.bg : 'rgba(255,255,255,0.03)',
                                border: `1.5px solid ${active ? k.color : 'rgba(255,255,255,0.07)'}`,
                                borderRadius: 14, padding: '1rem 1.1rem',
                                transition: 'all .2s',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <div style={{ width: 32, height: 32, borderRadius: 9, background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={15} color={k.color} />
                                </div>
                                {k.value > 0 && k.filter !== 'all' && (
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: k.color, display: 'inline-block', animation: k.filter === 'out' || k.filter === 'low' ? 'pulse 1.5s infinite' : 'none' }} />
                                )}
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>{k.label}</div>
                        </div>
                    );
                })}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.5; transform: scale(1.4); }
                }
            `}</style>

            <style>{`
                /* ── Stock table → mobile cards ── */
                .sk-header { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr; gap:1rem; padding: 0.75rem 1.25rem; background: rgba(0,0,0,0.2); border-bottom: 1px solid rgba(255,255,255,0.06); }
                .sk-row    { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr; gap:1rem; padding: 0.875rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.04); align-items: center; transition: background .2s; }
                .sk-label  { font-size: 0.68rem; font-weight:700; color:#475569; text-transform:uppercase; letter-spacing:0.06em; }
                @media (max-width: 640px) {
                    .sk-header { display: none; }
                    .sk-row {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                        padding: 0.875rem 1rem;
                    }
                    .sk-row-top { display: flex; align-items: center; gap: 0.75rem; }
                    .sk-row-meta { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
                    .sk-row-bottom { display: flex; align-items: center; gap: 0.625rem; }
                    .sk-col-cat, .sk-col-status-desktop, .sk-col-bar-desktop, .sk-col-update-desktop { display: none; }
                    .sk-mobile-only { display: flex !important; }
                }
                @media (min-width: 641px) {
                    .sk-row-top, .sk-row-meta, .sk-row-bottom { display: contents; }
                    .sk-mobile-only { display: none !important; }
                    .sk-col-cat, .sk-col-status-desktop, .sk-col-bar-desktop, .sk-col-update-desktop { display: block; }
                }
            `}</style>

            {/* ── Alert banner if out of stock items exist ── */}
            {summary.out > 0 && (
                <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 12, padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FiXCircle size={18} color="#ef4444" />
                    <span style={{ color: '#fca5a5', fontSize: '0.875rem', fontWeight: 600 }}>
                        ⚠️ {summary.out} product{summary.out > 1 ? 's are' : ' is'} <strong>Out of Stock</strong> — update stock levels now
                    </span>
                </div>
            )}
            {summary.low > 0 && (
                <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '0.75rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FiAlertTriangle size={16} color="#f59e0b" />
                    <span style={{ color: '#fcd34d', fontSize: '0.845rem', fontWeight: 500 }}>
                        {summary.low} product{summary.low > 1 ? 's have' : ' has'} <strong>low stock (5 or less units)</strong> — reorder soon
                    </span>
                </div>
            )}

            {/* ── Toolbar ── */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <FiSearch size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search product or category…"
                        style={{ ...inputSx, paddingLeft: '2.25rem' }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontSize: '0.8rem' }}>
                    <FiFilter size={13} /> {filtered.length} shown · sorted by lowest stock first
                </div>
            </div>

            {/* ── Stock Table ── */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
                {/* Table header */}
                <div className="sk-header">
                    {['Product', 'Category', 'Status', 'Stock Level', 'Update'].map(h => (
                        <div key={h} className="sk-label">{h}</div>
                    ))}
                </div>

                {/* Rows */}
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                        <FiPackage size={36} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                        <div>No products found</div>
                    </div>
                ) : (
                    filtered.map(p => {
                        const ss = stockStatus(p.stock);
                        const Icon = ss.icon;
                        const isEditing = editId === p.id;

                        return (
                            <div key={p.id} className="sk-row" style={{
                                background: p.stock === 0 ? 'rgba(239,68,68,0.04)' : p.stock <= 5 ? 'rgba(245,158,11,0.03)' : 'transparent',
                            }}>
                                {/* Product — always visible */}
                                <div className="sk-row-top">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                                        {p.image ? (
                                            <img src={p.image} alt={p.name} style={{ width: 38, height: 38, borderRadius: 9, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }} />
                                        ) : (
                                            <div style={{ width: 38, height: 38, borderRadius: 9, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                <FiPackage size={15} color="#475569" />
                                            </div>
                                        )}
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: '#475569' }}>£{Number(p.price).toFixed(2)}</div>
                                        </div>
                                    </div>
                                    {/* Mobile-only: status + update in top row */}
                                    <div className="sk-mobile-only" style={{ alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, padding: '3px 8px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700 }}>
                                            <Icon size={10} /> {ss.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Mobile meta row: bar + update */}
                                <div className="sk-row-meta">
                                    <div className="sk-mobile-only" style={{ flex: 1, alignItems: 'center', gap: '0.5rem' }}>
                                        <StockBar stock={p.stock} max={maxStock} />
                                        <div onClick={e => e.stopPropagation()}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                                                    <input
                                                        type="number" min="0"
                                                        value={newStock}
                                                        onChange={e => setNewStock(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleUpdateStock(p.id)}
                                                        autoFocus placeholder="qty"
                                                        style={{ ...inputSx, width: 60, padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                                                    />
                                                    <button onClick={() => handleUpdateStock(p.id)} style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: 7, padding: '0.4rem 0.5rem', cursor: 'pointer' }}><FiCheckCircle size={13} /></button>
                                                    <button onClick={() => { setEditId(null); setNewStock(''); }} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 7, padding: '0.4rem 0.5rem', cursor: 'pointer' }}><FiXCircle size={13} /></button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setEditId(p.id); setNewStock(String(p.stock)); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, WebkitTapHighlightColor: 'transparent', minHeight: 36 }}
                                                >
                                                    <FiEdit2 size={11} /> Update
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop-only columns */}
                                <div className="sk-col-cat" style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.category}</div>
                                <div className="sk-col-status-desktop">
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, padding: '3px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>
                                        <Icon size={11} /> {ss.label}
                                    </span>
                                </div>
                                <div className="sk-col-bar-desktop"><StockBar stock={p.stock} max={maxStock} /></div>
                                <div className="sk-col-update-desktop" onClick={e => e.stopPropagation()}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                                            <input
                                                type="number" min="0"
                                                value={newStock}
                                                onChange={e => setNewStock(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleUpdateStock(p.id)}
                                                autoFocus placeholder="qty"
                                                style={{ ...inputSx, width: 60, padding: '0.4rem 0.5rem', fontSize: '0.8rem' }}
                                            />
                                            <button onClick={() => handleUpdateStock(p.id)} style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: 7, padding: '0.4rem 0.5rem', cursor: 'pointer' }}><FiCheckCircle size={13} /></button>
                                            <button onClick={() => { setEditId(null); setNewStock(''); }} style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 7, padding: '0.4rem 0.5rem', cursor: 'pointer' }}><FiXCircle size={13} /></button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => { setEditId(p.id); setNewStock(String(p.stock)); }}
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#93c5fd', borderRadius: 8, padding: '0.4rem 0.75rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                                        >
                                            <FiEdit2 size={11} /> Update
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* ── Bottom summary strip ── */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', padding: '0.875rem 1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, flexWrap: 'wrap' }}>
                <div style={{ fontSize: '0.78rem', color: '#475569' }}>
                    <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{products.length}</span> total products
                </div>
                <div style={{ fontSize: '0.78rem', color: '#ef4444' }}>
                    <span style={{ fontWeight: 700 }}>{summary.out}</span> out of stock
                </div>
                <div style={{ fontSize: '0.78rem', color: '#f59e0b' }}>
                    <span style={{ fontWeight: 700 }}>{summary.low}</span> low stock
                </div>
                <div style={{ fontSize: '0.78rem', color: '#22c55e' }}>
                    <span style={{ fontWeight: 700 }}>{summary.ok}</span> well stocked
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginLeft: 'auto' }}>
                    Total inventory: <span style={{ color: '#f1f5f9', fontWeight: 700 }}>{products.reduce((s, p) => s + p.stock, 0)}</span> units
                </div>
            </div>
        </div>
    );
}
