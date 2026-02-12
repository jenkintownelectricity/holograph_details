const API_BASE = '/api';

let authToken: string | null = localStorage.getItem('bim_token');
let tenantSlug: string | null = localStorage.getItem('bim_tenant');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('bim_token', token);
  else localStorage.removeItem('bim_token');
}

export function setTenantSlug(slug: string | null) {
  tenantSlug = slug;
  if (slug) localStorage.setItem('bim_tenant', slug);
  else localStorage.removeItem('bim_tenant');
}

export function getAuthToken() { return authToken; }
export function getTenantSlug() { return tenantSlug; }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (tenantSlug) headers['X-Tenant-ID'] = tenantSlug;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

// Auth
export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user: any; tenant: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { email: string; password: string; name: string; tenantSlug?: string }) =>
    request<{ token: string; user: any; tenant: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Details
export const details = {
  list: () =>
    request<{ details: any[] }>('/details'),

  get: (id: string) =>
    request<{ detail: any }>(`/details/${id}`),

  create: (data: any) =>
    request<{ detail: any }>('/details', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    request<{ detail: any }>(`/details/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ deleted: boolean }>(`/details/${id}`, { method: 'DELETE' }),

  getLayers: (id: string) =>
    request<{ layers: any[] }>(`/details/${id}/layers`),

  updateLayers: (id: string, layers: any[]) =>
    request<{ layers: any[] }>(`/details/${id}/layers`, {
      method: 'PUT',
      body: JSON.stringify({ layers }),
    }),
};

// Tenants
export const tenants = {
  list: () => request<{ tenants: any[] }>('/tenants'),
  settings: () => request<any>('/tenant/settings'),
};

// Products
export const products = {
  list: () => request<{ products: any[] }>('/products'),
};

// Health
export const health = () => request<{ status: string }>('/health');
