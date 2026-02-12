import React, { createContext, useContext, useState, useEffect } from 'react';
import { tenants as tenantsApi, setTenantSlug } from '../services/api';
import { useAuth } from './AuthContext';

interface TenantSettings {
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  footerText?: string;
}

interface TenantState {
  slug: string | null;
  settings: TenantSettings | null;
  isLoading: boolean;
  selectTenant: (slug: string) => void;
}

const DEFAULT_SETTINGS: TenantSettings = {
  brandName: '3D BIM Detail Viewer',
  primaryColor: '#1a365d',
  secondaryColor: '#2563eb',
  footerText: '© 2026 Lefebvre Design Solutions LLC / ValidKernel',
};

const TenantContext = createContext<TenantState | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { tenantSlug, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<TenantSettings | null>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tenantSlug && isAuthenticated) {
      setIsLoading(true);
      tenantsApi.settings()
        .then(s => setSettings(s))
        .catch(() => setSettings(DEFAULT_SETTINGS))
        .finally(() => setIsLoading(false));
    }
  }, [tenantSlug, isAuthenticated]);

  const selectTenant = (slug: string) => {
    setTenantSlug(slug);
  };

  return (
    <TenantContext.Provider value={{ slug: tenantSlug, settings, isLoading, selectTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}
