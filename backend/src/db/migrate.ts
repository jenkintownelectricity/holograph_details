import { query, closePool } from './connection.js';

export async function createMasterSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug VARCHAR(63) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      schema_name VARCHAR(63) UNIQUE NOT NULL,
      logo_url TEXT,
      primary_color VARCHAR(7) DEFAULT '#1a365d',
      plan VARCHAR(20) DEFAULT 'free',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
  `);

  console.log('[migrate] Master schema ready');
}

export async function createTenantSchema(schemaName: string) {
  await query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);

  await query(`
    CREATE TABLE IF NOT EXISTS ${schemaName}.users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'viewer',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ${schemaName}.details (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      category VARCHAR(50) NOT NULL,
      description TEXT DEFAULT '',
      metadata_json JSONB DEFAULT '{}',
      created_by UUID REFERENCES ${schemaName}.users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ${schemaName}.layers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      detail_id UUID NOT NULL REFERENCES ${schemaName}.details(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      order_index INTEGER NOT NULL DEFAULT 0,
      color VARCHAR(7) DEFAULT '#888888',
      material_type VARCHAR(100),
      thickness_mm REAL DEFAULT 0,
      product_name VARCHAR(255),
      manufacturer VARCHAR(255),
      csi_section VARCHAR(20),
      geometry_params_json JSONB DEFAULT '{}',
      visible_default BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ${schemaName}.products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      manufacturer VARCHAR(255),
      csi_section VARCHAR(20),
      description TEXT DEFAULT '',
      thickness_range VARCHAR(50),
      application_notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS ${schemaName}.projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      client_name VARCHAR(255),
      detail_ids UUID[] DEFAULT '{}',
      created_by UUID REFERENCES ${schemaName}.users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_layers_detail ON ${schemaName}.layers(detail_id);
    CREATE INDEX IF NOT EXISTS idx_details_category ON ${schemaName}.details(category);
  `);

  console.log(`[migrate] Tenant schema '${schemaName}' ready`);
}

// Run directly
if (process.argv[1]?.endsWith('migrate.ts') || process.argv[1]?.endsWith('migrate.js')) {
  createMasterSchema()
    .then(() => closePool())
    .then(() => console.log('[migrate] Done'))
    .catch(err => { console.error('[migrate] Error:', err); process.exit(1); });
}
