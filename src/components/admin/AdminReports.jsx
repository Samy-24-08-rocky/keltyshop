import React, { useState, useMemo, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    FiDownload, FiPrinter, FiCalendar, FiDollarSign,
    FiShoppingBag, FiTrendingUp, FiPackage, FiUsers,
    FiCheckCircle, FiXCircle, FiEye, FiX, FiFilter,
} from 'react-icons/fi';

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_CFG = {
    delivered: { label: 'Delivered', color: '#22c55e' },
    processing: { label: 'Processing', color: '#f59e0b' },
    out_for_delivery: { label: 'Out for Delivery', color: '#3b82f6' },
    cancelled: { label: 'Cancelled', color: '#ef4444' },
};

const fmt = (n) => `£${Number(n).toFixed(2)}`;
const fmtN = (n) => Number(n).toLocaleString();

// ── CSV export ────────────────────────────────────────────────────────────────
const exportCSV = (rows, headers, filename) => {
    const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const content = [headers, ...rows.map(r => headers.map(h => escape(r[h])))].map(r => r.join(',')).join('\n');
    const blob = new Blob([content], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
};

// ── Print helpers ─────────────────────────────────────────────────────────────
const printElement = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const win = window.open('', '_blank', 'width=850,height=700');
    win.document.write(`
        <html><head><title>Kelty's Mini Market — Print</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color:#1a1a2e; background:#fff; padding:24px; }
            table { width:100%; border-collapse:collapse; margin-top:12px; }
            th { background:#f8f9fa; padding:10px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.05em; color:#555; border-bottom:2px solid #e5e7eb; }
            td { padding:10px 12px; font-size:13px; border-bottom:1px solid #f3f4f6; }
            h2 { font-size:20px; color:#ef4444; margin-bottom:4px; }
            .sub { font-size:12px; color:#888; margin-bottom:20px; }
            .badge { display:inline-block; padding:2px 10px; border-radius:99px; font-size:11px; font-weight:700; }
            .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:20px; }
            .kpi { background:#f8f9fa; border-radius:10px; padding:14px; border:1px solid #e5e7eb; }
            .kpi-label { font-size:10px; color:#888; text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px; }
            .kpi-value { font-size:22px; font-weight:800; color:#1a1a2e; }
            .header-row { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; }
            .logo { font-size:22px; font-weight:800; color:#ef4444; }
            .logo span { color:#1a1a2e; font-size:13px; font-weight:400; display:block; }
            @media print { button { display:none; } }
        </style></head><body>
        ${el.innerHTML}
        <br><button onclick="window.print()" style="background:#ef4444;color:white;border:none;padding:10px 24px;border-radius:8px;font-size:14px;cursor:pointer;margin-top:8px;">🖨 Print / Save as PDF</button>
        </body></html>
    `);
    win.document.close();
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, sub, color, bg }) => (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '1.1rem 1.25rem', display: 'flex', gap: '0.875rem', alignItems: 'center' }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={19} color={color} />
        </div>
        <div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1 }}>{value}</div>
            {sub && <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '0.2rem' }}>{sub}</div>}
        </div>
    </div>
);

const SectionHead = ({ title, children }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>{title}</h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>{children}</div>
    </div>
);

const iconBtn = (color = '#64748b') => ({
    display: 'flex', alignItems: 'center', gap: '0.375rem',
    padding: '0.45rem 0.875rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)', color, cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: 600, fontFamily: 'inherit',
    transition: 'all .15s',
});

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminReports() {
    const { orders, products, settings } = useAdmin();
    const storeName = settings?.storeName || "Kelty's Mini Market";

    // date range filter
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const [from, setFrom] = useState(monthAgo);
    const [to, setTo] = useState(today);
    const [invoiceOrder, setInvoiceOrder] = useState(null);

    // filtered orders
    const filtered = useMemo(() => orders.filter(o => {
        if (!o.date) return true;
        return o.date >= from && o.date <= to;
    }), [orders, from, to]);

    const paid = filtered.filter(o => o.status !== 'cancelled');
    const cancelled = filtered.filter(o => o.status === 'cancelled');
    const revenue = paid.reduce((s, o) => s + Number(o.total), 0);
    const avgOrder = paid.length ? revenue / paid.length : 0;

    // Status breakdown
    const statusBreakdown = ['delivered', 'processing', 'out_for_delivery', 'cancelled'].map(s => ({
        s, label: STATUS_CFG[s].label, color: STATUS_CFG[s].color,
        count: filtered.filter(o => o.status === s).length,
        rev: filtered.filter(o => o.status === s).reduce((acc, o) => acc + Number(o.total), 0),
    }));

    // Top products (by id frequency in orders — simulated by rating)
    const topProd = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);

    // CSV exports
    const exportOrders = () => exportCSV(
        filtered.map(o => ({ 'Order ID': o.id, Customer: o.customer, Email: o.email, Date: o.date, Items: o.items, Total: Number(o.total).toFixed(2), Status: STATUS_CFG[o.status]?.label, Delivery: o.delivery, Address: o.address })),
        ['Order ID', 'Customer', 'Email', 'Date', 'Items', 'Total', 'Status', 'Delivery', 'Address'],
        `orders_${from}_to_${to}.csv`
    );
    const exportProducts = () => exportCSV(
        products.map(p => ({ ID: p.id, Name: p.name, Category: p.category, Price: Number(p.price).toFixed(2), OldPrice: p.oldPrice ? Number(p.oldPrice).toFixed(2) : '', Stock: p.stock, Rating: p.rating, Featured: p.featured ? 'Yes' : 'No' })),
        ['ID', 'Name', 'Category', 'Price', 'OldPrice', 'Stock', 'Rating', 'Featured'],
        'products_catalog.csv'
    );

    // Invoice print data
    const tax = settings?.taxRate ?? 5;

    return (
        <div style={{ fontFamily: "'Inter',sans-serif", display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ── Page title ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#f1f5f9', fontWeight: 800, fontSize: '1.25rem' }}>Reports &amp; Billing</h2>
                    <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.82rem' }}>Financial summaries, order reports and printable invoices</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={exportOrders} style={iconBtn('#86efac')}><FiDownload size={14} /> Export Orders CSV</button>
                    <button onClick={exportProducts} style={iconBtn('#93c5fd')}><FiDownload size={14} /> Export Products CSV</button>
                    <button onClick={() => printElement('printable-summary')} style={iconBtn('#fbbf24')}><FiPrinter size={14} /> Print Summary</button>
                </div>
            </div>

            {/* ── Date range filter ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.875rem 1.25rem', flexWrap: 'wrap' }}>
                <FiFilter size={15} color="#64748b" />
                <span style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 600 }}>Date Range:</span>
                <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.4rem 0.75rem', color: '#f1f5f9', fontSize: '0.82rem', outline: 'none' }}
                />
                <span style={{ color: '#475569' }}>→</span>
                <input type="date" value={to} onChange={e => setTo(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.4rem 0.75rem', color: '#f1f5f9', fontSize: '0.82rem', outline: 'none' }}
                />
                <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.78rem' }}>Showing <strong style={{ color: '#a5b4fc' }}>{filtered.length}</strong> orders</span>
            </div>

            {/* ── KPI Summary ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '0.75rem' }}>
                <KpiCard icon={FiDollarSign} label="Total Revenue" value={fmt(revenue)} sub="Excl. cancelled" color="#22c55e" bg="rgba(34,197,94,0.15)" />
                <KpiCard icon={FiShoppingBag} label="Total Orders" value={filtered.length} sub={`${paid.length} paid`} color="#3b82f6" bg="rgba(59,130,246,0.15)" />
                <KpiCard icon={FiTrendingUp} label="Avg. Order Val" value={fmt(avgOrder)} sub="Per paid order" color="#6366f1" bg="rgba(99,102,241,0.15)" />
                <KpiCard icon={FiCheckCircle} label="Delivered" value={filtered.filter(o => o.status === 'delivered').length} sub="Completed" color="#22c55e" bg="rgba(34,197,94,0.15)" />
                <KpiCard icon={FiXCircle} label="Cancelled" value={cancelled.length} sub={fmt(cancelled.reduce((s, o) => s + Number(o.total), 0) + ' lost')} color="#ef4444" bg="rgba(239,68,68,0.15)" />
                <KpiCard icon={FiUsers} label="Customers" value={[...new Set(filtered.map(o => o.email))].length} sub="Unique buyers" color="#06b6d4" bg="rgba(6,182,212,0.15)" />
                <KpiCard icon={FiPackage} label="Products" value={products.length} sub={`${products.filter(p => p.stock === 0).length} out of stock`} color="#8b5cf6" bg="rgba(139,92,246,0.15)" />
                <KpiCard icon={FiDollarSign} label="Tax Collected" value={fmt(revenue * (tax / 100))} sub={`@ ${tax}% rate`} color="#f59e0b" bg="rgba(245,158,11,0.15)" />
            </div>

            {/* ── Status Breakdown ── */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '1.25rem' }}>
                <SectionHead title="Order Status Breakdown" />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '0.75rem' }}>
                    {statusBreakdown.map(({ s, label, color, count, rev }) => (
                        <div key={s} style={{ background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 12, padding: '1rem' }}>
                            <div style={{ fontSize: '0.7rem', color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{label}</div>
                            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{count}</div>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>{fmt(rev)}</div>
                            <div style={{ marginTop: '0.5rem', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                                <div style={{ height: '100%', width: `${filtered.length ? (count / filtered.length * 100) : 0}%`, background: color, borderRadius: 2, transition: 'width .4s' }} />
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem' }}>{filtered.length ? ((count / filtered.length) * 100).toFixed(1) : 0}% of total</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Orders Table with Print Invoice ── */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>Order Report — {from} to {to}</h3>
                    <button onClick={exportOrders} style={iconBtn('#86efac')}><FiDownload size={13} /> CSV</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                {['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Delivery', 'Invoice'].map(h => (
                                    <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.67rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(o => {
                                const sc = STATUS_CFG[o.status] || {};
                                return (
                                    <tr key={o.id}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .1s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.78rem' }}>{o.id}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <div style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>{o.customer}</div>
                                            <div style={{ color: '#475569', fontSize: '0.7rem' }}>{o.email}</div>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{o.date}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#e2e8f0', fontSize: '0.82rem' }}>{o.items}</td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#f1f5f9', fontWeight: 700, fontSize: '0.85rem' }}>{fmt(o.total)}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <span style={{ background: `${sc.color}20`, color: sc.color, padding: '2px 9px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>{sc.label}</span>
                                        </td>
                                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.78rem' }}>{o.delivery}</td>
                                        <td style={{ padding: '0.75rem 1rem' }}>
                                            <button onClick={() => setInvoiceOrder(o)} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.75rem', borderRadius: 7, border: '1px solid rgba(99,102,241,0.3)', background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600 }}>
                                                <FiEye size={11} /> Invoice
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        {filtered.length > 0 && (
                            <tfoot>
                                <tr style={{ borderTop: '2px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
                                    <td colSpan={4} style={{ padding: '0.875rem 1rem', color: '#94a3b8', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase' }}>Totals</td>
                                    <td style={{ padding: '0.875rem 1rem', color: '#22c55e', fontWeight: 800, fontSize: '0.95rem' }}>{fmt(revenue)}</td>
                                    <td colSpan={3} style={{ padding: '0.875rem 1rem', color: '#64748b', fontSize: '0.75rem' }}>{paid.length} paid · {cancelled.length} cancelled</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                    {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>No orders in selected date range.</div>}
                </div>
            </div>

            {/* ── Product Catalogue Report ── */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700, fontSize: '0.95rem' }}>Product Catalogue Report</h3>
                    <button onClick={exportProducts} style={iconBtn('#93c5fd')}><FiDownload size={13} /> CSV</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                {['Product', 'Category', 'Price', 'Old Price', 'Stock', 'Status', 'Rating', 'Featured'].map(h => (
                                    <th key={h} style={{ padding: '0.7rem 1rem', textAlign: 'left', fontSize: '0.67rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {topProd.map(p => (
                                <tr key={p.id}
                                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background .1s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                            <img src={p.image} alt="" style={{ width: 32, height: 32, borderRadius: 7, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }} onError={e => e.target.style.display = 'none'} />
                                            <span style={{ color: '#e2e8f0', fontSize: '0.82rem', fontWeight: 600 }}>{p.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem' }}><span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '2px 8px', borderRadius: 6, fontSize: '0.72rem', fontWeight: 600 }}>{p.category}</span></td>
                                    <td style={{ padding: '0.75rem 1rem', color: '#f1f5f9', fontWeight: 700 }}>{fmt(p.price)}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: '#475569', textDecoration: 'line-through', fontSize: '0.8rem' }}>{p.oldPrice ? fmt(p.oldPrice) : '—'}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f59e0b' : '#22c55e', fontWeight: 700, fontSize: '0.82rem' }}>{p.stock}</td>
                                    <td style={{ padding: '0.75rem 1rem' }}>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f59e0b' : '#22c55e' }}>
                                            {p.stock === 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem 1rem', color: '#fbbf24', fontWeight: 700 }}>★ {p.rating}</td>
                                    <td style={{ padding: '0.75rem 1rem', color: p.featured ? '#fbbf24' : '#475569', fontSize: '0.78rem', fontWeight: 600 }}>{p.featured ? '⭐ Yes' : 'No'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Hidden printable summary ── */}
            <div id="printable-summary" style={{ display: 'none' }}>
                <div className="header-row">
                    <div>
                        <div className="logo">{storeName}<span>Reports & Financial Summary</span></div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Period: {from} to {to} &nbsp;·&nbsp; Printed: {new Date().toLocaleString()}</div>
                    </div>
                </div>
                <div className="kpi-grid">
                    {[
                        { label: 'Total Revenue', value: fmt(revenue) },
                        { label: 'Total Orders', value: filtered.length },
                        { label: 'Avg Order', value: fmt(avgOrder) },
                        { label: 'Customers', value: [...new Set(filtered.map(o => o.email))].length },
                    ].map(k => (
                        <div key={k.label} className="kpi">
                            <div className="kpi-label">{k.label}</div>
                            <div className="kpi-value">{k.value}</div>
                        </div>
                    ))}
                </div>
                <h2 style={{ fontSize: 14, marginBottom: 8, color: '#333' }}>Order Details</h2>
                <table>
                    <thead><tr>{['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Delivery'].map(h => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>
                        {filtered.map(o => (
                            <tr key={o.id}>
                                <td><strong>{o.id}</strong></td>
                                <td>{o.customer}<br /><span style={{ fontSize: 11, color: '#888' }}>{o.email}</span></td>
                                <td>{o.date}</td>
                                <td>{o.items}</td>
                                <td><strong>{fmt(o.total)}</strong></td>
                                <td><span className="badge" style={{ background: STATUS_CFG[o.status]?.color + '22', color: STATUS_CFG[o.status]?.color }}>{STATUS_CFG[o.status]?.label}</span></td>
                                <td>{o.delivery}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr style={{ fontWeight: 'bold', background: '#f8f9fa' }}>
                            <td colSpan={4}>TOTAL</td>
                            <td>{fmt(revenue)}</td>
                            <td colSpan={2}>{paid.length} paid · {cancelled.length} cancelled</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* ══════════════════════════════════════════
                INVOICE MODAL
            ══════════════════════════════════════════ */}
            {invoiceOrder && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: '1rem' }}>
                    <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', position: 'relative' }}>
                        {/* Close & Print buttons */}
                        <div style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', zIndex: 10 }}>
                            <span style={{ fontWeight: 700, color: '#111827', fontSize: '0.95rem' }}>Invoice — {invoiceOrder.id}</span>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => printElement('invoice-print-area')}
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.45rem 1rem', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
                                    <FiPrinter size={14} /> Print / PDF
                                </button>
                                <button onClick={() => setInvoiceOrder(null)} style={{ padding: '0.45rem 0.75rem', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#374151' }}>
                                    <FiX size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Invoice content */}
                        <div id="invoice-print-area" style={{ padding: '2rem' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '3px solid #ef4444', paddingBottom: '1.25rem' }}>
                                <div>
                                    <div style={{ fontSize: 26, fontWeight: 900, color: '#ef4444', letterSpacing: '-0.5px' }}>{storeName}</div>
                                    <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>Fresh Groceries, Delivered Fast</div>
                                    <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 6 }}>www.keltyminimarket.co.uk &nbsp;·&nbsp; admin@kelty.com</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 28, fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>INVOICE</div>
                                    <div style={{ fontSize: 13, color: '#374151', marginTop: 4 }}><strong>#{invoiceOrder.id}</strong></div>
                                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Date: {invoiceOrder.date}</div>
                                    <div style={{ marginTop: 8 }}>
                                        <span style={{ background: STATUS_CFG[invoiceOrder.status]?.color + '20', color: STATUS_CFG[invoiceOrder.status]?.color, padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                                            {STATUS_CFG[invoiceOrder.status]?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Bill To + Delivery */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Bill To</div>
                                    <div style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{invoiceOrder.customer}</div>
                                    <div style={{ color: '#6b7280', fontSize: 13 }}>{invoiceOrder.email}</div>
                                    {invoiceOrder.address && <div style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }}>{invoiceOrder.address}</div>}
                                </div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Delivery Info</div>
                                    <div style={{ color: '#374151', fontSize: 13 }}><strong>Type:</strong> {invoiceOrder.delivery}</div>
                                    <div style={{ color: '#374151', fontSize: 13, marginTop: 2 }}><strong>Items:</strong> {invoiceOrder.items} item{invoiceOrder.items !== 1 ? 's' : ''}</div>
                                    <div style={{ color: '#374151', fontSize: 13, marginTop: 2 }}><strong>Order Date:</strong> {invoiceOrder.date}</div>
                                </div>
                            </div>

                            {/* Line items */}
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', borderRadius: 8 }}>
                                        {['#', 'Description', 'Qty', 'Unit Price', 'Amount'].map((h, i) => (
                                            <th key={h} style={{ padding: '10px 12px', textAlign: i >= 2 ? 'right' : 'left', fontSize: 11, color: '#6b7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid #e5e7eb' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* ── Per-item lines (from real order.products) ── */}
                                    {invoiceOrder.products && invoiceOrder.products.length > 0 ? (
                                        invoiceOrder.products.map((item, idx) => {
                                            const lineTotal = Number(item.price) * Number(item.qty || item.quantity || 1);
                                            return (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '12px 12px', color: '#9ca3af', fontSize: 13, verticalAlign: 'top' }}>{idx + 1}</td>
                                                    <td style={{ padding: '12px 12px', verticalAlign: 'top' }}>
                                                        <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{item.name}</div>
                                                        {item.category && <div style={{ color: '#9ca3af', fontSize: 11, marginTop: 2 }}>{item.category}</div>}
                                                    </td>
                                                    <td style={{ padding: '12px 12px', textAlign: 'right', color: '#374151', fontSize: 13, verticalAlign: 'top' }}>{item.qty || item.quantity || 1}</td>
                                                    <td style={{ padding: '12px 12px', textAlign: 'right', color: '#374151', fontSize: 13, verticalAlign: 'top' }}>£{Number(item.price).toFixed(2)}</td>
                                                    <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, color: '#111827', fontSize: 13, verticalAlign: 'top' }}>£{lineTotal.toFixed(2)}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        /* Fallback for older orders that have no product breakdown */
                                        <tr>
                                            <td style={{ padding: '14px 12px', color: '#9ca3af', fontSize: 13 }}>1</td>
                                            <td style={{ padding: '14px 12px' }}>
                                                <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>Grocery Order — {invoiceOrder.id}</div>
                                                <div style={{ color: '#6b7280', fontSize: 12 }}>{invoiceOrder.delivery} Delivery · {invoiceOrder.items} item{invoiceOrder.items !== 1 ? 's' : ''}</div>
                                            </td>
                                            <td style={{ padding: '14px 12px', textAlign: 'right', color: '#374151', fontSize: 13 }}>1</td>
                                            <td style={{ padding: '14px 12px', textAlign: 'right', color: '#374151', fontSize: 13 }}>{fmt(invoiceOrder.total)}</td>
                                            <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 600, color: '#111827', fontSize: 13 }}>{fmt(invoiceOrder.total)}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Totals block */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
                                <div style={{ minWidth: 280 }}>
                                    {(() => {
                                        // Compute subtotal from individual products if we have them
                                        const itemsSubtotal = invoiceOrder.products && invoiceOrder.products.length > 0
                                            ? invoiceOrder.products.reduce((s, p) => s + Number(p.price) * Number(p.qty || p.quantity || 1), 0)
                                            : invoiceOrder.total / (1 + tax / 100);
                                        const taxAmt = itemsSubtotal * (tax / 100);
                                        const grandTotal = itemsSubtotal + taxAmt;
                                        return (
                                            <>
                                                {[
                                                    { label: 'Subtotal', value: fmt(itemsSubtotal) },
                                                    { label: `VAT / Tax (${tax}%)`, value: fmt(taxAmt) },
                                                ].map(r => (
                                                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f3f4f6' }}>
                                                        <span style={{ color: '#6b7280', fontSize: 13 }}>{r.label}</span>
                                                        <span style={{ color: '#374151', fontSize: 13, fontWeight: 500 }}>{r.value}</span>
                                                    </div>
                                                ))}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', marginTop: 4, borderTop: '2px solid #e5e7eb' }}>
                                                    <span style={{ fontWeight: 800, color: '#111827', fontSize: 16 }}>TOTAL DUE</span>
                                                    <span style={{ fontWeight: 900, color: '#ef4444', fontSize: 20 }}>{fmt(grandTotal)}</span>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Footer note */}
                            <div style={{ background: '#f9fafb', borderRadius: 10, padding: '1rem', borderLeft: '4px solid #ef4444' }}>
                                <div style={{ fontWeight: 700, color: '#374151', fontSize: 13, marginBottom: 4 }}>Thank you for shopping with us! 🛒</div>
                                <div style={{ color: '#9ca3af', fontSize: 11, lineHeight: 1.6 }}>
                                    This is an electronically generated invoice and does not require a signature.<br />
                                    For queries, contact us at admin@kelty.com &nbsp;·&nbsp; {storeName}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
