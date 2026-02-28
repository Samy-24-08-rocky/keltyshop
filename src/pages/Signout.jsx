import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    logout().then(() => navigate('/'));
  }, []); // eslint-disable-line

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid #fecaca', borderTopColor: '#ef4444', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 1rem' }} />
        <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>Signing you out…</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
};

export default Signout;