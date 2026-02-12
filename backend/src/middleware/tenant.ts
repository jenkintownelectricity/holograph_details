import { Request, Response, NextFunction } from 'express';
import { query } from '../db/connection.js';
import type { AuthenticatedRequest, TenantContext } from '../types/express.js';

export async function tenantMiddleware(req: Request, res: Response, next: NextFunction) {
  const authReq = req as AuthenticatedRequest;

  // Try extracting tenant from:
  // 1. X-Tenant-ID header
  // 2. Subdomain
  // 3. URL path parameter
  let tenantSlug = req.headers['x-tenant-id'] as string | undefined;

  if (!tenantSlug) {
    const host = req.hostname;
    const parts = host.split('.');
    if (parts.length > 2) {
      tenantSlug = parts[0];
    }
  }

  if (!tenantSlug) {
    // Check for tenantSlug in route params or query
    tenantSlug = req.params.tenantSlug || (req.query.tenant as string);
  }

  if (!tenantSlug) {
    res.status(401).json({ error: 'Tenant identification required. Provide X-Tenant-ID header or use subdomain.' });
    return;
  }

  try {
    const result = await query(
      'SELECT id, slug, schema_name FROM tenants WHERE slug = $1',
      [tenantSlug]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: `Tenant '${tenantSlug}' not found.` });
      return;
    }

    const tenant = result.rows[0];
    authReq.tenant = {
      id: tenant.id,
      slug: tenant.slug,
      schemaName: tenant.schema_name,
    } as TenantContext;

    next();
  } catch (err) {
    console.error('[tenant] Resolution error:', err);
    res.status(500).json({ error: 'Failed to resolve tenant.' });
  }
}
