import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// User data (wishlist + orders) is stored per Firebase UID in localStorage
// so each user sees only their own data

const UserDataContext = createContext(null);

export const UserDataProvider = ({ children }) => {
    const { user } = useAuth();
    const uid = user?.uid ?? 'guest';

    const storageKey = (type) => `kelty_${type}_${uid}`;

    const [wishlist, setWishlist] = useState(() => {
        try { return JSON.parse(localStorage.getItem(storageKey('wishlist'))) || []; }
        catch { return []; }
    });

    const [orders, setOrders] = useState(() => {
        try { return JSON.parse(localStorage.getItem(storageKey('orders'))) || []; }
        catch { return []; }
    });

    // Re-load when user changes (login/logout)
    useEffect(() => {
        try {
            setWishlist(JSON.parse(localStorage.getItem(storageKey('wishlist'))) || []);
            setOrders(JSON.parse(localStorage.getItem(storageKey('orders'))) || []);
        } catch { /* ignore */ }
    }, [uid]); // eslint-disable-line

    // Persist wishlist
    useEffect(() => {
        localStorage.setItem(storageKey('wishlist'), JSON.stringify(wishlist));
    }, [wishlist, uid]); // eslint-disable-line

    // Persist orders
    useEffect(() => {
        localStorage.setItem(storageKey('orders'), JSON.stringify(orders));
    }, [orders, uid]); // eslint-disable-line

    // ── Wishlist helpers ─────────────────────────────────────────────────────────
    const addToWishlist = useCallback((product) => {
        setWishlist(prev =>
            prev.find(p => p.id === product.id) ? prev : [...prev, product]
        );
    }, []);

    const removeFromWishlist = useCallback((productId) => {
        setWishlist(prev => prev.filter(p => p.id !== productId));
    }, []);

    const toggleWishlist = useCallback((product) => {
        setWishlist(prev =>
            prev.find(p => p.id === product.id)
                ? prev.filter(p => p.id !== product.id)
                : [...prev, product]
        );
    }, []);

    const isWishlisted = useCallback((productId) => {
        return wishlist.some(p => p.id === productId);
    }, [wishlist]);

    // ── Orders helpers ───────────────────────────────────────────────────────────
    const placeOrder = useCallback((cartItems, delivery, totals) => {
        const order = {
            id: `ORD-${Date.now()}`,
            date: new Date().toLocaleDateString('en-GB'),
            items: cartItems,
            delivery,
            subtotal: totals.subtotal,
            deliveryFee: totals.deliveryFee,
            tax: totals.tax,
            total: totals.total,
            status: 'processing',
        };
        setOrders(prev => [order, ...prev]);
        return order;
    }, []);

    return (
        <UserDataContext.Provider value={{
            wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted,
            orders, placeOrder,
        }}>
            {children}
        </UserDataContext.Provider>
    );
};

export const useUserData = () => useContext(UserDataContext);
