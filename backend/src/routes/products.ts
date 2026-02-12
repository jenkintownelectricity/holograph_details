import { Router, Response } from 'express';
import { queryWithSchema } from '../db/connection.js';
import { authMiddleware } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types/express.js';

const router = Router();

router.use(authMiddleware as any);

// GET /api/products — product catalog for tenant
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.tenant) { res.status(401).json({ error: 'No tenant' }); return; }

    const result = await queryWithSchema(req.tenant.schemaName,
      'SELECT * FROM products ORDER BY manufacturer, name'
    );

    res.json({ products: result.rows });
  } catch (err) {
    console.error('[products/list]', err);
    res.status(500).json({ error: 'Failed to list products.' });
  }
});

export default router;
