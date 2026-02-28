// src/services/firestoreService.js
// ─── All Firestore read / write operations for the Kelty grocery store ──────
import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    writeBatch,
    serverTimestamp,
    query,
    orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';

// ─── Collection references ───────────────────────────────────────────────────
const col = (name) => collection(db, name);

// ═══════════════════════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Fetch all docs from a collection and return as an array */
const fetchAll = async (collectionName) => {
    const snap = await getDocs(col(collectionName));
    return snap.docs.map(d => ({ ...d.data(), _docId: d.id }));
};

/** Seed a collection with an array of objects (only if the collection is empty) */
export const seedCollectionIfEmpty = async (collectionName, items) => {
    const snap = await getDocs(col(collectionName));
    if (!snap.empty) return false; // already seeded

    const batch = writeBatch(db);
    items.forEach(item => {
        // Use item.id as the Firestore document ID so queries by id still work
        const ref = doc(db, collectionName, String(item.id ?? item.name ?? Math.random()));
        batch.set(ref, { ...item, _seeded: true, createdAt: serverTimestamp() });
    });
    await batch.commit();
    return true;
};

// ═══════════════════════════════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════════════════════════════

export const getProducts = () => fetchAll('products');

export const addProductFS = async (product) => {
    const ref = await addDoc(col('products'), { ...product, createdAt: serverTimestamp() });
    return ref.id;
};

export const updateProductFS = async (docId, updates) => {
    await updateDoc(doc(db, 'products', String(docId)), updates);
};

export const deleteProductFS = async (docId) => {
    await deleteDoc(doc(db, 'products', String(docId)));
};

/** Real-time listener — calls onChange(products[]) whenever Firestore changes */
export const subscribeProducts = (onChange) => {
    return onSnapshot(col('products'), (snap) => {
        onChange(snap.docs.map(d => ({ ...d.data(), _docId: d.id })));
    });
};

// ═══════════════════════════════════════════════════════════════════════════════
//  ORDERS  (admin-level global orders)
// ═══════════════════════════════════════════════════════════════════════════════

export const getOrders = () => fetchAll('orders');

export const addOrderFS = async (order) => {
    const ref = await addDoc(col('orders'), { ...order, createdAt: serverTimestamp() });
    return ref.id;
};

export const updateOrderFS = async (docId, updates) => {
    await updateDoc(doc(db, 'orders', String(docId)), updates);
};

export const deleteOrderFS = async (docId) => {
    await deleteDoc(doc(db, 'orders', String(docId)));
};

export const subscribeOrders = (onChange) => {
    return onSnapshot(col('orders'), (snap) => {
        onChange(snap.docs.map(d => ({ ...d.data(), _docId: d.id })));
    });
};

// ═══════════════════════════════════════════════════════════════════════════════
//  SETTINGS  (single document: settings/main)
// ═══════════════════════════════════════════════════════════════════════════════

const SETTINGS_REF = () => doc(db, 'settings', 'main');

export const getSettings = async () => {
    const snap = await getDoc(SETTINGS_REF());
    return snap.exists() ? snap.data() : null;
};

export const saveSettings = async (settings) => {
    await setDoc(SETTINGS_REF(), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
};

export const subscribeSettings = (onChange) => {
    return onSnapshot(SETTINGS_REF(), (snap) => {
        if (snap.exists()) onChange(snap.data());
    });
};

// ═══════════════════════════════════════════════════════════════════════════════
//  TESTIMONIALS
// ═══════════════════════════════════════════════════════════════════════════════

export const getTestimonials = () => fetchAll('testimonials');

export const addTestimonialFS = async (testimonial) => {
    const ref = await addDoc(col('testimonials'), { ...testimonial, createdAt: serverTimestamp() });
    return ref.id;
};

export const updateTestimonialFS = async (docId, updates) => {
    await updateDoc(doc(db, 'testimonials', String(docId)), updates);
};

export const deleteTestimonialFS = async (docId) => {
    await deleteDoc(doc(db, 'testimonials', String(docId)));
};

export const subscribeTestimonials = (onChange) => {
    return onSnapshot(col('testimonials'), (snap) => {
        onChange(snap.docs.map(d => ({ ...d.data(), _docId: d.id })));
    });
};

// ═══════════════════════════════════════════════════════════════════════════════
//  USER DATA  (per Firebase UID — wishlist & personal orders)
// ═══════════════════════════════════════════════════════════════════════════════

/** Path: users/{uid}/wishlist/{productId} */
export const getUserWishlist = async (uid) => {
    const snap = await getDocs(collection(db, 'users', uid, 'wishlist'));
    return snap.docs.map(d => d.data());
};

export const addToWishlistFS = async (uid, product) => {
    await setDoc(doc(db, 'users', uid, 'wishlist', String(product.id)), product);
};

export const removeFromWishlistFS = async (uid, productId) => {
    await deleteDoc(doc(db, 'users', uid, 'wishlist', String(productId)));
};

export const subscribeWishlist = (uid, onChange) => {
    return onSnapshot(collection(db, 'users', uid, 'wishlist'), (snap) => {
        onChange(snap.docs.map(d => d.data()));
    });
};

/** Path: users/{uid}/orders/{orderId} */
export const getUserOrders = async (uid) => {
    const snap = await getDocs(collection(db, 'users', uid, 'orders'));
    return snap.docs.map(d => ({ ...d.data(), _docId: d.id }));
};

export const placeUserOrderFS = async (uid, order) => {
    const ref = await addDoc(collection(db, 'users', uid, 'orders'), {
        ...order,
        createdAt: serverTimestamp(),
    });
    return ref.id;
};

export const subscribeUserOrders = (uid, onChange) => {
    return onSnapshot(collection(db, 'users', uid, 'orders'), (snap) => {
        onChange(snap.docs.map(d => ({ ...d.data(), _docId: d.id })));
    });
};
