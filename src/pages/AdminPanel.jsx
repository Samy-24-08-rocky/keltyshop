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
import {
    FiGrid, FiPackage, FiShoppingBag, FiTruck, FiSettings,
    FiLogOut, FiMenu, FiX, FiShoppingCart, FiChevronRight, FiBarChart2,
    FiAlertTriangle, FiMessageSquare
} from 'react-icons/fi';

const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: FiGrid },
    { id: 'products', label: 'Products', icon: FiPackage },
    { id: 'stock', label: 'Stock Management', icon: FiAlertTriangle },
    { id: 'orders', label: 'Orders', icon: FiShoppingBag },
    { id: 'deliveries', label: 'Deliveries', icon: FiTruck },
    { id: 'reviews', label: 'Customer Reviews', icon: FiMessageSquare },
    { id: 'reports', label: 'Reports & Billing', icon: FiBarChart2 },
    { id: 'settings', label: 'Settings', icon: FiSettings },
];

const S = {
    wrap: { display: 'flex', height: '100vh', fontFamily: "'Inter',sans-serif", background: '#0f172a', color: '#f1f5f9', overflow: 'hidden' },
    sidebar: (open) => ({
        width: open ? 260 : 0,
        minWidth: open ? 260 : 0,
        background: 'linear-gradient(180deg,#1e2a3a 0%,#0f172a 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        transition: 'all .3s ease', overflow: 'hidden',
        position: 'relative',
    }),
    logo: { padding: '1.5rem 1.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '0.75rem' },
    logoIcon: { width: 40, height: 40, background: 'linear-gradient(135deg,#ef4444,#dc2626)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    navItem: (active) => ({
        display: 'flex', alignItems: 'center', gap: '0.875rem',
        padding: '0.75rem 1.25rem', margin: '0.15rem 0.75rem',
        borderRadius: 10, cursor: 'pointer',
        background: active ? 'linear-gradient(90deg,rgba(239,68,68,0.2),rgba(239,68,68,0.05))' : 'transparent',
        color: active ? '#f87171' : '#94a3b8',
        borderLeft: active ? '3px solid #ef4444' : '3px solid transparent',
        transition: 'all .2s', fontWeight: active ? 600 : 400, fontSize: '0.875rem',
        whiteSpace: 'nowrap',
    }),
    main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: { background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
    content: { flex: 1, overflow: 'auto', padding: '1.5rem' },
    badge: { background: '#ef4444', color: 'white', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', marginLeft: 'auto' },
};

export default function AdminPanel() {
    const [section, setSection] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);
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

    const SECTIONS = { dashboard: <AdminDashboard />, products: <AdminProducts />, stock: <AdminStock />, orders: <AdminOrders />, deliveries: <AdminDeliveries />, reviews: <AdminReviews />, reports: <AdminReports />, settings: <AdminSettings /> };

    return (
        <div style={S.wrap}>
            {/* Sidebar */}
            <div style={S.sidebar(sidebarOpen)}>
                <div style={S.logo}>
                    <div style={S.logoIcon}><FiShoppingCart size={20} color="white" /></div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>KeltyAdmin</div>
                        <div style={{ fontSize: '0.7rem', color: '#475569' }}>Control Centre</div>
                    </div>
                </div>

                <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0.5rem 1.5rem', marginBottom: '0.25rem' }}>Main Menu</div>
                    {NAV.map(({ id, label, icon: Icon }) => {
                        const count = badgeCount(id);
                        return (
                            <div key={id} style={S.navItem(section === id)} onClick={() => setSection(id)}>
                                <Icon size={17} />
                                <span style={{ flex: 1 }}>{label}</span>
                                {count ? <span style={S.badge}>{count}</span> : <FiChevronRight size={14} style={{ opacity: section === id ? 1 : 0.3 }} />}
                            </div>
                        );
                    })}
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: 10, marginBottom: '0.75rem' }}>
                        <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
                            {adminUser.name?.[0] ?? 'A'}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{adminUser.name}</div>
                            <div style={{ fontSize: '0.68rem', color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminUser.email}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.6rem 0.875rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#f87171', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}>
                        <FiLogOut size={15} /> Sign Out
                    </button>
                </div>
            </div>

            {/* Main */}
            <div style={S.main}>
                {/* Topbar */}
                <div style={S.topbar}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.5rem', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}>
                            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
                        </button>
                        <div>
                            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9' }}>{NAV.find(n => n.id === section)?.label}</span>
                            <span style={{ color: '#475569', fontSize: '0.8rem', marginLeft: '0.5rem' }}>/ Kelty's Admin</span>
                        </div>
                    </div>
                    <a href="/" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', textDecoration: 'none', fontSize: '0.8rem' }}>
                        View Store ↗
                    </a>
                </div>

                {/* Section content */}
                <div style={S.content}>{SECTIONS[section]}</div>
            </div>

            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{box-sizing:border-box} ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#334155;border-radius:4px}`}</style>
        </div>
    );
}
