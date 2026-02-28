import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    subscribeWishlist,
    addToWishlistFS,
    removeFromWishlistFS,
    subscribeUserOrders,
    placeUserOrderFS,
} from '../services/firestoreService';

// User data (wishlist + orders) is stored per Firebase UID in Firestore
// so each user sees only their own data — persists across devices & browsers

const UserDataContext = createContext(null);

export const UserDataProvider = ({ children }) => {
    const { user } = useAuth();
    const uid = user?.uid ?? null;

    const [wishlist, setWishlist] = useState([]);
    const [orders, setOrders] = useState([]);

    // ── Subscribe to Firestore when user logs in, clear on logout ─────────────
    useEffect(() => {
        if (!uid) {
            setWishlist([]);
            setOrders([]);
            return;
        }

        const unsubWishlist = subscribeWishlist(uid, setWishlist);
        const unsubOrders = subscribeUserOrders(uid, (data) => {
            // Sort newest first
            setOrders([...data].sort((a, b) => {
                const ta = a.createdAt?.seconds ?? 0;
                const tb = b.createdAt?.seconds ?? 0;
                return tb - ta;
            }));
        });

        return () => {
            unsubWishlist();
            unsubOrders();
        };
    }, [uid]);

    // ── Wishlist helpers ──────────────────────────────────────────────────────
    const addToWishlist = useCallback(async (product) => {
        if (!uid) return;
        await addToWishlistFS(uid, product);
    }, [uid]);

    const removeFromWishlist = useCallback(async (productId) => {
        if (!uid) return;
        await removeFromWishlistFS(uid, productId);
    }, [uid]);

    const toggleWishlist = useCallback(async (product) => {
        if (!uid) return;
        const already = wishlist.find(p => p.id === product.id);
        if (already) {
            await removeFromWishlistFS(uid, product.id);
        } else {
            await addToWishlistFS(uid, product);
        }
    }, [uid, wishlist]);

    const isWishlisted = useCallback((productId) => {
        return wishlist.some(p => p.id === productId);
    }, [wishlist]);

    // ── Orders helpers ────────────────────────────────────────────────────────
    const placeOrder = useCallback(async (cartItems, delivery, totals) => {
        if (!uid) return null;
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
        await placeUserOrderFS(uid, order);
        return order;
    }, [uid]);

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
