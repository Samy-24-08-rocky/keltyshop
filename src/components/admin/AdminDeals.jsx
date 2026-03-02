import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FiPlus, FiTrash2, FiSave, FiClock } from 'react-icons/fi';

export default function AdminDeals() {
    const { products, settings, updateSettings } = useAdmin();
    const deals = settings.weeklyDeals || [];

    const [isAdding, setIsAdding] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [discount, setDiscount] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [tag, setTag] = useState('🔥 Fast Selling');

    const handleAddDeal = () => {
        if (!selectedProductId || !discount || !endDate || !endTime) return alert('Please fill in all fields');

        const product = products.find(p => p.id === Number(selectedProductId));
        if (!product) return alert('Product not found');

        // Create timestamp from endDate and endTime
        const endMs = new Date(`${endDate}T${endTime}`).getTime();

        const newDeal = {
            id: Date.now(),
            productId: product.id,
            name: product.name,
            price: Number((product.price * (1 - Number(discount) / 100)).toFixed(2)),
            oldPrice: product.price,
            discount: Number(discount),
            endMs,
            image: product.image,
            tag,
        };

        const updatedDeals = [...deals, newDeal];
        updateSettings({ weeklyDeals: updatedDeals });

        setIsAdding(false);
        setSelectedProductId('');
        setDiscount('');
        setEndDate('');
        setEndTime('');
        setTag('🔥 Fast Selling');
    };

    const handleRemoveDeal = (id) => {
        if (!window.confirm('Remove this deal?')) return;
        const updatedDeals = deals.filter(d => d.id !== id);
        updateSettings({ weeklyDeals: updatedDeals });
    };

    return (
        <div style={{ color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Flash Sales & Deals Manager</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer' }}
                >
                    {isAdding ? 'Cancel' : <><FiPlus /> Add Deal</>}
                </button>
            </div>

            {isAdding && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: 12, marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Create New Flash Sale</h3>

                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Select Product</label>
                        <select
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                        >
                            <option value="">-- Choose Product --</option>
                            {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (£{p.price.toFixed(2)})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Discount %</label>
                            <input
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                placeholder="e.g. 20"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Badge Tag</label>
                            <select
                                value={tag}
                                onChange={(e) => setTag(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                            >
                                <option value="🔥 Fast Selling">🔥 Fast Selling</option>
                                <option value="🥩 Best Seller">🥩 Best Seller</option>
                                <option value="🌿 Organic">🌿 Organic</option>
                                <option value="🐟 Wild Caught">🐟 Wild Caught</option>
                                <option value="⭐ Top Rated">⭐ Top Rated</option>
                                <option value="✨ New Arrival">✨ New Arrival</option>
                                <option value="⬇️ Price Drop">⬇️ Price Drop</option>
                                <option value="🛒 Save Big">🛒 Save Big</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>End Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', colorScheme: 'dark' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>End Time</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: 8, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', color: 'white', colorScheme: 'dark' }}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAddDeal}
                        style={{ alignSelf: 'flex-start', background: '#10b981', color: 'white', padding: '0.75rem 1.5rem', borderRadius: 8, display: 'flex', alignItems: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', marginTop: '1rem', fontWeight: 600 }}
                    >
                        <FiSave /> Save Deal
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {deals.map(deal => (
                    <div key={deal.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, overflow: 'hidden' }}>
                        <div style={{ height: 140, position: 'relative' }}>
                            <img src={deal.image} alt={deal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', top: 10, right: 10, background: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 'bold' }}>
                                -{deal.discount}%
                            </div>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem' }}>{deal.name}</h4>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <div>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>£{deal.price.toFixed(2)}</span>
                                    <span style={{ fontSize: '0.9rem', color: '#9ca3af', textDecoration: 'line-through', marginLeft: '0.5rem' }}>£{deal.oldPrice?.toFixed(2)}</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.85rem', marginBottom: '1rem' }}>
                                <FiClock /> Ends: {new Date(deal.endMs).toLocaleString()}
                            </div>
                            <button
                                onClick={() => handleRemoveDeal(deal.id)}
                                style={{ width: '100%', background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '0.6rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}
                            >
                                <FiTrash2 /> Remove Deal
                            </button>
                        </div>
                    </div>
                ))}
                {deals.length === 0 && !isAdding && (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#9ca3af', background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
                        No active deals. Click "Add Deal" to create a new flash sale.
                    </div>
                )}
            </div>
        </div>
    );
}
