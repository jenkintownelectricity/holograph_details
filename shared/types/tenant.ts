export interface Tenant {
  id: string;
  slug: string;
  name: string;
  schemaName: string;
  logoUrl?: string;
  primaryColor?: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  tenantId: string;
  brandName: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  footerText?: string;
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
}
