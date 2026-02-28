import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import {
    seedCollectionIfEmpty,
    subscribeProducts,
    addProductFS,
    updateProductFS,
    deleteProductFS,
    subscribeOrders,
    addOrderFS,
    updateOrderFS,
    deleteOrderFS,
    getSettings,
    saveSettings,
    subscribeSettings,
    subscribeTestimonials,
    addTestimonialFS,
    updateTestimonialFS,
    deleteTestimonialFS,
} from '../services/firestoreService';

// ─── Initial seed data (used only on first run to populate Firestore) ─────────
const INITIAL_PRODUCTS = [
    { id: 1, name: 'Extra Virgin Olive Oil', price: 5.99, oldPrice: 7.49, rating: 4.8, category: 'Pantry', stock: 15, featured: true, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=80' },
    { id: 2, name: 'Fresh Milk', price: 1.19, oldPrice: null, rating: 4.5, category: 'Dairy', stock: 8, featured: true, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80' },
    { id: 3, name: 'Whole Wheat Bread', price: 0.99, oldPrice: 1.29, rating: 4.3, category: 'Bakery', stock: 3, featured: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
    { id: 4, name: 'Whole Wheat Pasta', price: 1.89, oldPrice: null, rating: 4.7, category: 'Pantry', stock: 0, featured: true, image: 'https://images.unsplash.com/photo-1551326844-4df70f78d0e9?auto=format&fit=crop&w=800&q=80' },
    { id: 5, name: 'Premium Beef Steak', price: 8.99, oldPrice: 11.99, rating: 4.9, category: 'Meat', stock: 12, featured: true, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80' },
    { id: 6, name: 'Basmati Rice', price: 2.69, oldPrice: 3.99, rating: 4.6, category: 'Pantry', stock: 25, featured: true, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80' },
    { id: 7, name: 'Fresh Salmon Fillet', price: 10.99, oldPrice: 14.99, rating: 4.7, category: 'Seafood', stock: 6, featured: true, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80' },
    { id: 8, name: 'Organic Eggs', price: 2.49, oldPrice: null, rating: 4.8, category: 'Dairy', stock: 18, featured: true, image: 'https://images.unsplash.com/photo-1587486913049-53fc8895d1e4?auto=format&fit=crop&w=800&q=80' },
    { id: 9, name: 'Greek Yogurt', price: 1.49, oldPrice: 1.99, rating: 4.4, category: 'Dairy', stock: 10, featured: false, image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80' },
    { id: 10, name: 'Canned Organic Beans', price: 1.29, oldPrice: null, rating: 4.3, category: 'Pantry', stock: 20, featured: false, image: 'https://images.unsplash.com/photo-1610444391207-6bbdc8bde92a?auto=format&fit=crop&w=800&q=80' },
    { id: 11, name: 'Tomato Ketchup', price: 2.49, oldPrice: null, rating: 4.6, category: 'Condiments', stock: 30, featured: false, image: 'https://images.unsplash.com/photo-1528751512423-745a86dca50a?auto=format&fit=crop&w=800&q=80' },
    { id: 12, name: 'Mayonnaise', price: 3.49, oldPrice: 3.99, rating: 4.5, category: 'Condiments', stock: 22, featured: false, image: 'https://images.unsplash.com/photo-1626082928503-247502cd8b8a?auto=format&fit=crop&w=800&q=80' },
    { id: 13, name: 'Free Range Chicken Breast', price: 6.99, oldPrice: null, rating: 4.8, category: 'Meat', stock: 14, featured: false, image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80' },
    { id: 14, name: 'Cheddar Cheese Block', price: 4.49, oldPrice: 5.49, rating: 4.7, category: 'Dairy', stock: 19, featured: true, image: 'https://images.unsplash.com/photo-1618164436241-4473940d1f5c?auto=format&fit=crop&w=800&q=80' },
    { id: 15, name: 'Unsalted Butter', price: 3.29, oldPrice: null, rating: 4.6, category: 'Dairy', stock: 25, featured: false, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=800&q=80' },
    { id: 16, name: 'Roasted Coffee Beans', price: 8.99, oldPrice: 10.99, rating: 4.9, category: 'Drinks', stock: 40, featured: true, image: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=800&q=80' },
    { id: 17, name: 'Earl Grey Tea Bags', price: 3.99, oldPrice: null, rating: 4.5, category: 'Drinks', stock: 35, featured: false, image: 'https://images.unsplash.com/photo-1576092762791-dd9e2220afa1?auto=format&fit=crop&w=800&q=80' },
    { id: 18, name: 'Tortilla Chips', price: 2.99, oldPrice: 3.49, rating: 4.4, category: 'Snacks', stock: 50, featured: true, image: 'https://images.unsplash.com/photo-1601056586616-a36c96e6a1d8?auto=format&fit=crop&w=800&q=80' },
    { id: 19, name: 'Dark Chocolate Bar', price: 2.49, oldPrice: null, rating: 4.8, category: 'Snacks', stock: 28, featured: false, image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80' },
    { id: 20, name: 'All-Purpose Flour', price: 1.99, oldPrice: null, rating: 4.7, category: 'Pantry', stock: 60, featured: false, image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=800&q=80' },
    { id: 21, name: 'Granulated Sugar', price: 1.89, oldPrice: null, rating: 4.6, category: 'Pantry', stock: 45, featured: false, image: 'https://images.unsplash.com/photo-1626442385808-01d00c410be6?auto=format&fit=crop&w=800&q=80' },
    { id: 22, name: 'Honey Nut Cereal', price: 4.99, oldPrice: 5.99, rating: 4.5, category: 'Breakfast', stock: 12, featured: false, image: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=800&q=80' },
    { id: 23, name: 'Frozen Pepperoni Pizza', price: 5.49, oldPrice: 6.99, rating: 4.4, category: 'Frozen', stock: 15, featured: false, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80' },
    { id: 24, name: 'Creamy Peanut Butter', price: 3.99, oldPrice: 4.49, rating: 4.8, category: 'Pantry', stock: 20, featured: false, image: 'https://images.unsplash.com/photo-1611077544025-3004bb1b7473?auto=format&fit=crop&w=800&q=80' },
    { id: 25, name: 'Hazelnut Chocolate Spread', price: 4.99, oldPrice: null, rating: 4.9, category: 'Pantry', stock: 25, featured: true, image: 'https://images.unsplash.com/photo-1558299831-299e5cb3b302?auto=format&fit=crop&w=800&q=80' },
    { id: 26, name: 'Alfredo Pasta Sauce', price: 3.49, oldPrice: null, rating: 4.3, category: 'Condiments', stock: 18, featured: false, image: 'https://images.unsplash.com/photo-1596796333904-8d4885fe7f86?auto=format&fit=crop&w=800&q=80' },
    { id: 27, name: 'Canned Tuna in Spring Water', price: 1.99, oldPrice: null, rating: 4.6, category: 'Pantry', stock: 35, featured: false, image: 'https://images.unsplash.com/photo-1600854495567-270ebc0c5383?auto=format&fit=crop&w=800&q=80' },
    { id: 28, name: 'Sparkling Mineral Water', price: 1.49, oldPrice: null, rating: 4.5, category: 'Drinks', stock: 55, featured: false, image: 'https://images.unsplash.com/photo-1518175027810-093354cb4691?auto=format&fit=crop&w=800&q=80' },
    { id: 29, name: 'Unsweetened Almond Milk', price: 2.99, oldPrice: 3.49, rating: 4.7, category: 'Dairy', stock: 22, featured: true, image: 'https://images.unsplash.com/photo-1626084478171-8408f90eb017?auto=format&fit=crop&w=800&q=80' },
    { id: 30, name: 'Himalayan Pink Salt Grinder', price: 4.99, oldPrice: null, rating: 4.9, category: 'Pantry', stock: 16, featured: false, image: 'https://images.unsplash.com/photo-1518214598173-12eeeef30fb9?auto=format&fit=crop&w=800&q=80' },
];

const INITIAL_ORDERS = [
    { id: 'ORD-001', customer: 'Alice Johnson', email: 'alice@example.com', date: '2026-02-27', items: 3, total: 18.45, status: 'delivered', delivery: 'Standard', address: '12 Oak St, London' },
    { id: 'ORD-002', customer: 'Bob Smith', email: 'bob@example.com', date: '2026-02-26', items: 5, total: 42.30, status: 'out_for_delivery', delivery: 'Express', address: '45 Maple Ave, Edinburgh' },
    { id: 'ORD-003', customer: 'Carol White', email: 'carol@example.com', date: '2026-02-26', items: 2, total: 11.50, status: 'processing', delivery: 'Same Day', address: '7 Pine Rd, Glasgow' },
    { id: 'ORD-004', customer: 'David Brown', email: 'david@example.com', date: '2026-02-25', items: 8, total: 67.80, status: 'delivered', delivery: 'Standard', address: '89 Birch Lane, Manchester' },
    { id: 'ORD-005', customer: 'Eva Green', email: 'eva@example.com', date: '2026-02-25', items: 1, total: 8.99, status: 'cancelled', delivery: 'Express', address: '33 Cedar Blvd, Bristol' },
    { id: 'ORD-006', customer: 'Frank Miller', email: 'frank@example.com', date: '2026-02-24', items: 4, total: 29.60, status: 'processing', delivery: 'Standard', address: '56 Elm St, Leeds' },
    { id: 'ORD-007', customer: 'Grace Lee', email: 'grace@example.com', date: '2026-02-23', items: 6, total: 55.20, status: 'delivered', delivery: 'Same Day', address: '22 Willow Ct, Birmingham' },
];

const INITIAL_SETTINGS = {
    storeName: "Kelty's Mini Market",
    tagline: 'Fresh Groceries, Delivered Fast',
    freeDeliveryThreshold: 30,
    taxRate: 5,
    standardDelivery: 3.99,
    expressDelivery: 6.99,
    sameDayDelivery: 9.99,
    maintenanceMode: false,
    allowNewRegistrations: true,
    featuredProductsCount: 8,
    orderConfirmation: 'auto',
    heroProductId: 5,
    deliveryOptions: [
        { id: 'standard', label: 'Standard Delivery', description: 'Delivered by Royal Mail · 2–3 business days', time: '2–3 business days', price: 3.99, enabled: true },
        { id: 'express', label: 'Express Delivery', description: 'Order before 3 pm for next-day delivery', time: 'Next day', price: 6.99, enabled: true },
        { id: 'sameday', label: 'Same-Day Delivery', description: 'Order before 1 pm — arrive by 9 pm today', time: 'Same day by 9 pm', price: 9.99, enabled: true },
    ],
};

const INITIAL_TESTIMONIALS = [
    { id: 1, name: 'Sarah Johnson', role: 'Local Resident', rating: 5, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80', text: "Kelty's has been my go-to market for years! The quality is unmatched and I love the wide selection of pantry staples.", isApproved: true, date: '2026-02-15' },
    { id: 2, name: 'Michael Chen', role: 'Professional Chef', rating: 5, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80', text: "As a chef, I demand quality ingredients. Kelty's consistently delivers premium products that elevate my dishes. Delivery is always on time!", isApproved: true, date: '2026-02-10' },
    { id: 3, name: 'Emma Rodriguez', role: 'Busy Mum of Three', rating: 5, image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', text: "With three kids and a full-time job, grocery shopping was stressful. Kelty's has been a lifesaver — easy website, prompt delivery, top quality.", isApproved: true, date: '2026-02-05' },
];

// ─── Context ───────────────────────────────────────────────────────────────────
const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [settings, setSettings] = useState(INITIAL_SETTINGS);
    const [testimonials, setTestimonials] = useState([]);
    const [adminUser, setAdminUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('admin_user_v3')); }
        catch { return null; }
    });
    const [loading, setLoading] = useState(true);

    // ── Seed Firestore on first load, then subscribe to real-time updates ─────
    useEffect(() => {
        let unsubProducts, unsubOrders, unsubSettings, unsubTestimonials;

        const init = async () => {
            try {
                // Seed collections if they are empty (first run only)
                await Promise.all([
                    seedCollectionIfEmpty('products', INITIAL_PRODUCTS),
                    seedCollectionIfEmpty('orders', INITIAL_ORDERS),
                    seedCollectionIfEmpty('testimonials', INITIAL_TESTIMONIALS),
                ]);

                // Seed settings document if missing
                const existingSettings = await getSettings();
                if (!existingSettings) {
                    await saveSettings(INITIAL_SETTINGS);
                }
            } catch (err) {
                console.error('Firestore seed error:', err);
            }

            // Subscribe to real-time listeners
            unsubProducts = subscribeProducts(setProducts);
            unsubOrders = subscribeOrders(setOrders);
            unsubSettings = subscribeSettings((s) =>
                setSettings(prev => ({ ...INITIAL_SETTINGS, ...prev, ...s }))
            );
            unsubTestimonials = subscribeTestimonials(setTestimonials);

            setLoading(false);
        };

        init();

        return () => {
            unsubProducts?.();
            unsubOrders?.();
            unsubSettings?.();
            unsubTestimonials?.();
        };
    }, []);

    // ── Admin auth ────────────────────────────────────────────────────────────
    const adminLogin = useCallback((email, password) => {
        const expectedEmail =
            localStorage.getItem('admin_custom_email') ||
            import.meta.env.VITE_ADMIN_EMAIL ||
            'admin@kelty.com';
        const expectedPassword =
            localStorage.getItem('admin_custom_password') ||
            import.meta.env.VITE_ADMIN_PASSWORD ||
            'admin123';

        if (email.trim().toLowerCase() === expectedEmail && password === expectedPassword) {
            const user = { email: email.trim().toLowerCase(), name: 'Admin', role: 'superadmin' };
            setAdminUser(user);
            localStorage.setItem('admin_user_v3', JSON.stringify(user));
            return true;
        }
        return false;
    }, []);

    const adminLogout = useCallback(() => {
        setAdminUser(null);
        localStorage.removeItem('admin_user_v3');
    }, []);

    // ── Products CRUD ─────────────────────────────────────────────────────────
    const addProduct = useCallback(async (product) => {
        const newId = Math.max(...products.map(p => p.id ?? 0), 0) + 1;
        await addProductFS({ ...product, id: newId });
    }, [products]);

    const updateProduct = useCallback(async (id, updates) => {
        const target = products.find(p => p.id === id);
        if (target?._docId) await updateProductFS(target._docId, updates);
    }, [products]);

    const deleteProduct = useCallback(async (id) => {
        const target = products.find(p => p.id === id);
        if (target?._docId) await deleteProductFS(target._docId);
    }, [products]);

    const toggleFeatured = useCallback(async (id) => {
        const target = products.find(p => p.id === id);
        if (target?._docId) await updateProductFS(target._docId, { featured: !target.featured });
    }, [products]);

    // ── Orders ────────────────────────────────────────────────────────────────
    const updateOrderStatus = useCallback(async (id, status) => {
        const target = orders.find(o => o.id === id);
        if (!target) return;
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        try {
            if (target._docId) await updateOrderFS(target._docId, { status });
        } catch (err) { console.error('updateOrderStatus failed:', err); }
    }, [orders]);

    const addOrder = useCallback(async (order) => {
        const num = Math.max(...orders.map(o => parseInt(o.id?.replace('ORD-', '')) || 0), 0) + 1;
        const newId = `ORD-${String(num).padStart(3, '0')}`;
        await addOrderFS({ ...order, id: newId });
    }, [orders]);

    const updateOrder = useCallback(async (id, updates) => {
        const target = orders.find(o => o.id === id);
        if (!target) return;
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, ...updates } : o));
        try {
            if (target._docId) await updateOrderFS(target._docId, updates);
        } catch (err) { console.error('updateOrder failed:', err); }
    }, [orders]);

    // Soft delete — marks as deleted, keeps in Firestore (recoverable)
    const softDeleteOrder = useCallback(async (id) => {
        const target = orders.find(o => o.id === id);
        if (!target) return;
        const patch = { _deleted: true, _deletedAt: new Date().toISOString() };
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
        try {
            if (target._docId) await updateOrderFS(target._docId, patch);
        } catch (err) { console.error('softDeleteOrder failed:', err); }
    }, [orders]);

    // Restore a soft-deleted order
    const restoreOrder = useCallback(async (id) => {
        const target = orders.find(o => o.id === id);
        if (!target) return;
        const patch = { _deleted: false, _deletedAt: null };
        // Optimistic update
        setOrders(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
        try {
            if (target._docId) await updateOrderFS(target._docId, patch);
        } catch (err) { console.error('restoreOrder failed:', err); }
    }, [orders]);

    // Permanent delete — removes from Firestore and local state immediately
    const deleteOrder = useCallback(async (id) => {
        const target = orders.find(o => o.id === id);
        if (!target) { console.warn('deleteOrder: order not found', id); return; }

        // _docId is the Firestore document ID from the real-time listener.
        // For seeded orders the Firestore doc ID matches the order's own id field.
        const firestoreDocId = target._docId || target.id;
        console.log('deleteOrder → Firestore docId:', firestoreDocId, '| order:', target);

        // Optimistic remove from local state immediately
        setOrders(prev => prev.filter(o => o.id !== id));
        try {
            await deleteOrderFS(firestoreDocId);
            console.log('deleteOrder → success:', firestoreDocId);
        } catch (err) {
            console.error('deleteOrder → FAILED:', err);
            // Rollback UI if Firestore delete failed
            setOrders(prev => [...prev, target]);
            alert(`Delete failed: ${err.message}\nCheck browser console for details.`);
        }
    }, [orders]);

    // ── Settings ──────────────────────────────────────────────────────────────
    const updateSettings = useCallback(async (updates) => {
        const merged = { ...settings, ...updates };
        setSettings(merged); // optimistic local update
        await saveSettings(merged);
    }, [settings]);

    // ── Testimonials ──────────────────────────────────────────────────────────
    const addTestimonial = useCallback(async (testimonial) => {
        const newId = Math.max(...testimonials.map(t => t.id ?? 0), 0) + 1;
        await addTestimonialFS({ ...testimonial, id: newId });
    }, [testimonials]);

    const updateTestimonial = useCallback(async (id, updates) => {
        const target = testimonials.find(t => t.id === id);
        if (target?._docId) await updateTestimonialFS(target._docId, updates);
    }, [testimonials]);

    const deleteTestimonial = useCallback(async (id) => {
        const target = testimonials.find(t => t.id === id);
        if (target?._docId) await deleteTestimonialFS(target._docId);
    }, [testimonials]);

    // ── Stats ─────────────────────────────────────────────────────────────────
    const stats = {
        totalRevenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'processing').length,
        outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        totalProducts: products.length,
        lowStockProducts: products.filter(p => p.stock > 0 && p.stock <= 5).length,
        outOfStockProducts: products.filter(p => p.stock === 0).length,
        totalCustomers: [...new Set(orders.map(o => o.email))].length,
    };

    return (
        <AdminContext.Provider value={{
            loading,
            products, addProduct, updateProduct, deleteProduct, toggleFeatured,
            orders, updateOrderStatus, addOrder, updateOrder, deleteOrder, softDeleteOrder, restoreOrder,
            settings, updateSettings,
            testimonials, addTestimonial, updateTestimonial, deleteTestimonial,
            adminUser, adminLogin, adminLogout,
            stats,
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
