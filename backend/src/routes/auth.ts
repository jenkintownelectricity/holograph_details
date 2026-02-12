import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryWithSchema, query } from '../db/connection.js';
import { signToken } from '../middleware/auth.js';
import { createTenantSchema } from '../db/migrate.js';
import type { AuthenticatedRequest } from '../types/express.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required.' });
      return;
    }

    if (!req.tenant) {
      res.status(401).json({ error: 'Tenant context required.' });
      return;
    }

    const result = await queryWithSchema(req.tenant.schemaName,
      'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const token = signToken({
      userId: user.id,
      tenantId: req.tenant.id,
      tenantSlug: req.tenant.slug,
      role: user.role,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: req.tenant.id,
        createdAt: '',
        updatedAt: '',
      },
      tenant: {
        id: req.tenant.id,
        slug: req.tenant.slug,
        name: req.tenant.slug, // Will be enriched
      },
    });
  } catch (err) {
    console.error('[auth/login]', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// POST /api/auth/register
router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, name, tenantSlug } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Email, password, and name required.' });
      return;
    }

    // If tenantSlug is provided and no tenant context, create new tenant
    let schemaName: string;
    let tenantId: string;
    let slug: string;

    if (tenantSlug && !req.tenant) {
      // Creating new tenant
      const newSlug = tenantSlug.toLowerCase().replace(/[^a-z0-9-]/g, '');
      schemaName = `tenant_${newSlug}`;

      const existingTenant = await query('SELECT id FROM tenants WHERE slug = $1', [newSlug]);
      if (existingTenant.rows.length > 0) {
        res.status(409).json({ error: 'Tenant slug already taken.' });
        return;
      }

      const tenantResult = await query(
        'INSERT INTO tenants (slug, name, schema_name) VALUES ($1, $2, $3) RETURNING id',
        [newSlug, name + "'s Organization", schemaName]
      );
      tenantId = tenantResult.rows[0].id;
      slug = newSlug;

      await createTenantSchema(schemaName);
    } else if (req.tenant) {
      schemaName = req.tenant.schemaName;
      tenantId = req.tenant.id;
      slug = req.tenant.slug;
    } else {
      res.status(400).json({ error: 'Tenant context or tenantSlug required.' });
      return;
    }

    // Check if user already exists
    const existingUser = await queryWithSchema(schemaName,
      'SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      res.status(409).json({ error: 'Email already registered.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = req.tenant ? 'viewer' : 'admin'; // First user gets admin

    const userResult = await queryWithSchema(schemaName,
      'INSERT INTO users (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, passwordHash, name, role]
    );

    const token = signToken({
      userId: userResult.rows[0].id,
      tenantId,
      tenantSlug: slug,
      role: role as 'admin' | 'editor' | 'viewer',
    });

    res.status(201).json({
      token,
      user: {
        id: userResult.rows[0].id,
        email,
        name,
        role,
        tenantId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      tenant: { id: tenantId, slug, name: slug },
    });
  } catch (err) {
    console.error('[auth/register]', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

export default router;
