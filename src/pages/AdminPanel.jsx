import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminDeliveries from '../components/admin/AdminDeliveries';
import AdminSettings from '../components/admin/AdminSettings';
import AdminReports from '../components/admin/AdminReports';
import AdminStock from '../components/admin/AdminStock';
import AdminReviews from '../components/admin/AdminReviews';
import AdminPOS from '../components/admin/AdminPOS';
import {
    FiGrid, FiPackage, FiShoppingBag, FiTruck, FiSettings,
    FiLogOut, FiMenu, FiX, FiShoppingCart, FiChevronRight, FiBarChart2,
    FiAlertTriangle, FiMessageSquare, FiMonitor
} from 'react-icons/fi';

const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'pos', label: 'POS / Till', icon: FiMonitor },
    { id: 'products', label: 'Products', icon: FiPackage },
    { id: 'stock', label: 'Stock Management', icon: FiAlertTriangle },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'deliveries', label: 'Deliveries', icon: FiTruck },
    { id: 'reviews', label: 'Customer Reviews', icon: FiMessageSquare },
    { id: 'reports', label: 'Reports & Billing', icon: FiBarChart2 },
    { id: 'settings', label: 'Settings', icon: FiSettings },
];

const BADGE_STYLE = {
    background: '#ef4444', color: 'white', borderRadius: 99,
    fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', marginLeft: 'auto'
};

export default function AdminPanel() {
    const [section, setSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { adminUser, adminLogout, stats, testimonials } = useAdmin();
    const navigate = useNavigate();

    if (!adminUser) { navigate('/admin/login'); return null; }

    const handleLogout = () => { adminLogout(); navigate('/admin/login'); };

    const badgeCount = (id) => {
        if (id === 'orders') return stats.pendingOrders || null;
        if (id === 'deliveries') return stats.outForDelivery || null;
        if (id === 'products') return stats.lowStockProducts || null;
        if (id === 'stock') {
            const urgent = (stats.outOfStockProducts || 0) + (stats.lowStockProducts || 0);
            return urgent || null;
        }
        if (id === 'reviews') {
            const pending = testimonials.filter(t => !t.isApproved).length;
            return pending || null;
        }
        return null;
    };

    const handleNavClick = (id) => {
        setSection(id);
        setSidebarOpen(false); // close drawer on mobile after nav tap
    };

    const SECTIONS = {
        dashboard: <AdminDashboard />,
        pos: <AdminPOS />,
        products: <AdminProducts />,
        stock: <AdminStock />,
        orders: <AdminOrders />,
        deliveries: <AdminDeliveries />,
        reviews: <AdminReviews />,
        reports: <AdminReports />,
        settings: <AdminSettings />
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700\u0026display=swap');
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }

                .ap-wrap {
                    display: flex;
                    height: 100dvh;
                    font-family: 'Inter', sans-serif;
                    background: #0f172a;
                    color: #f1f5f9;
                    overflow: hidden;
                    position: relative;
                }

                /* ── Backdrop (tap to close sidebar on mobile) ── */
                .ap-backdrop {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 40;
                    animation: apFadeIn 0.2s ease;
                }
                .ap-backdrop.open { display: block; }
                @keyframes apFadeIn { from { opacity: 0; } to { opacity: 1; } }

                /* ── Sidebar ── */
                .ap-sidebar {
                    width: 260px;
                    min-width: 260px;
                    background: linear-gradient(180deg, #1e2a3a 0%, #0f172a 100%);
                    border-right: 1px solid rgba(255, 255, 255, 0.06);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    flex-shrink: 0;
                    transition: transform 0.3s ease;
                }

                /* ── Main area ── */
                .ap-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-width: 0;
                }

                /* ── Topbar ── */
                .ap-topbar {
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                    padding: 0 1rem;
                    height: 60px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-shrink: 0;
                    gap: 0.75rem;
                }

                .ap-topbar-left {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    min-width: 0;
                    flex: 1;
                }

                .ap-menu-btn {
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 0.5rem;
                    color: #94a3b8;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                    min-width: 38px;
                    min-height: 38px;
                }

                .ap-section-title {
                    font-weight: 700;
                    font-size: 1.05rem;
                    color: #f1f5f9;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .ap-store-link {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.5rem 0.875rem;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #94a3b8;
                    text-decoration: none;
                    font-size: 0.8rem;
                    white-space: nowrap;
                    flex-shrink: 0;
                    -webkit-tap-highlight-color: transparent;
                }

                .ap-content {
                    flex: 1;
                    overflow: auto;
                    padding: 1.25rem;
                }

                /* Nav items */
                .ap-nav-item {
                    display: flex;
                    align-items: center;
                    gap: 0.875rem;
                    padding: 0.8rem 1.25rem;
                    margin: 0.15rem 0.75rem;
                    border-radius: 10px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    white-space: nowrap;
                    transition: all 0.2s;
                    -webkit-tap-highlight-color: transparent;
                    touch-action: manipulation;
                    min-height: 48px;
                    border: none;
                    border-left: 3px solid transparent;
                    background: transparent;
                    width: calc(100% - 1.5rem);
                    text-align: left;
                    color: #94a3b8;
                    font-family: inherit;
                    font-weight: 400;
                }
                .ap-nav-item.active {
                    background: linear-gradient(90deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05));
                    color: #f87171;
                    border-left-color: #ef4444;
                    font-weight: 600;
                }
                .ap-nav-item:hover:not(.active) {
                    background: rgba(255, 255, 255, 0.05);
                    color: #cbd5e1;
                }

                /* ── MOBILE: sidebar becomes overlay drawer ── */
                @media (max-width: 768px) {
                    .ap-sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        height: 100dvh;
                        z-index: 50;
                        transform: translateX(-100%);
                        box-shadow: 4px 0 32px rgba(0, 0, 0, 0.6);
                    }
                    .ap-sidebar.open {
                        transform: translateX(0);
                    }
                    .ap-content {
                        padding: 1rem 0.75rem;
                    }
                    /* Hide "View Store" text, keep arrow */
                    .store-label { display: none; }
                }
            `}</style>

            <div className="ap-wrap">

                {/* Dark backdrop — tap closes sidebar on mobile */}
                <div
                    className={`ap-backdrop${sidebarOpen ? ' open' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                />

                {/* ── Sidebar ── */}
                <div className={`ap-sidebar${sidebarOpen ? ' open' : ''}`}>

                    {/* Logo header */}
                    <div style={{ padding: '1.25rem 1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FiShoppingCart size={20} color="white" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>KeltyAdmin</div>
                            <div style={{ fontSize: '0.7rem', color: '#475569' }}>Control Centre</div>
                        </div>
                        {/* X close button — always available, useful on mobile */}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.4rem', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent', flexShrink: 0 }}
                            aria-label="Close sidebar"
                        >
                            <FiX size={16} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.5rem 1.5rem', marginBottom: '0.25rem' }}>
                            Main Menu
                        </div>
                        {NAV.map(({ id, label, icon: Icon }) => {
                            const count = badgeCount(id);
                            return (
                                <button
                                    key={id}
                                    className={`ap-nav-item${section === id ? ' active' : ''}`}
                                    onClick={() => handleNavClick(id)}
                                >
                                    <Icon size={17} />
                                    <span style={{ flex: 1 }}>{label}</span>
                                    {count
                                        ? <span style={BADGE_STYLE}>{count}</span>
                                        : <FiChevronRight size={14} style={{ opacity: section === id ? 1 : 0.3 }} />
                                    }
                                </button>
                            );
                        })}
                    </nav>

                    {/* User info + Sign out */}
                    <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: '0.75rem' }}>
                            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                                {adminUser.name?.[0] ?? 'A'}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{adminUser.name}</div>
                                <div style={{ fontSize: '0.68rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminUser.email}</div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.6rem 0.875rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500, fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent', minHeight: 44 }}
                        >
                            <FiLogOut size={15} /> Sign Out
                        </button>
                    </div>
                </div>

                {/* ── Main content area ── */}
                <div className="ap-main">

                    {/* Topbar */}
                    <div className="ap-topbar">
                        <div className="ap-topbar-left">
                            <button
                                className="ap-menu-btn"
                                onClick={() => setSidebarOpen(o => !o)}
                                aria-label="Toggle menu"
                            >
                                <FiMenu size={18} />
                            </button>
                            <div style={{ minWidth: 0 }}>
                                <span className="ap-section-title">
                                    {NAV.find(n => n.id === section)?.label}
                                </span>
                                <span style={{ color: '#475569', fontSize: '0.78rem', marginLeft: '0.5rem' }}>
                                    / Kelty's Admin
                                </span>
                            </div>
                        </div>
                        <a href="/" target="_blank" rel="noreferrer" className="ap-store-link">
                            <span className="store-label">View Store</span> ↗
                        </a>
                    </div>

                    {/* Page section */}
                    <div className="ap-content">
                        {SECTIONS[section]}
                    </div>
                </div>
            </div>
        </>
    );
}
