import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { auth as authApi, setAuthToken, setTenantSlug, getAuthToken, getTenantSlug } from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

interface AuthState {
  user: User | null;
  tenantSlug: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; tenantSlug?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<string | null>(getTenantSlug());
  const [isLoading, setIsLoading] = useState(false);

  // Restore session from localStorage
  useEffect(() => {
    const token = getAuthToken();
    const slug = getTenantSlug();
    if (token && slug) {
      // Token exists — try to restore user from token payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.userId,
          email: '',
          name: '',
          role: payload.role,
          tenantId: payload.tenantId,
        });
        setTenant(slug);
      } catch {
        // Invalid token, clear
        setAuthToken(null);
        setTenantSlug(null);
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authApi.login(email, password);
      setAuthToken(result.token);
      setTenantSlug(result.tenant.slug);
      setUser(result.user);
      setTenant(result.tenant.slug);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; tenantSlug?: string }) => {
    setIsLoading(true);
    try {
      const result = await authApi.register(data);
      setAuthToken(result.token);
      setTenantSlug(result.tenant.slug);
      setUser(result.user);
      setTenant(result.tenant.slug);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setTenantSlug(null);
    setUser(null);
    setTenant(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      tenantSlug: tenant,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
