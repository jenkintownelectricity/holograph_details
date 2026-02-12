import { Router, Response } from 'express';
import { query } from '../db/connection.js';
import type { AuthenticatedRequest } from '../types/express.js';

const router = Router();

// POST /api/tenants — create new tenant (no auth needed for self-serve signup)
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      res.status(400).json({ error: 'Name and slug required.' });
      return;
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleanSlug.length < 2) {
      res.status(400).json({ error: 'Slug must be at least 2 characters.' });
      return;
    }

    const existing = await query('SELECT id FROM tenants WHERE slug = $1', [cleanSlug]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Slug already taken.' });
      return;
    }

    const schemaName = `tenant_${cleanSlug}`;
    const result = await query(
      'INSERT INTO tenants (slug, name, schema_name) VALUES ($1, $2, $3) RETURNING *',
      [cleanSlug, name, schemaName]
    );

    res.status(201).json({ tenant: result.rows[0] });
  } catch (err) {
    console.error('[tenants/create]', err);
    res.status(500).json({ error: 'Failed to create tenant.' });
  }
});

// GET /api/tenants — list tenants (public, for tenant selector)
router.get('/', async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await query('SELECT id, slug, name, plan, created_at FROM tenants ORDER BY name');
    res.json({ tenants: result.rows });
  } catch (err) {
    console.error('[tenants/list]', err);
    res.status(500).json({ error: 'Failed to list tenants.' });
  }
});

// GET /api/tenant/settings — current tenant config
router.get('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.tenant) {
      res.status(401).json({ error: 'Tenant context required.' });
      return;
    }

    const result = await query('SELECT * FROM tenants WHERE id = $1', [req.tenant.id]);
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Tenant not found.' });
      return;
    }

    const t = result.rows[0];
    res.json({
      tenantId: t.id,
      brandName: t.name,
      logoUrl: t.logo_url,
      primaryColor: t.primary_color,
      secondaryColor: '#2563eb',
      footerText: `© 2026 ${t.name}`,
    });
  } catch (err) {
    console.error('[tenant/settings]', err);
    res.status(500).json({ error: 'Failed to get settings.' });
  }
});

export default router;
