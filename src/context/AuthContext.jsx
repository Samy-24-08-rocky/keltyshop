import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  auth,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // wait for Firebase to restore session

  // ── Listen for Firebase auth state changes (persists across page refreshes) ───
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe; // cleanup on unmount
  }, []);

  // ── Email / Password sign-up ──────────────────────────────────────────────────
  const register = async (email, password, displayName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    setUser({ ...cred.user, displayName });
    return cred.user;
  };

  // ── Email / Password sign-in ──────────────────────────────────────────────────
  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  };

  // ── Google Sign-in ────────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred.user;
  };

  // ── Sign-out ──────────────────────────────────────────────────────────────────
  const logout = () => signOut(auth);

  // ── Password reset email ──────────────────────────────────────────────────────
  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, loginWithGoogle, logout, resetPassword }}>
      {/* Don't render children until Firebase has resolved the auth state */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);