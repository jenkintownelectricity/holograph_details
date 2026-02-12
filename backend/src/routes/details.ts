import { Router, Response } from 'express';
import { queryWithSchema } from '../db/connection.js';
import { authMiddleware, requireRole } from '../middleware/auth.js';
import type { AuthenticatedRequest } from '../types/express.js';

const router = Router();

// All detail routes require auth
router.use(authMiddleware as any);

// GET /api/details — list details for tenant
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.tenant) { res.status(401).json({ error: 'No tenant' }); return; }

    const result = await queryWithSchema(req.tenant.schemaName,
      `SELECT d.*, u.name as creator_name,
       (SELECT COUNT(*) FROM layers WHERE detail_id = d.id) as layer_count
       FROM details d
       LEFT JOIN users u ON d.created_by = u.id
       ORDER BY d.updated_at DESC`
    );

    res.json({ details: result.rows.map(rowToDetail) });
  } catch (err) {
    console.error('[details/list]', err);
    res.status(500).json({ error: 'Failed to list details.' });
  }
});

// GET /api/details/:id — get detail with layers
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.tenant) { res.status(401).json({ error: 'No tenant' }); return; }

    const detailResult = await queryWithSchema(req.tenant.schemaName,
      'SELECT * FROM details WHERE id = $1', [req.params.id]);

    if (detailResult.rows.length === 0) {
      res.status(404).json({ error: 'Detail not found.' });
      return;
    }

    const layerResult = await queryWithSchema(req.tenant.schemaName,
      'SELECT * FROM layers WHERE detail_id = $1 ORDER BY order_index', [req.params.id]);

    const detail = rowToDetail(detailResult.rows[0]);
    detail.layers = layerResult.rows.map(rowToLayer);

    res.json({ detail });
  } catch (err) {
    console.error('[details/get]', err);
    res.status(500).json({ error: 'Failed to get detail.' });
  }
});

// POST /api/details — create detail
router.post('/', requireRole('admin', 'editor') as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.tenant || !req.user) { res.status(401).json({ error: 'No tenant/user' }); return; }

    const { name, category, description, metadata, layers } = req.body;
    if (!name || !category) {
      res.status(400).json({ error: 'Name and category required.' });
      return;
    }

    const detailResult = await queryWithSchema(req.tenant.schemaName,
      `INSERT INTO details (name, category, description, metadata_json, created_by)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, category, description || '', JSON.stringify(metadata || {}), req.user.userId]
    );

    const detail = rowToDetail(detailResult.rows[0]);

    // Insert layers if provided
    if (layers && Array.isArray(layers)) {
      for (const layer of layers) {
        await queryWithSchema(req.tenant.schemaName,
          `INSERT INTO layers (detail_id, name, order_index, color, material_type, thickness_mm, product_name, manufacturer, csi_section, geometry_params_json, visible_default)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [detail.id, layer.name, layer.orderIndex, layer.color, layer.materialType, layer.thicknessMm, layer.productName, layer.manufacturer, layer.csiSection, JSON.stringify(layer.geometryParams || {}), layer.visibleDefault ?? true]
        );
      }
    }

    res.status(201).json({ detail });
  } catch (err) {
    console.error('[details/create]', err);
    res.status(500).json({ error: 'Failed to create detail.' });
  }
});

// PUT /api/details/:id — update detail
router.put('/:id', requireRole('admin', 'editor') as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.tenant) { res.status(401).json({ error: 'No tenant' }); return; }

    const { name, category, description, metadata } = req.body;
    const sets: string[] = [];
    const vals: unknown[] = [];
    let idx = 1;

    if (name) { sets.push(`name = $${idx++}`); vals.push(name); }
    if (category) { sets.push(`category = $${idx++}`); vals.push(category); }
    if (description !== undefined) { sets.push(`description = $${idx++}`); vals.push(description); }
    if (metadata) { sets.push(`metadata_json = $${idx++}`); vals.push(JSON.stringify(metadata)); }
    sets.push(`updated_at = NOW()`);
    vals.push(req.params.id);

    const result = await queryWithSchema(req.tenant.schemaName,
      `UPDATE details SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`, vals);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Detail not found.' });
      return;
    }

    res.json({ detail: rowToDetail(result.rows[0]) });
  } catch (err) {
    console.error('[details/update]', err);
    res.status(500).json({ error: 'Failed to update detail.' });
  }
});

// DELETE /api/details/:id — delete detail (admin only)
router.delete('/:id', requireRole('admin') as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.tenant) { res.status(401).json({ error: 'No tenant' }); return; }

    const result = await queryWithSchema(req.tenant.schemaName,
      'DELETE FROM details WHERE id = $1 RETURNING id', [req.params.id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Detail not found.' });
      return;
    }

    res.json({ deleted: true });
  } catch (err) {
    console.error('[details/delete]', err);
    res.status(500).json({ error: 'Failed to delete detail.' });
  }
});

// GET /api/details/:id/layers — get layers
router.get('/:id/layers', async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.tenant) { res.status(401).json({ error: 'No tenant' }); return; }

    const result = await queryWithSchema(req.tenant.schemaName,
      'SELECT * FROM layers WHERE detail_id = $1 ORDER BY order_index', [req.params.id]);

    res.json({ layers: result.rows.map(rowToLayer) });
  } catch (err) {
    console.error('[details/layers]', err);
    res.status(500).json({ error: 'Failed to get layers.' });
  }
});

// PUT /api/details/:id/layers — update layer visibility/order
router.put('/:id/layers', requireRole('admin', 'editor') as any, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.tenant) { res.status(401).json({ error: 'No tenant' }); return; }

    const { layers } = req.body;
    if (!layers || !Array.isArray(layers)) {
      res.status(400).json({ error: 'Layers array required.' });
      return;
    }

    for (const layer of layers) {
      const sets: string[] = [];
      const vals: unknown[] = [];
      let idx = 1;

      if (layer.orderIndex !== undefined) { sets.push(`order_index = $${idx++}`); vals.push(layer.orderIndex); }
      if (layer.visibleDefault !== undefined) { sets.push(`visible_default = $${idx++}`); vals.push(layer.visibleDefault); }
      if (layer.color) { sets.push(`color = $${idx++}`); vals.push(layer.color); }

      if (sets.length > 0) {
        vals.push(layer.id);
        await queryWithSchema(req.tenant.schemaName,
          `UPDATE layers SET ${sets.join(', ')} WHERE id = $${idx}`, vals);
      }
    }

    // Return updated layers
    const result = await queryWithSchema(req.tenant.schemaName,
      'SELECT * FROM layers WHERE detail_id = $1 ORDER BY order_index', [req.params.id]);

    res.json({ layers: result.rows.map(rowToLayer) });
  } catch (err) {
    console.error('[details/layers/update]', err);
    res.status(500).json({ error: 'Failed to update layers.' });
  }
});

function rowToDetail(row: any) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    metadata: row.metadata_json,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    layerCount: row.layer_count,
    creatorName: row.creator_name,
    layers: undefined as any,
  };
}

function rowToLayer(row: any) {
  return {
    id: row.id,
    detailId: row.detail_id,
    name: row.name,
    orderIndex: row.order_index,
    color: row.color,
    materialType: row.material_type,
    thicknessMm: row.thickness_mm,
    productName: row.product_name,
    manufacturer: row.manufacturer,
    csiSection: row.csi_section,
    geometryParams: row.geometry_params_json,
    visibleDefault: row.visible_default,
    createdAt: row.created_at,
  };
}

export default router;
