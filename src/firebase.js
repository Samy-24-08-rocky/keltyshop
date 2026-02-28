// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import {
    getAuth,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    onAuthStateChanged,
    sendPasswordResetEmail,
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

// Initialise Firebase app
let app;
let auth;
let db;
let googleProvider;

if (isFirebaseConfigured) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        googleProvider = new GoogleAuthProvider();

        // Analytics — only initialise in browser environments (not SSR/Node)
        isSupported().then((yes) => { if (yes) getAnalytics(app); });
    } catch (error) {
        console.error("Firebase initialization failed:", error);
    }
} else {
    // Provide a mocked auth instance to prevent component crashes
    console.error("Firebase Environment Variables missing!");
    auth = { onAuthStateChanged: () => () => { }, currentUser: null };
    googleProvider = {};
}

// Re-export Firebase Auth helpers and the configuration flag
export {
    auth,
    db,
    googleProvider,
    isFirebaseConfigured,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    onAuthStateChanged,
    sendPasswordResetEmail,
};
