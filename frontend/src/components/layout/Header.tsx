import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTenant } from '../../contexts/TenantContext';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { settings } = useTenant();

  return (
    <header style={{
      height: 56,
      background: settings?.primaryColor || '#1a365d',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      zIndex: 10,
    }}>
      <div>
        <h1 style={{ fontSize: 16, fontWeight: 600, letterSpacing: 1.5, margin: 0 }}>
          3D BIM DETAIL VIEWER — ROOFING &amp; WATERPROOFING
        </h1>
        <div style={{ fontSize: 11, color: '#94a3b8', letterSpacing: 0.5 }}>
          {settings?.brandName || 'SaaS Platform'}
        </div>
      </div>
      {isAuthenticated && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>{user?.name || user?.email}</span>
          <button
            onClick={logout}
            style={{
              padding: '5px 14px',
              background: 'transparent',
              border: '1px solid #475569',
              borderRadius: 16,
              color: '#94a3b8',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
