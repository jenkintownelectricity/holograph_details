import express from 'express';
import cors from 'cors';
import { tenantMiddleware } from './middleware/tenant.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { createMasterSchema } from './db/migrate.js';
import authRoutes from './routes/auth.js';
import detailRoutes from './routes/details.js';
import tenantRoutes from './routes/tenants.js';
import productRoutes from './routes/products.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001');

// Global middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: '3D BIM Detail Viewer API', version: '1.0.0' });
});

// Tenant management routes (no tenant middleware needed)
app.use('/api/tenants', tenantRoutes);

// Tenant-scoped routes
app.use('/api/auth', tenantMiddleware, authRoutes);
app.use('/api/details', tenantMiddleware, detailRoutes);
app.use('/api/products', tenantMiddleware, productRoutes);
app.use('/api/tenant', tenantMiddleware, tenantRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    // Ensure master schema exists (will silently succeed if DB not available)
    try {
      await createMasterSchema();
      console.log('[server] Database connected, master schema ready');
    } catch (dbErr) {
      console.warn('[server] Database not available — running in API-only mode');
      console.warn('[server] Set DB_HOST, DB_NAME, DB_USER, DB_PASSWORD to connect');
    }

    app.listen(PORT, () => {
      console.log(`[server] 3D BIM Detail Viewer API running on http://localhost:${PORT}`);
      console.log(`[server] Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err);
    process.exit(1);
  }
}

start();

export default app;
