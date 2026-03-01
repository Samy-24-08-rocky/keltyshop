import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
    FiMonitor, FiLayout, FiTarget, FiTrendingUp, FiShoppingBag,
    FiCheckCircle, FiSlash, FiZap, FiAward, FiStar
} from 'react-icons/fi';

export default function AdminMerchandising() {
    const { settings, updateSettings, products } = useAdmin();

    // Current merchandising state (with defaults from INITIAL_SETTINGS)
    const m = settings.merchandising || {
        showHotSpots: true,
        showCrossSell: true,
        showImpulseRail: true,
        goldenZoneEnabled: true,
        smartAislesEnabled: true
    };

    const toggle = (key) => {
        updateSettings({
            merchandising: { ...m, [key]: !m[key] }
        });
    };

    // Helper for Golden Zone scoring
    const goldenScore = (p) => {
        let score = 0;
        // Absolute priority for manual marks
        if (p.merchandisingSlot === 'golden') return 500;
        if (p.merchandisingSlot === 'hotspot') return 400;
        if (p.merchandisingSlot === 'impulse') return 300;

        if (p.featured) score += 40;
        if (p.rating >= 4.7) score += 30;
        if (p.oldPrice && p.oldPrice > p.price) score += 20;
        if (p.stock > 0 && p.stock <= 5) score += 10;
        return score;
    };

    const topGolden = products
        .map(p => ({ ...p, score: goldenScore(p) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);


    const STRATEGIES = [
        {
            id: 'showHotSpots',
            label: 'Home Endcap Highlights',
            desc: 'Show Rotating Hot Spots on home page (Specials, Arrivals, Top Rated)',
            icon: <FiLayout color="#fb7185" />
        },
        {
            id: 'showCrossSell',
            label: 'Pairs Great With',
            desc: 'Show complementary product suggestions on product detail pages',
            icon: <FiZap color="#facc15" />
        },
        {
            id: 'showImpulseRail',
            label: 'Checkout Impulse Buys',
            desc: "Show 'Add a Little Extra' rail in the cart to boost average order value",
            icon: <FiShoppingBag color="#38bdf8" />
        },
        {
            id: 'goldenZoneEnabled',
            label: 'Golden Zone Logic',
            desc: 'Prioritize eye-level products (high rating + margin) in shop results',
            icon: <FiAward color="#f59e0b" />
        },
        {
            id: 'smartAislesEnabled',
            label: 'Smart Aisle Navigation',
            desc: 'Enable aisle-based routing and overhead category signage in Shop',
            icon: <FiTarget color="#2dd4bf" />
        }
    ];

    return (
        <div style={{ padding: '0.5rem' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FiMonitor /> Store Merchandising Control
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    Manage "eye-level" placement, cross-selling rules, and seasonal Hot Spot displays.
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

                {/* Toggle Controls */}
                <section style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiLayout /> Activation Controls
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {STRATEGIES.map(s => (
                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                        {s.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>{s.label}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{s.desc}</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggle(s.id)}
                                    style={{
                                        cursor: 'pointer', border: 'none', background: m[s.id] ? '#ef4444' : '#334155',
                                        color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700,
                                        transition: 'all 0.2s', width: 80
                                    }}
                                >
                                    {m[s.id] ? 'Active' : 'Off'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Analytics & Golden Zone Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <section style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiAward /> Golden Zone Dominance
                        </h3>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '1rem' }}>
                            These products currently occupy your prime eye-level digital shelf space.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {topGolden.map((p, i) => (
                                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: i === 0 ? 'rgba(245,158,11,0.05)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                                    <img src={p.image} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: '8px' }} alt="" />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.category}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: 700 }}>{p.score}</div>
                                        <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase' }}>Shelf Score</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                        <FiTrendingUp style={{ position: 'absolute', top: -10, right: -10, fontSize: '5rem', color: 'rgba(255,255,255,0.02)' }} />
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '1rem' }}>
                            Strategy Insights
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#2dd4bf' }}>+18%</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>Impulse CTR</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '12px' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb7185' }}>£4.20</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', marginTop: '2px' }}>Avg Lift/Order</div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#475569', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiStar size={12} /> Using "First-In, First-Out" rotation proxy by stock levels.
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
