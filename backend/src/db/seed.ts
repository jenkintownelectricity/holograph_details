import bcrypt from 'bcryptjs';
import { query, queryWithSchema, closePool } from './connection.js';
import { createMasterSchema, createTenantSchema } from './migrate.js';

const PARAPET_LAYERS = [
  { name: "Structural Deck",    color: "#888888", thickness_mm: 152.4, order_index: 1,  material_type: "concrete",   product_name: "Concrete or steel deck",     manufacturer: null,          csi_section: "03 30 00", geometry_params: { type: "box", width: 2.4, height: 0.30, depth: 2.0, positionY: 0.15 } },
  { name: "Vapor Retarder",      color: "#4488CC", thickness_mm: 1.5,   order_index: 2,  material_type: "membrane",   product_name: "Self-adhered vapor retarder", manufacturer: null,          csi_section: "07 26 00", geometry_params: { type: "box", width: 2.4, height: 0.02, depth: 2.0, positionY: 0.31 } },
  { name: "Insulation (Polyiso)", color: "#FFCC00", thickness_mm: 76.2,  order_index: 3,  material_type: "insulation", product_name: "Tapered polyiso, 3\"",        manufacturer: null,          csi_section: "07 22 00", geometry_params: { type: "box", width: 2.4, height: 0.15, depth: 2.0, positionY: 0.395 } },
  { name: "Cover Board",         color: "#CCCCCC", thickness_mm: 12.7,  order_index: 4,  material_type: "coverboard", product_name: "Gypsum or HD polyiso, 0.5\"", manufacturer: null,          csi_section: "07 22 16", geometry_params: { type: "box", width: 2.4, height: 0.03, depth: 2.0, positionY: 0.485 } },
  { name: "Roofing Membrane",    color: "#333333", thickness_mm: 8.0,   order_index: 5,  material_type: "membrane",   product_name: "2-ply base + cap sheet",     manufacturer: "GCP / Saint-Gobain", csi_section: "07 51 13", geometry_params: { type: "box", width: 2.4, height: 0.04, depth: 2.0, positionY: 0.52 } },
  { name: "Parapet Wall",        color: "#D4B896", thickness_mm: 203.2, order_index: 6,  material_type: "masonry",    product_name: "CMU or steel stud, 36-48\"", manufacturer: null,          csi_section: "04 22 00", geometry_params: { type: "box", width: 0.20, height: 1.8, depth: 2.0, positionX: 1.3, positionY: 0.9, isWall: true } },
  { name: "Air Barrier",         color: "#228B22", thickness_mm: 1.0,   order_index: 7,  material_type: "air-barrier", product_name: "Perm-A-Barrier\u00AE",        manufacturer: "GCP / Saint-Gobain", csi_section: "07 27 00", geometry_params: { type: "box", width: 0.015, height: 1.8, depth: 2.0, positionX: 1.2, positionY: 0.9, isBarrier: true } },
  { name: "Metal Coping",        color: "#C0C0C0", thickness_mm: 1.2,   order_index: 8,  material_type: "metal",      product_name: "Drip edges both sides",      manufacturer: null,          csi_section: "07 71 00", geometry_params: { type: "extrude", positionY: 1.8, isCoping: true } },
  { name: "Counter-Flashing",    color: "#808080", thickness_mm: 0.8,   order_index: 9,  material_type: "metal",      product_name: "Reglet, overlaps 4\"",        manufacturer: null,          csi_section: "07 62 00", geometry_params: { type: "box", width: 0.01, height: 0.30, depth: 2.0, positionX: 1.19, positionY: 1.35, isFlashing: true } },
  { name: "Sealant",             color: "#CC3333", thickness_mm: 6.0,   order_index: 10, material_type: "sealant",    product_name: "At reglet + coping joints",  manufacturer: null,          csi_section: "07 92 00", geometry_params: { type: "box", width: 0.04, height: 0.02, depth: 2.0, positionX: 1.3, positionY: 1.8, isSealant: true } },
];

export async function seed() {
  console.log('[seed] Creating master schema...');
  await createMasterSchema();

  // Create default tenant
  const tenantSlug = 'demo';
  const schemaName = 'tenant_demo';

  const existing = await query('SELECT id FROM tenants WHERE slug = $1', [tenantSlug]);
  let tenantId: string;

  if (existing.rows.length > 0) {
    tenantId = existing.rows[0].id;
    console.log('[seed] Tenant already exists:', tenantId);
  } else {
    const result = await query(
      'INSERT INTO tenants (slug, name, schema_name, plan) VALUES ($1, $2, $3, $4) RETURNING id',
      [tenantSlug, 'Demo Organization', schemaName, 'pro']
    );
    tenantId = result.rows[0].id;
    console.log('[seed] Created tenant:', tenantId);
  }

  // Create tenant schema
  await createTenantSchema(schemaName);

  // Create admin user
  const passwordHash = await bcrypt.hash('demo123', 10);
  const userResult = await queryWithSchema(schemaName,
    `INSERT INTO users (email, password_hash, name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET name = $3
     RETURNING id`,
    ['admin@demo.com', passwordHash, 'Demo Admin', 'admin']
  );
  const userId = userResult.rows[0].id;

  // Create parapet detail
  const detailResult = await queryWithSchema(schemaName,
    `INSERT INTO details (name, category, description, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    ['Parapet Wall Assembly', 'roofing', 'Standard parapet wall detail with 10 layers — roofing membrane to metal coping.', userId]
  );
  const detailId = detailResult.rows[0].id;

  // Insert layers
  for (const layer of PARAPET_LAYERS) {
    await queryWithSchema(schemaName,
      `INSERT INTO layers (detail_id, name, order_index, color, material_type, thickness_mm, product_name, manufacturer, csi_section, geometry_params_json, visible_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [detailId, layer.name, layer.order_index, layer.color, layer.material_type, layer.thickness_mm, layer.product_name, layer.manufacturer, layer.csi_section, JSON.stringify(layer.geometry_params), true]
    );
  }

  console.log(`[seed] Created detail with ${PARAPET_LAYERS.length} layers`);
  console.log('[seed] Done! Login: admin@demo.com / demo123');
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seed().then(() => closePool()).catch(err => { console.error(err); process.exit(1); });
}
