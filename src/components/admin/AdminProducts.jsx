import React, { useState, useMemo, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiPlus, FiEdit2, FiTrash2, FiStar, FiSearch, FiX, FiCheck, FiAlertTriangle, FiZap, FiFilter, FiXCircle, FiTag, FiAlertCircle, FiChevronDown, FiChevronUp, FiUpload, FiLoader } from 'react-icons/fi';
import BarcodeScanner from './BarcodeScanner';

const CATEGORIES = ['Pantry', 'Condiments', 'Dairy', 'Bakery', 'Meat', 'Seafood', 'Drinks', 'Snacks'];

const blank = {
    name: '', price: '', oldPrice: '', category: 'Pantry', stock: '',
    image: '', rating: '4.5', featured: false, barcode: '',
    merchandisingSlot: 'none' // 'none', 'golden', 'hotspot', 'impulse'
};

const FILTER_TYPES = [
    { id: 'all', label: 'All', icon: null },
    { id: 'out', label: 'Out of Stock', icon: 'FiXCircle', color: '#ef4444' },
    { id: 'low', label: 'Low Stock', icon: 'FiAlertTriangle', color: '#f59e0b' },
    { id: 'onSale', label: 'On Sale', icon: 'FiTag', color: '#10b981' },
    { id: 'featured', label: 'Featured', icon: 'FiStar', color: '#facc15' },
    { id: 'merch', label: 'Merchandising', icon: 'FiZap', color: '#6366f1' },
];

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
    const [viewMode, setViewMode] = useState('grouped'); // 'list' | 'grouped'
    const [activeFilter, setActiveFilter] = useState('all');
    const [selectedCat, setSelectedCat] = useState('All Categories');
    const [collapsed, setCollapsed] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [inlineEdit, setInlineEdit] = useState({ id: null, field: null, val: '' });
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ml_default');

        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo';
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: data
            });
            const result = await res.json();
            if (result.secure_url) {
                setForm(f => ({ ...f, image: result.secure_url }));
            }
        } catch (err) {
            console.error("Upload failed:", err);
            alert("Image upload failed. Please check your connection or use a direct URL.");
        } finally {
            setUploading(false);
        }
    };

    const handleScannedProduct = (scannedData) => {
        setForm({ ...blank, ...scannedData, price: '', oldPrice: '', stock: '' });
        setEditId(null);
        setModal('edit');
    };

    const filtered = useMemo(() => {
        let res = products.filter(p =>
            (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
            (p.category || '').toLowerCase().includes(search.toLowerCase())
        );

        if (selectedCat !== 'All Categories') res = res.filter(p => p.category === selectedCat);
        if (activeFilter === 'out') res = res.filter(p => p.stock === 0);
        else if (activeFilter === 'low') res = res.filter(p => p.stock > 0 && p.stock <= 5);
        else if (activeFilter === 'onSale') res = res.filter(p => p.oldPrice && p.oldPrice > p.price);
        else if (activeFilter === 'featured') res = res.filter(p => p.featured);
        else if (activeFilter === 'merch') res = res.filter(p => p.merchandisingSlot && p.merchandisingSlot !== 'none');

        return res.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    }, [products, search, activeFilter, selectedCat]);

    const grouped = filtered.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p);
        return acc;
    }, {});

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

    const handleBulkMove = (newCat) => {
        if (!newCat) return;
        selectedIds.forEach(id => updateProduct(id, { category: newCat }));
        setSelectedIds([]);
    };

    const toggleCollapse = (cat) => setCollapsed(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);

    const handleBulkDelete = () => {
        if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;
        selectedIds.forEach(id => deleteProduct(id));
        setSelectedIds([]);
    };

    const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    const selectAll = () => setSelectedIds(selectedIds.length === filtered.length ? [] : filtered.map(p => p.id));

    const handleInlineUpdate = (id, field) => {
        const val = field === 'stock' ? parseInt(inlineEdit.val) : parseFloat(inlineEdit.val);
        if (isNaN(val)) return setInlineEdit({ id: null, field: null, val: '' });
        updateProduct(id, { [field]: val });
        setInlineEdit({ id: null, field: null, val: '' });
    };

    const MerchBadge = ({ slot }) => {
        const config = {
            golden: { label: 'GOLDEN', bg: '#fbbf24', color: '#000' },
            hotspot: { label: 'HOTSPOT', bg: '#ef4444', color: '#fff' },
            impulse: { label: 'IMPULSE', bg: '#6366f1', color: '#fff' }
        }[slot];
        if (!config) return null;
        return <span style={{ fontSize: '0.6rem', fontWeight: 900, background: config.bg, color: config.color, padding: '1px 5px', borderRadius: 4, letterSpacing: '0.02em' }}>{config.label}</span>;
    };

    return (
        <div>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
                    <FiSearch size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '0.65rem 0.875rem 0.65rem 2.25rem', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none' }} />
                </div>
                {/* View Switch */}
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '3px' }}>
                    <button onClick={() => setViewMode('list')} style={{ padding: '0.5rem 0.875rem', border: 'none', borderRadius: 8, background: viewMode === 'list' ? '#334155' : 'transparent', color: viewMode === 'list' ? '#fff' : '#64748b', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>List</button>
                    <button onClick={() => setViewMode('grid')} style={{ padding: '0.5rem 0.875rem', border: 'none', borderRadius: 8, background: viewMode === 'grid' ? '#334155' : 'transparent', color: viewMode === 'grid' ? '#fff' : '#64748b', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Grid</button>
                    <button onClick={() => setViewMode('grouped')} style={{ padding: '0.5rem 0.875rem', border: 'none', borderRadius: 8, background: viewMode === 'grouped' ? '#334155' : 'transparent', color: viewMode === 'grouped' ? '#fff' : '#64748b', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Grouped</button>
                </div>
                {/* Actions */}
                <button onClick={() => setShowScanner(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.1rem', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>
                    <FiZap size={16} /> Scan
                </button>
                <button onClick={openAdd} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', boxShadow: '0 4px 12px rgba(239,68,68,0.35)' }}>
                    <FiPlus size={16} /> Add Product
                </button>
            </div>

            {/* Filter Ribbon */}
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.25rem', scrollbarWidth: 'none' }}>
                {FILTER_TYPES.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        style={{
                            padding: '0.4rem 0.875rem', borderRadius: 8, border: `1px solid ${activeFilter === f.id ? f.color || '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                            background: activeFilter === f.id ? `${f.color ? f.color + '15' : 'rgba(59,130,246,0.1)'}` : 'rgba(255,255,255,0.03)',
                            color: activeFilter === f.id ? f.color || '#60a5fa' : '#64748b',
                            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'
                        }}
                    >
                        {f.label}
                    </button>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.7rem', fontWeight: 600 }}>
                    {filtered.length} / {products.length} Products
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedIds.length > 0 && (
                <div style={{ background: '#1e2a3a', border: '1px solid #3b82f6', borderRadius: 12, padding: '0.875rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: 'slideDown 0.3s', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    <div style={{ color: '#93c5fd', fontSize: '0.85rem', fontWeight: 600 }}>{selectedIds.length} items selected — <span style={{ color: '#64748b' }}>Quick manage category or delete</span></div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <select
                            onChange={(e) => handleBulkMove(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9', padding: '0.4rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', outline: 'none' }}
                        >
                            <option value="">Move to Category...</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button onClick={handleBulkDelete} style={{ background: '#ef444415', color: '#fca5a5', border: '1px solid #ef444430', padding: '0.4rem 1rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Delete All</button>
                        <button onClick={() => setSelectedIds([])} style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: '0.75rem', cursor: 'pointer' }}><FiX size={18} /></button>
                    </div>
                </div>
            )}

            {/* Category Navigation Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollbarWidth: 'none' }}>
                <button
                    onClick={() => setSelectedCat('All Categories')}
                    style={{ padding: '0.5rem 1rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', background: selectedCat === 'All Categories' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', color: selectedCat === 'All Categories' ? '#a5b4fc' : '#64748b', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                    All Categories
                </button>
                {CATEGORIES.map(cat => {
                    const count = products.filter(p => p.category === cat).length;
                    const oos = products.filter(p => p.category === cat && p.stock === 0).length;
                    return (
                        <button
                            key={cat}
                            onClick={() => setSelectedCat(cat)}
                            style={{ position: 'relative', padding: '0.5rem 1rem', borderRadius: 10, border: `1px solid ${selectedCat === cat ? '#3b82f640' : 'rgba(255,255,255,0.08)'}`, background: selectedCat === cat ? '#3b82f615' : 'rgba(255,255,255,0.03)', color: selectedCat === cat ? '#60a5fa' : '#64748b', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        >
                            {cat} <span style={{ opacity: 0.5, marginLeft: '0.25rem' }}>({count})</span>
                            {oos > 0 && <span style={{ position: 'absolute', top: -4, right: -4, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', border: '2px solid #1e2a3a' }} />}
                        </button>
                    );
                })}
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
                    .ap-grid-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
                    .ap-grid-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); borderRadius: 16px; overflow: hidden; position: relative; transition: all 0.3s ease; }
                    .ap-grid-card:hover { transform: translateY(-4px); background: rgba(255,255,255,0.06); border-color: rgba(99,102,241,0.3); box-shadow: 0 12px 24px rgba(0,0,0,0.2); }
                    .ap-grid-image { width: 100%; aspect-ratio: 1/1; object-fit: cover; border-bottom: 1px solid rgba(255,255,255,0.05); }
                    .ap-grid-content { padding: 0.875rem; }
                    .ap-grid-title { font-weight: 700; color: #f1f5f9; font-size: 0.85rem; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                    .ap-grid-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; }
                    .ap-grid-price { font-weight: 800; color: #fff; font-size: 1rem; }
                    .ap-grid-stock { font-size: 0.75rem; font-weight: 600; }
                    .ap-grid-actions { position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.375rem; opacity: 0; transition: opacity 0.2s; }
                    .ap-grid-card:hover .ap-grid-actions { opacity: 1; }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                }
            `}</style>

            <div className="ap-prod-table-wrap">

                {/* ── Grid View ── */}
                {viewMode === 'grid' && (
                    <div className="ap-grid-container">
                        {filtered.map(p => (
                            <div key={p.id} className="ap-grid-card" style={{ opacity: p.stock === 0 ? 0.7 : 1 }}>
                                <div className="ap-grid-actions">
                                    <button onClick={() => toggleFeatured(p.id)} style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', color: p.featured ? '#fbbf24' : '#fff' }}>
                                        <FiStar size={14} fill={p.featured ? '#fbbf24' : 'none'} />
                                    </button>
                                    <button onClick={() => openEdit(p)} style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', color: '#60a5fa' }}><FiEdit2 size={14} /></button>
                                    <button onClick={() => setConfirm(p.id)} style={{ background: 'rgba(239,68,68,0.8)', border: 'none', borderRadius: 8, padding: '0.4rem', cursor: 'pointer', color: '#fff' }}><FiTrash2 size={14} /></button>
                                </div>
                                <img src={p.image} alt={p.name} className="ap-grid-image" />
                                <div className="ap-grid-content">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{p.category}</span>
                                        <MerchBadge slot={p.merchandisingSlot} />
                                    </div>
                                    <div className="ap-grid-title" title={p.name}>{p.name}</div>
                                    <div className="ap-grid-meta">
                                        <div className="ap-grid-price">£{p.price.toFixed(2)}</div>
                                        <div className="ap-grid-stock" style={{ color: stockColor(p.stock) }}>{p.stock} in stock</div>
                                    </div>
                                </div>
                                <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}>
                                    <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ cursor: 'pointer', width: 18, height: 18 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Desktop Table ── */}
                <div style={{ overflowX: 'auto', display: viewMode === 'grid' ? 'none' : 'block' }}>
                    <table className="ap-prod-table">
                        <thead>
                            <tr className="ap-prod-thead">
                                <th style={{ width: 40 }}><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={selectAll} style={{ cursor: 'pointer' }} /></th>
                                {['Product', 'Category', 'Price', 'Stock', 'Promo', 'Actions'].map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {viewMode === 'grouped'
                                ? Object.entries(grouped).map(([cat, items]) => {
                                    const isCollapsed = collapsed.includes(cat);
                                    const oosCount = items.filter(i => i.stock === 0).length;
                                    return (
                                        <React.Fragment key={cat}>
                                            <tr
                                                onClick={() => toggleCollapse(cat)}
                                                style={{ background: 'rgba(255,255,255,0.05)', cursor: 'pointer', borderLeft: oosCount > 0 ? '4px solid #ef4444' : 'none' }}
                                            >
                                                <td colSpan="7" style={{ padding: '0.75rem 1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        {isCollapsed ? <FiChevronDown size={14} color="#64748b" /> : <FiChevronUp size={14} color="#64748b" />}
                                                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                                                            📦 {cat} <span style={{ opacity: 0.5, fontWeight: 500, marginLeft: '0.4rem' }}>({items.length} items)</span>
                                                        </span>
                                                        {oosCount > 0 && <span style={{ background: '#ef444415', color: '#fca5a5', padding: '2px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 800 }}>{oosCount} OUT OF STOCK</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                            {!isCollapsed && items.map(p => (
                                                <tr key={p.id} className="ap-prod-row" style={{ opacity: p.stock === 0 ? 0.7 : 1, background: selectedIds.includes(p.id) ? 'rgba(99,102,241,0.05)' : 'transparent' }}>
                                                    <td><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ cursor: 'pointer' }} /></td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                            <img src={p.image} alt={p.name} style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                                                <div style={{ color: '#475569', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                                    #{p.id}{p.barcode && <><span style={{ opacity: 0.3 }}>|</span> <FiZap size={10} /> {p.barcode}</>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.category}</span></td>
                                                    <td>
                                                        {inlineEdit.id === p.id && inlineEdit.field === 'price' ? (
                                                            <input autoFocus value={inlineEdit.val} onChange={e => setInlineEdit(v => ({ ...v, val: e.target.value }))} onBlur={() => handleInlineUpdate(p.id, 'price')} onKeyDown={e => e.key === 'Enter' && handleInlineUpdate(p.id, 'price')} style={{ width: 60, background: '#1e2a3a', border: '1px solid #3b82f6', color: '#fff', padding: '2px 4px', borderRadius: 4, fontSize: '0.85rem' }} />
                                                        ) : (
                                                            <div onClick={() => setInlineEdit({ id: p.id, field: 'price', val: String(p.price) })} style={{ cursor: 'pointer', padding: '2px 4px', borderRadius: 4 }}>
                                                                <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>£{p.price.toFixed(2)}</div>
                                                                {p.oldPrice && <div style={{ color: '#ef4444', fontSize: '0.72rem', textDecoration: 'line-through' }}>£{p.oldPrice.toFixed(2)}</div>}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {inlineEdit.id === p.id && inlineEdit.field === 'stock' ? (
                                                            <input autoFocus type="number" value={inlineEdit.val} onChange={e => setInlineEdit(v => ({ ...v, val: e.target.value }))} onBlur={() => handleInlineUpdate(p.id, 'stock')} onKeyDown={e => e.key === 'Enter' && handleInlineUpdate(p.id, 'stock')} style={{ width: 50, background: '#1e2a3a', border: '1px solid #3b82f6', color: '#fff', padding: '2px 4px', borderRadius: 4, fontSize: '0.85rem' }} />
                                                        ) : (
                                                            <div onClick={() => setInlineEdit({ id: p.id, field: 'stock', val: String(p.stock) })} style={{ cursor: 'pointer', color: stockColor(p.stock), fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                {p.stock} {p.stock <= 5 && <FiAlertTriangle size={12} />}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                            <button onClick={() => toggleFeatured(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.featured ? '#facc15' : '#334155', transition: 'transform 0.2s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.8)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                                                                <FiStar size={18} fill={p.featured ? '#facc15' : 'none'} />
                                                            </button>
                                                            <MerchBadge slot={p.merchandisingSlot} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={() => openEdit(p)} className="ap-act-btn" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}><FiEdit2 size={14} /></button>
                                                            <button onClick={() => setConfirm(p.id)} className="ap-act-btn" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}><FiTrash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    );
                                })
                                : filtered.map(p => (
                                    <tr key={p.id} className="ap-prod-row" style={{ opacity: p.stock === 0 ? 0.7 : 1, background: selectedIds.includes(p.id) ? 'rgba(99,102,241,0.05)' : 'transparent' }}>
                                        <td><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} style={{ cursor: 'pointer' }} /></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <img src={p.image} alt={p.name} style={{ width: 42, height: 42, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                                                <div style={{ minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                                    <div style={{ color: '#475569', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                                        #{p.id}{p.barcode && <><span style={{ opacity: 0.3 }}>|</span> <FiZap size={10} /> {p.barcode}</>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.category}</span></td>
                                        <td>
                                            {inlineEdit.id === p.id && inlineEdit.field === 'price' ? (
                                                <input autoFocus value={inlineEdit.val} onChange={e => setInlineEdit(v => ({ ...v, val: e.target.value }))} onBlur={() => handleInlineUpdate(p.id, 'price')} onKeyDown={e => e.key === 'Enter' && handleInlineUpdate(p.id, 'price')} style={{ width: 60, background: '#1e2a3a', border: '1px solid #3b82f6', color: '#fff', padding: '2px 4px', borderRadius: 4, fontSize: '0.85rem' }} />
                                            ) : (
                                                <div onClick={() => setInlineEdit({ id: p.id, field: 'price', val: String(p.price) })} style={{ cursor: 'pointer', padding: '2px 4px', borderRadius: 4 }}>
                                                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>£{p.price.toFixed(2)}</div>
                                                    {p.oldPrice && <div style={{ color: '#ef4444', fontSize: '0.72rem', textDecoration: 'line-through' }}>£{p.oldPrice.toFixed(2)}</div>}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {inlineEdit.id === p.id && inlineEdit.field === 'stock' ? (
                                                <input autoFocus type="number" value={inlineEdit.val} onChange={e => setInlineEdit(v => ({ ...v, val: e.target.value }))} onBlur={() => handleInlineUpdate(p.id, 'stock')} onKeyDown={e => e.key === 'Enter' && handleInlineUpdate(p.id, 'stock')} style={{ width: 50, background: '#1e2a3a', border: '1px solid #3b82f6', color: '#fff', padding: '2px 4px', borderRadius: 4, fontSize: '0.85rem' }} />
                                            ) : (
                                                <div onClick={() => setInlineEdit({ id: p.id, field: 'stock', val: String(p.stock) })} style={{ cursor: 'pointer', color: stockColor(p.stock), fontSize: '0.85rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    {p.stock} {p.stock <= 5 && <FiAlertTriangle size={12} />}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                                <button onClick={() => toggleFeatured(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.featured ? '#facc15' : '#334155', transition: 'transform 0.2s' }} onMouseDown={e => e.currentTarget.style.transform = 'scale(0.8)'} onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}>
                                                    <FiStar size={18} fill={p.featured ? '#facc15' : 'none'} />
                                                </button>
                                                <MerchBadge slot={p.merchandisingSlot} />
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button onClick={() => openEdit(p)} className="ap-act-btn" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}><FiEdit2 size={14} /></button>
                                                <button onClick={() => setConfirm(p.id)} className="ap-act-btn" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}><FiTrash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                {/* ── Mobile Cards ── */}
                <div className="ap-prod-cards">
                    {viewMode === 'grouped'
                        ? Object.entries(grouped).map(([cat, items]) => (
                            <div key={cat}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                                    {cat}
                                </div>
                                {items.map(p => (
                                    <div key={p.id} className="ap-prod-card">
                                        <img src={p.image} alt={p.name} className="ap-prod-card-img" />
                                        <div className="ap-prod-card-body">
                                            <div className="ap-prod-card-name">{p.name}</div>
                                            <div className="ap-prod-card-meta">
                                                <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.85rem' }}>£{p.price.toFixed(2)}</span>
                                                <span style={{ color: stockColor(p.stock), fontSize: '0.75rem', fontWeight: 600 }}>{stockLabel(p.stock)}</span>
                                            </div>
                                        </div>
                                        <div className="ap-prod-card-actions">
                                            <button onClick={() => openEdit(p)} className="ap-act-btn" style={{ color: '#93c5fd' }}><FiEdit2 size={14} /></button>
                                            <button onClick={() => setConfirm(p.id)} className="ap-act-btn" style={{ color: '#fca5a5' }}><FiTrash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))
                        : filtered.map(p => (
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

                        <div style={{ position: 'relative' }}>
                            <Input label="Image URL" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://…" />
                            <button
                                onClick={() => fileRef.current.click()}
                                disabled={uploading}
                                style={{ position: 'absolute', right: 8, top: 28, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', padding: '0.4rem 0.75rem', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                {uploading ? <FiLoader className="spin" size={14} /> : <FiUpload size={14} />}
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </button>
                            <input type="file" ref={fileRef} onChange={handleUpload} style={{ display: 'none' }} accept="image/*" />
                        </div>
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
