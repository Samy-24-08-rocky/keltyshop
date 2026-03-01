import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiSearch, FiX, FiCheck, FiAlertTriangle, FiZap } from 'react-icons/fi';
import BarcodeScanner from './BarcodeScanner';

const CATEGORIES = ['Pantry', 'Condiments', 'Dairy', 'Bakery', 'Meat', 'Seafood', 'Drinks', 'Snacks'];

const blank = {
    name: '', price: '', oldPrice: '', category: 'Pantry', stock: '',
    image: '', rating: '4.5', featured: false, barcode: '',
    merchandisingSlot: 'none' // 'none', 'golden', 'hotspot', 'impulse'
};

const Input = ({ label, ...props }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.375rem' }}>{label}</label>
        <input {...props} style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.65rem 0.875rem', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none', ...props.style }} />
    </div>
);

const Select = ({ label, options, ...props }) => (
    <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.375rem' }}>{label}</label>
        <select {...props} style={{ width: '100%', boxSizing: 'border-box', background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.65rem 0.875rem', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none' }}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    </div>
);

export default function AdminProducts() {
    const { products, addProduct, updateProduct, deleteProduct, toggleFeatured } = useAdmin();
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(blank);
    const [editId, setEditId] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [showScanner, setShowScanner] = useState(false);

    const handleScannedProduct = (scannedData) => {
        setForm({ ...blank, ...scannedData, price: '', oldPrice: '', stock: '' });
        setEditId(null);
        setModal('edit');
    };

    const filtered = products.filter(p =>
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.category || '').toLowerCase().includes(search.toLowerCase())
    );

    const openAdd = () => { setForm(blank); setEditId(null); setModal('edit'); };
    const openEdit = (p) => {
        setForm({
            ...p,
            price: String(p.price),
            oldPrice: String(p.oldPrice ?? ''),
            stock: String(p.stock),
            merchandisingSlot: p.merchandisingSlot || 'none'
        });
        setEditId(p.id);
        setModal('edit');
    };

    const applyDiscount = (percent) => {
        const p = parseFloat(form.price);
        if (!p) return;
        const old = p / (1 - percent / 100);
        setForm(f => ({ ...f, oldPrice: old.toFixed(2) }));
    };

    const handleSave = () => {
        const data = { ...form, price: parseFloat(form.price) || 0, oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null, stock: parseInt(form.stock) || 0, rating: parseFloat(form.rating) || 4.5 };
        if (editId) updateProduct(editId, data);
        else addProduct(data);
        setModal(null);
    };

    const stockColor = (s) => s === 0 ? '#ef4444' : s <= 5 ? '#f59e0b' : '#22c55e';
    const stockLabel = (s) => s === 0 ? 'Out of Stock' : s <= 5 ? `Low (${s})` : `${s}`;

    return (
        <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
                    <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.65rem 0.875rem 0.65rem 2.25rem', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none' }} />
                </div>
                {/* Scan Barcode */}
                <button onClick={() => setShowScanner(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.1rem', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(99,102,241,0.35)', flexShrink: 0 }}>
                    <FiZap size={16} /> Scan Barcode
                </button>
                <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(239,68,68,0.35)', flexShrink: 0 }}>
                    <FiPlus size={16} /> Add Product
                </button>
            </div>

            {/* Responsive Product List */}
            <style>{`
                .ap-prod-table-wrap { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden; }
                /* Table header */
                .ap-prod-thead th { padding: 0.75rem 1rem; text-align: left; font-size: 0.68rem; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; white-space: nowrap; border-bottom: 1px solid rgba(255,255,255,0.08); }
                .ap-prod-row td { padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
                .ap-prod-row:last-child td { border-bottom: none; }
                /* Action buttons */
                .ap-act-btn { border-radius: 8px; padding: 0.375rem 0.625rem; cursor: pointer; display: flex; align-items: center; justify-content: center; -webkit-tap-highlight-color: transparent; touch-action: manipulation; min-width: 34px; min-height: 34px; }

                /* ── Mobile card view ── */
                @media (max-width: 640px) {
                    .ap-prod-table { display: none; }
                    .ap-prod-cards { display: flex; flex-direction: column; gap: 0; }
                    .ap-prod-card {
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        padding: 0.875rem 1rem;
                        border-bottom: 1px solid rgba(255,255,255,0.06);
                    }
                    .ap-prod-card:last-child { border-bottom: none; }
                    .ap-prod-card-img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; border: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }
                    .ap-prod-card-body { flex: 1; min-width: 0; }
                    .ap-prod-card-name { font-weight: 600; color: #e2e8f0; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .ap-prod-card-meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; flex-wrap: wrap; }
                    .ap-prod-card-actions { display: flex; align-items: center; gap: 0.375rem; flex-shrink: 0; }
                }
                @media (min-width: 641px) {
                    .ap-prod-table { display: table; width: 100%; border-collapse: collapse; }
                    .ap-prod-cards { display: none; }
                }
            `}</style>

            <div className="ap-prod-table-wrap">

                {/* ── Desktop Table ── */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="ap-prod-table">
                        <thead>
                            <tr className="ap-prod-thead">
                                {['Product', 'Category', 'Price', 'Stock', 'Featured', 'Actions'].map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} className="ap-prod-row"
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <img src={p.image} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.08)' }} />
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.875rem' }}>{p.name}</div>
                                                <div style={{ color: '#475569', fontSize: '0.72rem' }}>ID #{p.id}{p.barcode ? ` · 🔳 ${p.barcode}` : ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '2px 9px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600 }}>{p.category}</span></td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.9rem' }}>£{p.price.toFixed(2)}</div>
                                        {p.oldPrice && <div style={{ color: '#475569', fontSize: '0.75rem', textDecoration: 'line-through' }}>£{p.oldPrice.toFixed(2)}</div>}
                                    </td>
                                    <td><span style={{ color: stockColor(p.stock), fontSize: '0.8rem', fontWeight: 600 }}>{stockLabel(p.stock)}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                            <button onClick={() => toggleFeatured(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.featured ? '#fbbf24' : '#334155' }}>
                                                <FiStar size={18} fill={p.featured ? '#fbbf24' : 'none'} />
                                            </button>
                                            {p.merchandisingSlot && p.merchandisingSlot !== 'none' && (
                                                <span title={`Manually marked: ${p.merchandisingSlot}`} style={{ background: '#ef4444', color: 'white', fontSize: '0.6rem', padding: '1px 4px', borderRadius: 4, fontWeight: 800, textTransform: 'uppercase' }}>
                                                    {p.merchandisingSlot[0]}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => openEdit(p)} className="ap-act-btn" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' }}><FiEdit2 size={14} /></button>
                                            <button onClick={() => setConfirm(p.id)} className="ap-act-btn" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}><FiTrash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Mobile Cards ── */}
                <div className="ap-prod-cards">
                    {filtered.map(p => (
                        <div key={p.id} className="ap-prod-card">
                            <img src={p.image} alt={p.name} className="ap-prod-card-img" />
                            <div className="ap-prod-card-body">
                                <div className="ap-prod-card-name">{p.name}</div>
                                <div className="ap-prod-card-meta">
                                    <span style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', padding: '1px 7px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600 }}>{p.category}</span>
                                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.85rem' }}>£{p.price.toFixed(2)}</span>
                                    {p.oldPrice && <span style={{ color: '#475569', fontSize: '0.72rem', textDecoration: 'line-through' }}>£{p.oldPrice.toFixed(2)}</span>}
                                    <span style={{ color: stockColor(p.stock), fontSize: '0.75rem', fontWeight: 600 }}>{stockLabel(p.stock)}</span>
                                </div>
                            </div>
                            <div className="ap-prod-card-actions">
                                <button onClick={() => toggleFeatured(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.featured ? '#fbbf24' : '#475569', padding: '0.375rem', WebkitTapHighlightColor: 'transparent' }}>
                                    <FiStar size={17} fill={p.featured ? '#fbbf24' : 'none'} />
                                </button>
                                <button onClick={() => openEdit(p)} className="ap-act-btn" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)', color: '#93c5fd' }}><FiEdit2 size={14} /></button>
                                <button onClick={() => setConfirm(p.id)} className="ap-act-btn" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}><FiTrash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>No products found.</div>}
            </div>


            {/* Delete confirm */}
            {confirm && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2rem', maxWidth: 360, width: '90%', textAlign: 'center' }}>
                        <FiAlertTriangle size={40} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ color: '#f1f5f9', margin: '0 0 0.5rem' }}>Delete Product?</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '1.5rem' }}>This action cannot be undone.</p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                            <button onClick={() => setConfirm(null)} style={{ padding: '0.625rem 1.25rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={() => { deleteProduct(confirm); setConfirm(null); }} style={{ padding: '0.625rem 1.25rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit modal */}
            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div style={{ background: '#1e2a3a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: '#f1f5f9', fontWeight: 700 }}>{editId ? 'Edit Product' : 'Add Product'}</h3>
                            <button onClick={() => setModal(null)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: '0.5rem', color: '#94a3b8', cursor: 'pointer' }}><FiX size={18} /></button>
                        </div>
                        <Input label="Product Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Organic Apples" required />
                        <Input label="Barcode (optional — for POS scanning)" value={form.barcode || ''} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} placeholder="e.g. 5012345678900" />
                        <Input label="Image URL" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://…" />
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                            <Input label="Price (£)" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="1.99" />
                            <Input label="Old Price (£, optional)" type="number" step="0.01" value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} placeholder="2.49" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
                            <Input label="Stock" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="10" />
                            <Input label="Rating (0–5)" type="number" step="0.1" max="5" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} placeholder="4.5" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <Select
                                label="Merchandising Zone"
                                value={form.merchandisingSlot}
                                onChange={e => setForm(f => ({ ...f, merchandisingSlot: e.target.value }))}
                                options={[
                                    { label: 'Regular Placement', value: 'none' },
                                    { label: '⭐ Golden Zone (Top Shelf)', value: 'golden' },
                                    { label: '🔥 Home Endcap (Hot Spot)', value: 'hotspot' },
                                    { label: '🛒 Checkout Impulse Buy', value: 'impulse' }
                                ].map(o => o.value)}
                            />
                            <div>
                                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500, marginBottom: '0.375rem' }}>Discount Helper</label>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                    {[10, 25, 50].map(v => (
                                        <button key={v} onClick={() => applyDiscount(v)} style={{ flex: 1, padding: '0.5rem 0.25rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', borderRadius: 6, fontSize: '0.7rem', cursor: 'pointer' }}>
                                            -{v}%
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', marginBottom: '1.5rem' }}>
                            <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} style={{ width: 16, height: 16, accentColor: '#ef4444' }} />
                            <span style={{ color: '#e2e8f0', fontSize: '0.875rem' }}>Show on Featured / Homepage</span>
                        </label>
                        {form.image && <img src={form.image} alt="preview" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10, marginBottom: '1rem' }} onError={e => e.target.style.display = 'none'} />}

                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setModal(null)} style={{ padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
                                <FiCheck size={16} /> {editId ? 'Save Changes' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Barcode Scanner Modal */}
            {showScanner && (
                <BarcodeScanner
                    onProductScanned={handleScannedProduct}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
